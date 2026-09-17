import { describe, expect, it } from "vitest";
import type { PlayerEntity } from "../entities";
import { applyDamageToPlayer } from "./damageSystem";

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

describe("damage system", () => {
  it("reduces player health", () => {
    const damagedPlayer = applyDamageToPlayer(
      player,
      25,
    );

    expect(damagedPlayer.health).toBe(75);
  });

  it("does not allow health below zero", () => {
    const damagedPlayer = applyDamageToPlayer(
      player,
      150,
    );

    expect(damagedPlayer.health).toBe(0);
  });

  it("does not mutate the original player", () => {
    applyDamageToPlayer(player, 25);

    expect(player.health).toBe(100);
  });

  it("keeps health unchanged when damage is zero", () => {
    const damagedPlayer = applyDamageToPlayer(
      player,
      0,
    );

    expect(damagedPlayer.health).toBe(100);
  });
});