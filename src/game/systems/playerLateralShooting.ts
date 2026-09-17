import type {
  PlayerEntity,
  ProjectileEntity,
  Vector2,
} from "../entities";
import type { WeaponConfig } from "../config/gameConfig";

export type LateralShootingSide = "left" | "right";

export function calculateLateralDirection(
  player: PlayerEntity,
  side: LateralShootingSide,
): Vector2 {
  const rotation = player.transform.rotation;
  const sideDirection = side === "right" ? 1 : -1;

  return {
    x: Math.cos(rotation) * sideDirection,
    y: Math.sin(rotation) * sideDirection,
  };
}

export function calculateLateralProjectilePosition(
  player: PlayerEntity,
  forwardOffset: number,
): Vector2 {
  const rotation = player.transform.rotation;

  return {
    x: player.transform.position.x
      + Math.sin(rotation) * forwardOffset,
    y: player.transform.position.y
      - Math.cos(rotation) * forwardOffset,
  };
}

export function createLateralProjectiles(
  player: PlayerEntity,
  weapon: WeaponConfig,
  side: LateralShootingSide,
  projectileIdPrefix: string,
): ProjectileEntity[] {
  const lateralDirection = calculateLateralDirection(player, side);

  const forwardOffsets = [-20, 0, 20];

  return forwardOffsets.map((forwardOffset, index) => {
    const position = calculateLateralProjectilePosition(
      player,
      forwardOffset,
    );

    return {
      id: `${projectileIdPrefix}-${index}`,
      owner: "player",
      transform: {
        position,
        rotation: player.transform.rotation,
      },
      velocity: {
        x: lateralDirection.x * weapon.projectileSpeed,
        y: lateralDirection.y * weapon.projectileSpeed,
      },
      damage: weapon.damage,
      remainingLifetimeSeconds: weapon.projectileLifetimeSeconds,
    };
  }); 
}

export function createBothLateralProjectiles(
  player: PlayerEntity,
  weapon: WeaponConfig,
  projectileIdPrefix: string,
): ProjectileEntity[] {
  const leftProjectiles = createLateralProjectiles(
    player,
    weapon,
    "left",
    `${projectileIdPrefix}-left`,
  );

  const rightProjectiles = createLateralProjectiles(
    player,
    weapon,
    "right",
    `${projectileIdPrefix}-right`,
  );

  return [...leftProjectiles, ...rightProjectiles];
}