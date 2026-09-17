import type {
  IslandEntity,
  PlayerEntity,
  ProjectileEntity,
} from "../entities";

function calculateDistance(
  firstPosition: { x: number; y: number },
  secondPosition: { x: number; y: number },
): number {
  const deltaX = firstPosition.x - secondPosition.x;
  const deltaY = firstPosition.y - secondPosition.y;

  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

export function isPlayerCollidingWithIsland(
  player: PlayerEntity,
  island: IslandEntity,
  playerRadius: number,
): boolean {
  const distance = calculateDistance(
    player.transform.position,
    island.position,
  );

  return distance <= playerRadius + island.radius;
}

export function isProjectileCollidingWithIsland(
  projectile: ProjectileEntity,
  island: IslandEntity,
  projectileRadius: number,
): boolean {
  const distance = calculateDistance(
    projectile.transform.position,
    island.position,
  );

  return distance <= projectileRadius + island.radius;
}