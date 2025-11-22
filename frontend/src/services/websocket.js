import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const SOCKET_URL = 'http://localhost:8080/ws';

let stompClient;

const connect = (roomCode, onMessageReceived) => {
  stompClient = new Client({
    webSocketFactory: () => new SockJS(SOCKET_URL),
    debug: (str) => console.log('STOMP:', str),
    reconnectDelay: 5000,
    onConnect: () => {
      console.log('STOMP: Connected');
      stompClient.subscribe(`/topic/room/${roomCode}`, (message) => {
        onMessageReceived(JSON.parse(message.body));
      });
    },
    onStompError: (frame) => {
      console.error('STOMP Error:', frame.headers['message']);
      console.error('Details:', frame.body);
    },
  });

  stompClient.activate();
};

const disconnect = () => {
  if (stompClient) stompClient.deactivate();
};

const sendMessage = (destination, body) => {
  if (stompClient && stompClient.active) {
    stompClient.publish({
      destination,
      body: JSON.stringify(body),
    });
  } else {
    console.error(`STOMP not active. Cannot send to ${destination}`);
  }
};

const websocket = { connect, disconnect, sendMessage };
export default websocket;
