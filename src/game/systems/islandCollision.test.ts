
import { describe, expect, it } from "vitest";
import type {
  IslandEntity,
  PlayerEntity,
  ProjectileEntity,
} from "../entities";
import {
  isPlayerCollidingWithIsland,
  isProjectileCollidingWithIsland,
} from "./islandCollision";

const island: IslandEntity = {
  id: "island-1",
  position: {
    x: 100,
    y: 100,
  },
  radius: 30,
};

const player: PlayerEntity = {
  id: "player-1",
  transform: {
    position: {
      x: 150,
      y: 100,
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

const projectile: ProjectileEntity = {
  id: "projectile-1",
  owner: "player",
  transform: {
    position: {
      x: 130,
      y: 100,
    },
    rotation: 0,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  damage: 25,
  remainingLifetimeSeconds: 2,
};

describe("islandCollision", () => {
  it("detects player collision with an island", () => {
    expect(
      isPlayerCollidingWithIsland(player, island, 20),
    ).toBe(true);
  });

  it("detects when player is outside an island", () => {
    const distantPlayer: PlayerEntity = {
      ...player,
      transform: {
        ...player.transform,
        position: {
          x: 300,
          y: 300,
        },
      },
    };

    expect(
      isPlayerCollidingWithIsland(
        distantPlayer,
        island,
        20,
      ),
    ).toBe(false);
  });

  it("detects projectile collision with an island", () => {
    expect(
      isProjectileCollidingWithIsland(
        projectile,
        island,
        5,
      ),
    ).toBe(true);
  });

  it("detects when projectile is outside an island", () => {
    const distantProjectile: ProjectileEntity = {
      ...projectile,
      transform: {
        ...projectile.transform,
        position: {
          x: 300,
          y: 300,
        },
      },
    };

    expect(
      isProjectileCollidingWithIsland(
        distantProjectile,
        island,
        5,
      ),
    ).toBe(false);
  });
});