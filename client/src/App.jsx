import { useState } from 'react';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import Result from './pages/Result';
import './App.css';

export default function App() {
  const [page, setPage] = useState('home');
  const [playerInfo, setPlayerInfo] = useState({ username: '', avatarId: 'pingo' });
  const [roomCode, setRoomCode] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);

  const goTo = (p) => setPage(p);

  return (
    <div className="app">
      {page === 'home' && (
        <Home
          onEnter={(info, code, isNew) => {
            setPlayerInfo(info);
            setRoomCode(code);
            goTo('lobby');
          }}
        />
      )}
      {page === 'lobby' && (
        <Lobby
          playerInfo={playerInfo}
          roomCode={roomCode}
          onGameStart={() => goTo('game')}
          onLeave={() => goTo('home')}
        />
      )}
      {page === 'game' && (
        <Game
          playerInfo={playerInfo}
          roomCode={roomCode}
          onGameOver={(lb) => { setLeaderboard(lb); goTo('result'); }}
        />
      )}
      {page === 'result' && (
        <Result
          leaderboard={leaderboard}
          myId={playerInfo.socketId}
          onPlayAgain={() => goTo('home')}
        />
      )}
    </div>
  );
}
