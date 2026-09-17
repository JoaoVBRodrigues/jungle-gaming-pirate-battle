import { describe, expect, it } from 'vitest';
import type { PlayerEntity } from '../entities';
import {
    calculateNextPlayerPosition,
    calculatePlayerRotationDelta,
    calculatePlayerVelocity,
    type MovementInput,
    updatePlayerTransform,
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

describe('calculateNextPlayerPosition', () => {
    it('updates the player position using velocity and delta time', () => {
        const movingPlayer: PlayerEntity = {
            ...player,
            transform: {
                ...player.transform,
                position: { x: 10, y: 20 },
            },
            velocity: {
                x: 100,
                y: -50,
            },
        };

        expect(
            calculateNextPlayerPosition(movingPlayer, 0.5),
        ).toEqual({
            x: 60,
            y: -5,
        });
    });

    it('keeps the same position when velocity is zero', () => {
        expect(
            calculateNextPlayerPosition(player, 1),
        ).toEqual({
            x: 0,
            y: 0,
        });
    });
});

describe('updatePlayerTransform', () => {
    it('updates position and rotation', () => {
        const updatedPlayer = updatePlayerTransform(
            player,
            {
                forward: true,
                backward: false,
                left: false,
                right: true,
            },
            0.5,
        );

        expect(updatedPlayer.velocity).toEqual({
            x: 0,
            y: -100,
        });

        expect(updatedPlayer.transform.position).toEqual({
            x: 0,
            y: -50,
        });

        expect(updatedPlayer.transform.rotation).toBe(1);
    });
});