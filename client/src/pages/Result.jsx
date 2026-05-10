import { useEffect, useRef } from 'react';
import { getCharacter } from '../constants/characters';
import '../styles/Result.css';

/* ============================================================
   Web Audio — Fanfare sound for winner announcement
   ============================================================ */
function playFanfare() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.18, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // Fanfare melody: triumphant ascending arpeggio
    const notes = [
      [523,  0.00, 0.18], // C5
      [659,  0.15, 0.18], // E5
      [784,  0.30, 0.18], // G5
      [1047, 0.45, 0.45], // C6 (hold)
      [784,  0.65, 0.14], // G5
      [1047, 0.75, 0.55], // C6 (final)
    ];

    notes.forEach(([freq, start, dur]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(1, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.02);
    });
  } catch (e) {
    // Silently ignore if AudioContext is not available
  }
}

/* ============================================================
   Confetti canvas — pure JS/Canvas, no library
   ============================================================ */
function useConfetti(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;

    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;

    const COLORS = [
      '#7c3aed', '#a855f7', '#00ff87', '#ffd700',
      '#00c8ff', '#ff4757', '#ff6b35', '#d084ff',
    ];

    // Create 160 confetti particles
    const particles = Array.from({ length: 160 }, () => ({
      x: Math.random() * W,
      y: Math.random() * -H,          // start above viewport
      w: 6 + Math.random() * 8,       // width
      h: 4 + Math.random() * 6,       // height
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: (Math.random() - 0.5) * 2,  // horizontal drift
      vy: 2.5 + Math.random() * 3,    // fall speed
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.2,
      opacity: 0.8 + Math.random() * 0.2,
    }));

    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;

      particles.forEach(p => {
        p.x  += p.vx;
        p.y  += p.vy;
        p.rot += p.rotV;

        // Fade out after 180 frames (~3s at 60fps)
        if (frame > 180) p.opacity = Math.max(0, p.opacity - 0.012);

        // Reset if fallen off bottom while still opaque
        if (p.y > H + 20 && frame < 200) {
          p.y = -20;
          p.x = Math.random() * W;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      // Stop when all invisible
      if (frame < 280) {
        animId = requestAnimationFrame(draw);
      } else {
        canvas.style.display = 'none';
      }
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);
}

/* ============================================================
   Result page
   ============================================================ */
export default function Result({ leaderboard, myId, onPlayAgain }) {
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const medals = ['🥇', '🥈', '🥉'];
  const podiumOrder = [1, 0, 2]; // visual order: 2nd, 1st, 3rd

  const canvasRef = useRef(null);
  useConfetti(canvasRef);

  // Fanfare plays once on mount
  useEffect(() => {
    const timer = setTimeout(playFanfare, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="result-page">
      {/* Confetti canvas — overlays the whole viewport */}
      <canvas
        ref={canvasRef}
        className="confetti-canvas"
        aria-hidden="true"
      />

      <div className="result-container">
        <h1 className="result-title">GAME OVER</h1>

        {/* ── Podium ── */}
        <div className="podium-wrap">
          {podiumOrder.map(idx => {
            const player = top3[idx];
            if (!player) return <div key={idx} className="podium-slot empty" />;
            const char = getCharacter(player.avatarId);
            const isFirst = idx === 0;
            return (
              <div key={player.id} className={`podium-slot rank-${idx + 1}`}>
                {isFirst && <div className="crown">👑</div>}
                <span
                  className="podium-emoji"
                  style={{ animation: isFirst ? 'celebrate 0.5s ease-in-out infinite' : 'idle 1.4s ease-in-out infinite' }}
                >
                  {char.emoji}
                </span>
                <div className="podium-name">
                  {player.username} {player.id === myId ? '(Kamu)' : ''}
                </div>
                <div className={`podium-block rank-${idx + 1}-block`}>
                  <span className="podium-medal">{medals[idx]}</span>
                  <span className="podium-score">{player.score}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Full leaderboard (4th place and below) ── */}
        {rest.length > 0 && (
          <div className="lb-card">
            {rest.map((p, i) => {
              const char = getCharacter(p.avatarId);
              const isMe = p.id === myId;
              // Use server-provided rank if available, fallback to index + 4
              const rank = p.rank ?? (i + 4);
              return (
                <div key={p.id} className={`lb-row ${isMe ? 'is-me' : ''}`}>
                  <span className="lb-rank">#{rank}</span>
                  <span className="lb-emoji">{char.emoji}</span>
                  <span className="lb-name">{p.username} {isMe ? '(Kamu)' : ''}</span>
                  <span className="lb-score">{p.score}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Action buttons ── */}
        <div className="result-actions">
          <button
            id="btn-play-again"
            className="btn-primary btn-purple play-again-btn"
            onClick={onPlayAgain}
          >
            🔄 MAIN LAGI
          </button>
          <button
            id="btn-back-menu"
            className="btn-primary btn-outline back-menu-btn"
            onClick={onPlayAgain}
          >
            ← KEMBALI KE MENU
          </button>
        </div>
      </div>
    </div>
  );
}
