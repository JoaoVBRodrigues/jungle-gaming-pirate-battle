import type { PlayerEntity, Vector2 } from "../entities";

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
  let direction = 0;

  if (input.forward) {
    direction += 1;
  }

  if (input.backward) {
    direction -= 1;
  }

  if (direction === 0) {
    return {
      x: 0,
      y: 0,
    };
  }

  const speed = player.movementSpeed * direction;
  const rotation = player.transform.rotation;

  const velocityX = Math.sin(rotation) * speed;
  const velocityY = -Math.cos(rotation) * speed;

  return {
    x: Math.abs(velocityX) < Number.EPSILON ? 0 : velocityX,
    y: Math.abs(velocityY) < Number.EPSILON ? 0 : velocityY,
  };
}

export function calculatePlayerRotationDelta(
  player: PlayerEntity,
  input: MovementInput,
  deltaTimeSeconds: number,
): number {
  let direction = 0;

  if (input.right) {
    direction += 1;
  }

  if (input.left) {
    direction -= 1;
  }

  return direction * player.rotationSpeed * deltaTimeSeconds;
}

export function calculateNextPlayerPosition(
    player: PlayerEntity,
    deltaTimeSeconds: number,
): Vector2 {
    return {
        x: player.transform.position.x
            + player.velocity.x * deltaTimeSeconds,
        y: player.transform.position.y
            + player.velocity.y * deltaTimeSeconds,
    };
}