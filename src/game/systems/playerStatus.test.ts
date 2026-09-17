
import { describe, expect, it } from "vitest";
import type { PlayerEntity } from "../entities";
import { isPlayerDefeated } from "./playerStatus";

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

describe("player status", () => {
  it("returns false when player has health", () => {
    expect(isPlayerDefeated(player)).toBe(false);
  });

  it("returns true when player health is zero", () => {
    const defeatedPlayer: PlayerEntity = {
      ...player,
      health: 0,
    };

    expect(isPlayerDefeated(defeatedPlayer)).toBe(true);
  });

  it("returns true when player health is negative", () => {
    const defeatedPlayer: PlayerEntity = {
      ...player,
      health: -10,
    };

    expect(isPlayerDefeated(defeatedPlayer)).toBe(true);
  });
});