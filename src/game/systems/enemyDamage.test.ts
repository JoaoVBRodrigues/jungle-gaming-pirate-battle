
import { describe, expect, it } from "vitest";
import type { EnemyEntity } from "../entities";
import { applyDamageToEnemy } from "./enemyDamage";

function createEnemy(): EnemyEntity {
  return {
    id: "enemy-1",
    type: "chaser",
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
    movementSpeed: 80,
    health: 50,
    maxHealth: 50,
  };
}

describe("applyDamageToEnemy", () => {
  it("reduces enemy health", () => {
    const enemy = createEnemy();

    const damagedEnemy = applyDamageToEnemy(enemy, 20);

    expect(damagedEnemy.health).toBe(30);
  });

  it("does not allow enemy health to become negative", () => {
    const enemy = createEnemy();

    const damagedEnemy = applyDamageToEnemy(enemy, 100);

    expect(damagedEnemy.health).toBe(0);
  });

  it("supports damage equal to enemy health", () => {
    const enemy = createEnemy();

    const damagedEnemy = applyDamageToEnemy(enemy, 50);

    expect(damagedEnemy.health).toBe(0);
  });

  it("preserves the original enemy", () => {
    const enemy = createEnemy();

    applyDamageToEnemy(enemy, 20);

    expect(enemy.health).toBe(50);
  });

  it("preserves the enemy properties", () => {
    const enemy = createEnemy();

    const damagedEnemy = applyDamageToEnemy(enemy, 20);

    expect(damagedEnemy.id).toBe(enemy.id);
    expect(damagedEnemy.type).toBe(enemy.type);
    expect(damagedEnemy.maxHealth).toBe(enemy.maxHealth);
    expect(damagedEnemy.transform).toEqual(enemy.transform);
    expect(damagedEnemy.velocity).toEqual(enemy.velocity);
  });
});