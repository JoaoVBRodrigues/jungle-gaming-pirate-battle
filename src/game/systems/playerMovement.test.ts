import { describe, expect, it } from 'vitest';
import type { PlayerEntity } from '../entities';
import {
    calculatePlayerRotationDelta,
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

describe('calculatePlayerRotationDelta', () => {
    it('rotates right', () => {
        const rotationDelta = calculatePlayerRotationDelta(
            player,
            {
                ...noInput,
                right: true,
            },
            0.5,
        );

        expect(rotationDelta).toBe(1);
    });

    it('rotates left', () => {
        const rotationDelta = calculatePlayerRotationDelta(
            player,
            {
                ...noInput,
                left: true,
            },
            0.5,
        );

        expect(rotationDelta).toBe(-1);
    });

    it('does not rotate without input', () => {
        const rotationDelta = calculatePlayerRotationDelta(
            player,
            noInput,
            0.5,
        );

        expect(rotationDelta).toBe(0);
    });
});