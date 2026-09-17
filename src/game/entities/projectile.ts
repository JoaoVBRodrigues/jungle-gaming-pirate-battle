import type { Transform, Vector2 } from './entityTypes';

export type ProjectileOwner = 'player' | 'enemy';

export interface ProjectileEntity {
    id: string;
    owner: ProjectileOwner;
    transform: Transform;
    velocity: Vector2;
    damage: number;
    remainingLifetimeSeconds: number;
}