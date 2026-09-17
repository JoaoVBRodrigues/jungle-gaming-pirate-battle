import { describe, expect, it } from "vitest";
import type { EnemyEntity, PlayerEntity } from "../entities";
import {
  calculateDirectionToPlayer,
  calculateEnemyVelocity,
  updateEnemyPosition,
} from "./enemyMovement";

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
  movementSpeed: 100,
  rotationSpeed: 2,
  health: 100,
  maxHealth: 100,
};

const enemy: EnemyEntity = {
  id: "enemy-1",
  type: "chaser",
  transform: {
    position: {
      x: 0,
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

describe("enemyMovement", () => {
  it("calculates the direction to the player", () => {
    const direction = calculateDirectionToPlayer(enemy, player);

    expect(direction).toEqual({
      x: 1,
      y: 0,
    });
  });

  it("returns zero direction when enemy and player overlap", () => {
    const overlappingEnemy: EnemyEntity = {
      ...enemy,
      transform: {
        ...enemy.transform,
        position: player.transform.position,
      },
    };

    const direction = calculateDirectionToPlayer(overlappingEnemy, player);

    expect(direction).toEqual({
      x: 0,
      y: 0,
    });
  });

  it("calculates enemy velocity using movement speed", () => {
    const velocity = calculateEnemyVelocity(enemy, player);

    expect(velocity).toEqual({
      x: 80,
      y: 0,
    });
  });

  it("calculates diagonal movement with normalized direction", () => {
    const diagonalPlayer: PlayerEntity = {
      ...player,
      transform: {
        ...player.transform,
        position: {
          x: 100,
          y: 200,
        },
      },
    };

    const direction = calculateDirectionToPlayer(enemy, diagonalPlayer);

    expect(direction.x).toBeCloseTo(Math.SQRT1_2);
    expect(direction.y).toBeCloseTo(Math.SQRT1_2);
  });
  it("updates enemy position based on elapsed time", () => {
    const updatedEnemy = updateEnemyPosition(enemy, player, 0.5);

    expect(updatedEnemy.transform.position).toEqual({
      x: 40,
      y: 100,
    });

    expect(updatedEnemy.velocity).toEqual({
      x: 80,
      y: 0,
    });
  });
});
