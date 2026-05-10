import { useState, useEffect } from 'react';
import socket from '../socket';

/**
 * ConnectionStatus
 * ─────────────────
 * Renders a small top banner that shows:
 *  • "🔴 Menghubungkan…"  while disconnected
 *  • "🟢 Terhubung!"      for 2 seconds after connecting, then hides
 *
 * Uses socket.io events: 'connect' and 'disconnect'.
 */
export default function ConnectionStatus() {
  // 'connecting' | 'connected' | 'hidden'
  const [status, setStatus] = useState(socket.connected ? 'hidden' : 'connecting');

  useEffect(() => {
    let hideTimer = null;

    const onConnect = () => {
      setStatus('connected');
      // Auto-hide the "Connected!" flash after 2 s
      hideTimer = setTimeout(() => setStatus('hidden'), 2000);
    };

    const onDisconnect = () => {
      clearTimeout(hideTimer);
      setStatus('connecting');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // If already connected when component mounts, show brief flash then hide
    if (socket.connected) {
      setStatus('hidden');
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      clearTimeout(hideTimer);
    };
  }, []);

  if (status === 'hidden') return null;

  return (
    <div
      id="connection-status-banner"
      className={`conn-banner conn-banner--${status}`}
      role="status"
      aria-live="polite"
    >
      {status === 'connecting' ? (
        <>
          <span className="conn-dot conn-dot--red" />
          <span>Menghubungkan ke server…</span>
        </>
      ) : (
        <>
          <span className="conn-dot conn-dot--green" />
          <span>Terhubung!</span>
        </>
      )}
    </div>
  );
}
