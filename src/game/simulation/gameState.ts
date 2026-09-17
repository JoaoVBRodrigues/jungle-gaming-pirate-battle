export type GameStatus =
    | 'ready'
    | 'playing'
    | 'paused'
    | 'finished';

export interface GameState {
    status: GameStatus;
    elapsedTimeSeconds: number;
    score: number;
}

export const INITIAL_GAME_STATE: GameState = {
    status: 'ready',
    elapsedTimeSeconds: 0,
    score: 0,
};