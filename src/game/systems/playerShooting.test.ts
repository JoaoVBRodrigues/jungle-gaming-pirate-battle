import { describe, expect, it } from "vitest";
import type { PlayerEntity } from "../entities";
import type { WeaponConfig } from "../config/gameConfig";
import { createFrontalProjectile } from "./playerShooting";

describe("createFrontalProjectile", () => {
  const player: PlayerEntity = {
    id: "player-1",
    transform: {
      position: {
        x: 400,
        y: 300,
      },
      rotation: 0,
    },
    velocity: {
      x: 0,
      y: 0,
    },
    movementSpeed: 100,
    rotationSpeed: 2,
    health: 100,
    maxHealth: 100,
  };

  const weapon: WeaponConfig = {
    damage: 25,
    projectileSpeed: 400,
    projectileLifetimeSeconds: 2,
    cooldownSeconds: 0.5,
  };

  it("creates a frontal projectile", () => {
    const projectile = createFrontalProjectile(
      player,
      weapon,
      "projectile-1",
    );

    expect(projectile).toEqual({
      id: "projectile-1",
      owner: "player",
      transform: {
        position: {
          x: 400,
          y: 300,
        },
        rotation: 0,
      },
      velocity: {
        x: 0,
        y: -400,
      },
      damage: 25,
      remainingLifetimeSeconds: 2,
    });
  });

  it("creates a projectile following the player's rotation", () => {
    const rotatedPlayer: PlayerEntity = {
      ...player,
      transform: {
        ...player.transform,
        rotation: Math.PI / 2,
      },
    };

    const projectile = createFrontalProjectile(
      rotatedPlayer,
      weapon,
      "projectile-2",
    );

    expect(projectile.velocity.x).toBeCloseTo(400);
    expect(projectile.velocity.y).toBeCloseTo(0);
  });

  it("copies the player's position", () => {
    const projectile = createFrontalProjectile(
      player,
      weapon,
      "projectile-3",
    );

    expect(projectile.transform.position).toEqual({
      x: 400,
      y: 300,
    });

    expect(projectile.transform.position).not.toBe(
      player.transform.position,
    );
  });
});