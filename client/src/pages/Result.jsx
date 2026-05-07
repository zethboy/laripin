import { getCharacter } from '../constants/characters';
import '../styles/Result.css';

export default function Result({ leaderboard, myId, onPlayAgain }) {
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const medals = ['🥇', '🥈', '🥉'];
  const podiumOrder = [1, 0, 2]; // show 2nd, 1st, 3rd visually

  return (
    <div className="result-page">
      <div className="result-container">
        <h1 className="result-title">GAME OVER</h1>

        {/* Podium */}
        <div className="podium-wrap">
          {podiumOrder.map(idx => {
            const player = top3[idx];
            if (!player) return <div key={idx} className="podium-slot empty" />;
            const char = getCharacter(player.avatarId);
            const isFirst = idx === 0;
            return (
              <div key={player.id} className={`podium-slot rank-${idx + 1}`}>
                {isFirst && <div className="crown">👑</div>}
                <span className="podium-emoji" style={{ animation: isFirst ? 'celebrate 0.5s ease-in-out infinite' : 'idle 1.4s ease-in-out infinite' }}>
                  {char.emoji}
                </span>
                <div className="podium-name">{player.username} {player.id === myId ? '(Kamu)' : ''}</div>
                <div className={`podium-block rank-${idx + 1}-block`}>
                  <span className="podium-medal">{medals[idx]}</span>
                  <span className="podium-score">{player.score}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Full leaderboard */}
        {rest.length > 0 && (
          <div className="lb-card">
            {rest.map((p) => {
              const char = getCharacter(p.avatarId);
              const isMe = p.id === myId;
              return (
                <div key={p.id} className={`lb-row ${isMe ? 'is-me' : ''}`}>
                  <span className="lb-rank">#{p.rank}</span>
                  <span className="lb-emoji">{char.emoji}</span>
                  <span className="lb-name">{p.username} {isMe ? '(Kamu)' : ''}</span>
                  <span className="lb-score">{p.score}</span>
                </div>
              );
            })}
          </div>
        )}

        <button className="btn-primary btn-purple play-again-btn" onClick={onPlayAgain}>
          🔄 MAIN LAGI
        </button>
      </div>
    </div>
  );
}
