// src/pages/Estimation.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import socketService from '../services/socket';
import { getRoom } from '../services/api';
import Card from '../components/Card';

const CARD_VALUES = ["0","0.5","1","2","3","5","8","13","20","?"];

export default function Estimation() {
  const { code, storyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { nickname, role } = location.state || {};
  const [room, setRoom] = useState(null);
  const [story, setStory] = useState(null);
  const [selected, setSelected] = useState(null);
  const [casted, setCasted] = useState(false);
  const [sending, setSending] = useState(false);
  const [votedCount, setVotedCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [revealResult, setRevealResult] = useState(null);

  useEffect(() => {
    if (!nickname) { navigate('/'); return; }
    let mounted = true;

    (async () => {
      try {
        const r = await getRoom(code);
        if (!mounted) return;
        setRoom(r.data);
        const s = r.data.stories.find(x => x.id.toString() === storyId);
        setStory(s);
        setTotal(r.data.participants?.length || 0);

        await socketService.connect();
        await socketService.subscribeRoom(code, (evt) => {
          if (!mounted) return;
          const { type, payload } = evt;
          if (type === 'ROOM_UPDATED') {
            setRoom(payload);
            setStory(payload.stories.find(x => x.id.toString() === storyId));
            // do not automatically clear selection on room updated
          } else if (type === 'VOTE_STATUS') {
            if (payload.storyId && payload.storyId.toString() === storyId.toString()) {
              setVotedCount(payload.votedCount || 0);
              setTotal(payload.totalParticipants || total);
            }
          } else if (type === 'REVEAL') {
            if (payload.storyId && payload.storyId.toString() === storyId.toString()) {
              setRevealed(true);
              setRevealResult(payload);
            }
          } else if (type === 'REVOTE') {
            // allow recast after revote
            setRevealed(false);
            setRevealResult(null);
            setVotedCount(0);
            setCasted(false);
            setSelected(null); // clear selection after revote (optional)
          } else if (type === 'FINALIZED') {
            const s = payload.stories.find(x => x.id.toString() === storyId);
            setStory(s);
          } else if (type === 'ERROR') {
            console.warn('Server error:', payload);
          }
        });

        // announce presence in room topic
        socketService.send('/app/join', { roomCode: code, nickname, role });
      } catch (e) {
        console.error(e);
        if (mounted) alert('Failed to connect to room');
      }
    })();

    return () => {
      mounted = false;
      socketService.unsubscribe(code);
      socketService.disconnect();
    };
  }, [code, storyId]);

  const handleSelect = (val) => {
    if (casted) return; // prevent changing after cast (until revote)
    setSelected(val);
  };

  const handleCast = () => {
    if (!selected) return alert('Choose a card');
    if (casted) return;
    setSending(true);
    try {
      socketService.send('/app/vote', { roomCode: code, storyId: Number(storyId), nickname, value: selected });
      setCasted(true);
    } catch (e) {
      console.error(e);
      alert('Failed to cast vote');
    } finally {
      setSending(false);
    }
  };

  const handleReveal = () => {
    if (role !== 'SCRUM_MASTER') return alert('Only Scrum Master can reveal');
    socketService.send('/app/reveal', { roomCode: code, storyId: Number(storyId) });
  };

  const handleRevote = () => {
    if (role !== 'SCRUM_MASTER') return alert('Only Scrum Master can revote');
    socketService.send('/app/revote', { roomCode: code, storyId: Number(storyId) });
  };

  const handleFinalize = () => {
    if (role !== 'SCRUM_MASTER') return alert('Only Scrum Master can finalize');
    const val = prompt('Enter final estimate (numeric)');
    if (!val) return;
    const n = Number(val);
    if (isNaN(n)) return alert('Please enter a number');
    socketService.send('/app/finalize', { roomCode: code, storyId: Number(storyId), estimate: n });
  };

  return (
    <div className="container" style={{padding:'28px 0'}}>
      <div style={{textAlign:'center', marginBottom:6}}>
        <div className="card-picker-label">Choose your card 👇</div>
      </div>

      <div className="cards-row" role="list" aria-label="card deck">
        {CARD_VALUES.map(c => (
          <Card key={c} value={c} selected={selected === c} onClick={handleSelect} />
        ))}
      </div>

      <div className="actions" style={{marginTop:20}}>
        <button
          className="btn btn-primary"
          onClick={handleCast}
          disabled={sending || casted}
          aria-pressed={casted}
        >
          {sending ? 'Casting...' : (casted ? 'Voted' : 'Cast Vote')}
        </button>

        <button className={`btn btn-ghost ${revealed ? 'active' : ''}`} onClick={handleReveal}>
          Reveal
        </button>

        <button className="btn btn-ghost" onClick={handleRevote}>Revote</button>

        <button className="btn btn-ghost" onClick={handleFinalize}>Finalize</button>
      </div>

      <div style={{marginTop:18, textAlign:'center'}}>
        <div className="small-muted">Votes: {votedCount} / {total}</div>

        {revealed && revealResult && (
          <div style={{marginTop:12}}>
            <div className="small-muted">Min: {revealResult.min ?? '-'} &nbsp; Max: {revealResult.max ?? '-'} &nbsp; Avg: {revealResult.avg ? Number(revealResult.avg).toFixed(2) : '-'}</div>
            <ul style={{marginTop:8, listStyle:'none', padding:0}}>
              {revealResult.votes?.map((v, idx) => (
                <li key={idx} style={{marginTop:6}}>{v.voter}: <strong>{v.value}</strong></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
