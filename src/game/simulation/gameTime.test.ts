import { describe, expect, it } from 'vitest';
import { INITIAL_GAME_STATE } from './gameState';
import { startGame } from './gameStateManager';
import { updateGameTime } from './gameTime';

describe('updateGameTime', () => {
    it('advances time during a playing game', () => {
        const playingState = startGame(INITIAL_GAME_STATE);

        const result = updateGameTime(
            playingState,
            5,
            120,
        );

        expect(result.elapsedTimeSeconds).toBe(5);
        expect(result.status).toBe('playing');
    });

    it('does not advance time while paused', () => {
        const playingState = startGame(INITIAL_GAME_STATE);
        const pausedState = {
            ...playingState,
            status: 'paused' as const,
        };

        const result = updateGameTime(
            pausedState,
            5,
            120,
        );

        expect(result).toBe(pausedState);
    });

    it('finishes the game when the time limit is reached', () => {
        const playingState = {
            ...startGame(INITIAL_GAME_STATE),
            elapsedTimeSeconds: 118,
        };

        const result = updateGameTime(
            playingState,
            5,
            120,
        );

        expect(result.elapsedTimeSeconds).toBe(120);
        expect(result.status).toBe('finished');
    });

    it('does not exceed the match duration', () => {
        const playingState = startGame(INITIAL_GAME_STATE);

        const result = updateGameTime(
            playingState,
            200,
            120,
        );

        expect(result.elapsedTimeSeconds).toBe(120);
        expect(result.status).toBe('finished');
    });
});