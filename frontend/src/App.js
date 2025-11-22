import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import JoinRoom from './pages/JoinRoom';
import Lobby from './pages/Lobby';
import Estimation from './pages/Estimation';
import Results from './pages/Results';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/join" element={<JoinRoom />} />
      <Route path="/lobby/:code" element={<Lobby />} />
      <Route path="/room/:code/estimate/:storyId" element={<Estimation />} />
      <Route path="/room/:code/results/:storyId" element={<Results />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
  );
}
