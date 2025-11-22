import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom, joinRoom } from '../services/api';
import socketService from '../services/socket';

export default function JoinRoom(){
  const [nickname, setNickname] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!nickname.trim()) return alert('Enter a nickname');
    setLoading(true);
    try {
      const res = await createRoom(nickname.trim());
      const room = res.data;
      const roomCode = room.code;

      await socketService.connect();
      await socketService.subscribeRoom(roomCode, (evt) => {
        // optional event handling
        console.log('WS EVENT', evt);
      });

      socketService.send('/app/join', { roomCode, nickname: nickname.trim(), role: 'SCRUM_MASTER' });
      navigate(`/lobby/${roomCode}`, { state: { nickname: nickname.trim(), role: 'SCRUM_MASTER' }});
    } catch (e) {
      console.error(e);
      alert('Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!nickname.trim() || !code.trim()) return alert('Enter nickname and room code');
    setLoading(true);
    try {
      await joinRoom(code.trim(), nickname.trim(), 'TEAM_MEMBER');

      await socketService.connect();
      await socketService.subscribeRoom(code.trim(), (evt) => {
        if (evt.type === 'ERROR') alert(evt.payload?.message || 'Error');
      });

      socketService.send('/app/join', { roomCode: code.trim(), nickname: nickname.trim(), role: 'TEAM_MEMBER' });
      navigate(`/lobby/${code.trim()}`, { state: { nickname: nickname.trim(), role: 'TEAM_MEMBER' }});
    } catch (e) {
      console.error(e);
      alert('Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{padding:'38px 0'}}>
      <div className="container">
        <div className="join-card" style={{maxWidth:720, margin:'0 auto'}}>
          <h2 style={{marginTop:0}}>Planning Poker — Join</h2>
          <hr style={{border:'none', borderTop:'1px solid #eef2f7', margin:'12px 0 18px 0'}} />

          <div style={{marginBottom:12}}>
            <label className="form-label">Nickname</label>
            <input className="input" placeholder="Your name" value={nickname} onChange={(e)=>setNickname(e.target.value)} />
          </div>

          <div style={{marginBottom:12}}>
            <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>
              {loading ? 'Creating...' : 'Create Room (Scrum Master)'}
            </button>
          </div>

          <hr style={{border:'none', borderTop:'1px solid #eef2f7', margin:'18px 0'}} />

          <div>
            <label className="form-label">Join with Room Code</label>
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <input className="input" placeholder="Room Code" value={code} onChange={(e)=>setCode(e.target.value)} />
              <button className="btn btn-ghost" onClick={handleJoin} disabled={loading}>Join</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
