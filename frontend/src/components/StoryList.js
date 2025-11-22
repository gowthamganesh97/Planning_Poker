import React from 'react';

export default function StoryList({stories, onEstimate}) {
  if (!stories) return null;
  return (
    <div>
      <h4>Stories</h4>
      <div style={{display:'grid', gap:10}}>
        {stories.map(s => (
          <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:10,background:'#f1f5f9',borderRadius:8}}>
            <div>
              <div style={{fontWeight:600}}>{s.title}</div>
              <div style={{color:'#6b7280'}}>{s.description}</div>
            </div>
            <div>
              <button className="btn btn-ghost" onClick={() => onEstimate(s.id)}>Estimate</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
