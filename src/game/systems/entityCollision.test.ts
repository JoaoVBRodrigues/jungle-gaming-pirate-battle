import { describe, expect, it } from "vitest";
import type { EnemyEntity, PlayerEntity } from "../entities";
import {
  areEntitiesColliding,
  type CollisionSettings,
} from "./entityCollision";

const collisionSettings: CollisionSettings = {
  playerRadius: 20,
  enemyRadius: 18,
};

const player: PlayerEntity = {
  id: "player-1",
  transform: {
    position: {
      x: 100,
      y: 100,
    },
    rotation: 0,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  movementSpeed: 150,
  rotationSpeed: 3,
  health: 100,
  maxHealth: 100,
};

const enemy: EnemyEntity = {
  id: "chaser-1",
  type: "chaser",
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
  movementSpeed: 80,
  health: 50,
  maxHealth: 50,
};

describe("entity collision", () => {
  it("detects collision when entities overlap", () => {
    expect(
      areEntitiesColliding(
        player,
        enemy,
        collisionSettings,
      ),
    ).toBe(true);
  });

  it("does not detect collision when entities are far apart", () => {
    const distantEnemy: EnemyEntity = {
      ...enemy,
      transform: {
        ...enemy.transform,
        position: {
          x: 200,
          y: 100,
        },
      },
    };

    expect(
      areEntitiesColliding(
        player,
        distantEnemy,
        collisionSettings,
      ),
    ).toBe(false);
  });

  it("detects collision when distance equals combined radii", () => {
    const edgeEnemy: EnemyEntity = {
      ...enemy,
      transform: {
        ...enemy.transform,
        position: {
          x: 138,
          y: 100,
        },
      },
    };

    expect(
      areEntitiesColliding(
        player,
        edgeEnemy,
        collisionSettings,
      ),
    ).toBe(true);
  });

  it("does not detect collision when entities are at the same position with invalid radii", () => {
    const overlappingEnemy: EnemyEntity = {
      ...enemy,
      transform: {
        ...enemy.transform,
        position: {
          x: 100,
          y: 100,
        },
      },
    };

    expect(
      areEntitiesColliding(
        player,
        overlappingEnemy,
        collisionSettings,
      ),
    ).toBe(true);
  });
});