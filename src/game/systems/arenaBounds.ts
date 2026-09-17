
import type { Vector2 } from "../entities";

export interface ArenaBounds {
  width: number;
  height: number;
  paddingX: number;
  paddingY: number;
}

export function clampPlayerPosition(
  position: Vector2,
  bounds: ArenaBounds,
): Vector2 {
  return {
    x: Math.max(
      bounds.paddingX,
      Math.min(position.x, bounds.width - bounds.paddingX),
    ),
    y: Math.max(
      bounds.paddingY,
      Math.min(position.y, bounds.height - bounds.paddingY),
    ),
  };
}