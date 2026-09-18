import type {
    EnemyEntity,
    IslandEntity,
    PlayerEntity,
    Vector2,
} from "../entities";
import { isEnemyCollidingWithIsland } from "./islandCollision";

export type SteeringSide = -1 | 0 | 1;

export interface EnemySteeringResult {
    readonly velocity: Vector2;
    readonly side: SteeringSide;
}

const STEERING_ANGLES = [Math.PI / 4, Math.PI / 2, (Math.PI * 3) / 4];

export function calculateEnemySteering(
    enemy: EnemyEntity,
    player: PlayerEntity,
    islands: readonly IslandEntity[],
    deltaTimeSeconds: number,
    enemyRadius: number,
    previousSide: SteeringSide = 0,
): EnemySteeringResult {
    const directDirection = normalize({
        x: player.transform.position.x - enemy.transform.position.x,
        y: player.transform.position.y - enemy.transform.position.y,
    });

    if (isZeroVector(directDirection)) {
        return {
            velocity: { x: 0, y: 0 },
            side: 0,
        };
    }

    const directVelocity = scale(directDirection, enemy.movementSpeed);
    const directNextPosition = add(
        enemy.transform.position,
        scale(directVelocity, deltaTimeSeconds),
    );

    if (!isPositionBlocked(directNextPosition, islands, enemyRadius)) {
        return { velocity: directVelocity, side: 0 };
    }

    const candidateAngles = previousSide === 0
        ? STEERING_ANGLES.flatMap((angle) => [-angle, angle])
        : [
              previousSide * STEERING_ANGLES[0],
              previousSide * STEERING_ANGLES[1],
              previousSide * STEERING_ANGLES[2],
              -previousSide * STEERING_ANGLES[0],
              -previousSide * STEERING_ANGLES[1],
              -previousSide * STEERING_ANGLES[2],
          ];

    let bestCandidate: {
        velocity: Vector2;
        side: SteeringSide;
        distanceToPlayer: number;
    } | null = null;

    for (const angle of candidateAngles) {
        const direction = rotate(directDirection, angle);
        const velocity = scale(direction, enemy.movementSpeed);
        const nextPosition = add(
            enemy.transform.position,
            scale(velocity, deltaTimeSeconds),
        );

        if (isPositionBlocked(nextPosition, islands, enemyRadius)) {
            continue;
        }

        const distanceToPlayer = distance(nextPosition, player.transform.position);
        const side = angle < 0 ? -1 : 1;

        if (
            bestCandidate === null ||
            distanceToPlayer < bestCandidate.distanceToPlayer
        ) {
            bestCandidate = { velocity, side, distanceToPlayer };
        }
    }

    return bestCandidate
        ? { velocity: bestCandidate.velocity, side: bestCandidate.side }
        : { velocity: { x: 0, y: 0 }, side: previousSide };
}

function isPositionBlocked(
    position: Vector2,
    islands: readonly IslandEntity[],
    enemyRadius: number,
): boolean {
    const candidate: EnemyEntity = {
        id: "steering-probe",
        type: "chaser",
        transform: { position, rotation: 0 },
        velocity: { x: 0, y: 0 },
        movementSpeed: 0,
        health: 1,
        maxHealth: 1,
    };

    return islands.some((island) =>
        isEnemyCollidingWithIsland(candidate, island, enemyRadius),
    );
}

function normalize(vector: Vector2): Vector2 {
    const length = Math.hypot(vector.x, vector.y);

    return length === 0
        ? { x: 0, y: 0 }
        : { x: vector.x / length, y: vector.y / length };
}

function rotate(vector: Vector2, angle: number): Vector2 {
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);

    return {
        x: vector.x * cosine - vector.y * sine,
        y: vector.x * sine + vector.y * cosine,
    };
}

function scale(vector: Vector2, amount: number): Vector2 {
    return { x: vector.x * amount, y: vector.y * amount };
}

function add(first: Vector2, second: Vector2): Vector2 {
    return { x: first.x + second.x, y: first.y + second.y };
}

function distance(first: Vector2, second: Vector2): number {
    return Math.hypot(first.x - second.x, first.y - second.y);
}

function isZeroVector(vector: Vector2): boolean {
    return vector.x === 0 && vector.y === 0;
}