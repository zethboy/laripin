/**
 * AudioManager — Singleton audio engine for Burjaw
 *
 * Persists across React page transitions (lives outside React lifecycle).
 * Uses Web Audio API oscillators for synthesized BGM — no audio files needed.
 *
 * Usage:
 *   import audioManager from './AudioManager';
 *   audioManager.init();            // call once after first user gesture
 *   audioManager.playBGM('lobby');  // switch BGM track
 *   audioManager.setVolume(0.5);    // 0–1
 *   audioManager.toggleMute();
 */

const FADE_DURATION = 0.8; // seconds for crossfade

class AudioManager {
  constructor() {
    this._ctx = null;
    this._masterGain = null;
    this._bgmGain = null;
    this._sfxGain = null;
    this._volume = 0.5; // Increased from 0.35
    this._muted = false;
    this._currentTrack = null;
    this._bgmNodes = [];     // active oscillator/gain pairs for current BGM
    this._bgmInterval = null;
    this._initialized = false;
    this._listeners = new Set();
  }

  /* ── Public API ── */

  /** Initialize AudioContext (must call after user gesture) */
  init() {
    if (this._initialized) return;
    try {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._masterGain = this._ctx.createGain();
      this._masterGain.gain.setValueAtTime(this._volume, this._ctx.currentTime);
      this._masterGain.connect(this._ctx.destination);

      this._bgmGain = this._ctx.createGain();
      this._bgmGain.gain.setValueAtTime(0.8, this._ctx.currentTime); // Increased from 0.6
      this._bgmGain.connect(this._masterGain);

      this._sfxGain = this._ctx.createGain();
      this._sfxGain.gain.setValueAtTime(1.0, this._ctx.currentTime);
      this._sfxGain.connect(this._masterGain);

      this._initialized = true;
      this._notify();
    } catch (e) {
      console.warn('AudioManager: AudioContext not available', e);
    }
  }

  /** Get the shared AudioContext (for SFX played by components) */
  getContext() {
    if (!this._initialized) return null;
    if (this._ctx.state === 'suspended') this._ctx.resume();
    return this._ctx;
  }

  /** Get SFX gain node (components connect their oscillators here) */
  getSfxDestination() {
    return this._sfxGain || (this._ctx ? this._ctx.destination : null);
  }

  /** Switch BGM to a named track with crossfade */
  playBGM(trackName) {
    if (!this._initialized) return;
    if (this._currentTrack === trackName) return;
    if (this._ctx.state === 'suspended') this._ctx.resume();

    // Fade out current
    this._fadeOutBGM();

    this._currentTrack = trackName;

    // Small delay so fade-out begins before fade-in
    setTimeout(() => {
      if (this._currentTrack !== trackName) return; // track changed again
      switch (trackName) {
        case 'lobby': this._playLobbyBGM(); break;
        case 'game': this._playGameBGM(); break;
        case 'result': this._playResultBGM(); break;
        default: break;
      }
    }, 200);

    this._notify();
  }

  /** Stop all BGM */
  stopBGM() {
    this._fadeOutBGM();
    this._currentTrack = null;
    this._notify();
  }

  /** Play a short transition whoosh */
  playTransition() {
    if (!this._initialized) return;
    const ctx = this._ctx;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(this._sfxGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  }

  setVolume(v) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this._masterGain) {
      this._masterGain.gain.setValueAtTime(this._volume, this._ctx.currentTime);
    }
    this._notify();
  }

  getVolume() { return this._volume; }

  toggleMute() {
    this._muted = !this._muted;
    if (this._masterGain) {
      this._masterGain.gain.setValueAtTime(
        this._muted ? 0 : this._volume,
        this._ctx.currentTime
      );
    }
    this._notify();
  }

  isMuted() { return this._muted; }
  isInitialized() { return this._initialized; }
  getCurrentTrack() { return this._currentTrack; }

  /** Subscribe to state changes (for React re-renders) */
  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  /* ── Internal ── */

  _notify() {
    this._listeners.forEach(fn => fn());
  }

  _fadeOutBGM() {
    // Stop scheduled loop
    if (this._bgmInterval) {
      clearInterval(this._bgmInterval);
      this._bgmInterval = null;
    }
    // Fade out and disconnect existing nodes
    const now = this._ctx.currentTime;
    this._bgmNodes.forEach(({ osc, gain }) => {
      try {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + FADE_DURATION);
        osc.stop(now + FADE_DURATION + 0.1);
      } catch (e) { /* already stopped */ }
    });
    this._bgmNodes = [];
  }

  /* ── BGM Track Generators ── */

  /** Lobby — Chill ambient pad with gentle arpeggiation */
  _playLobbyBGM() {
    const ctx = this._ctx;
    const now = ctx.currentTime;

    // Warm pad chord (C-E-G-B)
    const padFreqs = [130.81, 164.81, 196.0, 246.94];
    padFreqs.forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + FADE_DURATION); // Doubled from 0.06
      osc.connect(gain);
      gain.connect(this._bgmGain);
      osc.start(now);
      this._bgmNodes.push({ osc, gain });
    });

    // Gentle arpeggio loop
    const arpNotes = [261.63, 329.63, 392.0, 493.88, 392.0, 329.63];
    let noteIdx = 0;
    this._bgmInterval = setInterval(() => {
      if (!this._initialized || this._currentTrack !== 'lobby') {
        clearInterval(this._bgmInterval);
        return;
      }
      const freq = arpNotes[noteIdx % arpNotes.length];
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.08, t); // Doubled from 0.04
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.connect(gain);
      gain.connect(this._bgmGain);
      osc.start(t);
      osc.stop(t + 0.65);
      noteIdx++;
    }, 700);
  }

  /** Game — Intense pulsing bass + tension chord */
  _playGameBGM() {
    const ctx = this._ctx;
    const now = ctx.currentTime;

    // Low tension drone
    const droneFreqs = [65.41, 82.41, 98.0];
    droneFreqs.forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + FADE_DURATION); // Increased from 0.03
      osc.connect(gain);
      gain.connect(this._bgmGain);
      osc.start(now);
      this._bgmNodes.push({ osc, gain });
    });

    // Pulsing rhythm
    let beat = 0;
    this._bgmInterval = setInterval(() => {
      if (!this._initialized || this._currentTrack !== 'game') {
        clearInterval(this._bgmInterval);
        return;
      }
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(beat % 4 === 0 ? 110 : 82.41, t);
      gain.gain.setValueAtTime(0.07, t); // Doubled from 0.035
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(gain);
      gain.connect(this._bgmGain);
      osc.start(t);
      osc.stop(t + 0.15);
      beat++;
    }, 400);
  }

  /** Result — Triumphant warm major chord */
  _playResultBGM() {
    const ctx = this._ctx;
    const now = ctx.currentTime;

    // Warm major chord (C-E-G-C)
    const chordFreqs = [261.63, 329.63, 392.0, 523.25];
    chordFreqs.forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + FADE_DURATION);
      osc.connect(gain);
      gain.connect(this._bgmGain);
      osc.start(now);
      this._bgmNodes.push({ osc, gain });
    });

    // Gentle sparkle
    const sparkleNotes = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25];
    let idx = 0;
    this._bgmInterval = setInterval(() => {
      if (!this._initialized || this._currentTrack !== 'result') {
        clearInterval(this._bgmInterval);
        return;
      }
      const freq = sparkleNotes[idx % sparkleNotes.length];
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.03, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      osc.connect(gain);
      gain.connect(this._bgmGain);
      osc.start(t);
      osc.stop(t + 0.85);
      idx++;
    }, 900);
  }
}

// Singleton export
const audioManager = new AudioManager();
export default audioManager;
