import React from 'react';

export default function VoteStatusBar({votedCount, total}) {
  return (
    <div style={{marginTop:12}}>
      <div className="small">Votes: {votedCount} / {total}</div>
    </div>
  );
}
