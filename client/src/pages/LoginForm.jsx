import { useState } from 'react';
import '../styles/LoginForm.css';

/**
 * LoginForm — Cosmetic "login" page between the splash and Home.
 * No real authentication. Only "ENTER AS GUEST" is functional.
 *
 * Flow: Login (splash) → PLAY NOW → LoginForm → ENTER AS GUEST → Home
 */
export default function LoginForm({ onGuest }) {
  // Track tooltip visibility for the social buttons
  const [tooltip, setTooltip] = useState(null); // 'google' | 'email' | null

  return (
    <div className="lf-page">
      {/* ── Subtle grid dot background ── */}
      <div className="lf-grid-bg" aria-hidden="true" />

      {/* ── Center card ── */}
      <div className="lf-card" role="main">

        {/* Mini logo */}
        <div className="lf-logo" aria-label="BURJAW">
          <span className="lf-logo-text">BURJAW</span>
          <span className="lf-logo-dot" aria-hidden="true" />
        </div>

        {/* Welcome text */}
        <div className="lf-welcome">
          <h1 className="lf-title">Welcome, Player!</h1>
          <p className="lf-subtitle">Pilih cara masuk untuk mulai berlomba</p>
        </div>

        {/* ── Primary CTA — only functional button ── */}
        <button
          id="btn-enter-guest"
          className="lf-btn lf-btn-guest"
          onClick={onGuest}
          aria-label="Masuk sebagai tamu dan mulai bermain"
        >
          <span className="lf-btn-icon" aria-hidden="true">🎮</span>
          <span>ENTER AS GUEST</span>
          <span className="lf-btn-arrow" aria-hidden="true">→</span>
        </button>

        {/* ── Divider ── */}
        <div className="lf-divider" aria-hidden="true">
          <span className="lf-divider-line" />
          <span className="lf-divider-text">atau</span>
          <span className="lf-divider-line" />
        </div>

        {/* ── Cosmetic social buttons ── */}
        <div className="lf-social-btns">

          {/* Google button */}
          <div className="lf-social-wrap">
            <button
              className="lf-btn lf-btn-social"
              onClick={() => setTooltip(tooltip === 'google' ? null : 'google')}
              onMouseEnter={() => setTooltip('google')}
              onMouseLeave={() => setTooltip(null)}
              aria-label="Login dengan Google — segera hadir"
              type="button"
            >
              {/* Google "G" SVG icon */}
              <svg
                className="lf-social-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
            {tooltip === 'google' && (
              <div className="lf-tooltip" role="tooltip">
                🚀 Coming soon!
              </div>
            )}
          </div>

          {/* Email button */}
          <div className="lf-social-wrap">
            <button
              className="lf-btn lf-btn-social"
              onClick={() => setTooltip(tooltip === 'email' ? null : 'email')}
              onMouseEnter={() => setTooltip('email')}
              onMouseLeave={() => setTooltip(null)}
              aria-label="Login dengan Email — segera hadir"
              type="button"
            >
              <span className="lf-social-icon lf-email-icon" aria-hidden="true">📧</span>
              <span>Continue with Email</span>
            </button>
            {tooltip === 'email' && (
              <div className="lf-tooltip" role="tooltip">
                🚀 Coming soon!
              </div>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="lf-footer">
          Dengan masuk, kamu menyetujui{' '}
          <span className="lf-footer-link">Syarat &amp; Ketentuan</span> kami.
        </p>
      </div>

      {/* Corner decorations */}
      <div className="lf-corner lf-corner-tl" aria-hidden="true" />
      <div className="lf-corner lf-corner-tr" aria-hidden="true" />
      <div className="lf-corner lf-corner-bl" aria-hidden="true" />
      <div className="lf-corner lf-corner-br" aria-hidden="true" />
    </div>
  );
}
