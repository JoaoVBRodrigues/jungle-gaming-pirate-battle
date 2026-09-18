import { useEffect, useMemo, useRef } from 'react';
import type { GameConfig } from '../../game/config/gameConfig';
import type { MatchRegistration } from '../../types/matches';
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
    const { submitMatch } = registration;
    const submittedMatchId = useRef<string | null>(null);
    const duration = config.matchDurationSeconds - gameState.remainingTime;
    const matchRegistration: MatchRegistration = useMemo(
        () => ({
            matchId,
            playerId: 'player-1',
            playerName: 'You',
            date: new Date().toISOString(),
            result: gameState.health <= 0 ? 'defeat' : 'timeout',
            score: gameState.score,
            duration: formatMatchDuration(duration),
            config,
            configKey: JSON.stringify(config),
        }),
        [
            duration,
            gameState.health,
            gameState.score,
            matchId,
            config,
        ],
    );

    useEffect(() => {
        if (
            gameState.status !== 'finished' ||
            submittedMatchId.current === matchId
        ) {
            return;
        }

        submittedMatchId.current = matchId;
        submitMatch(matchRegistration);
    }, [
        config.matchDurationSeconds,
        duration,
        gameState.health,
        gameState.remainingTime,
        gameState.score,
        gameState.status,
        matchId,
        matchRegistration,
        submitMatch,
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

                {registration.isError && (
                    <button
                        className="match-result__secondary-button"
                        type="button"
                        onClick={() => submitMatch(matchRegistration)}
                    >
                        Retry Save
                    </button>
                )}

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