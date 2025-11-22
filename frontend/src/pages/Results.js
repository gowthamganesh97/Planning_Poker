import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import { getRoom } from '../services/api';

export default function Results() {
  const { code, storyId } = useParams();
  const [story, setStory] = useState(null);

  useEffect(() => {
    getRoom(code).then(r => {
      const s = r.data.stories.find(x => x.id.toString() === storyId);
      setStory(s);
    }).catch(() => alert('Room not found'));
  }, [code, storyId]);

  if (!story) return <div className="container">Loading...</div>;

  return (
    <div className="container" style={{padding:'28px 0'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div><h3 style={{margin:0}}>Results: {story.title}</h3><div style={{color:'#6b7280'}}>{story.description}</div></div>
        <div style={{color:'#6b7280'}}>Final estimate: {story.finalEstimate ?? 'Not finalized'}</div>
      </div>

      <div style={{marginTop:12}}>
        <h4>Votes (history)</h4>
        <ul>
          {story.votes?.map((v, idx) => <li key={idx}>{v.voter}: {v.value}</li>)}
        </ul>
      </div>
    </div>
  );
}
