import { afterEach, describe, expect, it } from 'vitest';
import {
    getGameStateSnapshot,
    INITIAL_GAME_HUD_STATE,
    resetGameState,
    subscribeToGameState,
    updateGameState,
} from './gameStateStore';

describe('gameStateStore', () => {
    afterEach(() => {
        resetGameState();
    });

    it('starts with the complete HUD state', () => {
        expect(getGameStateSnapshot()).toEqual(
            INITIAL_GAME_HUD_STATE,
        );
    });

    it('updates only the supplied HUD fields', () => {
        updateGameState({
            health: 75,
            score: 100,
            remainingTime: 90,
            status: 'playing',
        });

        expect(getGameStateSnapshot()).toEqual({
            health: 75,
            maxHealth: 100,
            score: 100,
            remainingTime: 90,
            status: 'playing',
        });
    });

    it('notifies subscribers when the state changes', () => {
        let notificationCount = 0;
        const unsubscribe = subscribeToGameState(() => {
            notificationCount += 1;
        });

        updateGameState({ health: 50 });

        expect(notificationCount).toBe(1);

        unsubscribe();
        updateGameState({ score: 10 });

        expect(notificationCount).toBe(1);
    });

    it('does not notify subscribers when the values are unchanged', () => {
        let notificationCount = 0;
        subscribeToGameState(() => {
            notificationCount += 1;
        });

        updateGameState({ health: 100 });

        expect(notificationCount).toBe(0);
    });

    it('resets the state and notifies subscribers', () => {
        let notificationCount = 0;
        subscribeToGameState(() => {
            notificationCount += 1;
        });

        updateGameState({ health: 20, status: 'finished' });
        resetGameState();

        expect(getGameStateSnapshot()).toEqual(
            INITIAL_GAME_HUD_STATE,
        );
        expect(notificationCount).toBe(2);
    });
});