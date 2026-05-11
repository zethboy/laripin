import { useState, useEffect } from 'react';
import Login from './pages/Login';
import LoginForm from './pages/LoginForm';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import Result from './pages/Result';
import ConnectionStatus from './components/ConnectionStatus';
import SoundController from './components/SoundController';
import { useAudio } from './audio/AudioContext';
import socket from './socket';
import './App.css';
import './styles/KickModal.css';

/**
 * App — root router & global state
 */
export default function App() {
  const [page, setPage] = useState('login');
  const [transitioning, setTransitioning] = useState(false);
  const [playerInfo, setPlayerInfo] = useState({ username: '', avatarId: 'pingo', socketId: '' });
  const [roomCode, setRoomCode] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [initialQuestion, setInitialQuestion] = useState(null);

  // New Global States
  const [isSpectator, setIsSpectator] = useState(false);
  const [kickMessage, setKickMessage] = useState('');

  const { playBGM, playTransition } = useAudio();

  // ── Global Socket Listeners ──
  useEffect(() => {
    const handleKick = ({ message }) => {
      setKickMessage(message || 'Kamu dikeluarkan oleh host.');
      setRoomCode('');
      setIsSpectator(false);
      setPage('home');
      // Clear message after 4s
      setTimeout(() => setKickMessage(''), 4000);
    };

    const handleKickGlobal = ({ targetName }) => {
      if (targetName === playerInfo.username) {
        handleKick({ message: 'Kamu dikeluarkan oleh host.' });
      }
    };

    socket.on('player_kicked', handleKick);
    socket.on('player_kicked_global', handleKickGlobal);
    return () => {
      socket.off('player_kicked', handleKick);
      socket.off('player_kicked_global', handleKickGlobal);
    };
  }, [playerInfo.username]);

  // ── BGM Manager ──
  useEffect(() => {
    // Determine BGM track based on current page
    if (['login', 'loginForm', 'home', 'lobby'].includes(page)) {
      playBGM('lobby');
    } else if (page === 'game') {
      playBGM('game');
    } else if (page === 'result') {
      playBGM('result');
    }
  }, [page, playBGM]);

  const goTo = (nextPage) => {
    setTransitioning(true);
    playTransition();
    setTimeout(() => {
      setPage(nextPage);
      setTransitioning(false);
    }, 250);
  };

  return (
    <div className="app">
      <ConnectionStatus />
      
      {/* Global Sound Controller */}
      <SoundController />

      {/* Kick Notification Toast */}
      {kickMessage && (
        <div className="kicked-toast">
          <span className="kicked-toast-icon">⚠️</span>
          <span>{kickMessage}</span>
        </div>
      )}

      <div className={`page-wrap ${transitioning ? 'page-out' : 'page-in'}`}>

        {page === 'login' && (
          <Login onPlay={() => goTo('loginForm')} />
        )}

        {page === 'loginForm' && (
          <LoginForm onGuest={() => goTo('home')} />
        )}

        {page === 'home' && (
          <Home
            onEnter={(info, code, spectatorMode = false) => {
              setPlayerInfo(info);
              setRoomCode(code);
              setIsSpectator(spectatorMode);
              goTo('lobby');
            }}
          />
        )}

        {page === 'lobby' && (
          <Lobby
            playerInfo={playerInfo}
            roomCode={roomCode}
            isSpectator={isSpectator}
            setIsSpectator={setIsSpectator}
            onGameStart={(questionData) => {
              setInitialQuestion(questionData);
              goTo('game');
            }}
            onLeave={() => {
              setIsSpectator(false);
              goTo('home');
            }}
          />
        )}

        {page === 'game' && (
          <Game
            playerInfo={playerInfo}
            roomCode={roomCode}
            initialQuestion={initialQuestion}
            isSpectator={isSpectator}
            onGameOver={(lb) => {
              setInitialQuestion(null);
              setLeaderboard(lb);
              goTo('result');
            }}
          />
        )}

        {page === 'result' && (
          <Result
            leaderboard={leaderboard}
            myId={playerInfo.socketId}
            onPlayAgain={() => {
              setIsSpectator(false);
              goTo('home');
            }}
          />
        )}
      </div>
    </div>
  );
}
