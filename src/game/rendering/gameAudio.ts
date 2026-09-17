type GameSound =
    | 'cannonFire'
    | 'broadside'
    | 'enemyFire'
    | 'impact'
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

    const audio = audioCache.get(sound) ?? new Audio(soundUrls[sound]);
    audioCache.set(sound, audio);
    audio.currentTime = 0;
    void audio.play().catch(() => {
        // Browsers may reject playback until the first user gesture.
    });
}
