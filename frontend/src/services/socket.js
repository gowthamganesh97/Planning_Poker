import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class SocketService {
  constructor() {
    this.client = null;
    this.subscriptions = {};
    this._pendingSubs = [];
    this._connectPromise = null;
  }

  connect() {
    if (this.client && this.client.active) return Promise.resolve();
    if (this._connectPromise) return this._connectPromise;

    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      debug: () => {}
    });

    this._connectPromise = new Promise((resolve, reject) => {
      this.client.onConnect = () => {
        try {
          this._pendingSubs.forEach(item => {
            const sub = this.client.subscribe(`/topic/room.${item.roomCode}`, (message) => {
              try { item.cb(JSON.parse(message.body)); } catch (e) { console.error(e); }
            });
            this.subscriptions[item.roomCode] = sub;
            if (item.resolve) item.resolve(sub);
          });
          this._pendingSubs = [];
        } catch (e) {
          console.error('pending subs error', e);
        }
        resolve();
      };
      this.client.onStompError = (frame) => { console.error('Broker error', frame); };
      this.client.onWebSocketError = (evt) => { console.error('WebSocket error', evt); };
      this.client.activate();
    });

    return this._connectPromise;
  }

  subscribeRoom(roomCode, cb) {
    if (!roomCode) return Promise.reject(new Error('roomCode required'));
    if (this.subscriptions[roomCode]) return Promise.resolve(this.subscriptions[roomCode]);

    if (this.client && this.client.active) {
      try {
        const sub = this.client.subscribe(`/topic/room.${roomCode}`, (message) => {
          try { cb(JSON.parse(message.body)); } catch (e) { console.error(e); }
        });
        this.subscriptions[roomCode] = sub;
        return Promise.resolve(sub);
      } catch (e) {
        return Promise.reject(e);
      }
    }

    return new Promise((resolve) => {
      this._pendingSubs.push({ roomCode, cb, resolve });
      if (!this._connectPromise) this.connect().catch(err => console.error('connect failed', err));
    });
  }

  send(destination, payload) {
    if (!this.client || !this.client.active) {
      console.warn('WebSocket not active; cannot send', destination);
      return;
    }
    this.client.publish({ destination, body: JSON.stringify(payload) });
  }

  unsubscribe(roomCode) {
    const sub = this.subscriptions[roomCode];
    if (sub) {
      try { sub.unsubscribe(); } catch (e) {}
      delete this.subscriptions[roomCode];
    } else {
      this._pendingSubs = this._pendingSubs.filter(p => p.roomCode !== roomCode);
    }
  }

  disconnect() {
    try {
      Object.keys(this.subscriptions).forEach(k => this.unsubscribe(k));
      if (this.client) this.client.deactivate();
    } catch (e) { console.error(e); }
    this.client = null;
    this._connectPromise = null;
    this._pendingSubs = [];
    this.subscriptions = {};
  }
}

export default new SocketService();
