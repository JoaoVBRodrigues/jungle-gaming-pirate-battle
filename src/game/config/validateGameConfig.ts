import type { GameConfig } from './gameConfig';

export interface ConfigValidationResult {
    isValid: boolean;
    errors: string[];
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

    if (config.frontalWeapon.damage <= 0) {
        errors.push('Frontal weapon damage must be greater than zero.');
    }

    if (config.lateralWeapon.damage <= 0) {
        errors.push('Lateral weapon damage must be greater than zero.');
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