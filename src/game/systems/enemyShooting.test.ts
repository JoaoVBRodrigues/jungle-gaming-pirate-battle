
import { describe, expect, it } from "vitest";
import type {
    EnemyEntity,
    PlayerEntity,
} from "../entities";
import { DEFAULT_GAME_CONFIG } from "../config/gameConfig";
import { createEnemyProjectile } from "./enemyShooting";

describe("createEnemyProjectile", () => {
    const enemy: EnemyEntity = {
        id: "shooter-1",
        type: "shooter",
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
        movementSpeed: 60,
        health: 40,
        maxHealth: 40,
    };

    const player: PlayerEntity = {
        id: "player",
        transform: {
            position: {
                x: 200,
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

    it("creates an enemy-owned projectile", () => {
        const projectile = createEnemyProjectile(
            enemy,
            player,
            DEFAULT_GAME_CONFIG.shooter,
            "enemy-projectile-1",
        );

        expect(projectile.owner).toBe("enemy");
        expect(projectile.id).toBe("enemy-projectile-1");

        expect(projectile.damage).toBe(
            DEFAULT_GAME_CONFIG.shooter.contactDamage,
        );
    });

    it("creates a projectile directed toward the player", () => {
        const projectile = createEnemyProjectile(
            enemy,
            player,
            DEFAULT_GAME_CONFIG.shooter,
            "enemy-projectile-1",
        );

        expect(projectile.velocity.x).toBe(
            DEFAULT_GAME_CONFIG.shooter.projectileSpeed,
        );

        expect(projectile.velocity.y).toBe(0);

        expect(projectile.transform.rotation).toBe(0);
    });

    it("starts the projectile at the enemy position", () => {
        const projectile = createEnemyProjectile(
            enemy,
            player,
            DEFAULT_GAME_CONFIG.shooter,
            "enemy-projectile-1",
        );

        expect(projectile.transform.position).toEqual({
            x: enemy.transform.position.x,
            y: enemy.transform.position.y,
        });
    });

    it("uses the configured projectile lifetime", () => {
        const projectile = createEnemyProjectile(
            enemy,
            player,
            DEFAULT_GAME_CONFIG.shooter,
            "enemy-projectile-1",
        );

        expect(projectile.remainingLifetimeSeconds).toBe(
            DEFAULT_GAME_CONFIG.shooter.projectileLifetimeSeconds,
        );
    });
});