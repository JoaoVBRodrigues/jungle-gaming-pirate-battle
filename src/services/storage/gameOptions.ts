import {
    DEFAULT_GAME_CONFIG,
    type GameConfig,
} from '../../game/config/gameConfig';

export interface GameOptions {
    readonly matchDurationSeconds: number;
    readonly spawnIntervalSeconds: number;
}

const STORAGE_KEY = 'pirate-battle.game-options';
const MIN_MATCH_DURATION_SECONDS = 60;
const MAX_MATCH_DURATION_SECONDS = 180;
const MIN_SPAWN_INTERVAL_SECONDS = 1;
const MAX_SPAWN_INTERVAL_SECONDS = 30;

export const DEFAULT_GAME_OPTIONS: GameOptions = {
    matchDurationSeconds: DEFAULT_GAME_CONFIG.matchDurationSeconds,
    spawnIntervalSeconds: DEFAULT_GAME_CONFIG.spawn.intervalSeconds,
};

export function loadGameOptions(): GameOptions {
    if (typeof window === 'undefined') {
        return DEFAULT_GAME_OPTIONS;
    }

    try {
        const storedValue = window.localStorage.getItem(STORAGE_KEY);
        if (!storedValue) {
            return DEFAULT_GAME_OPTIONS;
        }

        return normalizeGameOptions(JSON.parse(storedValue));
    } catch {
        return DEFAULT_GAME_OPTIONS;
    }
}

export function saveGameOptions(options: GameOptions): GameOptions {
    const normalizedOptions = normalizeGameOptions(options);

    if (typeof window !== 'undefined') {
        try {
            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(normalizedOptions),
            );
        } catch {
            // Gameplay keeps working when localStorage is unavailable.
        }
    }

    return normalizedOptions;
}

export function createGameConfig(
    options: GameOptions,
): GameConfig {
    const normalizedOptions = normalizeGameOptions(options);

    return {
        ...DEFAULT_GAME_CONFIG,
        matchDurationSeconds: normalizedOptions.matchDurationSeconds,
        spawn: {
            ...DEFAULT_GAME_CONFIG.spawn,
            intervalSeconds: normalizedOptions.spawnIntervalSeconds,
        },
        player: { ...DEFAULT_GAME_CONFIG.player },
        frontalWeapon: { ...DEFAULT_GAME_CONFIG.frontalWeapon },
        lateralWeapon: { ...DEFAULT_GAME_CONFIG.lateralWeapon },
        chaser: { ...DEFAULT_GAME_CONFIG.chaser },
        shooter: { ...DEFAULT_GAME_CONFIG.shooter },
    };
}

function normalizeGameOptions(value: unknown): GameOptions {
    if (!isRecord(value)) {
        return DEFAULT_GAME_OPTIONS;
    }

    return {
        matchDurationSeconds: clamp(
            toNumber(
                value.matchDurationSeconds,
                DEFAULT_GAME_OPTIONS.matchDurationSeconds,
            ),
            MIN_MATCH_DURATION_SECONDS,
            MAX_MATCH_DURATION_SECONDS,
        ),
        spawnIntervalSeconds: clamp(
            toNumber(
                value.spawnIntervalSeconds,
                DEFAULT_GAME_OPTIONS.spawnIntervalSeconds,
            ),
            MIN_SPAWN_INTERVAL_SECONDS,
            MAX_SPAWN_INTERVAL_SECONDS,
        ),
    };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function toNumber(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value)
        ? value
        : fallback;
}

function clamp(value: number, minimum: number, maximum: number): number {
    return Math.min(maximum, Math.max(minimum, value));
}
