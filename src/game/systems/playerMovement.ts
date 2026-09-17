import type { PlayerEntity, Vector2 } from '../entities';

export interface MovementInput {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
}

export function calculatePlayerVelocity(
    player: PlayerEntity,
    input: MovementInput,
): Vector2 {
    let directionX = 0;
    let directionY = 0;

    if (input.left) {
        directionX -= 1;
    }

    if (input.right) {
        directionX += 1;
    }

    if (input.forward) {
        directionY -= 1;
    }

    if (input.backward) {
        directionY += 1;
    }

    const length = Math.sqrt(
        directionX ** 2 + directionY ** 2,
    );

    if (length === 0) {
        return {
            x: 0,
            y: 0,
        };
    }

    return {
        x: (directionX / length) * player.velocity.x,
        y: (directionY / length) * player.velocity.y,
    };
}