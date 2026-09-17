import type { Vector2 } from './entityTypes';

export interface IslandEntity {
    id: string;
    position: Vector2;
    radius: number;
}