import type { PlayerEntity, Vector2 } from "../entities";

export function calculateLateralDirection(
  player: PlayerEntity,
  side: "left" | "right",
): Vector2 {
  const rotation = player.transform.rotation;
  const sideDirection = side === "right" ? 1 : -1;

  return {
    x: Math.cos(rotation) * sideDirection,
    y: Math.sin(rotation) * sideDirection,
  };
}