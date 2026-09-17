import { describe, expect, it } from "vitest";
import type { ProjectileEntity } from "../entities";
import {
  isProjectileExpired,
  updateProjectile,
} from "./projectileMovement";

describe("updateProjectile", () => {
  const projectile: ProjectileEntity = {
    id: "projectile-1",
    owner: "player",
    transform: {
      position: {
        x: 100,
        y: 200,
      },
      rotation: 0,
    },
    velocity: {
      x: 400,
      y: -200,
    },
    damage: 25,
    remainingLifetimeSeconds: 2,
  };

  it("moves the projectile according to its velocity", () => {
    const result = updateProjectile(projectile, 0.5);

    expect(result.transform.position).toEqual({
      x: 300,
      y: 100,
    });
  });

  it("reduces the projectile lifetime", () => {
    const result = updateProjectile(projectile, 0.5);

    expect(result.remainingLifetimeSeconds).toBe(1.5);
  });

  it("does not allow lifetime to become negative", () => {
    const result = updateProjectile(projectile, 3);

    expect(result.remainingLifetimeSeconds).toBe(0);
  });

  it("preserves the original projectile", () => {
    const result = updateProjectile(projectile, 0.5);

    expect(result).not.toBe(projectile);
    expect(projectile.transform.position).toEqual({
      x: 100,
      y: 200,
    });
  });
});

describe("isProjectileExpired", () => {
  it("returns true when the projectile lifetime reaches zero", () => {
    const projectile: ProjectileEntity = {
      id: "projectile-1",
      owner: "player",
      transform: {
        position: {
          x: 0,
          y: 0,
        },
        rotation: 0,
      },
      velocity: {
        x: 0,
        y: 0,
      },
      damage: 25,
      remainingLifetimeSeconds: 0,
    };

    expect(isProjectileExpired(projectile)).toBe(true);
  });

  it("returns false when the projectile still has lifetime", () => {
    const projectile: ProjectileEntity = {
      id: "projectile-2",
      owner: "player",
      transform: {
        position: {
          x: 0,
          y: 0,
        },
        rotation: 0,
      },
      velocity: {
        x: 0,
        y: 0,
      },
      damage: 25,
      remainingLifetimeSeconds: 1,
    };

    expect(isProjectileExpired(projectile)).toBe(false);
  });
});