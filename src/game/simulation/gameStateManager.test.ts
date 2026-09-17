import { describe, expect, it } from 'vitest';
import { INITIAL_GAME_STATE } from './gameState';
import {
    finishGame,
    pauseGame,
    resumeGame,
    startGame,
} from './gameStateManager';

describe('gameStateManager', () => {
    it('starts a ready game', () => {
        const result = startGame(INITIAL_GAME_STATE);

        expect(result.status).toBe('playing');
    });

    it('pauses a playing game', () => {
        const playingState = startGame(INITIAL_GAME_STATE);
        const result = pauseGame(playingState);

        expect(result.status).toBe('paused');
    });

    it('resumes a paused game', () => {
        const playingState = startGame(INITIAL_GAME_STATE);
        const pausedState = pauseGame(playingState);
        const result = resumeGame(pausedState);

        expect(result.status).toBe('playing');
    });

    it('finishes a game', () => {
        const playingState = startGame(INITIAL_GAME_STATE);
        const result = finishGame(playingState);

        expect(result.status).toBe('finished');
    });

    it('does not start an already playing game', () => {
        const playingState = startGame(INITIAL_GAME_STATE);
        const result = startGame(playingState);

        expect(result).toBe(playingState);
    });
});