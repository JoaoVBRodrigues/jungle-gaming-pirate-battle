import type {
  EnemyEntity,
  PlayerEntity,
  Vector2,
} from "../entities";

export function calculateDirectionToPlayer(
  enemy: EnemyEntity,
  player: PlayerEntity,
): Vector2 {
  const deltaX =
    player.transform.position.x - enemy.transform.position.x;

  const deltaY =
    player.transform.position.y - enemy.transform.position.y;

  const distance = Math.sqrt(
    deltaX * deltaX + deltaY * deltaY,
  );

  if (distance === 0) {
    return {
      x: 0,
      y: 0,
    };
  }

  return {
    x: deltaX / distance,
    y: deltaY / distance,
  };
}

export function calculateEnemyVelocity(
  enemy: EnemyEntity,
  player: PlayerEntity,
): Vector2 {
  const direction = calculateDirectionToPlayer(enemy, player);

  return {
    x: direction.x * enemy.movementSpeed,
    y: direction.y * enemy.movementSpeed,
  };
}

export function updateEnemyPosition(
  enemy: EnemyEntity,
  player: PlayerEntity,
  deltaTimeSeconds: number,
): EnemyEntity {
  const velocity = calculateEnemyVelocity(enemy, player);

  return {
    ...enemy,
    velocity,
    transform: {
      ...enemy.transform,
      position: {
        x: enemy.transform.position.x
          + velocity.x * deltaTimeSeconds,
        y: enemy.transform.position.y
          + velocity.y * deltaTimeSeconds,
      },
    },
  };
}