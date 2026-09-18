import { describe, expect, it } from "vitest";
import type { EnemyEntity, IslandEntity, PlayerEntity } from "../entities";
import { calculateEnemySteering } from "./enemySteering";

const enemy: EnemyEntity = {
    id: "enemy-1",
    type: "chaser",
    transform: { position: { x: 0, y: 100 }, rotation: 0 },
    velocity: { x: 0, y: 0 },
    movementSpeed: 80,
    health: 50,
    maxHealth: 50,
};

const player: PlayerEntity = {
    id: "player-1",
    transform: { position: { x: 200, y: 100 }, rotation: 0 },
    velocity: { x: 0, y: 0 },
    movementSpeed: 100,
    rotationSpeed: 2,
    health: 100,
    maxHealth: 100,
};

const island: IslandEntity = {
    id: "island-1",
    position: { x: 30, y: 100 },
    radius: 20,
};

describe("enemySteering", () => {
    it("keeps direct movement when no island blocks the next step", () => {
        const result = calculateEnemySteering(
            enemy,
            player,
            [],
            0.1,
            16,
        );

        expect(result.velocity).toEqual({ x: 80, y: 0 });
        expect(result.side).toBe(0);
    });

    it("chooses an alternative direction around a blocking island", () => {
        const result = calculateEnemySteering(
            enemy,
            player,
            [island],
            0.5,
            16,
        );

        expect(result.velocity.x).toBeGreaterThan(0);
        expect(Math.abs(result.velocity.y)).toBeGreaterThan(0);
        expect(result.side).not.toBe(0);
    });

    it("retains the selected side while the direct path remains blocked", () => {
        const first = calculateEnemySteering(
            enemy,
            player,
            [island],
            0.5,
            16,
        );
        const second = calculateEnemySteering(
            enemy,
            player,
            [island],
            0.5,
            16,
            first.side,
        );

        expect(second.side).toBe(first.side);
    });
});