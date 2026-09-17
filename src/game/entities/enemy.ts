import type { Transform, Vector2 } from './entityTypes';

export type EnemyType = 'chaser' | 'shooter';

export interface EnemyEntity {
    id: string;
    type: EnemyType;
    transform: Transform;
    velocity: Vector2;
    health: number;
    maxHealth: number;
}