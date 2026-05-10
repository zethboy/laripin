import { useState, useEffect, useRef, useCallback } from 'react';
import socket from '../socket';
import { getCharacter } from '../constants/characters';
import '../styles/Game.css';

/* ============================================================
   WEB AUDIO — Pure JS sound synthesis, no library needed
   All sounds use AudioContext oscillators / buffers
   ============================================================ */

/**
 * Returns the shared AudioContext (created lazily after user gesture).
 * Browser policy: AudioContext must be created/resumed after a user interaction.
 */
let _audioCtx = null;
function getAudioCtx() {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended (some browsers require this)
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

/** Play a sequence of tones defined as [frequency, startTime, duration, volume] */
function playTones(tones, waveform = 'sine') {
  const ctx = getAudioCtx();
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.25, ctx.currentTime);
  masterGain.connect(ctx.destination);

  tones.forEach(([freq, start, dur, vol = 1]) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = waveform;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
    gain.gain.setValueAtTime(vol * 0.25, ctx.currentTime + start);
    // Quick fade-out to avoid clicks
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + dur + 0.01);
  });
}

/** ✅ Correct answer — ascending pleasant chime */
function playCorrectSound() {
  playTones([
    [523, 0.00, 0.12, 0.9],  // C5
    [659, 0.10, 0.12, 0.8],  // E5
    [784, 0.20, 0.25, 1.0],  // G5
    [1047,0.32, 0.35, 0.7],  // C6
  ], 'sine');
}

/** ❌ Wrong answer — descending buzzer */
function playWrongSound() {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.35);
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.42);
}

/** ⏱ Tick sound for urgent timer (≤ 3 s) */
function playTickSound() {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.08);
}

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

  useEffect(() => {
    // Play an ascending tone for each count
    const toneFreqs = [261, 329, 392, 784]; // C, E, G, G(high)
    let step = 0;

    const tick = () => {
      step++;
      if (step < 4) {
        // Play tone
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = toneFreqs[step - 1] || 523;
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.28);

        setCount(4 - step); // 3 → 2 → 1
        setLabel(String(4 - step));
      }
    };

    const sequence = [
      setTimeout(() => { setLabel('3'); }, 0),
      setTimeout(() => { setLabel('2'); tick(); }, 1000),
      setTimeout(() => { setLabel('1'); tick(); }, 2000),
      setTimeout(() => {
        // "GO!" with a fanfare burst
        setLabel('GO!');
        playTones([[523,0,0.1],[659,0.08,0.1],[784,0.16,0.2],[1047,0.28,0.4,1.2]], 'sine');
      }, 3000),
      setTimeout(() => onDone(), 3700),
    ];

    return () => sequence.forEach(clearTimeout);
  }, [onDone]);

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
export default function Game({ playerInfo, roomCode, onGameOver }) {
  const [players, setPlayers] = useState([]);
  const [question, setQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [answered, setAnswered] = useState(false);
  const [myChoice, setMyChoice] = useState(null); // true | false | null
  const [lanes, setLanes] = useState({});
  const [animStates, setAnimStates] = useState({});
  const [result, setResult] = useState(null);
  const [phase, setPhase] = useState('playing'); // 'playing' | 'result'
  const [showCountdown, setShowCountdown] = useState(false);
  const [floatingReaction, setFloatingReaction] = useState(null); // '+1' | '❌' | null

  const timerRef = useRef(null);
  const timerBarRef = useRef(null);
  const tickFiredRef = useRef(false); // prevent multiple tick sounds per second
  const prevTimeLeft = useRef(timeLeft);

  /* ── Tick sound when timer hits urgent zone ── */
  useEffect(() => {
    if (timeLeft <= 3 && timeLeft > 0 && phase === 'playing' && timeLeft !== prevTimeLeft.current) {
      playTickSound();
    }
    prevTimeLeft.current = timeLeft;
  }, [timeLeft, phase]);

  /* ── Socket listeners ── */
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
      setMyChoice(null);
      setResult(null);
      setPhase('playing');
      setFloatingReaction(null);

      // Show countdown overlay only before the very first question
      if (questionIndex === 0) {
        setShowCountdown(true);
        // Timer bar will start after countdown is dismissed
      } else {
        startTimerBar(timer);
        startLocalTimer(timer);
      }

      // Reset lane positions and animations
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

      // Animate each player celebrate/fall
      scores.forEach(s => {
        setAnimStates(prev => ({ ...prev, [s.id]: s.wasCorrect ? 'celebrate' : 'fall' }));
      });

      // Play sound for my result
      const myResult = scores.find(s => s.id === socket.id);
      if (myResult) {
        if (myResult.wasCorrect) playCorrectSound();
        else playWrongSound();
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
  }, []);

  /* ── Timer helpers ── */
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

  /* Called when countdown "3-2-1-GO" finishes */
  const handleCountdownDone = useCallback(() => {
    setShowCountdown(false);
    // Now start the real timer for question #0
    setTimeLeft(prev => {
      startTimerBar(prev);
      startLocalTimer(prev);
      return prev;
    });
  }, [startTimerBar, startLocalTimer]);

  /* ── Answer handler ── */
  const handleAnswer = (choice) => {
    if (answered || phase !== 'playing') return;
    setAnswered(true);
    setMyChoice(choice);
    socket.emit('player_answer', { roomCode, answer: choice });

    // Show floating reaction (will be updated when result arrives)
    // For now just show a lock icon
    setFloatingReaction('🔒');
    setTimeout(() => setFloatingReaction(null), 1200);
  };

  /* Update floating reaction when result arrives for my answer */
  useEffect(() => {
    if (phase === 'result' && result && myChoice !== null) {
      const myResult = result.scores?.find(s => s.id === socket.id);
      if (myResult) {
        setFloatingReaction(myResult.wasCorrect ? '+1 ✨' : '❌');
        setTimeout(() => setFloatingReaction(null), 2000);
      }
    }
  }, [phase, result]);

  const myScore = result?.scores?.find(s => s.id === socket.id)?.score ?? 0;

  const benarPlayers = players.filter(p => lanes[p.id] === 'benar');
  const salahPlayers = players.filter(p => lanes[p.id] === 'salah');
  const neutralPlayers = players.filter(p => !lanes[p.id]);

  return (
    <div className="game-page">

      {/* ── Countdown overlay (first question only) ── */}
      {showCountdown && (
        <CountdownOverlay onDone={handleCountdownDone} />
      )}

      {/* ── Top HUD ── */}
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

      {/* ── Timer bar ── */}
      <div className="timer-bar-track">
        <div
          ref={timerBarRef}
          className={`timer-bar-fill ${timeLeft <= 3 ? 'urgent' : ''}`}
        />
      </div>

      {/* ── Statement ── */}
      {question && (
        <div className="statement-wrap">
          <div className="question-category">{question.category}</div>
          <div className="question-statement">"{question.statement}"</div>
        </div>
      )}

      {/* ── Result banner ── */}
      {phase === 'result' && result && (
        <div className={`result-banner ${result.correctAnswer ? 'correct' : 'incorrect'}`}>
          Jawaban: <strong>{result.correctAnswer ? '✓ BENAR' : '✗ SALAH'}</strong>
        </div>
      )}

      {/* ── Arena — 3 lanes ── */}
      <div className="arena">
        {/* BENAR lane */}
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

        {/* SALAH lane */}
        <div className={`lane lane-salah ${phase === 'result' && !result?.correctAnswer ? 'lane-highlight' : ''}`}>
          <div className="lane-label neon-text-red">SALAH</div>
          <div className="lane-chars">
            {salahPlayers.map(p => (
              <CharacterUnit key={p.id} player={p} isMe={p.id === socket.id} animState={animStates[p.id] || 'idle'} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Answer buttons + floating reaction ── */}
      <div className="answer-area">
        <div className="answer-buttons">
          <div className="answer-btn-wrap">
            {/* Floating reaction above BENAR button */}
            {floatingReaction && myChoice === true && (
              <div className="floating-reaction">{floatingReaction}</div>
            )}
            <button
              id="btn-benar"
              className={`btn-primary btn-benar
                ${answered && myChoice === true ? 'btn-flash-benar' : ''}
                ${answered ? 'btn-answered' : ''}`}
              onClick={() => handleAnswer(true)}
              disabled={answered || phase === 'result'}
              aria-label="Jawab Benar"
            >
              ✓ BENAR
            </button>
          </div>

          <div className="answer-btn-wrap">
            {/* Floating reaction above SALAH button */}
            {floatingReaction && myChoice === false && (
              <div className="floating-reaction">{floatingReaction}</div>
            )}
            <button
              id="btn-salah"
              className={`btn-primary btn-salah
                ${answered && myChoice === false ? 'btn-flash-salah' : ''}
                ${answered ? 'btn-answered' : ''}`}
              onClick={() => handleAnswer(false)}
              disabled={answered || phase === 'result'}
              aria-label="Jawab Salah"
            >
              ✗ SALAH
            </button>
          </div>
        </div>
      </div>

      {answered && phase === 'playing' && (
        <div className="answered-msg">Jawabanmu sudah terkunci! 🔒</div>
      )}

      {/* ── "Next question coming..." — shown while waiting after result ── */}
      {phase === 'result' && (
        <div className="waiting-next" aria-live="polite">
          <span>Bersiap untuk soal berikutnya</span>
          <span className="waiting-next-dots" aria-hidden="true">
            <span className="waiting-next-dot" />
            <span className="waiting-next-dot" />
            <span className="waiting-next-dot" />
          </span>
        </div>
      )}
    </div>
  );
}
