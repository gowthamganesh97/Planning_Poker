import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home(){
  const navigate = useNavigate();

  const handleStart = () => navigate('/join');

  return (
    <>
      <div className="navbar">
        <div className="navbar-inner container">
          <div className="brand">Planning Poker</div>
          <div className="nav-links">
            <a className="nav-link" href="/signup">Sign Up</a>
            <a className="nav-link" href="/login">Login</a>
          </div>
        </div>
      </div>

      <main className="container">
        <section className="hero" role="banner">
          <h1>Scrum Poker for agile teams</h1>
          <p className="lead">Easy-to-use and fun estimations.</p>

          <div className="cta">
            <button className="btn btn-primary" onClick={handleStart}>Start new game</button>
          </div>
        </section>

        <section className="join-section" aria-labelledby="join-title">
          <h2 id="join-title">Join an Existing Session</h2>
          <p>Enter the room code and your nickname to join an ongoing estimation session.</p>

          <div className="join-card" role="region" aria-label="Join room form">
            <label className="form-label">Room Code</label>
            <div style={{display:'flex', gap:12}}>
              <input className="input" placeholder="Enter Room Code" />
              <input className="input input--small" placeholder="Enter Your Nickname" />
            </div>

            <div style={{marginTop:18}}>
              <button className="join-btn" onClick={() => navigate('/join')}>Join Room</button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
