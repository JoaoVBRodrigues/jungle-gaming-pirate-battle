type GameSound =
    | 'cannonFire'
    | 'broadside'
    | 'enemyFire'
    | 'impact'
    | 'collision'
    | 'explosion'
    | 'gameOver'
    | 'gameComplete';

const soundUrls: Record<GameSound, string> = {
    cannonFire: new URL(
        '../../../assets/sounds/cannon_fire_1.wav',
        import.meta.url,
    ).href,
    broadside: new URL(
        '../../../assets/sounds/cannon_broadside.wav',
        import.meta.url,
    ).href,
    enemyFire: new URL(
        '../../../assets/sounds/cannon_fire_2.wav',
        import.meta.url,
    ).href,
    impact: new URL(
        '../../../assets/sounds/ship_wood_hit_1.wav',
        import.meta.url,
    ).href,
    collision: new URL(
        '../../../assets/sounds/ship_collision.wav',
        import.meta.url,
    ).href,
    explosion: new URL(
        '../../../assets/sounds/ship_explosion_1.wav',
        import.meta.url,
    ).href,
    gameOver: new URL(
        '../../../assets/sounds/game_over.wav',
        import.meta.url,
    ).href,
    gameComplete: new URL(
        '../../../assets/sounds/game_complete.wav',
        import.meta.url,
    ).href,
};

const audioCache = new Map<GameSound, HTMLAudioElement>();

export function playGameSound(sound: GameSound): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        const audio =
            audioCache.get(sound) ?? new Audio(soundUrls[sound]);
        audioCache.set(sound, audio);
        audio.currentTime = 0;
        void audio.play().catch(() => {
            // Browsers may reject playback until the first user gesture.
        });
    } catch {
        // Audio failures must not interrupt gameplay.
    }
}

export function stopGameSounds(): void {
    for (const audio of audioCache.values()) {
        try {
            audio.pause();
            audio.currentTime = 0;
        } catch {
            // Audio cleanup failures are intentionally ignored.
        }
    }
}
