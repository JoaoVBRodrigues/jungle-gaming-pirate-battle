export interface PlayerConfig {
    health: number;
    movementSpeed: number;
    rotationSpeed: number;
}

export interface WeaponConfig {
    damage: number;
    projectileSpeed: number;
    projectileLifetimeSeconds: number;
    cooldownSeconds: number;
}

export interface EnemyConfig {
    health: number;
    movementSpeed: number;
    rotationSpeed: number;
    contactDamage: number;
}

export interface ShooterConfig extends EnemyConfig {
    attackRange: number;
    attackCooldownSeconds: number;
}

export interface SpawnConfig {
    intervalSeconds: number;
    minimumDistanceFromPlayer: number;
}

export interface GameConfig {
    matchDurationSeconds: number;
    player: PlayerConfig;
    frontalWeapon: WeaponConfig;
    lateralWeapon: WeaponConfig;
    chaser: EnemyConfig;
    shooter: ShooterConfig;
    spawn: SpawnConfig;
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
    matchDurationSeconds: 120,

    player: {
        health: 100,
        movementSpeed: 150,
        rotationSpeed: 3,
    },

    frontalWeapon: {
        damage: 25,
        projectileSpeed: 400,
        projectileLifetimeSeconds: 2,
        cooldownSeconds: 0.5,
    },

    lateralWeapon: {
        damage: 15,
        projectileSpeed: 350,
        projectileLifetimeSeconds: 2,
        cooldownSeconds: 1,
    },

    chaser: {
        health: 50,
        movementSpeed: 80,
        rotationSpeed: 2,
        contactDamage: 25,
    },

    shooter: {
        health: 40,
        movementSpeed: 60,
        rotationSpeed: 2,
        contactDamage: 10,
        attackRange: 300,
        attackCooldownSeconds: 2,
    },

    spawn: {
        intervalSeconds: 5,
        minimumDistanceFromPlayer: 250,
    },
};
