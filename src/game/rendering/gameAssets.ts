import { Assets, type Texture } from 'pixi.js';

export interface GameTextures {
    readonly playerShip?: Texture;
    readonly enemyShips: readonly Texture[];
    readonly cannonBall?: Texture;
    readonly island?: Texture;
    readonly water?: Texture;
}

const assetUrls = {
    playerShip: new URL(
        '../../../assets/png/default/ships/ship_1.png',
        import.meta.url,
    ).href,
    cannonBall: new URL(
        '../../../assets/png/default/ship_parts/cannon_ball.png',
        import.meta.url,
    ).href,
    island: new URL(
        '../../../assets/png/default/tiles/tile_49.png',
        import.meta.url,
    ).href,
    water: new URL(
        '../../../assets/png/default/tiles/tile_73.png',
        import.meta.url,
    ).href,
} as const;

const enemyShipUrls = Array.from({ length: 15 }, (_, index) =>
    new URL(
        `../../../assets/png/default/ships/ship_${index + 2}.png`,
        import.meta.url,
    ).href,
);

let texturesPromise: Promise<GameTextures> | null = null;

export function loadGameTextures(): Promise<GameTextures> {
    texturesPromise ??= loadTextures();
    return texturesPromise;
}

async function loadTextures(): Promise<GameTextures> {
    const entries = await Promise.all(
        Object.entries(assetUrls).map(async ([key, url]) => {
            try {
                return [key, await Assets.load<Texture>(url)] as const;
            } catch {
                return [key, undefined] as const;
            }
        }),
    );

    const enemyShips = await Promise.all(
        enemyShipUrls.map(async (url) => {
            try {
                return await Assets.load<Texture>(url);
            } catch {
                return undefined;
            }
        }),
    );

    return {
        ...(Object.fromEntries(entries) as Omit<
            GameTextures,
            'enemyShips'
        >),
        enemyShips: enemyShips.filter(
            (texture): texture is Texture => texture !== undefined,
        ),
    };
}
