import { useState, useRef, useEffect } from 'react';
import { useAudio } from '../audio/AudioContext';
import '../styles/SoundController.css';

/**
 * SoundController — Floating audio controller (bottom-right corner)
 *
 * Features:
 * - Click to toggle mute/unmute
 * - Click + drag slider to adjust volume
 * - Glassmorphism style matching project theme
 * - Responsive mobile + desktop
 */
export default function SoundController() {
  const { volume, muted, initialized, setVolume, toggleMute } = useAudio();
  const [showSlider, setShowSlider] = useState(false);
  const wrapRef = useRef(null);
  const hideTimerRef = useRef(null);

  // Auto-hide slider after 3s of inactivity
  useEffect(() => {
    if (showSlider) {
      hideTimerRef.current = setTimeout(() => setShowSlider(false), 3000);
    }
    return () => clearTimeout(hideTimerRef.current);
  }, [showSlider, volume]);

  // Close slider on outside click
  useEffect(() => {
    if (!showSlider) return;
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowSlider(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSlider]);

  if (!initialized) return null;

  const handleToggleSlider = (e) => {
    e.stopPropagation();
    setShowSlider(prev => !prev);
  };

  const handleVolumeChange = (e) => {
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setShowSlider(false), 3000);
    setVolume(Number(e.target.value));
  };

  const volumePercent = Math.round(volume * 100);
  const icon = muted || volume === 0 ? '🔇' : volume < 0.4 ? '🔉' : '🔊';

  return (
    <div className="sound-ctrl-wrap" ref={wrapRef}>
      {/* Volume slider popup */}
      {showSlider && (
        <div className="sound-slider-popup" onClick={e => e.stopPropagation()}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={muted ? 0 : volume}
            onChange={handleVolumeChange}
            className="sound-slider"
            aria-label="Volume"
          />
          <span className="sound-slider-label">{volumePercent}%</span>
        </div>
      )}

      {/* Main floating button */}
      <button
        className={`sound-ctrl-btn ${muted ? 'sound-ctrl-btn--muted' : ''}`}
        onClick={toggleMute}
        onContextMenu={(e) => { e.preventDefault(); handleToggleSlider(e); }}
        onDoubleClick={handleToggleSlider}
        aria-label={muted ? 'Unmute audio' : 'Mute audio'}
        title="Klik: mute/unmute | Double-klik: volume"
      >
        <span className="sound-ctrl-icon">{icon}</span>
      </button>

      {/* Volume toggle button (separate small button) */}
      <button
        className="sound-ctrl-expand"
        onClick={handleToggleSlider}
        aria-label="Adjust volume"
        title="Atur volume"
      >
        ⚙
      </button>
    </div>
  );
}
