import { useState, useEffect } from 'react';
import socket from '../socket';
import { CHARACTERS } from '../constants/characters';
import '../styles/Home.css';

export default function Home({ onEnter }) {
  const [username, setUsername] = useState('');
  const [selectedChar, setSelectedChar] = useState('pingo');
  const [mode, setMode] = useState(null); // 'create' | 'join'
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    socket.on('room_created', ({ roomCode }) => {
      setLoading(false);
      onEnter({ username, avatarId: selectedChar, socketId: socket.id }, roomCode, true);
    });
    socket.on('room_joined', ({ roomCode }) => {
      setLoading(false);
      onEnter({ username, avatarId: selectedChar, socketId: socket.id }, roomCode, false);
    });
    socket.on('error', ({ message }) => {
      setLoading(false);
      setError(message);
    });
    return () => {
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('error');
    };
  }, [username, selectedChar]);

  const handleCreate = () => {
    if (!username.trim()) return setError('Masukkan username dulu!');
    setError('');
    setLoading(true);
    socket.emit('create_room', { username: username.trim(), avatarId: selectedChar });
  };

  const handleJoin = () => {
    if (!username.trim()) return setError('Masukkan username dulu!');
    if (!joinCode.trim()) return setError('Masukkan kode room!');
    setError('');
    setLoading(true);
    socket.emit('join_room', { roomCode: joinCode.trim().toUpperCase(), username: username.trim(), avatarId: selectedChar });
  };

  return (
    <div className="home-page">
      {/* Animated background characters */}
      <div className="bg-runners">
        {['🐧','🐸','🦊','🐼','🐱','🦄'].map((e, i) => (
          <span key={i} className="bg-runner" style={{ animationDelay: `${i * 1.8}s`, top: `${20 + i * 12}%` }}>{e}</span>
        ))}
      </div>

      {/* Scanline overlay */}
      <div className="scanline" />

      <div className="home-container">
        {/* Title */}
        <div className="home-title-wrap">
          <h1 className="home-title">LARIPIN</h1>
          <p className="home-subtitle">Siapa paling pintar? Buktikan sekarang!</p>
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
            <label className="input-label">PILIH KARAKTER</label>
            <div className="char-grid">
              {CHARACTERS.map(char => (
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
