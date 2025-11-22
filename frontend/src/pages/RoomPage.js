// import React, { useState, useEffect } from 'react';
// import { useParams, useLocation, useNavigate } from 'react-router-dom';
// import websocket from '../services/websocket';
// import Participants from '../components/Participants';
// import StoryManager from '../components/StoryManager';
// import VotingArea from '../components/VotingArea';

// function RoomPage() {
//   const { roomCode } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [gameState, setGameState] = useState(null);
//   const [currentUser, setCurrentUser] = useState(null);

//   useEffect(() => {
//     const { state } = location;
//     if (!state || (!state.isScrumMaster && !state.nickname)) {
//       navigate('/');
//       return;
//     }

//     const userDetails = {
//       name: state.isScrumMaster ? 'Scrum Master' : state.nickname,
//       role: state.isScrumMaster ? 'SCRUM_MASTER' : 'TEAM_MEMBER',
//     };

//     // ✅ Connect WebSocket
//     websocket.connect(roomCode, (message) => {
//       if (message.type === 'STATE') {
//         setGameState(message.payload);

//         // find myself inside users list
//         const me = message.payload.users?.find(
//           (u) => u.name === userDetails.name && u.role === userDetails.role
//         );
//         setCurrentUser(me || userDetails);
//       }

//     });

//     // ✅ Send join event
//     setTimeout(() => {
//       websocket.sendMessage(`/app/room/${roomCode}/message`, {
//         type: 'JOIN',
//         payload: userDetails,
//       });
//     }, 500);

//     return () => {
//       websocket.disconnect();
//     };
//   }, [roomCode, location, navigate]);

//   if (!gameState) {
//     return (
//       <div style={{ textAlign: 'center', marginTop: '4rem', fontSize: '1.25rem' }}>
//         Connecting to room...
//       </div>
//     );
//   }

//   const activeStory = gameState.stories?.find(
//     (s) => s.status === 'VOTING' || s.status === 'VOTED'
//   );
//   const votesForStory = activeStory ? gameState.votes?.[activeStory.id] || {} : {};

//   return (
//     <div className="room-page-container">
//       <header className="room-header">
//         <h1>Planning Poker</h1>
//         <div>
//           <span>Room Code:</span>
//           <span className="room-code">{roomCode}</span>
//         </div>
//       </header>

//       <div className="room-layout">
//         <aside className="sidebar">
//           <Participants users={gameState.users || []} />
//         </aside>

//         <main>
//           {currentUser && currentUser.role === 'SCRUM_MASTER' && (
//             <div className="main-content story-manager-section">
//               <StoryManager roomCode={roomCode} stories={gameState.stories || []} />
//             </div>
//           )}

//           <div className="main-content">
//             <VotingArea
//               story={activeStory}
//               roomCode={roomCode}
//               currentUser={currentUser}
//               votes={votesForStory}
//               resultsVisible={activeStory && activeStory.status === 'VOTED'}
//             />
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

// export default RoomPage;
