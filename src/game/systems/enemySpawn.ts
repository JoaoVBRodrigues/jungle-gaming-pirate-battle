import type {
    EnemyEntity,
    EnemyType,
    IslandEntity,
    PlayerEntity,
} from "../entities";
import type { ArenaBounds } from "./arenaBounds";

export interface EnemySpawnConfig {
    readonly health: number;
    readonly movementSpeed: number;
}

export function createEnemyAtSpawn(
    type: EnemyType,
    id: string,
    player: PlayerEntity,
    islands: readonly IslandEntity[],
    bounds: ArenaBounds,
    config: EnemySpawnConfig,
    candidatePositions: readonly { x: number; y: number }[],
    minimumDistanceFromPlayer: number,
): EnemyEntity | null {
    for (const position of candidatePositions) {
        if (
            !isPositionInsideBounds(position, bounds) ||
            distanceBetween(position, player.transform.position) <
                minimumDistanceFromPlayer ||
            islands.some(
                (island) =>
                    distanceBetween(position, island.position) <=
                    island.radius + 18,
            )
        ) {
            continue;
        }

        return {
            id,
            type,
            transform: {
                position: { ...position },
                rotation: 0,
            },
            velocity: { x: 0, y: 0 },
            movementSpeed: config.movementSpeed,
            health: config.health,
            maxHealth: config.health,
        };
    }

    return null;
}

function isPositionInsideBounds(
    position: { x: number; y: number },
    bounds: ArenaBounds,
): boolean {
    return (
        position.x >= bounds.paddingX &&
        position.x <= bounds.width - bounds.paddingX &&
        position.y >= bounds.paddingY &&
        position.y <= bounds.height - bounds.paddingY
    );
}

function distanceBetween(
    first: { x: number; y: number },
    second: { x: number; y: number },
): number {
    return Math.hypot(first.x - second.x, first.y - second.y);
}