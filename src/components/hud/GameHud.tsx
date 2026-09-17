import { useGameState } from '../../app/hooks/useGameState';
import './GameHud.css';

function formatRemainingTime(remainingTime: number): string {
    const totalSeconds = Math.max(0, Math.ceil(remainingTime));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

export function GameHud() {
    const gameState = useGameState();

    return (
        <section className="game-hud" aria-label="Game status">
            <div className="game-hud__item">
                <span className="game-hud__label">Health</span>
                <strong>
                    {gameState.health}/{gameState.maxHealth}
                </strong>
            </div>

            <div className="game-hud__item">
                <span className="game-hud__label">Score</span>
                <strong>{gameState.score}</strong>
            </div>

            <div className="game-hud__item">
                <span className="game-hud__label">Time</span>
                <strong>
                    {formatRemainingTime(gameState.remainingTime)}
                </strong>
            </div>

            <div className="game-hud__item">
                <span className="game-hud__label">Status</span>
                <strong>{formatStatus(gameState.status)}</strong>
            </div>
        </section>
    );
}