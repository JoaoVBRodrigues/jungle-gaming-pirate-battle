import { describe, expect, it } from "vitest";
import type { ProjectileEntity } from "../entities";
import {
  addProjectile,
  updateProjectiles,
} from "./projectileManager";

function createTestProjectile(
  id: string,
  lifetime = 2,
): ProjectileEntity {
  return {
    id,
    owner: "player",
    transform: {
      position: {
        x: 100,
        y: 200,
      },
      rotation: 0,
    },
    velocity: {
      x: 100,
      y: 0,
    },
    damage: 25,
    remainingLifetimeSeconds: lifetime,
  };
}

describe("addProjectile", () => {
  it("adds a projectile to the collection", () => {
    const projectiles: ProjectileEntity[] = [];
    const projectile = createTestProjectile("projectile-1");

    const result = addProjectile(projectiles, projectile);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(projectile);
  });

  it("does not modify the original collection", () => {
    const projectiles: ProjectileEntity[] = [];
    const projectile = createTestProjectile("projectile-1");

    const result = addProjectile(projectiles, projectile);

    expect(projectiles).toHaveLength(0);
    expect(result).not.toBe(projectiles);
  });
});

describe("updateProjectiles", () => {
  it("updates every projectile in the collection", () => {
    const projectiles = [
      createTestProjectile("projectile-1"),
      createTestProjectile("projectile-2"),
    ];

    const result = updateProjectiles(projectiles, 0.5);

    expect(result).toHaveLength(2);
    expect(result[0].transform.position).toEqual({
      x: 150,
      y: 200,
    });
    expect(result[1].transform.position).toEqual({
      x: 150,
      y: 200,
    });
  });

  it("removes expired projectiles", () => {
    const projectiles = [
      createTestProjectile("active-projectile", 2),
      createTestProjectile("expired-projectile", 0.5),
    ];

    const result = updateProjectiles(projectiles, 1);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("active-projectile");
  });

  it("returns an empty collection when all projectiles expire", () => {
    const projectiles = [
      createTestProjectile("projectile-1", 0.5),
      createTestProjectile("projectile-2", 0.2),
    ];

    const result = updateProjectiles(projectiles, 1);

    expect(result).toEqual([]);
  });
});