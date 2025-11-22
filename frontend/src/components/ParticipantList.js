import React from 'react';

export default function ParticipantList({participants}) {
  if (!participants) return null;
  return (
    <div>
      <h4>Participants</h4>
      <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
        {participants.map(p => (
          <div key={p.id} style={{padding:'8px 10px', background:'#eef2ff', borderRadius:8}}>
            {p.nickname} {p.role === 'SCRUM_MASTER' ? '(SM)' : ''}
          </div>
        ))}
      </div>
    </div>
  );
}
