import type { GameState } from './gameState';

export function startGame(state: GameState): GameState {
    if (state.status !== 'ready') {
        return state;
    }

    return {
        ...state,
        status: 'playing',
    };
}

export function pauseGame(state: GameState): GameState {
    if (state.status !== 'playing') {
        return state;
    }

    return {
        ...state,
        status: 'paused',
    };
}

export function resumeGame(state: GameState): GameState {
    if (state.status !== 'paused') {
        return state;
    }

    return {
        ...state,
        status: 'playing',
    };
}

export function finishGame(state: GameState): GameState {
    if (state.status === 'finished') {
        return state;
    }

    return {
        ...state,
        status: 'finished',
    };
}