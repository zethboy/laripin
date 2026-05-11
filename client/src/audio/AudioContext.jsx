import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import audioManager from './AudioManager';

/**
 * AudioContext — React Context that exposes AudioManager state & controls.
 *
 * Mounted at main.jsx level (outside App) so it persists across all
 * page transitions. Components use `useAudio()` hook to access controls.
 */
const AudioCtx = createContext(null);

export function AudioProvider({ children }) {
  const [volume, setVolumeState] = useState(audioManager.getVolume());
  const [muted, setMutedState] = useState(audioManager.isMuted());
  const [initialized, setInitialized] = useState(audioManager.isInitialized());
  const [currentTrack, setCurrentTrack] = useState(audioManager.getCurrentTrack());

  // Subscribe to AudioManager state changes
  useEffect(() => {
    const unsub = audioManager.subscribe(() => {
      setVolumeState(audioManager.getVolume());
      setMutedState(audioManager.isMuted());
      setInitialized(audioManager.isInitialized());
      setCurrentTrack(audioManager.getCurrentTrack());
    });
    return unsub;
  }, []);

  // Initialize audio on first user interaction (browser policy)
  useEffect(() => {
    const handleInteraction = () => {
      if (!audioManager.isInitialized()) {
        audioManager.init();
      }
    };
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  const setVolume = useCallback((v) => {
    audioManager.setVolume(v);
  }, []);

  const toggleMute = useCallback(() => {
    audioManager.toggleMute();
  }, []);

  const playBGM = useCallback((track) => {
    audioManager.playBGM(track);
  }, []);

  const stopBGM = useCallback(() => {
    audioManager.stopBGM();
  }, []);

  const playTransition = useCallback(() => {
    audioManager.playTransition();
  }, []);

  const value = {
    volume,
    muted,
    initialized,
    currentTrack,
    setVolume,
    toggleMute,
    playBGM,
    stopBGM,
    playTransition,
    audioManager, // direct access for SFX context
  };

  return (
    <AudioCtx.Provider value={value}>
      {children}
    </AudioCtx.Provider>
  );
}

/** Hook for consuming audio controls in any component */
export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used within <AudioProvider>');
  return ctx;
}
