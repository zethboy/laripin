import { useState, useEffect } from 'react';
import '../styles/Login.css';

// Characters that animate across the background
const BG_CHARS = ['🐧', '🐸', '🦊', '🐼', '🐱', '🦄', '🐧', '🐸', '🦊'];

export default function Login({ onPlay }) {
  // Track when the button is pressed so we can play the exit animation
  const [exiting, setExiting] = useState(false);

  const handlePlay = () => {
    setExiting(true);
    // Let the exit animation finish (400ms) before switching page
    setTimeout(() => onPlay(), 400);
  };

  // Subtle title letter shimmer — cycle active letter index
  const [shimmerIdx, setShimmerIdx] = useState(-1);
  useEffect(() => {
    const letters = 'BURJAW'.length;
    let i = 0;
    const id = setInterval(() => {
      setShimmerIdx(i % letters);
      i++;
    }, 220);
    return () => clearInterval(id);
  }, []);

  const titleLetters = 'BURJAW'.split('');

  return (
    <div className={`login-page ${exiting ? 'login-exit' : 'login-enter'}`}>

      {/* ── Animated grid background ── */}
      <div className="login-grid-bg" aria-hidden="true" />

      {/* ── Scanline sweep ── */}
      <div className="login-scanline" aria-hidden="true" />

      {/* ── Floating background runners ── */}
      <div className="login-runners" aria-hidden="true">
        {BG_CHARS.map((emoji, i) => (
          <span
            key={i}
            className="login-runner"
            style={{
              top: `${8 + i * 10}%`,
              animationDelay: `${i * 1.3}s`,
              animationDuration: `${7 + (i % 3)}s`,
              fontSize: `${1.8 + (i % 3) * 0.6}rem`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      {/* ── Center content ── */}
      <div className="login-center">

        {/* Badge above title */}
        <div className="login-badge">⚡ MULTIPLAYER QUIZ GAME ⚡</div>

        {/* Animated title */}
        <h1 className="login-title" aria-label="BURJAW">
          {titleLetters.map((letter, i) => (
            <span
              key={i}
              className={`login-letter ${i === shimmerIdx ? 'shimmer' : ''}`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {letter}
            </span>
          ))}
        </h1>

        {/* Tagline */}
        <p className="login-tagline">
          Siapa paling pintar?{' '}
          <span className="login-tagline-highlight">Buktikan sekarang!</span>
        </p>

        {/* Decorative divider */}
        <div className="login-divider" aria-hidden="true">
          <span />
          <span className="login-divider-icon">🏆</span>
          <span />
        </div>

        {/* Feature pills */}
        <div className="login-features" aria-hidden="true">
          <span className="login-pill">🎮 Realtime</span>
          <span className="login-pill">👥 Multiplayer</span>
          <span className="login-pill">🧠 Quiz</span>
        </div>

        {/* CTA button */}
        <button
          id="login-play-btn"
          className="login-play-btn"
          onClick={handlePlay}
          aria-label="Mulai bermain BURJAW"
        >
          <span className="login-play-btn-glow" aria-hidden="true" />
          <span className="login-play-btn-text">⚡ PLAY NOW</span>
        </button>

        {/* Version / footer note */}
        <p className="login-footer">
          Buat room atau bergabung dengan kode 6 huruf
        </p>
      </div>

      {/* ── Corner decorations ── */}
      <div className="login-corner login-corner-tl" aria-hidden="true" />
      <div className="login-corner login-corner-tr" aria-hidden="true" />
      <div className="login-corner login-corner-bl" aria-hidden="true" />
      <div className="login-corner login-corner-br" aria-hidden="true" />
    </div>
  );
}
