import { describe, expect, it } from "vitest";
import type { PlayerEntity } from "../entities";
import { calculateLateralDirection } from "./playerLateralShooting";

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

    const rightDirection = calculateLateralDirection(
      rotatedPlayer,
      "right",
    );

    expect(rightDirection.x).toBeCloseTo(0);
    expect(rightDirection.y).toBeCloseTo(1);
  });
});