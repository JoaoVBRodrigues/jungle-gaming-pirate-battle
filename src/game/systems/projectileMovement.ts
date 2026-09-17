import type { ProjectileEntity } from "../entities";

export function updateProjectile(
  projectile: ProjectileEntity,
  deltaTimeSeconds: number,
): ProjectileEntity {
  return {
    ...projectile,
    transform: {
      ...projectile.transform,
      position: {
        x: projectile.transform.position.x
          + projectile.velocity.x * deltaTimeSeconds,
        y: projectile.transform.position.y
          + projectile.velocity.y * deltaTimeSeconds,
      },
    },
    remainingLifetimeSeconds: Math.max(
      0,
      projectile.remainingLifetimeSeconds - deltaTimeSeconds,
    ),
  };
}

export function isProjectileExpired(
  projectile: ProjectileEntity,
): boolean {
  return projectile.remainingLifetimeSeconds <= 0;
}