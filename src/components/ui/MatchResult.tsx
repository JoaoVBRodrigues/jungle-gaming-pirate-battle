import { useEffect, useRef } from 'react';
import type { GameConfig } from '../../game/config/gameConfig';
import { useRegisterMatch } from '../../app/hooks/useRegisterMatch';
import { useGameState } from '../../app/hooks/useGameState';
import { formatMatchDuration } from '../../game/simulation/matchDuration';
import './MatchResult.css';

interface MatchResultProps {
    onPlayAgain: () => void;
    onBackToMenu: () => void;
    matchId: string;
    config: GameConfig;
}

export function MatchResult({
    onPlayAgain,
    onBackToMenu,
    matchId,
    config,
}: MatchResultProps) {
    const gameState = useGameState();
    const registration = useRegisterMatch();
    const submittedMatchId = useRef<string | null>(null);
    const duration = config.matchDurationSeconds - gameState.remainingTime;

    useEffect(() => {
        if (
            gameState.status !== 'finished' ||
            submittedMatchId.current === matchId
        ) {
            return;
        }

        submittedMatchId.current = matchId;
        registration.mutate({
            matchId,
            date: new Date().toISOString(),
            result: gameState.health <= 0 ? 'Game Over' : 'Victory',
            score: gameState.score,
            duration: formatMatchDuration(duration),
        });
    }, [
        config.matchDurationSeconds,
        duration,
        gameState.health,
        gameState.remainingTime,
        gameState.score,
        gameState.status,
        matchId,
        registration,
    ]);

    if (gameState.status !== 'finished') {
        return null;
    }

    const playerWasDefeated = gameState.health <= 0;

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
                        <dd>{formatMatchDuration(duration)}</dd>
                    </div>
                </dl>

                <p className="match-result__registration" role="status">
                    {registration.isPending && 'Saving result...'}
                    {registration.isSuccess && 'Result saved.'}
                    {registration.isError && 'Result could not be saved.'}
                </p>

                <button
                    className="match-result__button"
                    type="button"
                    onClick={onPlayAgain}
                >
                    Play Again
                </button>
                <button
                    className="match-result__secondary-button"
                    type="button"
                    onClick={onBackToMenu}
                >
                    Back to Menu
                </button>
            </div>
        </section>
    );
}