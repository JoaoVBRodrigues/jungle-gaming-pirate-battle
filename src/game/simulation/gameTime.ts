import type { GameState } from './gameState';

export function updateGameTime(
    state: GameState,
    deltaTimeSeconds: number,
    matchDurationSeconds: number,
): GameState {
    if (state.status !== 'playing') {
        return state;
    }

    const nextElapsedTime = Math.min(
        state.elapsedTimeSeconds + deltaTimeSeconds,
        matchDurationSeconds,
    );

    const hasReachedTimeLimit =
        nextElapsedTime >= matchDurationSeconds;

    return {
        ...state,
        elapsedTimeSeconds: nextElapsedTime,
        status: hasReachedTimeLimit ? 'finished' : 'playing',
    };
}