import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/LoginForm.css';

export default function LoginForm({ onGuest }) {
  const { loginWithGoogle, login, signup, playAsGuest } = useAuth();
  
  // 'menu' | 'email_login' | 'email_register'
  const [view, setView] = useState('menu');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGuest = () => {
    playAsGuest();
    onGuest();
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      toast.success('Berhasil login dengan Google!');
      onGuest(); // Use onGuest to navigate to Home
    } catch (error) {
      toast.error('Gagal login dengan Google: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (view === 'email_login') {
        await login(email, password);
        toast.success('Berhasil login!');
      } else {
        await signup(email, password);
        toast.success('Berhasil mendaftar!');
      }
      onGuest(); // Use onGuest to navigate to Home
    } catch (error) {
      toast.error('Gagal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lf-page">
      <div className="lf-grid-bg" aria-hidden="true" />
      <div className="lf-card" role="main">
        <div className="lf-logo" aria-label="BURJAW">
          <span className="lf-logo-text">BURJAW</span>
          <span className="lf-logo-dot" aria-hidden="true" />
        </div>

        {view === 'menu' && (
          <>
            <div className="lf-welcome">
              <h1 className="lf-title">Welcome, Player!</h1>
              <p className="lf-subtitle">Pilih cara masuk untuk mulai berlomba</p>
            </div>

            <button
              className="lf-btn lf-btn-guest"
              onClick={handleGuest}
              disabled={loading}
            >
              <span className="lf-btn-icon" aria-hidden="true">🎮</span>
              <span>ENTER AS GUEST</span>
              <span className="lf-btn-arrow" aria-hidden="true">→</span>
            </button>

            <div className="lf-divider" aria-hidden="true">
              <span className="lf-divider-line" />
              <span className="lf-divider-text">atau</span>
              <span className="lf-divider-line" />
            </div>

            <div className="lf-social-btns">
              <div className="lf-social-wrap">
                <button
                  className="lf-btn lf-btn-social"
                  onClick={handleGoogle}
                  disabled={loading}
                  type="button"
                >
                  <svg className="lf-social-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              <div className="lf-social-wrap">
                <button
                  className="lf-btn lf-btn-social"
                  onClick={() => setView('email_login')}
                  disabled={loading}
                  type="button"
                >
                  <span className="lf-social-icon lf-email-icon" aria-hidden="true">📧</span>
                  <span>Continue with Email</span>
                </button>
              </div>
            </div>
          </>
        )}

        {(view === 'email_login' || view === 'email_register') && (
          <form className="lf-email-form" onSubmit={handleEmailSubmit}>
            <div className="lf-welcome">
              <h1 className="lf-title">{view === 'email_login' ? 'Login' : 'Register'}</h1>
            </div>
            
            <input 
              type="email" 
              placeholder="Email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="lf-input"
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="lf-input"
            />
            
            <button type="submit" className="lf-btn lf-btn-guest" disabled={loading}>
              <span>{loading ? 'Processing...' : (view === 'email_login' ? 'LOGIN' : 'REGISTER')}</span>
            </button>

            <p className="lf-footer">
              {view === 'email_login' ? "Belum punya akun? " : "Sudah punya akun? "}
              <span className="lf-footer-link" onClick={() => setView(view === 'email_login' ? 'email_register' : 'email_login')}>
                {view === 'email_login' ? "Daftar di sini" : "Login di sini"}
              </span>
            </p>
            
            <p className="lf-footer" style={{marginTop: '10px'}}>
              <span className="lf-footer-link" onClick={() => setView('menu')}>← Kembali</span>
            </p>
          </form>
        )}

      </div>
    </div>
  );
}

