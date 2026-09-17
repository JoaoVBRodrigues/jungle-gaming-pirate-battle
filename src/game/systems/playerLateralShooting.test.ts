import { describe, expect, it } from "vitest";
import type { PlayerEntity } from "../entities";
import type { WeaponConfig } from "../config/gameConfig";
import {
  calculateLateralDirection,
  createLateralProjectiles,
} from "./playerLateralShooting";

describe("calculateLateralDirection", () => {
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

  it("calculates the right direction", () => {
    const direction = calculateLateralDirection(player, "right");

    expect(direction.x).toBeCloseTo(1);
    expect(direction.y).toBeCloseTo(0);
  });

  it("calculates the left direction", () => {
    const direction = calculateLateralDirection(player, "left");

    expect(direction.x).toBeCloseTo(-1);
    expect(direction.y).toBeCloseTo(0);
  });

  it("follows the player's rotation", () => {
    const rotatedPlayer: PlayerEntity = {
      ...player,
      transform: {
        ...player.transform,
        rotation: Math.PI / 2,
      },
    };

    const rightDirection = calculateLateralDirection(rotatedPlayer, "right");

    expect(rightDirection.x).toBeCloseTo(0);
    expect(rightDirection.y).toBeCloseTo(1);
  });

  describe("createLateralProjectiles", () => {
    const weapon: WeaponConfig = {
      damage: 15,
      projectileSpeed: 350,
      projectileLifetimeSeconds: 2,
      cooldownSeconds: 1,
    };

    it("creates three projectiles for one side", () => {
      const projectiles = createLateralProjectiles(
        player,
        weapon,
        "right",
        "lateral-right",
      );

      expect(projectiles).toHaveLength(3);

      expect(projectiles.map((projectile) => projectile.id)).toEqual([
        "lateral-right-0",
        "lateral-right-1",
        "lateral-right-2",
      ]);
    });

    it("creates projectiles with lateral velocity", () => {
      const projectiles = createLateralProjectiles(
        player,
        weapon,
        "right",
        "lateral-right",
      );

      for (const projectile of projectiles) {
        expect(projectile.velocity.x).toBeCloseTo(350);
        expect(projectile.velocity.y).toBeCloseTo(0);
      }
    });

    it("distributes projectiles along the forward axis", () => {
      const projectiles = createLateralProjectiles(
        player,
        weapon,
        "right",
        "lateral-right",
      );

      expect(projectiles[0].transform.position).toEqual({
        x: 400,
        y: 320,
      });

      expect(projectiles[1].transform.position).toEqual({
        x: 400,
        y: 300,
      });

      expect(projectiles[2].transform.position).toEqual({
        x: 400,
        y: 280,
      });
    });
  });
});
