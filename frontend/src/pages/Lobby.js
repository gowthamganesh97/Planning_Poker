import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import socketService from '../services/socket';
import { getRoom, addStory } from '../services/api';
import ParticipantList from '../components/ParticipantList';
import StoryList from '../components/StoryList';

export default function Lobby() {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { nickname, role } = location.state || {};

  const [room, setRoom] = useState(null);
  const [title, setTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!nickname) { navigate('/'); return; }
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const r = await getRoom(code);
        if (!mounted) return;
        setRoom(r.data);

        await socketService.connect();
        await socketService.subscribeRoom(code, (evt) => {
          if (!mounted) return;
          if (['STATE', 'ROOM_UPDATED', 'REVOTE', 'FINALIZED'].includes(evt.type)) {
            setRoom(evt.payload);
          }
        });

        socketService.send(`/app/room/${code}/message`, { type: 'JOIN', payload: { name: nickname, role } });
      } catch (e) {
        console.error(e);
        if (mounted) alert('Failed to load room');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      try { socketService.unsubscribe(code); } catch {}
      try { socketService.disconnect(); } catch {}
    };
  }, [code, navigate, nickname, role]);

  const createStory = async () => {
    if (!title.trim()) return;
    try {
      setAdding(true);
      await addStory(code, title.trim(), '');
      setTitle('');
      const r = await getRoom(code);
      setRoom(r.data);
    } catch (e) {
      console.error(e);
      alert('Failed to add story');
    } finally {
      setAdding(false);
    }
  };

  const goEstimate = (storyId) =>
    navigate(`/room/${code}/estimate/${storyId}`, { state: { nickname, role } });

  if (loading)
    return (
      <div style={styles.center}>
        <div style={styles.loadingCard}>Loading room…</div>
      </div>
    );

  if (!room)
    return (
      <div style={styles.center}>
        <div style={styles.emptyCard}>
          <h3>Room not found</h3>
          <p>Double-check the link or create a new room.</p>
          <button style={styles.primaryButton} onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    );

  const participants = room.participants || room.users || [];

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>
            Room <span style={styles.roomCode}>{room.code}</span>
          </h2>
          <div style={styles.sub}>
            Created by <strong>{room.createdBy}</strong>
            {room.createdAt
              ? ` • ${new Date(room.createdAt).toLocaleString()}`
              : ''}
          </div>
        </div>

        <div style={styles.userInfo}>
          <div>You: <strong>{nickname}</strong></div>
          <div style={styles.roleText}>
            {role === 'SCRUM_MASTER' ? 'Scrum Master' : 'Team Member'}
          </div>
        </div>
      </header>

      {/* Layout Grid */}
      <div style={styles.grid}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              Participants ({participants.length})
            </h3>
            <div style={styles.scrollArea}>
              <ParticipantList participants={participants} />
            </div>
            <button style={styles.dangerButton} onClick={() => navigate('/')}>
              Leave Room
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <section style={styles.main}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={styles.card}
          >
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Stories</h3>
              <p style={styles.subText}>
                Select a story to start estimation
              </p>
            </div>

            <StoryList stories={room.stories || []} onEstimate={goEstimate} />

            {role === 'SCRUM_MASTER' && (
              <div style={styles.addStory}>
                <input
                  style={styles.input}
                  placeholder="New story title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <button
                  style={styles.primaryButton}
                  onClick={createStory}
                  disabled={adding}
                >
                  {adding ? 'Adding…' : 'Add Story'}
                </button>
              </div>
            )}
          </motion.div>
        </section>
      </div>
    </div>
  );
}

/* ---------- Inline Style Object ---------- */
const styles = {
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #f7f9fc 0%, #ffffff 100%)',
    padding: '24px',
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    color: '#1e293b',
  },
  center: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f9fafb',
  },
  loadingCard: {
    padding: '30px 40px',
    borderRadius: '12px',
    background: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    fontSize: '15px',
  },
  emptyCard: {
    padding: '30px 40px',
    borderRadius: '12px',
    background: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 'bold',
  },
  roomCode: {
    background: '#eef2ff',
    color: '#4f46e5',
    padding: '4px 8px',
    borderRadius: '6px',
    marginLeft: '6px',
  },
  sub: {
    color: '#6b7280',
    fontSize: '13px',
    marginTop: '4px',
  },
  userInfo: {
    textAlign: 'right',
  },
  roleText: {
    fontSize: '13px',
    color: '#6b7280',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '20px',
  },
  sidebar: {},
  card: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
    padding: '16px',
    marginBottom: '16px',
  },
  cardTitle: {
    margin: '0 0 8px',
    fontSize: '16px',
    fontWeight: 600,
  },
  subText: {
    margin: 0,
    fontSize: '13px',
    color: '#6b7280',
  },
  scrollArea: {
    maxHeight: '250px',
    overflowY: 'auto',
    marginBottom: '12px',
  },
  main: {},
  cardHeader: {
    marginBottom: '10px',
  },
  addStory: {
    display: 'flex',
    gap: '10px',
    marginTop: '14px',
  },
  input: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    outline: 'none',
    fontSize: '14px',
  },
  primaryButton: {
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 14px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  ghostButton: {
    background: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '8px 14px',
    cursor: 'pointer',
  },
  dangerButton: {
    background: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '8px 14px',
    cursor: 'pointer',
    marginBottom: '8px',
  },
};
