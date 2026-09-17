
import type { EnemyEntity } from "../entities";

export function applyDamageToEnemy(
  enemy: EnemyEntity,
  damage: number,
): EnemyEntity {
  const nextHealth = Math.max(
    0,
    enemy.health - damage,
  );

  return {
    ...enemy,
    health: nextHealth,
  };
}