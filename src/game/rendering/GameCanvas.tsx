import { useEffect, useRef } from "react";
import {
    Application,
    Graphics,
    Sprite,
    Text,
    TilingSprite,
} from "pixi.js";
import { INITIAL_GAME_STATE } from "../simulation/gameState";
import {
    startGame,
    finishGame,
    pauseGame,
    resumeGame,
} from "../simulation/gameStateManager";
import { updateGameTime } from "../simulation/gameTime";
import {
    resetGameState,
    updateGameState,
} from "../simulation/gameStateStore";
import type {
    EnemyEntity,
    IslandEntity,
    PlayerEntity,
    ProjectileEntity,
} from "../entities";
import {
    DEFAULT_GAME_CONFIG,
    type GameConfig,
} from "../config/gameConfig";
import { DEFAULT_ISLANDS } from "../config/islandLayout";
import {
    updatePlayerTransform,
    type MovementInput,
} from "../systems/playerMovement";
import {
    clampPlayerPosition,
    type ArenaBounds,
} from "../systems/arenaBounds";
import { createFrontalProjectile } from "../systems/playerShooting";
import { createBothLateralProjectiles } from "../systems/playerLateralShooting";
import { createEnemyProjectile } from "../systems/enemyShooting";
import { updateProjectiles } from "../systems/projectileManager";
import { updateEnemyPosition } from "../systems/enemyMovement";
import { areEntitiesColliding } from "../systems/entityCollision";
import { applyDamageToPlayer } from "../systems/damageSystem";
import { applyDamageToEnemy } from "../systems/enemyDamage";
import { isPlayerDefeated } from "../systems/playerStatus";
import {
    addEnemyDefeatScore,
    createInitialScore,
} from "../systems/scoreSystem";
import {
    isEnemyCollidingWithIsland,
    isPlayerCollidingWithIsland,
    isProjectileCollidingWithIsland,
} from "../systems/islandCollision";
import { createEnemyAtSpawn } from "../systems/enemySpawn";
import type { EnemyType } from "../entities";
import { loadGameTextures } from "./gameAssets";

type EntityVisual = Graphics | Sprite;

const LOGICAL_ARENA_WIDTH = 800;
const LOGICAL_ARENA_HEIGHT = 600;

function getVisualRotationForVelocity(
    velocity: { x: number; y: number },
    fallbackRotation = 0,
): number {
    if (velocity.x === 0 && velocity.y === 0) {
        return fallbackRotation + Math.PI / 2;
    }

    return Math.atan2(velocity.y, velocity.x) + Math.PI / 2;
}

interface GameCanvasProps {
    config?: GameConfig;
}

export function GameCanvas({
    config = DEFAULT_GAME_CONFIG,
}: GameCanvasProps) {
    const canvasContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = canvasContainerRef.current;

        if (!container) {
            return;
        }

        const application = new Application();

        let isMounted = true;
        let isInitialized = false;
        let removeKeyboardListeners = () => undefined;
        let removePauseListeners = () => undefined;
        let removeResizeObserver = () => undefined;

        async function initializeGame() {
            await application.init({
                width: LOGICAL_ARENA_WIDTH,
                height: LOGICAL_ARENA_HEIGHT,
                background: "#123047",
            });

            isInitialized = true;

            if (!isMounted) {
                application.destroy(true);
                return;
            }

            const currentContainer = canvasContainerRef.current;

            if (!currentContainer) {
                application.destroy(true);
                return;
            }

            const resizeTarget = currentContainer;

            const textures = await loadGameTextures();

            if (textures.water) {
                application.stage.addChild(
                    new TilingSprite({
                        texture: textures.water,
                        width: 800,
                        height: 600,
                    }),
                );
            }

            const arenaBounds: ArenaBounds = {
                width: LOGICAL_ARENA_WIDTH,
                height: LOGICAL_ARENA_HEIGHT,
                paddingX: 20,
                paddingY: 25,
            };

            const matchConfig = config;

            const player: PlayerEntity = {
                id: "player-1",
                transform: {
                    position: {
                        x: 400,
                        y: 300,
                    },
                    rotation: 0,
                },
                velocity: {
                    x: 0,
                    y: 0,
                },
                movementSpeed: matchConfig.player.movementSpeed,
                rotationSpeed: matchConfig.player.rotationSpeed,
                health: matchConfig.player.health,
                maxHealth: matchConfig.player.health,
            };

            let currentPlayer = player;

            let currentScore = createInitialScore();

            let currentGameState = startGame(
                INITIAL_GAME_STATE,
            );
            let lastPublishedHealth = -1;
            let lastPublishedMaxHealth = -1;
            let lastPublishedScore = -1;
            let lastPublishedRemainingTime = -1;
            let lastPublishedStatus = currentGameState.status;

            const weaponConfig = matchConfig.frontalWeapon;
            const lateralWeaponConfig =
                matchConfig.lateralWeapon;
            const shooterConfig = matchConfig.shooter;

            let projectiles: ProjectileEntity[] = [];

            let projectileCooldownRemaining = 0;
            let lateralProjectileCooldownRemaining = 0;
            const chaserContactCooldownSeconds = 1;
            const shooterAttackRange = shooterConfig.attackRange;
            const shooterProjectileRadius = 6;
            const playerCollisionRadius = 20;

            let isGameOver = false;
            let spawnCooldownRemaining =
                matchConfig.spawn.intervalSeconds;
            let spawnSequence = 0;
            let spawnedEnemies: EnemyEntity[] = [];

            const projectileGraphics = new Map<string, EntityVisual>();
            const spawnedEnemyGraphics = new Map<string, EntityVisual>();
            const enemyHealthBars = new Map<string, Graphics>();
            const impactEffects = new Map<
                string,
                { graphic: Graphics; remaining: number }
            >();
            const spawnedEnemyContactCooldowns = new Map<string, number>();
            const spawnedShooterCooldowns = new Map<string, number>();

            const islands: IslandEntity[] = DEFAULT_ISLANDS.map(
                (island) => ({
                    ...island,
                    position: {
                        ...island.position,
                    },
                }),
            );

            const islandGraphics = new Map<string, EntityVisual>();

            for (const island of islands) {
                const islandGraphic = textures.island
                    ? new Sprite(textures.island)
                    : new Graphics()
                          .circle(0, 0, island.radius)
                          .fill({
                              color: 0x527d50,
                          })
                          .stroke({
                              color: 0x9dbb75,
                              width: 4,
                          });

                if (islandGraphic instanceof Sprite) {
                    islandGraphic.anchor.set(0.5);
                    islandGraphic.scale.set(
                        (island.radius * 2) / islandGraphic.width,
                    );
                }

                islandGraphic.position.set(
                    island.position.x,
                    island.position.y,
                );

                islandGraphics.set(island.id, islandGraphic);
                application.stage.addChild(islandGraphic);
            }

            const playerShip = textures.playerShip
                ? new Sprite(textures.playerShip)
                : new Graphics()
                      .poly([0, -25, 18, 20, 0, 12, -18, 20])
                      .fill({
                          color: 0xf4c542,
                      });

            if (playerShip instanceof Sprite) {
                playerShip.anchor.set(0.5);
                playerShip.scale.set(0.4);
            }

            playerShip.position.set(
                currentPlayer.transform.position.x,
                currentPlayer.transform.position.y,
            );

            const playerHealthBar = new Graphics();
            let playerDamageFlashRemaining = 0;

            function updateHealthBar(
                graphic: Graphics,
                health: number,
                maxHealth: number,
                width: number,
            ) {
                const ratio = Math.max(0, Math.min(1, health / maxHealth));
                graphic.clear();
                graphic
                    .rect(-width / 2, 0, width, 4)
                    .fill({ color: 0x17232d });
                graphic
                    .rect(-width / 2, 0, width * ratio, 4)
                    .fill({
                        color: ratio > 0.35 ? 0x45d483 : 0xe85d5d,
                    });
            }

            function addImpactEffect(position: { x: number; y: number }) {
                const graphic = new Graphics()
                    .circle(0, 0, 18)
                    .stroke({ color: 0xffd166, width: 4 });
                graphic.position.set(position.x, position.y);
                application.stage.addChild(graphic);
                impactEffects.set(crypto.randomUUID(), {
                    graphic,
                    remaining: 0.25,
                });
            }

            const gameOverText = new Text({
                text: "GAME OVER",
                style: {
                    fontFamily: "Arial",
                    fontSize: 56,
                    fontWeight: "bold",
                    fill: 0xff4444,
                    stroke: {
                        color: 0x000000,
                        width: 6,
                    },
                },
            });

            gameOverText.anchor.set(0.5);
            gameOverText.position.set(400, 300);
            gameOverText.visible = false;

            function publishGameState() {
                const remainingTime = Math.max(
                    0,
                    Math.ceil(
                        matchConfig.matchDurationSeconds -
                            currentGameState.elapsedTimeSeconds,
                    ),
                );

                const hasChanged =
                    currentPlayer.health !== lastPublishedHealth ||
                    currentPlayer.maxHealth !==
                        lastPublishedMaxHealth ||
                    currentScore.score !== lastPublishedScore ||
                    remainingTime !== lastPublishedRemainingTime ||
                    currentGameState.status !== lastPublishedStatus;

                if (!hasChanged) {
                    return;
                }

                updateGameState({
                    health: currentPlayer.health,
                    maxHealth: currentPlayer.maxHealth,
                    score: currentScore.score,
                    remainingTime,
                    status: currentGameState.status,
                });

                lastPublishedHealth = currentPlayer.health;
                lastPublishedMaxHealth = currentPlayer.maxHealth;
                lastPublishedScore = currentScore.score;
                lastPublishedRemainingTime = remainingTime;
                lastPublishedStatus = currentGameState.status;
            }

            function resizeRenderer() {
                const width = Math.max(
                    1,
                    resizeTarget.clientWidth || window.innerWidth,
                );
                const height = Math.max(
                    1,
                    resizeTarget.clientHeight || window.innerHeight,
                );
                const scale = Math.min(
                    width / LOGICAL_ARENA_WIDTH,
                    height / LOGICAL_ARENA_HEIGHT,
                );

                application.renderer.resize(width, height);
                application.stage.scale.set(scale);
                application.stage.position.set(
                    (width - LOGICAL_ARENA_WIDTH * scale) / 2,
                    (height - LOGICAL_ARENA_HEIGHT * scale) / 2,
                );
            }

            function endCurrentGame() {
                if (isGameOver) {
                    return;
                }

                isGameOver = true;
                currentGameState = finishGame(currentGameState);

                movementInput.forward = false;
                movementInput.backward = false;
                movementInput.left = false;
                movementInput.right = false;

                gameOverText.visible = true;

                for (const graphic of spawnedEnemyGraphics.values()) {
                    graphic.destroy();
                }
                for (const graphic of enemyHealthBars.values()) {
                    graphic.destroy();
                }
                for (const effect of impactEffects.values()) {
                    effect.graphic.destroy();
                }

                spawnedEnemyGraphics.clear();
                enemyHealthBars.clear();
                impactEffects.clear();
                spawnedEnemies = [];

                publishGameState();
            }

            function pauseCurrentGame() {
                currentGameState = pauseGame(currentGameState);
                movementInput.forward = false;
                movementInput.backward = false;
                movementInput.left = false;
                movementInput.right = false;
                publishGameState();
            }

            function resumeCurrentGame() {
                currentGameState = resumeGame(currentGameState);
                publishGameState();
            }

            function togglePause() {
                if (currentGameState.status === "playing") {
                    pauseCurrentGame();
                } else if (currentGameState.status === "paused") {
                    resumeCurrentGame();
                }
            }

            resetGameState();
            publishGameState();

            application.stage.addChild(playerShip);
            application.stage.addChild(playerHealthBar);
            application.stage.addChild(gameOverText);

            currentContainer.appendChild(application.canvas);
            application.canvas.className = "game-canvas";
            resizeRenderer();

            const resizeObserver = new ResizeObserver(resizeRenderer);
            resizeObserver.observe(currentContainer);
            removeResizeObserver = () => {
                resizeObserver.disconnect();
            };

            const movementInput: MovementInput = {
                forward: false,
                backward: false,
                left: false,
                right: false,
            };

            function calculateDistance(
                firstPosition: { x: number; y: number },
                secondPosition: { x: number; y: number },
            ): number {
                const deltaX =
                    firstPosition.x - secondPosition.x;
                const deltaY =
                    firstPosition.y - secondPosition.y;

                return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            }

            const spawnPositions = [
                { x: 60, y: 80 },
                { x: 400, y: 70 },
                { x: 740, y: 80 },
                { x: 60, y: 520 },
                { x: 400, y: 530 },
                { x: 740, y: 520 },
            ];

            function updateSpawnedEnemyAppearance(
                graphic: EntityVisual,
                enemy: EnemyEntity,
            ) {
                if (graphic instanceof Sprite) {
                    return;
                }

                graphic.clear();

                if (enemy.type === "chaser") {
                    graphic
                        .circle(0, 0, 16)
                        .fill({ color: 0xd94f4f });
                    return;
                }

                graphic
                    .rect(-15, -15, 30, 30)
                    .fill({ color: 0x8b5cf6 })
                    .stroke({ color: 0xe0c3ff, width: 2 });
            }

            function spawnEnemy(type: EnemyType) {
                const config =
                    type === "chaser"
                        ? matchConfig.chaser
                        : matchConfig.shooter;
                const orderedPositions = spawnPositions.map(
                    (_, index) =>
                        spawnPositions[
                            (index + spawnSequence) %
                                spawnPositions.length
                        ],
                );
                const enemy = createEnemyAtSpawn(
                    type,
                    `spawned-${type}-${spawnSequence}`,
                    currentPlayer,
                    islands,
                    arenaBounds,
                    config,
                    orderedPositions,
                    matchConfig.spawn.minimumDistanceFromPlayer,
                );

                spawnSequence += 1;

                if (!enemy) {
                    return;
                }

                const texture =
                    textures.enemyShips.length > 0
                        ? textures.enemyShips[
                              spawnSequence %
                                  textures.enemyShips.length
                          ]
                        : undefined;
                const graphic = texture
                    ? new Sprite(texture)
                    : new Graphics();

                if (graphic instanceof Sprite) {
                    graphic.anchor.set(0.5);
                    graphic.scale.set(0.3);
                }

                updateSpawnedEnemyAppearance(graphic, enemy);
                graphic.position.set(
                    enemy.transform.position.x,
                    enemy.transform.position.y,
                );
                application.stage.addChild(graphic);
                const healthBar = new Graphics();
                updateHealthBar(
                    healthBar,
                    enemy.health,
                    enemy.maxHealth,
                    34,
                );
                healthBar.position.set(
                    enemy.transform.position.x,
                    enemy.transform.position.y - 28,
                );
                application.stage.addChild(healthBar);
                spawnedEnemies = [...spawnedEnemies, enemy];
                spawnedEnemyGraphics.set(enemy.id, graphic);
                enemyHealthBars.set(enemy.id, healthBar);
                spawnedEnemyContactCooldowns.set(enemy.id, 0);
                spawnedShooterCooldowns.set(
                    enemy.id,
                    type === "shooter"
                        ? shooterConfig.attackCooldownSeconds
                        : 0,
                );
            }

            function addProjectileGraphic(
                projectile: ProjectileEntity,
                color: number,
            ) {
                const projectileGraphic = textures.cannonBall
                    ? new Sprite(textures.cannonBall)
                    : new Graphics()
                          .circle(0, 0, 5)
                          .fill({
                              color,
                          });

                if (projectileGraphic instanceof Sprite) {
                    projectileGraphic.anchor.set(0.5);
                    projectileGraphic.tint = color;
                }

                projectileGraphic.position.set(
                    projectile.transform.position.x,
                    projectile.transform.position.y,
                );

                application.stage.addChild(projectileGraphic);
                projectileGraphics.set(
                    projectile.id,
                    projectileGraphic,
                );
            }

            function fireFrontalProjectile() {
                if (
                    isGameOver ||
                    currentGameState.status !== "playing" ||
                    projectileCooldownRemaining > 0
                ) {
                    return;
                }

                const projectile = createFrontalProjectile(
                    currentPlayer,
                    weaponConfig,
                    `projectile-${crypto.randomUUID()}`,
                );

                projectiles = [...projectiles, projectile];

                addProjectileGraphic(projectile, 0xffffff);

                projectileCooldownRemaining =
                    weaponConfig.cooldownSeconds;
            }

            function fireLateralProjectiles() {
                if (
                    isGameOver ||
                    currentGameState.status !== "playing" ||
                    lateralProjectileCooldownRemaining > 0
                ) {
                    return;
                }

                const lateralProjectiles =
                    createBothLateralProjectiles(
                        currentPlayer,
                        lateralWeaponConfig,
                        `lateral-${crypto.randomUUID()}`,
                    );

                projectiles = [
                    ...projectiles,
                    ...lateralProjectiles,
                ];

                for (const projectile of lateralProjectiles) {
                    addProjectileGraphic(projectile, 0xffd166);
                }

                lateralProjectileCooldownRemaining =
                    lateralWeaponConfig.cooldownSeconds;
            }

            function handleKeyDown(event: KeyboardEvent) {
                const key = event.key.toLowerCase();

                if (event.key === "Escape") {
                    event.preventDefault();
                    togglePause();
                    return;
                }

                if (
                    key === "arrowup" ||
                    key === "arrowdown" ||
                    key === "arrowleft" ||
                    key === "arrowright" ||
                    event.code === "Space" ||
                    event.code === "ShiftLeft" ||
                    event.code === "ShiftRight"
                ) {
                    event.preventDefault();
                }

                if (
                    event.code === "Space" ||
                    event.key === " "
                ) {
                    if (!event.repeat) {
                        fireFrontalProjectile();
                    }

                    return;
                }

                if (
                    event.code === "ShiftLeft" ||
                    event.code === "ShiftRight"
                ) {
                    if (!event.repeat) {
                        fireLateralProjectiles();
                    }

                    return;
                }

                if (isGameOver) {
                    return;
                }

                if (currentGameState.status !== "playing") {
                    return;
                }

                switch (key) {
                    case "w":
                    case "arrowup":
                        movementInput.forward = true;
                        break;

                    case "s":
                    case "arrowdown":
                        movementInput.backward = true;
                        break;

                    case "a":
                    case "arrowleft":
                        movementInput.left = true;
                        break;

                    case "d":
                    case "arrowright":
                        movementInput.right = true;
                        break;
                }
            }

            function handleKeyUp(event: KeyboardEvent) {
                switch (event.key.toLowerCase()) {
                    case "w":
                    case "arrowup":
                        movementInput.forward = false;
                        break;

                    case "s":
                    case "arrowdown":
                        movementInput.backward = false;
                        break;

                    case "a":
                    case "arrowleft":
                        movementInput.left = false;
                        break;

                    case "d":
                    case "arrowright":
                        movementInput.right = false;
                        break;
                }
            }

            function handleTouchInput(event: Event) {
                const detail = (
                    event as CustomEvent<{
                        action?: string;
                        pressed?: boolean;
                    }>
                ).detail;

                if (!detail || typeof detail.pressed !== "boolean") {
                    return;
                }

                if (currentGameState.status !== "playing") {
                    return;
                }

                switch (detail.action) {
                    case "forward":
                        movementInput.forward = detail.pressed;
                        break;
                    case "left":
                        movementInput.left = detail.pressed;
                        break;
                    case "right":
                        movementInput.right = detail.pressed;
                        break;
                    case "fire":
                        if (detail.pressed) {
                            fireFrontalProjectile();
                        }
                        break;
                    case "lateral":
                        if (detail.pressed) {
                            fireLateralProjectiles();
                        }
                        break;
                }
            }

            function isProjectileCollidingWithEnemy(
                projectile: ProjectileEntity,
                enemy: EnemyEntity,
                enemyRadius: number,
            ): boolean {
                const distance = calculateDistance(
                    projectile.transform.position,
                    enemy.transform.position,
                );

                return distance <= 5 + enemyRadius;
            }

            function isProjectileCollidingWithPlayer(
                projectile: ProjectileEntity,
                targetPlayer: PlayerEntity,
            ): boolean {
                const distance = calculateDistance(
                    projectile.transform.position,
                    targetPlayer.transform.position,
                );

                return (
                    distance <=
                    shooterProjectileRadius +
                        playerCollisionRadius
                );
            }

            function removeProjectile(projectileId: string) {
                const graphic = projectileGraphics.get(projectileId);

                if (graphic) {
                    graphic.destroy();
                    projectileGraphics.delete(projectileId);
                }

                projectiles = projectiles.filter(
                    (projectile) => projectile.id !== projectileId,
                );
            }

            function isPlayerCollidingWithAnyIsland(
                candidatePlayer: PlayerEntity,
            ): boolean {
                return islands.some((island) =>
                    isPlayerCollidingWithIsland(
                        candidatePlayer,
                        island,
                        playerCollisionRadius,
                    ),
                );
            }

            function removeProjectilesCollidingWithIslands() {
                for (const projectile of [...projectiles]) {
                    const isCollidingWithIsland = islands.some(
                        (island) =>
                            isProjectileCollidingWithIsland(
                                projectile,
                                island,
                                5,
                            ),
                    );

                    if (isCollidingWithIsland) {
                        removeProjectile(projectile.id);
                    }
                }
            }

            function removeProjectilesOutsideArena() {
                for (const projectile of [...projectiles]) {
                    const { x, y } = projectile.transform.position;
                    const isOutside =
                        x < 0 ||
                        x > arenaBounds.width ||
                        y < 0 ||
                        y > arenaBounds.height;

                    if (isOutside) {
                        removeProjectile(projectile.id);
                    }
                }
            }

            function fireShooterProjectileForEnemy(
                enemy: EnemyEntity,
            ) {
                const projectile = createEnemyProjectile(
                    enemy,
                    currentPlayer,
                    shooterConfig,
                    `enemy-projectile-${crypto.randomUUID()}`,
                );

                projectiles = [...projectiles, projectile];
                addProjectileGraphic(projectile, 0x66ccff);
            }

            function updateShooterPosition(
                enemy: EnemyEntity,
                targetPlayer: PlayerEntity,
                deltaTimeSeconds: number,
            ): EnemyEntity {
                const deltaX =
                    targetPlayer.transform.position.x -
                    enemy.transform.position.x;

                const deltaY =
                    targetPlayer.transform.position.y -
                    enemy.transform.position.y;

                const distance = Math.sqrt(
                    deltaX * deltaX + deltaY * deltaY,
                );

                const minimumAttackDistance =
                    shooterAttackRange * 0.75;

                if (
                    distance <= minimumAttackDistance ||
                    distance === 0
                ) {
                    return {
                        ...enemy,
                        velocity: {
                            x: 0,
                            y: 0,
                        },
                        transform: {
                            ...enemy.transform,
                            rotation: Math.atan2(deltaY, deltaX),
                        },
                    };
                }

                const directionX = deltaX / distance;
                const directionY = deltaY / distance;

                return {
                    ...enemy,
                    velocity: {
                        x: directionX * enemy.movementSpeed,
                        y: directionY * enemy.movementSpeed,
                    },
                    transform: {
                        position: {
                            x:
                                enemy.transform.position.x +
                                directionX *
                                    enemy.movementSpeed *
                                    deltaTimeSeconds,
                            y:
                                enemy.transform.position.y +
                                directionY *
                                    enemy.movementSpeed *
                                    deltaTimeSeconds,
                        },
                        rotation: Math.atan2(deltaY, deltaX),
                    },
                };
            }

            window.addEventListener("keydown", handleKeyDown);
            window.addEventListener("keyup", handleKeyUp);
            window.addEventListener(
                "game:touch-input",
                handleTouchInput,
            );

            function handleWindowBlur() {
                pauseCurrentGame();
            }

            function handleVisibilityChange() {
                if (document.hidden) {
                    pauseCurrentGame();
                }
            }

            function handlePauseToggle() {
                togglePause();
            }

            window.addEventListener("blur", handleWindowBlur);
            document.addEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
            window.addEventListener(
                "game:toggle-pause",
                handlePauseToggle,
            );

            removeKeyboardListeners = () => {
                window.removeEventListener("keydown", handleKeyDown);
                window.removeEventListener("keyup", handleKeyUp);
                window.removeEventListener(
                    "game:touch-input",
                    handleTouchInput,
                );
            };

            removePauseListeners = () => {
                window.removeEventListener("blur", handleWindowBlur);
                document.removeEventListener(
                    "visibilitychange",
                    handleVisibilityChange,
                );
                window.removeEventListener(
                    "game:toggle-pause",
                    handlePauseToggle,
                );
            };

            application.ticker.add((ticker) => {
                if (isGameOver) {
                    return;
                }

                if (currentGameState.status === "paused") {
                    return;
                }

                const deltaTimeSeconds = ticker.deltaMS / 1000;

                currentGameState = updateGameTime(
                    currentGameState,
                    deltaTimeSeconds,
                    matchConfig.matchDurationSeconds,
                );

                if (currentGameState.status === "finished") {
                    endCurrentGame();
                    return;
                }

                const nextPlayer = updatePlayerTransform(
                    currentPlayer,
                    movementInput,
                    deltaTimeSeconds,
                );

                const boundedPosition = clampPlayerPosition(
                    nextPlayer.transform.position,
                    arenaBounds,
                );

                const candidatePlayer: PlayerEntity = {
                    ...nextPlayer,
                    transform: {
                        ...nextPlayer.transform,
                        position: boundedPosition,
                    },
                };

                if (
                    !isPlayerCollidingWithAnyIsland(
                        candidatePlayer,
                    )
                ) {
                    currentPlayer = candidatePlayer;
                } else {
                    currentPlayer = {
                        ...currentPlayer,
                        transform: {
                            ...currentPlayer.transform,
                            rotation: nextPlayer.transform.rotation,
                        },
                    };
                }

                playerShip.position.set(
                    currentPlayer.transform.position.x,
                    currentPlayer.transform.position.y,
                );

                playerShip.rotation =
                    currentPlayer.transform.rotation;
                playerHealthBar.position.set(
                    currentPlayer.transform.position.x,
                    currentPlayer.transform.position.y - 34,
                );
                updateHealthBar(
                    playerHealthBar,
                    currentPlayer.health,
                    currentPlayer.maxHealth,
                    48,
                );

                spawnCooldownRemaining = Math.max(
                    0,
                    spawnCooldownRemaining - deltaTimeSeconds,
                );

                if (spawnCooldownRemaining === 0) {
                    spawnEnemy(
                        spawnSequence % 2 === 0
                            ? "chaser"
                            : "shooter",
                    );
                    spawnCooldownRemaining =
                        matchConfig.spawn.intervalSeconds;
                }

                for (const enemy of spawnedEnemies) {
                    if (enemy.type === "chaser") {
                        const nextEnemy = updateEnemyPosition(
                            enemy,
                            currentPlayer,
                            deltaTimeSeconds,
                        );
                        const isBlockedByIsland = islands.some((island) =>
                            isEnemyCollidingWithIsland(
                                nextEnemy,
                                island,
                                16,
                            ),
                        );
                        const resolvedEnemy = isBlockedByIsland
                            ? {
                                  ...enemy,
                                  velocity: { x: 0, y: 0 },
                              }
                            : nextEnemy;
                        const enemyGraphic =
                            spawnedEnemyGraphics.get(enemy.id);
                        const isColliding = areEntitiesColliding(
                            currentPlayer,
                            resolvedEnemy,
                            { playerRadius: 20, enemyRadius: 16 },
                        );
                        const contactCooldown = Math.max(
                            0,
                            (spawnedEnemyContactCooldowns.get(
                                enemy.id,
                            ) ?? 0) - deltaTimeSeconds,
                        );

                        spawnedEnemyContactCooldowns.set(
                            enemy.id,
                            contactCooldown,
                        );

                        if (
                            isColliding &&
                            contactCooldown === 0 &&
                            currentPlayer.health > 0
                        ) {
                            currentPlayer = applyDamageToPlayer(
                                currentPlayer,
                                matchConfig.chaser
                                    .contactDamage,
                            );
                            playerDamageFlashRemaining = 0.2;
                            addImpactEffect(resolvedEnemy.transform.position);
                            spawnedEnemyContactCooldowns.set(
                                enemy.id,
                                chaserContactCooldownSeconds,
                            );

                            enemyGraphic?.destroy();
                            spawnedEnemyGraphics.delete(enemy.id);
                            enemyHealthBars.get(enemy.id)?.destroy();
                            enemyHealthBars.delete(enemy.id);
                            spawnedEnemyContactCooldowns.delete(
                                enemy.id,
                            );
                            spawnedEnemies = spawnedEnemies.filter(
                                (candidate) =>
                                    candidate.id !== enemy.id,
                            );
                            continue;
                        }

                        if (enemyGraphic) {
                            enemyGraphic.position.set(
                                resolvedEnemy.transform.position.x,
                                resolvedEnemy.transform.position.y,
                            );
                            enemyGraphic.rotation =
                                getVisualRotationForVelocity(
                                    resolvedEnemy.velocity,
                                );
                        }
                        const healthBar = enemyHealthBars.get(enemy.id);
                        if (healthBar) {
                            healthBar.position.set(
                                resolvedEnemy.transform.position.x,
                                resolvedEnemy.transform.position.y - 28,
                            );
                        }

                        spawnedEnemies = spawnedEnemies.map(
                            (candidate) =>
                                candidate.id === enemy.id
                                    ? resolvedEnemy
                                    : candidate,
                        );
                        continue;
                    }

                    const nextEnemy = updateShooterPosition(
                        enemy,
                        currentPlayer,
                        deltaTimeSeconds,
                    );
                    const isBlockedByIsland = islands.some((island) =>
                        isEnemyCollidingWithIsland(nextEnemy, island, 15),
                    );
                    const resolvedEnemy = isBlockedByIsland
                        ? {
                              ...enemy,
                              velocity: { x: 0, y: 0 },
                          }
                        : nextEnemy;
                    const enemyGraphic = spawnedEnemyGraphics.get(
                        enemy.id,
                    );
                    const distanceToPlayer = calculateDistance(
                        resolvedEnemy.transform.position,
                        currentPlayer.transform.position,
                    );
                    const nextCooldown = Math.max(
                        0,
                        (spawnedShooterCooldowns.get(enemy.id) ?? 0) -
                            deltaTimeSeconds,
                    );

                    spawnedShooterCooldowns.set(
                        enemy.id,
                        nextCooldown,
                    );

                    if (
                        distanceToPlayer <= shooterAttackRange &&
                        nextCooldown === 0
                    ) {
                        fireShooterProjectileForEnemy(resolvedEnemy);
                        spawnedShooterCooldowns.set(
                            enemy.id,
                            shooterConfig.attackCooldownSeconds,
                        );
                    }

                    if (enemyGraphic) {
                        enemyGraphic.position.set(
                            resolvedEnemy.transform.position.x,
                            resolvedEnemy.transform.position.y,
                        );
                        enemyGraphic.rotation =
                            getVisualRotationForVelocity(
                                resolvedEnemy.velocity,
                                resolvedEnemy.transform.rotation,
                            );
                    }
                    const healthBar = enemyHealthBars.get(enemy.id);
                    if (healthBar) {
                        healthBar.position.set(
                            resolvedEnemy.transform.position.x,
                            resolvedEnemy.transform.position.y - 28,
                        );
                    }

                    spawnedEnemies = spawnedEnemies.map(
                        (candidate) =>
                            candidate.id === enemy.id
                                ? resolvedEnemy
                                : candidate,
                    );
                }

                if (isPlayerDefeated(currentPlayer)) {
                    endCurrentGame();

                    console.log("Game over");

                    return;
                }

                projectileCooldownRemaining = Math.max(
                    0,
                    projectileCooldownRemaining - deltaTimeSeconds,
                );

                lateralProjectileCooldownRemaining = Math.max(
                    0,
                    lateralProjectileCooldownRemaining -
                        deltaTimeSeconds,
                );

                projectiles = updateProjectiles(
                    projectiles,
                    deltaTimeSeconds,
                );

                removeProjectilesCollidingWithIslands();
                removeProjectilesOutsideArena();

                for (const enemy of [...spawnedEnemies]) {
                    for (const projectile of [...projectiles]) {
                        if (
                            projectile.owner !== "player" ||
                            !isProjectileCollidingWithEnemy(
                                projectile,
                                enemy,
                                enemy.type === "chaser" ? 16 : 15,
                            )
                        ) {
                            continue;
                        }

                        const damagedEnemy = applyDamageToEnemy(
                            enemy,
                            projectile.damage,
                        );
                        removeProjectile(projectile.id);

                        spawnedEnemies = spawnedEnemies.map(
                            (candidate) =>
                                candidate.id === enemy.id
                                    ? damagedEnemy
                                    : candidate,
                        );

                        if (damagedEnemy.health <= 0) {
                            const graphic = spawnedEnemyGraphics.get(
                                enemy.id,
                            );
                            graphic?.destroy();
                            spawnedEnemyGraphics.delete(enemy.id);
                            enemyHealthBars.get(enemy.id)?.destroy();
                            enemyHealthBars.delete(enemy.id);
                            spawnedEnemyContactCooldowns.delete(
                                enemy.id,
                            );
                            spawnedShooterCooldowns.delete(enemy.id);
                            spawnedEnemies = spawnedEnemies.filter(
                                (candidate) =>
                                    candidate.id !== enemy.id,
                            );
                            currentScore = addEnemyDefeatScore(
                                currentScore,
                            );
                            addImpactEffect(enemy.transform.position);
                        } else {
                            const healthBar = enemyHealthBars.get(enemy.id);
                            if (healthBar) {
                                updateHealthBar(
                                    healthBar,
                                    damagedEnemy.health,
                                    damagedEnemy.maxHealth,
                                    34,
                                );
                            }
                        }

                        break;
                    }
                }

                for (const projectile of [...projectiles]) {
                    if (
                        projectile.owner !== "enemy" ||
                        !isProjectileCollidingWithPlayer(
                            projectile,
                            currentPlayer,
                        )
                    ) {
                        continue;
                    }

                    currentPlayer = applyDamageToPlayer(
                        currentPlayer,
                        projectile.damage,
                    );
                    playerDamageFlashRemaining = 0.2;

                    console.log(
                        `Player hit by enemy projectile. Health: ${currentPlayer.health}`,
                    );

                    removeProjectile(projectile.id);
                    break;
                }

                if (isPlayerDefeated(currentPlayer)) {
                    endCurrentGame();

                    console.log("Game over");

                    return;
                }

                publishGameState();

                const activeProjectileIds = new Set(
                    projectiles.map((projectile) => projectile.id),
                );

                for (const [
                    projectileId,
                    graphic,
                ] of projectileGraphics) {
                    if (!activeProjectileIds.has(projectileId)) {
                        graphic.destroy();
                        projectileGraphics.delete(projectileId);
                    }
                }

                for (const projectile of projectiles) {
                    const graphic = projectileGraphics.get(
                        projectile.id,
                    );

                    if (!graphic) {
                        continue;
                    }

                    graphic.position.set(
                        projectile.transform.position.x,
                        projectile.transform.position.y,
                    );
                    graphic.rotation = getVisualRotationForVelocity(
                        projectile.velocity,
                    );
                }

                playerDamageFlashRemaining = Math.max(
                    0,
                    playerDamageFlashRemaining - deltaTimeSeconds,
                );
                playerShip.alpha =
                    playerDamageFlashRemaining > 0 ? 0.5 : 1;

                for (const [effectId, effect] of impactEffects) {
                    effect.remaining -= deltaTimeSeconds;
                    effect.graphic.alpha = Math.max(
                        0,
                        effect.remaining / 0.25,
                    );
                    effect.graphic.scale.set(
                        1 + (0.25 - effect.remaining) * 2,
                    );
                    if (effect.remaining <= 0) {
                        effect.graphic.destroy();
                        impactEffects.delete(effectId);
                    }
                }
            });
        }

        void initializeGame();

        return () => {
            isMounted = false;

            removeKeyboardListeners();
            removePauseListeners();
            removeResizeObserver();

            if (isInitialized) {
                application.destroy(true);
            }
        };
    }, [config]);

    return <div className="game-canvas-container" ref={canvasContainerRef} />;
}