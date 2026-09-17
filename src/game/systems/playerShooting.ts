import type {
  PlayerEntity,
  ProjectileEntity,
} from "../entities";
import type { WeaponConfig } from "../config/gameConfig";

export function createFrontalProjectile(
  player: PlayerEntity,
  weapon: WeaponConfig,
  projectileId: string,
): ProjectileEntity {
  const rotation = player.transform.rotation;

  const velocity = {
    x: Math.sin(rotation) * weapon.projectileSpeed,
    y: -Math.cos(rotation) * weapon.projectileSpeed,
  };

  return {
    id: projectileId,
    owner: "player",
    transform: {
      position: {
        ...player.transform.position,
      },
      rotation,
    },
    velocity,
    damage: weapon.damage,
    remainingLifetimeSeconds: weapon.projectileLifetimeSeconds,
  };
}