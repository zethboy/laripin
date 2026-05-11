import { useState, useEffect, useRef, useCallback } from 'react';
import socket from '../socket';
import { getCharacter } from '../constants/characters';
import { useAudio } from '../audio/AudioContext';
import '../styles/Game.css';
import '../styles/KickModal.css';

/* ============================================================
   CharacterUnit sub-component
   ============================================================ */
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

/* ============================================================
   CountdownOverlay — "3 … 2 … 1 … GO!"
   ============================================================ */
function CountdownOverlay({ onDone }) {
  const [count, setCount] = useState(3);
  const [label, setLabel] = useState('3');
  const { audioManager } = useAudio();

  useEffect(() => {
    const ctx = audioManager.getContext();
    const dest = audioManager.getSfxDestination();
    if (!ctx || !dest) return;

    const toneFreqs = [261, 329, 392, 784]; // C, E, G, G(high)
    let step = 0;

    const playStepTone = (freq, vol = 0.2, dur = 0.25) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + dur + 0.05);
    };

    const tick = () => {
      step++;
      if (step < 4) {
        playStepTone(toneFreqs[step - 1]);
        setCount(4 - step);
        setLabel(String(4 - step));
      }
    };

    const sequence = [
      setTimeout(() => { setLabel('3'); }, 0),
      setTimeout(() => { setLabel('2'); tick(); }, 1000),
      setTimeout(() => { setLabel('1'); tick(); }, 2000),
      setTimeout(() => {
        setLabel('GO!');
        // GO! Fanfare
        [523, 659, 784, 1047].forEach((f, i) => {
          setTimeout(() => playStepTone(f, 0.25, 0.4), i * 80);
        });
      }, 3000),
      setTimeout(() => onDone(), 3700),
    ];

    return () => sequence.forEach(clearTimeout);
  }, [onDone, audioManager]);

  const isGo = label === 'GO!';

  return (
    <div className="countdown-overlay" aria-live="assertive">
      <div className={`countdown-number ${isGo ? 'countdown-go' : ''}`}>
        {label}
      </div>
    </div>
  );
}

/* ============================================================
   Main Game component
   ============================================================ */
export default function Game({ playerInfo, roomCode, initialQuestion, isSpectator, onGameOver }) {
  const [players, setPlayers] = useState([]);
  const [question, setQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [answered, setAnswered] = useState(false);
  const [myChoice, setMyChoice] = useState(null);
  const [lanes, setLanes] = useState({});
  const [animStates, setAnimStates] = useState({});
  const [result, setResult] = useState(null);
  const [phase, setPhase] = useState('playing'); // 'playing' | 'result'
  const [showCountdown, setShowCountdown] = useState(false);
  const [floatingReaction, setFloatingReaction] = useState(null);

  const { audioManager } = useAudio();

  const timerRef = useRef(null);
  const timerBarRef = useRef(null);
  const prevTimeLeft = useRef(timeLeft);
  const pendingTimerDuration = useRef(10);

  /* ── SFX Helpers using shared context ── */
  const playSFX = useCallback((type) => {
    const ctx = audioManager.getContext();
    const dest = audioManager.getSfxDestination();
    if (!ctx || !dest) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'tick') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime); // Increased from 0.08
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'correct') {
      [523, 659, 784, 1047].forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.1);
        g.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.1); // Increased from 0.15
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
        o.connect(g);
        g.connect(dest);
        o.start(ctx.currentTime + i * 0.1);
        o.stop(ctx.currentTime + i * 0.1 + 0.35);
      });
      return;
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.25, ctx.currentTime); // Increased from 0.15
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.42);
    }

    osc.connect(gain);
    gain.connect(dest);
  }, [audioManager]);

  /* ── Tick sound logic ── */
  useEffect(() => {
    if (timeLeft <= 3 && timeLeft > 0 && phase === 'playing' && timeLeft !== prevTimeLeft.current) {
      playSFX('tick');
    }
    prevTimeLeft.current = timeLeft;
  }, [timeLeft, phase, playSFX]);

  /* ── Socket listeners ── */
  useEffect(() => {
    socket.on('room_update', ({ players }) => {
      setPlayers(players);
      setLanes(prev => {
        const next = { ...prev };
        players.forEach(p => { if (!(p.id in next)) next[p.id] = null; });
        return next;
      });
      setAnimStates(prev => {
        const next = { ...prev };
        players.forEach(p => { if (!(p.id in next)) next[p.id] = 'idle'; });
        return next;
      });
    });

    socket.on('question_start', ({ statement, category, questionIndex, total, timer }) => {
      setQuestion({ statement, category });
      setQuestionIndex(questionIndex);
      setTotalQuestions(total);
      setTimeLeft(timer);
      pendingTimerDuration.current = timer;
      setAnswered(false);
      setMyChoice(null);
      setResult(null);
      setPhase('playing');
      setFloatingReaction(null);

      if (questionIndex === 0) {
        setShowCountdown(true);
      } else {
        startTimerBar(timer);
        startLocalTimer(timer);
      }

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
    });

    socket.on('player_moved', ({ playerId, choseLane }) => {
      setLanes(prev => ({ ...prev, [playerId]: choseLane }));
      setAnimStates(prev => ({ ...prev, [playerId]: 'running' }));
      setTimeout(() => {
        setAnimStates(prev => ({ ...prev, [playerId]: 'idle' }));
      }, 700);
    });

    socket.on('question_result', ({ correctAnswer, scores }) => {
      clearInterval(timerRef.current);
      setResult({ correctAnswer, scores });
      setPhase('result');

      scores.forEach(s => {
        setAnimStates(prev => ({ ...prev, [s.id]: s.wasCorrect ? 'celebrate' : 'fall' }));
      });

      // Play result sound if not spectator
      if (!isSpectator) {
        const myResult = scores.find(s => s.id === socket.id);
        if (myResult) {
          playSFX(myResult.wasCorrect ? 'correct' : 'wrong');
        }
      }
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
  }, [onGameOver, playSFX, isSpectator]);

  /* ── Initial question processing ── */
  useEffect(() => {
    if (!initialQuestion) return;
    const { statement, category, questionIndex, total, timer, players: initPlayers } = initialQuestion;
    setQuestion({ statement, category });
    setQuestionIndex(questionIndex ?? 0);
    setTotalQuestions(total ?? 10);
    setTimeLeft(timer ?? 10);
    pendingTimerDuration.current = timer ?? 10;
    setAnswered(false);
    setMyChoice(null);
    setResult(null);
    setPhase('playing');

    if (questionIndex === 0) setShowCountdown(true);
    else {
      startTimerBar(timer ?? 10);
      startLocalTimer(timer ?? 10);
    }

    if (initPlayers && initPlayers.length > 0) {
      const lanes = {};
      const anims = {};
      initPlayers.forEach(p => { lanes[p.id] = null; anims[p.id] = 'idle'; });
      setLanes(lanes);
      setAnimStates(anims);
      setPlayers(initPlayers);
    }
  }, [initialQuestion]);

  const startTimerBar = useCallback((duration) => {
    if (timerBarRef.current) {
      timerBarRef.current.style.transition = 'none';
      timerBarRef.current.style.width = '100%';
      setTimeout(() => {
        if (timerBarRef.current) {
          timerBarRef.current.style.transition = `width ${duration}s linear`;
          timerBarRef.current.style.width = '0%';
        }
      }, 50);
    }
  }, []);

  const startLocalTimer = useCallback((duration) => {
    clearInterval(timerRef.current);
    let t = duration;
    timerRef.current = setInterval(() => {
      t--;
      setTimeLeft(t);
      if (t <= 0) clearInterval(timerRef.current);
    }, 1000);
  }, []);

  const handleCountdownDone = useCallback(() => {
    setShowCountdown(false);
    const dur = pendingTimerDuration.current;
    startTimerBar(dur);
    startLocalTimer(dur);
  }, [startTimerBar, startLocalTimer]);

  const handleAnswer = (choice) => {
    if (isSpectator || phase !== 'playing' || timeLeft <= 0) return;
    if (myChoice === choice) return;
    setAnswered(true);
    setMyChoice(choice);
    socket.emit('player_answer', { roomCode, answer: choice });
  };

  useEffect(() => {
    if (!isSpectator && phase === 'result' && result && myChoice !== null) {
      const myResult = result.scores?.find(s => s.id === socket.id);
      if (myResult) {
        setFloatingReaction(myResult.wasCorrect ? '+1 ✨' : '❌');
        setTimeout(() => setFloatingReaction(null), 2000);
      }
    }
  }, [phase, result, myChoice, isSpectator]);

  const myScore = isSpectator ? 0 : (
    phase === 'result' && result
      ? (result.scores?.find(s => s.id === socket.id)?.score ?? 0)
      : (players.find(p => p.id === socket.id)?.score ?? 0)
  );

  const benarPlayers = players.filter(p => lanes[p.id] === 'benar');
  const salahPlayers = players.filter(p => lanes[p.id] === 'salah');
  const neutralPlayers = players.filter(p => !lanes[p.id]);

  return (
    <div className="game-page">
      {isSpectator && (
        <div className="spectator-banner">
          <span className="spectator-banner-icon">👁</span>
          <span>MENONTON SEBAGAI PENONTON (READ-ONLY)</span>
        </div>
      )}

      {showCountdown && <CountdownOverlay onDone={handleCountdownDone} />}

      <div className="game-hud">
        <div className="hud-item">
          <span className="hud-label">SOAL</span>
          <span className="hud-value">{questionIndex + 1}/{totalQuestions}</span>
        </div>
        <div className={`hud-timer ${timeLeft <= 3 ? 'urgent' : ''}`}>
          <span className="timer-num">{timeLeft}</span>
        </div>
        <div className="hud-item right">
          <span className="hud-label">{isSpectator ? 'WATCHING' : 'POIN'}</span>
          <span className="hud-value neon-text-green">{isSpectator ? '...' : myScore}</span>
        </div>
      </div>

      <div className="timer-bar-track">
        <div ref={timerBarRef} className={`timer-bar-fill ${timeLeft <= 3 ? 'urgent' : ''}`} />
      </div>

      {question && (
        <div className="statement-wrap">
          <div className="question-category">{question.category}</div>
          <div className="question-statement">"{question.statement}"</div>
        </div>
      )}

      {phase === 'result' && result && (
        <div className={`result-banner ${result.correctAnswer ? 'correct' : 'incorrect'}`}>
          Jawaban: <strong>{result.correctAnswer ? '✓ BENAR' : '✗ SALAH'}</strong>
        </div>
      )}

      <div className="arena">
        <div className={`lane lane-benar ${phase === 'result' && result?.correctAnswer ? 'lane-highlight' : ''}`}>
          <div className="lane-label neon-text-green">BENAR</div>
          <div className="lane-chars">
            {benarPlayers.map(p => (
              <CharacterUnit key={p.id} player={p} isMe={!isSpectator && p.id === socket.id} animState={animStates[p.id] || 'idle'} />
            ))}
          </div>
        </div>

        <div className="lane lane-neutral">
          <div className="lane-label">?</div>
          <div className="lane-chars">
            {neutralPlayers.map(p => (
              <CharacterUnit key={p.id} player={p} isMe={!isSpectator && p.id === socket.id} animState={animStates[p.id] || 'idle'} />
            ))}
          </div>
        </div>

        <div className={`lane lane-salah ${phase === 'result' && !result?.correctAnswer ? 'lane-highlight' : ''}`}>
          <div className="lane-label neon-text-red">SALAH</div>
          <div className="lane-chars">
            {salahPlayers.map(p => (
              <CharacterUnit key={p.id} player={p} isMe={!isSpectator && p.id === socket.id} animState={animStates[p.id] || 'idle'} />
            ))}
          </div>
        </div>
      </div>

      {!isSpectator ? (
        <div className="answer-area">
          <div className="answer-buttons">
            <div className="answer-btn-wrap">
              {floatingReaction && myChoice === true && <div className="floating-reaction">{floatingReaction}</div>}
              <button
                className={`btn-primary btn-benar ${myChoice === true ? 'btn-flash-benar btn-answered' : ''}`}
                onClick={() => handleAnswer(true)}
                disabled={phase === 'result' || timeLeft <= 0}
              >
                ✓ BENAR
              </button>
            </div>

            <div className="answer-btn-wrap">
              {floatingReaction && myChoice === false && <div className="floating-reaction">{floatingReaction}</div>}
              <button
                className={`btn-primary btn-salah ${myChoice === false ? 'btn-flash-salah btn-answered' : ''}`}
                onClick={() => handleAnswer(false)}
                disabled={phase === 'result' || timeLeft <= 0}
              >
                ✗ SALAH
              </button>
            </div>
          </div>
          {answered && phase === 'playing' && timeLeft > 0 && (
            <div className="answered-msg">Sudah memilih — bisa ganti selagi waktu masih ada! ↔️</div>
          )}
        </div>
      ) : (
        <div className="spectator-msg">
          Melihat arena sebagai penonton... 👁
        </div>
      )}

      {phase === 'result' && (
        <div className="waiting-next">
          <span>Bersiap untuk soal berikutnya</span>
          <span className="waiting-next-dots">
            <span className="waiting-next-dot" />
            <span className="waiting-next-dot" />
            <span className="waiting-next-dot" />
          </span>
        </div>
      )}
    </div>
  );
}
