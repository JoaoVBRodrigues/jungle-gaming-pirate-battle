import { describe, expect, it } from 'vitest';
import type { PlayerEntity } from '../entities';
import {
    calculatePlayerVelocity,
    type MovementInput,
} from './playerMovement';

const player: PlayerEntity = {
    id: 'player-1',
    transform: {
        position: { x: 0, y: 0 },
        rotation: 0,
    },
    velocity: {
        x: 100,
        y: 100,
    },
    health: 100,
    maxHealth: 100,
};

const noInput: MovementInput = {
    forward: false,
    backward: false,
    left: false,
    right: false,
};

describe('calculatePlayerVelocity', () => {
    it('returns zero velocity without input', () => {
        expect(calculatePlayerVelocity(player, noInput)).toEqual({
            x: 0,
            y: 0,
        });
    });

    it('moves forward', () => {
        expect(calculatePlayerVelocity(player, {
            ...noInput,
            forward: true,
        })).toEqual({
            x: 0,
            y: -100,
        });
    });

    it('moves backward', () => {
        expect(calculatePlayerVelocity(player, {
            ...noInput,
            backward: true,
        })).toEqual({
            x: 0,
            y: 100,
        });
    });

    it('normalizes diagonal movement', () => {
        const velocity = calculatePlayerVelocity(player, {
            ...noInput,
            forward: true,
            right: true,
        });

        expect(velocity.x).toBeCloseTo(70.71, 1);
        expect(velocity.y).toBeCloseTo(-70.71, 1);
    });
});