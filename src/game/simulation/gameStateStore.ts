import type { GameStatus } from './gameState';

export interface GameHudState {
    readonly health: number;
    readonly maxHealth: number;
    readonly score: number;
    readonly remainingTime: number;
    readonly status: GameStatus;
}

export const INITIAL_GAME_HUD_STATE: GameHudState = {
    health: 100,
    maxHealth: 100,
    score: 0,
    remainingTime: 0,
    status: 'ready',
};

type GameStateListener = () => void;

let currentState: GameHudState = INITIAL_GAME_HUD_STATE;
const listeners = new Set<GameStateListener>();

export function getGameStateSnapshot(): GameHudState {
    return currentState;
}

export function subscribeToGameState(
    listener: GameStateListener,
): () => void {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}

export function updateGameState(
    updates: Partial<GameHudState>,
): void {
    const nextState: GameHudState = {
        ...currentState,
        ...updates,
    };

    if (isSameGameState(currentState, nextState)) {
        return;
    }

    currentState = nextState;

    for (const listener of listeners) {
        listener();
    }
}

export function resetGameState(): void {
    updateGameState(INITIAL_GAME_HUD_STATE);
}

function isSameGameState(
    firstState: GameHudState,
    secondState: GameHudState,
): boolean {
    return (
        firstState.health === secondState.health &&
        firstState.maxHealth === secondState.maxHealth &&
        firstState.score === secondState.score &&
        firstState.remainingTime === secondState.remainingTime &&
        firstState.status === secondState.status
    );
}