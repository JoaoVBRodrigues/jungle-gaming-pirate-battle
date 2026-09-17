
import type { PlayerEntity } from "../entities";

export function isPlayerDefeated(
  player: PlayerEntity,
): boolean {
  return player.health <= 0;
}