import { useState, useEffect } from 'react';
import socket from '../socket';
import { CHARACTERS } from '../constants/characters';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/Home.css';

export default function Home({ onEnter }) {
  const { currentUser, isGuest, logout } = useAuth();
  const [username, setUsername] = useState(currentUser?.displayName || currentUser?.email?.split('@')[0] || '');
  const [selectedChar, setSelectedChar] = useState('pingo');
  const [mode, setMode] = useState(null); // 'create' | 'join'
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    socket.on('room_created', ({ roomCode }) => {
      setLoading(false);
      onEnter({ username, avatarId: selectedChar, socketId: socket.id }, roomCode, false);
    });
    socket.on('room_joined', ({ roomCode }) => {
      setLoading(false);
      onEnter({ username, avatarId: selectedChar, socketId: socket.id }, roomCode, false);
    });
    socket.on('joined_as_spectator', ({ roomCode }) => {
      setLoading(false);
      onEnter({ username, avatarId: selectedChar, socketId: socket.id }, roomCode, true);
    });
    socket.on('error', ({ message }) => {
      setLoading(false);
      setError(message);
    });
    socket.on('connect_error', (err) => {
      setLoading(false);
      setError('Koneksi gagal: ' + err.message);
    });
    return () => {
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('joined_as_spectator');
      socket.off('error');
      socket.off('connect_error');
    };
  }, [username, selectedChar, onEnter]);

  const connectSocketAndEmit = async (event, payload) => {
    try {
      if (!isGuest && currentUser) {
        const token = await currentUser.getIdToken();
        socket.auth = { token, isGuest: false, username: payload.username, avatarId: payload.avatarId };
      } else {
        socket.auth = { isGuest: true, username: payload.username, avatarId: payload.avatarId };
      }
      
      if (!socket.connected) {
        socket.connect();
      }
      socket.emit(event, payload);
    } catch (err) {
      setError('Gagal autentikasi: ' + err.message);
      setLoading(false);
    }
  };

  const [maxPlayers, setMaxPlayers] = useState(6);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('Campuran');

  const handleCreate = () => {
    if (!username.trim()) return setError('Masukkan username dulu!');
    setError('');
    setLoading(true);
    // Send settings to the server
    connectSocketAndEmit('create_room', { 
      username: username.trim(), 
      avatarId: selectedChar, 
      maxPlayers: isGuest ? 6 : maxPlayers,
      totalQuestions: isGuest ? 10 : totalQuestions,
      difficulty: isGuest ? 'Campuran' : difficulty
    });
  };

  const handleJoin = () => {
    if (!username.trim()) return setError('Masukkan username dulu!');
    if (!joinCode.trim()) return setError('Masukkan kode room!');
    setError('');
    setLoading(true);
    connectSocketAndEmit('join_room', { roomCode: joinCode.trim().toUpperCase(), username: username.trim(), avatarId: selectedChar });
  };

  const handleLogout = async () => {
    try {
      if (socket.connected) socket.disconnect();
      await logout();
      window.location.reload(); // Quick reset
    } catch (e) {
      toast.error('Gagal logout');
    }
  };

  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const fetchProfile = async () => {
    if (isGuest || !currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      const backendUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (showProfile && !profileData) {
      fetchProfile();
    }
  }, [showProfile]);

  return (
    <div className="home-page">
      {/* ── Profile Modal ── */}
      {showProfile && (
        <div className="kick-modal-overlay">
          <div className="kick-modal" style={{ minWidth: '300px' }}>
            <span className="kick-modal-icon">⭐</span>
            <h3 className="kick-modal-title">STATISTIK PROFIL</h3>
            {profileData ? (
              <div style={{ textAlign: 'left', margin: '1rem 0', color: 'var(--text-primary)', lineHeight: '1.8' }}>
                <div><strong>Email:</strong> {profileData.email}</div>
                <div><strong>Total Main:</strong> {profileData.totalGames}</div>
                <div><strong>Total Menang:</strong> {profileData.totalWins}</div>
                <div><strong>Total Poin:</strong> {profileData.totalPoints}</div>
                <div><strong>Win Rate:</strong> {profileData.totalGames ? Math.round((profileData.totalWins / profileData.totalGames) * 100) : 0}%</div>
              </div>
            ) : (
              <p>Memuat data profil...</p>
            )}
            <div className="kick-modal-actions">
              <button className="btn-primary btn-purple" onClick={() => setShowProfile(false)}>
                TUTUP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animated background characters */}
      <div className="bg-runners">
        {['🐧','🐸','🦊','🐼','🐱','🦄'].map((e, i) => (
          <span key={i} className="bg-runner" style={{ animationDelay: `${i * 1.8}s`, top: `${20 + i * 12}%` }}>{e}</span>
        ))}
      </div>

      {/* Scanline overlay */}
      <div className="scanline" />

      <div className="home-container" style={{ marginTop: mode === 'create' && !isGuest ? '120px' : '0' }}>
        {/* Title */}
        <div className="home-title-wrap">
          <h1 className="home-title">BURJAW</h1>
          <p className="home-subtitle">Siapa paling pintar? Buktikan sekarang!</p>
          
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <span className="login-pill" style={{ opacity: 1, border: '1px solid var(--accent-purple)' }}>
              {isGuest ? '👤 GUEST MODE' : `⭐ PRO PLAYER: ${currentUser?.email}`}
            </span>
            {!isGuest && currentUser && (
              <button onClick={() => setShowProfile(true)} className="btn-primary btn-purple" style={{ padding: '0.2rem 0.8rem', fontSize: '0.7rem', minHeight: '30px' }}>PROFIL</button>
            )}
            <button onClick={handleLogout} className="btn-primary btn-outline" style={{ padding: '0.2rem 0.8rem', fontSize: '0.7rem', minHeight: '30px' }}>LOGOUT</button>
          </div>
        </div>

        <div className="home-card">
          {/* Username */}
          <div className="input-group">
            <label className="input-label">USERNAME</label>
            <input
              className="game-input"
              type="text"
              placeholder="Masukkan namamu..."
              value={username}
              onChange={e => setUsername(e.target.value)}
              maxLength={16}
            />
          </div>

          {/* Character select */}
          <div className="char-section">
            <label className="input-label">PILIH KARAKTER {isGuest && '(Login untuk 6 karakter extra!)'}</label>
            <div className="char-grid">
              {CHARACTERS.slice(0, isGuest ? 6 : CHARACTERS.length).map(char => (
                <div
                  key={char.id}
                  className={`char-card ${selectedChar === char.id ? 'selected' : ''}`}
                  style={{ '--char-color': char.color }}
                  onClick={() => setSelectedChar(char.id)}
                >
                  <span className={`char-card-emoji ${selectedChar === char.id ? 'state-celebrate' : ''}`}>{char.emoji}</span>
                  <span className="char-card-name">{char.name}</span>
                  {selectedChar === char.id && <div className="char-selected-ring" />}
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          {!mode && (
            <div className="home-actions">
              <button className="btn-primary btn-purple" onClick={() => setMode('create')} disabled={loading}>
                ⚔ BUAT ROOM
              </button>
              <button className="btn-primary btn-outline" onClick={() => setMode('join')} disabled={loading}>
                🚪 JOIN ROOM
              </button>
            </div>
          )}

          {mode === 'create' && (
            <div className="create-room-settings" style={{ marginBottom: '1rem', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {isGuest ? (
                <div style={{ color: '#aaa', fontSize: '0.85rem' }}>
                  <label className="input-label">PENGATURAN ROOM</label>
                  Guest terkunci di:<br/>
                  • 6 Pemain<br/>
                  • 10 Soal<br/>
                  • Tingkat Kesulitan: Campuran<br/><br/>
                  (Login untuk mengatur hingga 30 pemain, 30 soal, dan pilih kesulitan!)
                </div>
              ) : (
                <>
                  <div>
                    <label className="input-label">MAKSIMAL PEMAIN</label>
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginTop: '5px', flexWrap: 'wrap' }}>
                      {[4, 6, 10, 20, 30].map(num => (
                        <button 
                          key={num}
                          onClick={() => setMaxPlayers(num)}
                          className={`btn-primary ${maxPlayers === num ? 'btn-purple' : 'btn-outline'}`}
                          style={{ padding: '0.4rem 0.8rem', flex: '1 0 15%' }}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="input-label">JUMLAH SOAL</label>
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginTop: '5px' }}>
                      {[10, 20, 30].map(num => (
                        <button 
                          key={num}
                          onClick={() => setTotalQuestions(num)}
                          className={`btn-primary ${totalQuestions === num ? 'btn-purple' : 'btn-outline'}`}
                          style={{ padding: '0.4rem 0.8rem', flex: 1 }}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="input-label">TINGKAT KESULITAN</label>
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginTop: '5px', flexWrap: 'wrap' }}>
                      {['Campuran', 'Mudah', 'Sedang', 'Sulit'].map(diff => (
                        <button 
                          key={diff}
                          onClick={() => setDifficulty(diff)}
                          className={`btn-primary ${difficulty === diff ? 'btn-purple' : 'btn-outline'}`}
                          style={{ padding: '0.4rem 0.8rem', flex: '1 0 40%' }}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {mode === 'create' && (
            <div className="home-actions">
              <button className="btn-primary btn-purple" onClick={handleCreate} disabled={loading}>
                {loading ? 'Membuat...' : '🚀 BUAT SEKARANG'}
              </button>
              <button className="btn-primary btn-outline" onClick={() => setMode(null)}>← KEMBALI</button>
            </div>
          )}

          {mode === 'join' && (
            <div className="home-actions">
              <input
                className="game-input code-input"
                type="text"
                placeholder="KODE ROOM (6 huruf)"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
              <button className="btn-primary btn-purple" onClick={handleJoin} disabled={loading}>
                {loading ? 'Bergabung...' : '🏃 JOIN!'}
              </button>
              <button className="btn-primary btn-outline" onClick={() => setMode(null)}>← KEMBALI</button>
            </div>
          )}

          {error && <div className="error-msg">⚠ {error}</div>}
        </div>
      </div>
    </div>
  );
}
