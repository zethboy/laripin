import { useState, useEffect } from 'react';
import socket from '../socket';
import { getCharacter } from '../constants/characters';
import '../styles/Lobby.css';

export default function Lobby({ playerInfo, roomCode, onGameStart, onLeave }) {
  const [players, setPlayers] = useState([]);
  const [hostId, setHostId] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const isHost = socket.id === hostId;

  useEffect(() => {
    socket.on('room_update', ({ players, hostId }) => {
      setPlayers(players);
      setHostId(hostId);
    });
    socket.on('question_start', () => onGameStart());
    socket.on('error', ({ message }) => setError(message));
    return () => {
      socket.off('room_update');
      socket.off('question_start');
      socket.off('error');
    };
  }, []);

  const handleStart = () => {
    setError('');
    socket.emit('start_game', { roomCode });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="lobby-page">
      <div className="lobby-container">
        <div className="lobby-header">
          <h2 className="lobby-title">LOBBY</h2>
          <button className="btn-primary btn-outline leave-btn" onClick={onLeave}>✕ KELUAR</button>
        </div>

        {/* Room code */}
        <div className="room-code-card">
          <div className="room-code-label">KODE ROOM — BAGIKAN KE TEMAN!</div>
          <div className="room-code-display">{roomCode}</div>
          <button className="btn-primary btn-outline copy-btn" onClick={copyCode}>
            {copied ? '✓ TERSALIN!' : '📋 SALIN KODE'}
          </button>
        </div>

        {/* Players */}
        <div className="players-section">
          <div className="players-header">
            <span className="section-label">PEMAIN</span>
            <span className="player-count">{players.length} / 6</span>
          </div>
          <div className="players-grid">
            {players.map((p) => {
              const char = getCharacter(p.avatarId);
              const isMe = p.id === socket.id;
              const isPlayerHost = p.id === hostId;
              return (
                <div key={p.id} className={`player-card ${isMe ? 'is-me' : ''}`}>
                  <span className="player-emoji" style={{ animation: 'idle 1.4s ease-in-out infinite' }}>
                    {char.emoji}
                  </span>
                  <div className="player-info">
                    <span className="player-username">{p.username} {isMe && '(Kamu)'}</span>
                    {isPlayerHost && <span className="host-badge">HOST</span>}
                  </div>
                  <div className="player-ready-dot" />
                </div>
              );
            })}
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 2 - players.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="player-card empty">
                <span className="empty-slot">Menunggu...</span>
              </div>
            ))}
          </div>
        </div>

        {error && <div className="error-msg">⚠ {error}</div>}

        {/* Start / Waiting */}
        {isHost ? (
          <button
            className="btn-primary btn-purple start-btn"
            onClick={handleStart}
            disabled={players.length < 2}
          >
            {players.length < 2 ? '⏳ BUTUH MIN. 2 PEMAIN' : '⚔ MULAI GAME!'}
          </button>
        ) : (
          <div className="waiting-msg">
            <span className="waiting-dot" />
            <span className="waiting-dot" style={{ animationDelay: '0.2s' }} />
            <span className="waiting-dot" style={{ animationDelay: '0.4s' }} />
            <span>Menunggu host memulai</span>
          </div>
        )}
      </div>
    </div>
  );
}
