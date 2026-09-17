import type { ProjectileEntity } from "../entities";
import {
  isProjectileExpired,
  updateProjectile,
} from "./projectileMovement";

export function addProjectile(
  projectiles: ProjectileEntity[],
  projectile: ProjectileEntity,
): ProjectileEntity[] {
  return [...projectiles, projectile];
}

export function updateProjectiles(
  projectiles: ProjectileEntity[],
  deltaTimeSeconds: number,
): ProjectileEntity[] {
  return projectiles
    .map((projectile) =>
      updateProjectile(projectile, deltaTimeSeconds),
    )
    .filter((projectile) => !isProjectileExpired(projectile));
}