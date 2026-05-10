import { useState, useEffect } from 'react';
import socket from '../socket';
import { getCharacter } from '../constants/characters';
import '../styles/Lobby.css';

const MAX_PLAYERS = 6; // Maximum room capacity

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

  // How many ghost (empty) slots to show — always fill to MAX_PLAYERS
  const emptySlotCount = Math.max(0, MAX_PLAYERS - players.length);

  return (
    <div className="lobby-page">
      <div className="lobby-container">
        <div className="lobby-header">
          <h2 className="lobby-title">LOBBY</h2>
          <button
            id="btn-leave-lobby"
            className="btn-primary btn-outline leave-btn"
            onClick={onLeave}
          >
            ✕ KELUAR
          </button>
        </div>

        {/* ── Room code card ── */}
        <div className="room-code-card">
          <div className="room-code-label">KODE ROOM — BAGIKAN KE TEMAN!</div>

          {/* Each letter rendered as its own glowing tile */}
          <div className="room-code-tiles" aria-label={`Kode room: ${roomCode}`}>
            {roomCode.split('').map((letter, i) => (
              <span
                key={i}
                className="room-code-tile"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                {letter}
              </span>
            ))}
          </div>

          <button
            id="btn-copy-code"
            className={`btn-primary btn-outline copy-btn ${copied ? 'copy-btn--copied' : ''}`}
            onClick={copyCode}
          >
            {copied ? '✓ TERSALIN!' : '📋 SALIN KODE'}
          </button>
        </div>

        {/* ── Players list ── */}
        <div className="players-section">
          <div className="players-header">
            <span className="section-label">PEMAIN</span>
            <span className="player-count">{players.length} / {MAX_PLAYERS}</span>
          </div>
          <div className="players-grid">

            {/* Filled player slots */}
            {players.map((p) => {
              const char = getCharacter(p.avatarId);
              const isMe = p.id === socket.id;
              const isPlayerHost = p.id === hostId;
              return (
                <div key={p.id} className={`player-card ${isMe ? 'is-me' : ''}`}>
                  <span
                    className="player-emoji"
                    style={{ animation: 'idle 1.4s ease-in-out infinite' }}
                    aria-hidden="true"
                  >
                    {char.emoji}
                  </span>
                  <div className="player-info">
                    <span className="player-username">
                      {p.username} {isMe && '(Kamu)'}
                    </span>
                    {isPlayerHost && <span className="host-badge">HOST</span>}
                  </div>
                  <div className="player-ready-dot" aria-hidden="true" />
                </div>
              );
            })}

            {/* Ghost (empty) slots — animated dashed placeholders */}
            {Array.from({ length: emptySlotCount }).map((_, i) => (
              <div key={`empty-${i}`} className="player-card empty ghost-slot" aria-hidden="true">
                <span className="ghost-icon">👻</span>
                <div className="ghost-text">
                  Menunggu
                  <span className="ghost-dots">
                    <span className="ghost-dot" />
                    <span className="ghost-dot" style={{ animationDelay: '0.25s' }} />
                    <span className="ghost-dot" style={{ animationDelay: '0.50s' }} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <div className="error-msg">⚠ {error}</div>}

        {/* ── Start / Waiting ── */}
        {isHost ? (
          <button
            id="btn-start-game"
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
