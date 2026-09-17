
import type {
    PlayerEntity,
    ProjectileEntity,
    EnemyEntity,
} from "../entities";
import type { ShooterConfig } from "../config/gameConfig";

export function createEnemyProjectile(
    enemy: EnemyEntity,
    player: PlayerEntity,
    config: ShooterConfig,
    projectileId: string,
): ProjectileEntity {
    const deltaX =
        player.transform.position.x - enemy.transform.position.x;

    const deltaY =
        player.transform.position.y - enemy.transform.position.y;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const directionX = distance > 0 ? deltaX / distance : 0;
    const directionY = distance > 0 ? deltaY / distance : 0;

    return {
        id: projectileId,
        owner: "enemy",
        transform: {
            position: {
                x: enemy.transform.position.x,
                y: enemy.transform.position.y,
            },
            rotation: Math.atan2(directionY, directionX),
        },
        velocity: {
            x: directionX * config.projectileSpeed,
            y: directionY * config.projectileSpeed,
        },
        damage: config.contactDamage,
        remainingLifetimeSeconds:
            config.projectileLifetimeSeconds,
    };
}