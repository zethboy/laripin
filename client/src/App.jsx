import { useState } from 'react';
import Login from './pages/Login';
import LoginForm from './pages/LoginForm';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import Result from './pages/Result';
import ConnectionStatus from './components/ConnectionStatus';
import './App.css';

/**
 * App — root router
 *
 * Page flow:
 *   login (splash) → loginForm (cosmetic) → home → lobby → game → result
 *
 * goTo() wraps every transition in a 250 ms fade-out so page-wrap's
 * CSS animation plays before the new page mounts.
 */
export default function App() {
  const [page, setPage] = useState('login');
  const [transitioning, setTransitioning] = useState(false);
  const [playerInfo, setPlayerInfo] = useState({ username: '', avatarId: 'pingo' });
  const [roomCode, setRoomCode] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  // Capture question_start data that arrives while Lobby→Game transition is happening
  const [initialQuestion, setInitialQuestion] = useState(null);

  // Smooth page transition: fade-out → swap → fade-in
  const goTo = (nextPage) => {
    setTransitioning(true);
    setTimeout(() => {
      setPage(nextPage);
      setTransitioning(false);
    }, 250);
  };

  return (
    <div className="app">
      {/* Global socket connection banner (fixed, always on top) */}
      <ConnectionStatus />

      {/* Page wrapper — toggles page-out / page-in CSS classes */}
      <div className={`page-wrap ${transitioning ? 'page-out' : 'page-in'}`}>

        {/* ── 1. Splash screen ── */}
        {page === 'login' && (
          <Login onPlay={() => goTo('loginForm')} />
        )}

        {/* ── 2. Cosmetic login form ── */}
        {page === 'loginForm' && (
          <LoginForm onGuest={() => goTo('home')} />
        )}

        {/* ── 3. Username + character + room select ── */}
        {page === 'home' && (
          <Home
            onEnter={(info, code) => {
              setPlayerInfo(info);
              setRoomCode(code);
              goTo('lobby');
            }}
          />
        )}

        {/* ── 4. Lobby / waiting room ── */}
        {page === 'lobby' && (
          <Lobby
            playerInfo={playerInfo}
            roomCode={roomCode}
            onGameStart={(questionData) => {
              setInitialQuestion(questionData);
              goTo('game');
            }}
            onLeave={() => goTo('home')}
          />
        )}

        {/* ── 5. Game arena ── */}
        {page === 'game' && (
          <Game
            playerInfo={playerInfo}
            roomCode={roomCode}
            initialQuestion={initialQuestion}
            onGameOver={(lb) => {
              setInitialQuestion(null);
              setLeaderboard(lb);
              goTo('result');
            }}
          />
        )}

        {/* ── 6. Result / leaderboard ── */}
        {page === 'result' && (
          <Result
            leaderboard={leaderboard}
            myId={playerInfo.socketId}
            onPlayAgain={() => goTo('home')}
          />
        )}
      </div>
    </div>
  );
}
