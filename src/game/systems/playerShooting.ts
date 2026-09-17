import type {
  PlayerEntity,
  ProjectileEntity,
} from "../entities";
import type { WeaponConfig } from "../config/gameConfig";

export function calculateProjectileSpawnPosition(
  player: PlayerEntity,
  spawnDistance: number,
) {
  const rotation = player.transform.rotation;

  return {
    x: player.transform.position.x
      + Math.sin(rotation) * spawnDistance,
    y: player.transform.position.y
      - Math.cos(rotation) * spawnDistance,
  };
}

export function createFrontalProjectile(
  player: PlayerEntity,
  weapon: WeaponConfig,
  projectileId: string,
): ProjectileEntity {
  const rotation = player.transform.rotation;
  const spawnDistance = 30;

  const velocity = {
    x: Math.sin(rotation) * weapon.projectileSpeed,
    y: -Math.cos(rotation) * weapon.projectileSpeed,
  };

  const spawnPosition = calculateProjectileSpawnPosition(
    player,
    spawnDistance,
  );

  return {
    id: projectileId,
    owner: "player",
    transform: {
      position: spawnPosition,
      rotation,
    },
    velocity,
    damage: weapon.damage,
    remainingLifetimeSeconds: weapon.projectileLifetimeSeconds,
  };
}