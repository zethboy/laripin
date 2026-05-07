import { useState, useEffect, useRef } from 'react';
import socket from '../socket';
import { getCharacter } from '../constants/characters';
import '../styles/Game.css';

// Character states: idle | running | celebrate | fall
function CharacterUnit({ player, isMe, animState }) {
  const char = getCharacter(player.avatarId);
  return (
    <div className="char-unit">
      <span className={`character-emoji state-${animState}`}>{char.emoji}</span>
      <span className={`character-name-tag ${isMe ? 'is-me' : ''}`}>
        {isMe ? '★ ' : ''}{player.username}
      </span>
    </div>
  );
}

export default function Game({ playerInfo, roomCode, onGameOver }) {
  const [players, setPlayers] = useState([]);
  const [question, setQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [answered, setAnswered] = useState(false);
  const [lanes, setLanes] = useState({}); // { socketId: 'benar' | 'salah' | null }
  const [animStates, setAnimStates] = useState({}); // { socketId: 'idle' | 'running' | 'celebrate' | 'fall' }
  const [result, setResult] = useState(null); // { correctAnswer, scores }
  const [phase, setPhase] = useState('playing'); // 'playing' | 'result'
  const timerRef = useRef(null);
  const timerBarRef = useRef(null);

  useEffect(() => {
    socket.on('room_update', ({ players }) => {
      setPlayers(players);
      const initLanes = {};
      const initAnims = {};
      players.forEach(p => { initLanes[p.id] = null; initAnims[p.id] = 'idle'; });
      setLanes(initLanes);
      setAnimStates(initAnims);
    });

    socket.on('question_start', ({ statement, category, questionIndex, total, timer }) => {
      setQuestion({ statement, category });
      setQuestionIndex(questionIndex);
      setTotalQuestions(total);
      setTimeLeft(timer);
      setAnswered(false);
      setResult(null);
      setPhase('playing');
      // Reset all lanes and animations
      setLanes(prev => {
        const reset = {};
        Object.keys(prev).forEach(id => { reset[id] = null; });
        return reset;
      });
      setAnimStates(prev => {
        const reset = {};
        Object.keys(prev).forEach(id => { reset[id] = 'idle'; });
        return reset;
      });
      // Start timer bar animation
      if (timerBarRef.current) {
        timerBarRef.current.style.transition = 'none';
        timerBarRef.current.style.width = '100%';
        setTimeout(() => {
          if (timerBarRef.current) {
            timerBarRef.current.style.transition = `width ${timer}s linear`;
            timerBarRef.current.style.width = '0%';
          }
        }, 50);
      }
      // Local countdown
      clearInterval(timerRef.current);
      let t = timer;
      timerRef.current = setInterval(() => {
        t--;
        setTimeLeft(t);
        if (t <= 0) clearInterval(timerRef.current);
      }, 1000);
    });

    socket.on('player_moved', ({ playerId, choseLane }) => {
      setLanes(prev => ({ ...prev, [playerId]: choseLane }));
      // Running animation then idle after 700ms
      setAnimStates(prev => ({ ...prev, [playerId]: 'running' }));
      setTimeout(() => {
        setAnimStates(prev => ({ ...prev, [playerId]: 'idle' }));
      }, 700);
    });

    socket.on('question_result', ({ correctAnswer, scores }) => {
      clearInterval(timerRef.current);
      setResult({ correctAnswer, scores });
      setPhase('result');
      // Animate celebrate/fall per player
      scores.forEach(s => {
        setAnimStates(prev => ({ ...prev, [s.id]: s.wasCorrect ? 'celebrate' : 'fall' }));
      });
    });

    socket.on('game_over', ({ leaderboard }) => {
      clearInterval(timerRef.current);
      setTimeout(() => onGameOver(leaderboard), 1500);
    });

    return () => {
      socket.off('room_update');
      socket.off('question_start');
      socket.off('player_moved');
      socket.off('question_result');
      socket.off('game_over');
      clearInterval(timerRef.current);
    };
  }, []);

  const handleAnswer = (choice) => {
    if (answered || phase !== 'playing') return;
    setAnswered(true);
    socket.emit('player_answer', { roomCode, answer: choice });
  };

  const myScore = result?.scores?.find(s => s.id === socket.id)?.score ?? 0;

  const benarPlayers = players.filter(p => lanes[p.id] === 'benar');
  const salahPlayers = players.filter(p => lanes[p.id] === 'salah');
  const neutralPlayers = players.filter(p => !lanes[p.id]);

  return (
    <div className="game-page">
      {/* Top HUD */}
      <div className="game-hud">
        <div className="hud-item">
          <span className="hud-label">SOAL</span>
          <span className="hud-value">{questionIndex + 1}/{totalQuestions}</span>
        </div>
        <div className={`hud-timer ${timeLeft <= 3 ? 'urgent' : ''}`}>
          <span className="timer-num">{timeLeft}</span>
        </div>
        <div className="hud-item right">
          <span className="hud-label">POIN</span>
          <span className="hud-value neon-text-green">{myScore}</span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="timer-bar-track">
        <div
          ref={timerBarRef}
          className={`timer-bar-fill ${timeLeft <= 3 ? 'urgent' : ''}`}
        />
      </div>

      {/* Category + Statement */}
      {question && (
        <div className="statement-wrap">
          <div className="question-category">{question.category}</div>
          <div className="question-statement">"{question.statement}"</div>
        </div>
      )}

      {/* Result overlay */}
      {phase === 'result' && result && (
        <div className={`result-banner ${result.correctAnswer ? 'correct' : 'incorrect'}`}>
          Jawaban: <strong>{result.correctAnswer ? '✓ BENAR' : '✗ SALAH'}</strong>
        </div>
      )}

      {/* Arena — 3 lanes */}
      <div className="arena">
        {/* BENAR Lane */}
        <div className={`lane lane-benar ${phase === 'result' && result?.correctAnswer ? 'lane-highlight' : ''}`}>
          <div className="lane-label neon-text-green">BENAR</div>
          <div className="lane-chars">
            {benarPlayers.map(p => (
              <CharacterUnit key={p.id} player={p} isMe={p.id === socket.id} animState={animStates[p.id] || 'idle'} />
            ))}
          </div>
        </div>

        {/* NEUTRAL zone */}
        <div className="lane lane-neutral">
          <div className="lane-label" style={{ color: 'var(--text-secondary)' }}>?</div>
          <div className="lane-chars">
            {neutralPlayers.map(p => (
              <CharacterUnit key={p.id} player={p} isMe={p.id === socket.id} animState={animStates[p.id] || 'idle'} />
            ))}
          </div>
        </div>

        {/* SALAH Lane */}
        <div className={`lane lane-salah ${phase === 'result' && !result?.correctAnswer ? 'lane-highlight' : ''}`}>
          <div className="lane-label neon-text-red">SALAH</div>
          <div className="lane-chars">
            {salahPlayers.map(p => (
              <CharacterUnit key={p.id} player={p} isMe={p.id === socket.id} animState={animStates[p.id] || 'idle'} />
            ))}
          </div>
        </div>
      </div>

      {/* Answer buttons */}
      <div className="answer-buttons">
        <button
          className={`btn-primary btn-benar ${answered ? 'btn-answered' : ''}`}
          onClick={() => handleAnswer(true)}
          disabled={answered || phase === 'result'}
        >
          ✓ BENAR
        </button>
        <button
          className={`btn-primary btn-salah ${answered ? 'btn-answered' : ''}`}
          onClick={() => handleAnswer(false)}
          disabled={answered || phase === 'result'}
        >
          ✗ SALAH
        </button>
      </div>

      {answered && phase === 'playing' && (
        <div className="answered-msg">Jawabanmu sudah terkunci! 🔒</div>
      )}
    </div>
  );
}
