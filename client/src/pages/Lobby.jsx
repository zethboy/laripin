import { useState, useEffect, useRef } from 'react';
import socket from '../socket';
import { getCharacter } from '../constants/characters';
import '../styles/Lobby.css';

const MAX_PLAYERS = 6;

export default function Lobby({ playerInfo, roomCode, onGameStart, onLeave }) {
  const [players, setPlayers] = useState([]);
  const [hostId, setHostId] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  const isHost = socket.id === hostId;

  useEffect(() => {
    socket.on('room_update', ({ players, hostId }) => {
      setPlayers(players);
      setHostId(hostId);
    });
    socket.on('question_start', (data) => onGameStart(data));
    socket.on('error', ({ message }) => setError(message));

    // Chat listener
    socket.on('lobby_chat', (msg) => {
      setChatMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off('room_update');
      socket.off('question_start');
      socket.off('error');
      socket.off('lobby_chat');
    };
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleStart = () => {
    setError('');
    socket.emit('start_game', { roomCode });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendChat = () => {
    const msg = chatInput.trim();
    if (!msg) return;
    socket.emit('lobby_chat', { roomCode, message: msg });
    setChatInput('');
  };

  const handleChatKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChat();
    }
  };

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

        {/* ── Main content: players + chat side by side ── */}
        <div className="lobby-main">

          {/* ── Players list ── */}
          <div className="players-section">
            <div className="players-header">
              <span className="section-label">PEMAIN</span>
              <span className="player-count">{players.length} / {MAX_PLAYERS}</span>
            </div>
            <div className="players-grid">
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

          {/* ── Chat Room ── */}
          <div className="lobby-chat">
            <div className="chat-header">
              <span className="section-label">💬 CHAT ROOM</span>
              <span className="chat-online">{players.length} online</span>
            </div>

            <div className="chat-messages" aria-live="polite" aria-label="Chat lobby">
              {chatMessages.length === 0 && (
                <div className="chat-empty">
                  <span>Belum ada pesan...</span>
                  <span className="chat-empty-hint">Sapa teman sebelum game dimulai! 👋</span>
                </div>
              )}
              {chatMessages.map((msg, i) => {
                const char = getCharacter(msg.avatarId);
                const isMe = msg.id === socket.id;
                const time = new Date(msg.ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={i} className={`chat-msg ${isMe ? 'chat-msg--me' : ''}`}>
                    <span className="chat-avatar" title={msg.username}>{char.emoji}</span>
                    <div className="chat-bubble">
                      <div className="chat-meta">
                        <span className="chat-username">{isMe ? 'Kamu' : msg.username}</span>
                        <span className="chat-time">{time}</span>
                      </div>
                      <div className="chat-text">{msg.message}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <div className="chat-input-row">
              <input
                id="chat-input"
                className="chat-input"
                type="text"
                placeholder="Ketik pesan..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={handleChatKey}
                maxLength={200}
                autoComplete="off"
              />
              <button
                id="btn-send-chat"
                className="btn-primary chat-send-btn"
                onClick={sendChat}
                disabled={!chatInput.trim()}
                aria-label="Kirim pesan"
              >
                ➤
              </button>
            </div>
          </div>

        </div>{/* end lobby-main */}

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
