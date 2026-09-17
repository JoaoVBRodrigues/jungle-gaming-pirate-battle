import type { EnemyEntity, PlayerEntity } from "../entities";

export interface CollisionSettings {
  playerRadius: number;
  enemyRadius: number;
}

export function areEntitiesColliding(
  player: PlayerEntity,
  enemy: EnemyEntity,
  settings: CollisionSettings,
): boolean {
  const deltaX =
    player.transform.position.x -
    enemy.transform.position.x;

  const deltaY =
    player.transform.position.y -
    enemy.transform.position.y;

  const distance = Math.sqrt(
    deltaX * deltaX + deltaY * deltaY,
  );

  const collisionDistance =
    settings.playerRadius + settings.enemyRadius;

  return distance <= collisionDistance;
}