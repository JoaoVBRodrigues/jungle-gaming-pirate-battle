import { describe, expect, it } from 'vitest';
import { DEFAULT_GAME_CONFIG } from './gameConfig';
import { validateGameConfig } from './validateGameConfig';

describe('validateGameConfig', () => {
    it('accepts the default game configuration', () => {
        const result = validateGameConfig(DEFAULT_GAME_CONFIG);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('rejects a match duration below the minimum', () => {
        const result = validateGameConfig({
            ...DEFAULT_GAME_CONFIG,
            matchDurationSeconds: 30,
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
            'Match duration must be between 60 and 180 seconds.',
        );
    });

    it('rejects a match duration above the maximum', () => {
        const result = validateGameConfig({
            ...DEFAULT_GAME_CONFIG,
            matchDurationSeconds: 200,
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
            'Match duration must be between 60 and 180 seconds.',
        );
    });

    it('rejects a player with zero health', () => {
        const result = validateGameConfig({
            ...DEFAULT_GAME_CONFIG,
            player: {
                ...DEFAULT_GAME_CONFIG.player,
                health: 0,
            },
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
            'Player health must be greater than zero.',
        );
    });

    it('rejects a player with negative movement speed', () => {
        const result = validateGameConfig({
            ...DEFAULT_GAME_CONFIG,
            player: {
                ...DEFAULT_GAME_CONFIG.player,
                movementSpeed: -10,
            },
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
            'Player movement speed must be greater than zero.',
        );
    });

    it('rejects a weapon with zero damage', () => {
        const result = validateGameConfig({
            ...DEFAULT_GAME_CONFIG,
            frontalWeapon: {
                ...DEFAULT_GAME_CONFIG.frontalWeapon,
                damage: 0,
            },
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
            'Frontal weapon damage must be greater than zero.',
        );
    });

    it('rejects a negative spawn interval', () => {
        const result = validateGameConfig({
            ...DEFAULT_GAME_CONFIG,
            spawn: {
                ...DEFAULT_GAME_CONFIG.spawn,
                intervalSeconds: -1,
            },
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
            'Spawn interval must be greater than zero.',
        );
    });
});