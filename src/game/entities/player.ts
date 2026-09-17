import type { Transform, Vector2 } from './entityTypes';

export interface PlayerEntity {
    id: string;
    transform: Transform;
    velocity: Vector2;
    movementSpeed: number;
    rotationSpeed: number;
    health: number;
    maxHealth: number;
}