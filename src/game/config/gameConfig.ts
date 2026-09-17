export interface GameConfig {
    matchDurationSeconds: number;
    playerHealth: number;
    enemySpawnIntervalSeconds: number;
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
    matchDurationSeconds: 120,
    playerHealth: 100,
    enemySpawnIntervalSeconds: 5,
};