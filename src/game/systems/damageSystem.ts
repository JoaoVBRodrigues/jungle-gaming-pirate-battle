import type { PlayerEntity } from "../entities";

export function applyDamageToPlayer(
  player: PlayerEntity,
  damage: number,
): PlayerEntity {
  const nextHealth = Math.max(
    0,
    player.health - damage,
  );

  return {
    ...player,
    health: nextHealth,
  };
}