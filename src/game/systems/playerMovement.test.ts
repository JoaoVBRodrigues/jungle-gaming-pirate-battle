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
        x: 0,
        y: 0,
    },
    movementSpeed: 100,
    rotationSpeed: 2,
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
});