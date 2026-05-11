import { useState, useEffect, useRef } from 'react';
import socket from '../socket';
import { getCharacter } from '../constants/characters';
import '../styles/Lobby.css';
import '../styles/KickModal.css';

const MAX_PLAYERS = 6;

export default function Lobby({ playerInfo, roomCode, isSpectator, onGameStart, onLeave }) {
  const [players, setPlayers] = useState([]);
  const [spectators, setSpectators] = useState([]);
  const [hostId, setHostId] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const [maxPlayers, setMaxPlayers] = useState(6);
  const [kickConfirm, setKickConfirm] = useState(null); // { id, username } | null

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  // We use the ID from the players list to identify ourselves reliably
  const myIdInRoom = players.find(p => p.username === playerInfo.username)?.id || socket.id;
  const isHost = socket.id === hostId || myIdInRoom === hostId;

  useEffect(() => {
    // Force a re-render when socket connects to ensure socket.id is available
    const handleConnect = () => setPlayers(prev => [...prev]);
    socket.on('connect', handleConnect);

    socket.on('room_update', ({ players, spectators, hostId, maxPlayers: serverMaxPlayers }) => {
      console.log('Lobby Update:', { players, hostId, serverMaxPlayers });
      setPlayers(players);
      setSpectators(spectators || []);
      setHostId(hostId);
      if (serverMaxPlayers) setMaxPlayers(serverMaxPlayers);
    });
    socket.on('question_start', (data) => onGameStart(data));
    socket.on('error', ({ message }) => setError(message));

    // Request initial state in case we missed the broadcast during transition
    socket.emit('get_room_state', { roomCode });

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
  }, [onGameStart, roomCode, onLeave]);

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

  const confirmKick = (id, username) => {
    setKickConfirm({ id, username });
  };

  const executeKick = () => {
    if (!kickConfirm) return;
    socket.emit('kick_player', { 
      targetId: kickConfirm.id, 
      targetName: kickConfirm.username 
    });
    setKickConfirm(null);
  };

  const emptySlotCount = Math.max(0, maxPlayers - players.length);

  return (
    <div className="lobby-page">
      {/* ── Kick Confirmation Modal ── */}
      {kickConfirm && (
        <div className="kick-modal-overlay">
          <div className="kick-modal">
            <span className="kick-modal-icon">👢</span>
            <h3 className="kick-modal-title">KONFIRMASI KICK</h3>
            <p className="kick-modal-msg">
              Keluarkan <strong>{kickConfirm.username}</strong> dari room?
            </p>
            <div className="kick-modal-actions">
              <button className="btn-primary btn-outline" onClick={() => setKickConfirm(null)}>
                BATAL
              </button>
              <button className="btn-primary btn-danger" onClick={executeKick}>
                KICK!
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="lobby-container">
        <div className="lobby-header">
          <div className="lobby-title-area">
            <h2 className="lobby-title">LOBBY</h2>
            {isSpectator && <span className="spectator-badge">👁 SPECTATOR</span>}
          </div>
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
              <span className="player-count">{players.length} / {maxPlayers}</span>
            </div>
            <div className="players-grid">
              {players.map((p) => {
                const char = getCharacter(p.avatarId);
                const isMe = p.id === socket.id || p.username === playerInfo.username;
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
                      {p.isGuest === false && <span className="host-badge" style={{ background: 'gold', color: 'black' }}>PRO</span>}
                    </div>
                    {/* Host kick button */}
                    {isHost && !isMe && (
                      <button 
                        className="kick-btn" 
                        onClick={() => confirmKick(p.id, p.username)}
                        title="Kick player"
                      >
                        ❌
                      </button>
                    )}
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

            {/* ── Spectators list (only if any exist) ── */}
            {spectators.length > 0 && (
              <div className="spectator-section">
                <div className="spectator-header">
                  <span className="spectator-label">PENONTON</span>
                  <span className="spectator-count">{spectators.length}</span>
                </div>
                <div className="players-grid">
                  {spectators.map((s) => {
                    const isMe = s.id === socket.id;
                    return (
                      <div key={s.id} className={`player-card spectator-card ${isMe ? 'is-me' : ''}`}>
                        <span className="player-emoji" style={{ fontSize: '1.2rem' }}>👁</span>
                        <div className="player-info">
                          <span className="player-username" style={{ fontSize: '0.8rem' }}>
                            {s.username} {isMe && '(Kamu)'}
                          </span>
                        </div>
                        {isHost && !isMe && (
                          <button 
                            className="kick-btn" 
                            onClick={() => confirmKick(s.id, s.username)}
                            title="Kick spectator"
                          >
                            ❌
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Chat Room ── */}
          <div className="lobby-chat">
            <div className="chat-header">
              <span className="section-label">💬 CHAT ROOM</span>
              <span className="chat-online">{players.length + spectators.length} online</span>
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
                        <span className="chat-username">
                          {isMe ? 'Kamu' : msg.username}
                          {msg.isSpectator && <span className="chat-spec-tag"> (Spectator)</span>}
                        </span>
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
            <span>{isSpectator ? 'Menonton sebagai penonton' : 'Menunggu host memulai'}</span>
          </div>
        )}
      </div>
    </div>
  );
}
