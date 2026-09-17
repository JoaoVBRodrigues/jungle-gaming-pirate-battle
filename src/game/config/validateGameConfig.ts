import type {
    EnemyConfig,
    GameConfig,
    WeaponConfig,
} from './gameConfig';

export interface ConfigValidationResult {
    isValid: boolean;
    errors: string[];
}

function validateWeapon(
    weapon: WeaponConfig,
    weaponName: string,
    errors: string[],
): void {
    if (weapon.damage <= 0) {
        errors.push(`${weaponName} damage must be greater than zero.`);
    }

    if (weapon.projectileSpeed <= 0) {
        errors.push(
            `${weaponName} projectile speed must be greater than zero.`,
        );
    }

    if (weapon.projectileLifetimeSeconds <= 0) {
        errors.push(
            `${weaponName} projectile lifetime must be greater than zero.`,
        );
    }

    if (weapon.cooldownSeconds <= 0) {
        errors.push(
            `${weaponName} cooldown must be greater than zero.`,
        );
    }
}

function validateEnemy(
    enemy: EnemyConfig,
    enemyName: string,
    errors: string[],
): void {
    if (enemy.health <= 0) {
        errors.push(`${enemyName} health must be greater than zero.`);
    }

    if (enemy.movementSpeed <= 0) {
        errors.push(
            `${enemyName} movement speed must be greater than zero.`,
        );
    }

    if (enemy.rotationSpeed <= 0) {
        errors.push(
            `${enemyName} rotation speed must be greater than zero.`,
        );
    }

    if (enemy.contactDamage <= 0) {
        errors.push(
            `${enemyName} contact damage must be greater than zero.`,
        );
    }
}

export function validateGameConfig(
    config: GameConfig,
): ConfigValidationResult {
    const errors: string[] = [];

    if (
        config.matchDurationSeconds < 60 ||
        config.matchDurationSeconds > 180
    ) {
        errors.push(
            'Match duration must be between 60 and 180 seconds.',
        );
    }

    if (config.player.health <= 0) {
        errors.push('Player health must be greater than zero.');
    }

    if (config.player.movementSpeed <= 0) {
        errors.push('Player movement speed must be greater than zero.');
    }

    if (config.player.rotationSpeed <= 0) {
        errors.push('Player rotation speed must be greater than zero.');
    }

    validateWeapon(
        config.frontalWeapon,
        'Frontal weapon',
        errors,
    );

    validateWeapon(
        config.lateralWeapon,
        'Lateral weapon',
        errors,
    );

    validateEnemy(config.chaser, 'Chaser', errors);
    validateEnemy(config.shooter, 'Shooter', errors);

    if (config.shooter.attackRange <= 0) {
        errors.push(
            'Shooter attack range must be greater than zero.',
        );
    }

    if (config.shooter.attackCooldownSeconds <= 0) {
        errors.push(
            'Shooter attack cooldown must be greater than zero.',
        );
    }

    if (config.spawn.intervalSeconds <= 0) {
        errors.push('Spawn interval must be greater than zero.');
    }

    if (config.spawn.minimumDistanceFromPlayer < 0) {
        errors.push(
            'Minimum spawn distance cannot be negative.',
        );
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}