import { describe, expect, it } from "vitest";
import type { IslandEntity, PlayerEntity } from "../entities";
import { createEnemyAtSpawn } from "./enemySpawn";

const player: PlayerEntity = {
    id: "player-1",
    transform: { position: { x: 400, y: 300 }, rotation: 0 },
    velocity: { x: 0, y: 0 },
    movementSpeed: 100,
    rotationSpeed: 2,
    health: 100,
    maxHealth: 100,
};

const bounds = {
    width: 800,
    height: 600,
    paddingX: 20,
    paddingY: 25,
};

const config = { health: 50, movementSpeed: 80 };

describe("createEnemyAtSpawn", () => {
    it("selects a valid position outside the player distance and islands", () => {
        const islands: IslandEntity[] = [
            { id: "island-1", position: { x: 100, y: 100 }, radius: 40 },
        ];

        const enemy = createEnemyAtSpawn(
            "chaser",
            "chaser-2",
            player,
            islands,
            bounds,
            config,
            [
                { x: 100, y: 100 },
                { x: 40, y: 40 },
            ],
            250,
        );

        expect(enemy?.transform.position).toEqual({ x: 40, y: 40 });
    });

    it("returns null when no candidate is valid", () => {
        const enemy = createEnemyAtSpawn(
            "shooter",
            "shooter-2",
            player,
            [],
            bounds,
            config,
            [{ x: 400, y: 300 }],
            250,
        );

        expect(enemy).toBeNull();
    });
});