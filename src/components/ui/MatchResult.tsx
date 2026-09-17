import { DEFAULT_GAME_CONFIG } from '../../game/config/gameConfig';
import { useGameState } from '../../app/hooks/useGameState';
import './MatchResult.css';

interface MatchResultProps {
    onPlayAgain: () => void;
}

function formatDuration(totalSeconds: number): string {
    const safeSeconds = Math.max(0, Math.ceil(totalSeconds));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function MatchResult({ onPlayAgain }: MatchResultProps) {
    const gameState = useGameState();

    if (gameState.status !== 'finished') {
        return null;
    }

    const playerWasDefeated = gameState.health <= 0;
    const duration =
        DEFAULT_GAME_CONFIG.matchDurationSeconds -
        gameState.remainingTime;

    return (
        <section
            className="match-result"
            aria-labelledby="match-result-title"
        >
            <div className="match-result__panel">
                <p className="match-result__eyebrow">
                    Match Result
                </p>
                <h2 id="match-result-title">
                    {playerWasDefeated
                        ? 'GAME OVER'
                        : 'TIME COMPLETED'}
                </h2>

                <dl className="match-result__details">
                    <div>
                        <dt>Final Score</dt>
                        <dd>{gameState.score}</dd>
                    </div>
                    <div>
                        <dt>Match Duration</dt>
                        <dd>{formatDuration(duration)}</dd>
                    </div>
                </dl>

                <button
                    className="match-result__button"
                    type="button"
                    onClick={onPlayAgain}
                >
                    Play Again
                </button>
            </div>
        </section>
    );
}