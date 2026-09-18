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

const hudAssets = {
    healthFrame: new URL(
        '../../../assets/png/default/ui/hud/health_frame.png',
        import.meta.url,
    ).href,
    healthGreen: new URL(
        '../../../assets/png/default/ui/hud/health_fill_green.png',
        import.meta.url,
    ).href,
    healthAmber: new URL(
        '../../../assets/png/default/ui/hud/health_fill_amber.png',
        import.meta.url,
    ).href,
    healthRed: new URL(
        '../../../assets/png/default/ui/hud/health_fill_red.png',
        import.meta.url,
    ).href,
    pause: new URL(
        '../../../assets/png/retina/ui/controls/icon_pause.png',
        import.meta.url,
    ).href,
} as const;

export function GameHud() {
    const gameState = useGameState();

    function handlePauseToggle() {
        window.dispatchEvent(new Event('game:toggle-pause'));
    }

    const healthRatio = Math.max(
        0,
        Math.min(1, gameState.health / Math.max(1, gameState.maxHealth)),
    );
    const healthFill =
        healthRatio > 0.6
            ? hudAssets.healthGreen
            : healthRatio > 0.3
              ? hudAssets.healthAmber
              : hudAssets.healthRed;

    return (
        <section className="game-hud" aria-label="Game status">
            <div className="game-hud__tutorial">
                <span className="game-hud__label">How to Play</span>
                <span>W / Up Move</span>
                <span>A / Left, D / Right Turn</span>
                <span>Space Fire · Q / E Side Fire · Esc Pause</span>
            </div>

            <div
                className="game-hud__health"
                role="progressbar"
                aria-label="Player health"
                aria-valuemin={0}
                aria-valuemax={gameState.maxHealth}
                aria-valuenow={gameState.health}
            >
                <span className="game-hud__label">Hull</span>
                <div className="game-hud__health-meter">
                    <img
                        className="game-hud__health-fill"
                        src={healthFill}
                        alt=""
                        aria-hidden="true"
                        style={{ width: `${healthRatio * 76}%` }}
                    />
                    <img
                        className="game-hud__health-frame"
                        src={hudAssets.healthFrame}
                        alt=""
                        aria-hidden="true"
                    />
                </div>
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

            {(gameState.status === 'playing' ||
                gameState.status === 'paused') && (
                <button
                    className="game-hud__pause-button"
                    type="button"
                    onClick={handlePauseToggle}
                >
                    <img src={hudAssets.pause} alt="" aria-hidden="true" />
                    {gameState.status === 'paused' ? 'Resume' : 'Pause'}
                </button>
            )}

            {gameState.status === 'paused' && (
                <div className="game-hud__pause-overlay" role="status">
                    <strong>PAUSED</strong>
                    <span>Press Resume to continue</span>
                </div>
            )}
        </section>
    );
}