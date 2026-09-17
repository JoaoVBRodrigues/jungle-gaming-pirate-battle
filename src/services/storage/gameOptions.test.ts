import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    createGameConfig,
    DEFAULT_GAME_OPTIONS,
    loadGameOptions,
    saveGameOptions,
} from './gameOptions';

describe('gameOptions', () => {
    const values = new Map<string, string>();

    beforeEach(() => {
        vi.stubGlobal('window', {
            localStorage: {
                getItem: (key: string) => values.get(key) ?? null,
                setItem: (key: string, value: string) => {
                    values.set(key, value);
                },
                clear: () => values.clear(),
            },
        });
    });

    afterEach(() => {
        values.clear();
        vi.unstubAllGlobals();
    });

    it('uses defaults when no options are stored', () => {
        expect(loadGameOptions()).toEqual(DEFAULT_GAME_OPTIONS);
    });

    it('persists and loads normalized options', () => {
        const saved = saveGameOptions({
            matchDurationSeconds: 90,
            spawnIntervalSeconds: 4,
        });

        expect(loadGameOptions()).toEqual(saved);
    });

    it('clamps invalid option values to documented limits', () => {
        const saved = saveGameOptions({
            matchDurationSeconds: 5,
            spawnIntervalSeconds: 100,
        });

        expect(saved).toEqual({
            matchDurationSeconds: 60,
            spawnIntervalSeconds: 30,
        });
    });

    it('creates a match configuration snapshot', () => {
        const config = createGameConfig({
            matchDurationSeconds: 75,
            spawnIntervalSeconds: 3,
        });

        expect(config.matchDurationSeconds).toBe(75);
        expect(config.spawn.intervalSeconds).toBe(3);
        expect(config.player).toEqual({
            health: 100,
            movementSpeed: 150,
            rotationSpeed: 3,
        });
    });
});
