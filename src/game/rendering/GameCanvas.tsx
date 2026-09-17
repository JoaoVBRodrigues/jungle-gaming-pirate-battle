import { useEffect, useRef } from "react";
import { Application, Graphics, Text } from "pixi.js";
import type {
    EnemyEntity,
    IslandEntity,
    PlayerEntity,
    ProjectileEntity,
} from "../entities";
import { DEFAULT_GAME_CONFIG } from "../config/gameConfig";
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
    isPlayerCollidingWithIsland,
    isProjectileCollidingWithIsland,
} from "../systems/islandCollision";

export function GameCanvas() {
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

        async function initializeGame() {
            await application.init({
                width: 800,
                height: 600,
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

            const arenaBounds: ArenaBounds = {
                width: 800,
                height: 600,
                paddingX: 20,
                paddingY: 25,
            };

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
                movementSpeed: 100,
                rotationSpeed: 2,
                health: 100,
                maxHealth: 100,
            };

            let currentPlayer = player;

            const chaser: EnemyEntity = {
                id: "chaser-1",
                type: "chaser",
                transform: {
                    position: {
                        x: 150,
                        y: 150,
                    },
                    rotation: 0,
                },
                velocity: {
                    x: 0,
                    y: 0,
                },
                movementSpeed: DEFAULT_GAME_CONFIG.chaser.movementSpeed,
                health: DEFAULT_GAME_CONFIG.chaser.health,
                maxHealth: DEFAULT_GAME_CONFIG.chaser.health,
            };

            let currentChaser = chaser;

            const shooter: EnemyEntity = {
                id: "shooter-1",
                type: "shooter",
                transform: {
                    position: {
                        x: 650,
                        y: 450,
                    },
                    rotation: 0,
                },
                velocity: {
                    x: 0,
                    y: 0,
                },
                movementSpeed: DEFAULT_GAME_CONFIG.shooter.movementSpeed,
                health: DEFAULT_GAME_CONFIG.shooter.health,
                maxHealth: DEFAULT_GAME_CONFIG.shooter.health,
            };

            let currentShooter = shooter;

            let currentScore = createInitialScore();

            const weaponConfig = DEFAULT_GAME_CONFIG.frontalWeapon;
            const lateralWeaponConfig =
                DEFAULT_GAME_CONFIG.lateralWeapon;
            const shooterConfig = DEFAULT_GAME_CONFIG.shooter;

            let projectiles: ProjectileEntity[] = [];

            let projectileCooldownRemaining = 0;
            let lateralProjectileCooldownRemaining = 0;
            let chaserContactCooldownRemaining = 0;
            let shooterContactCooldownRemaining = 0;
            let shooterAttackCooldownRemaining = 1;

            const chaserContactCooldownSeconds = 1;
            const shooterContactCooldownSeconds = 1;
            const shooterAttackRange = shooterConfig.attackRange;
            const shooterProjectileRadius = 6;
            const playerCollisionRadius = 20;

            let isGameOver = false;
            let isChaserDefeated = false;
            let isShooterDefeated = false;

            const projectileGraphics = new Map<string, Graphics>();

            const islands: IslandEntity[] = DEFAULT_ISLANDS.map(
                (island) => ({
                    ...island,
                    position: {
                        ...island.position,
                    },
                }),
            );

            const islandGraphics = new Map<string, Graphics>();

            for (const island of islands) {
                const islandGraphic = new Graphics()
                    .circle(0, 0, island.radius)
                    .fill({
                        color: 0x527d50,
                    })
                    .stroke({
                        color: 0x9dbb75,
                        width: 4,
                    });

                islandGraphic.position.set(
                    island.position.x,
                    island.position.y,
                );

                islandGraphics.set(island.id, islandGraphic);
                application.stage.addChild(islandGraphic);
            }

            const playerShip = new Graphics();

            playerShip
                .poly([0, -25, 18, 20, 0, 12, -18, 20])
                .fill({
                    color: 0xf4c542,
                });

            playerShip.position.set(
                currentPlayer.transform.position.x,
                currentPlayer.transform.position.y,
            );

            const chaserShip = new Graphics();

            function updateChaserAppearance(isColliding: boolean) {
                chaserShip.clear();

                chaserShip
                    .circle(0, 0, isColliding ? 24 : 18)
                    .fill({
                        color: isColliding ? 0xffcc00 : 0xd94f4f,
                    });
            }

            updateChaserAppearance(false);

            chaserShip.position.set(
                currentChaser.transform.position.x,
                currentChaser.transform.position.y,
            );

            const shooterShip = new Graphics();

            function updateShooterAppearance(isAttacking: boolean) {
                shooterShip.clear();

                shooterShip
                    .rect(-18, -18, 36, 36)
                    .fill({
                        color: isAttacking ? 0xff9900 : 0x8b5cf6,
                    })
                    .stroke({
                        color: 0xe0c3ff,
                        width: 3,
                    });

                shooterShip
                    .circle(0, 0, 7)
                    .fill({
                        color: 0x27134d,
                    });
            }

            updateShooterAppearance(false);

            shooterShip.position.set(
                currentShooter.transform.position.x,
                currentShooter.transform.position.y,
            );

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

            application.stage.addChild(playerShip);
            application.stage.addChild(chaserShip);
            application.stage.addChild(shooterShip);
            application.stage.addChild(gameOverText);

            currentContainer.appendChild(application.canvas);

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

            function addProjectileGraphic(
                projectile: ProjectileEntity,
                color: number,
            ) {
                const projectileGraphic = new Graphics()
                    .circle(0, 0, 5)
                    .fill({
                        color,
                    });

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

            function fireShooterProjectile() {
                if (
                    isGameOver ||
                    isShooterDefeated ||
                    shooterAttackCooldownRemaining > 0
                ) {
                    return;
                }

                const distanceToPlayer = calculateDistance(
                    currentShooter.transform.position,
                    currentPlayer.transform.position,
                );

                if (distanceToPlayer > shooterAttackRange) {
                    return;
                }

                const projectile = createEnemyProjectile(
                    currentShooter,
                    currentPlayer,
                    shooterConfig,
                    `enemy-projectile-${crypto.randomUUID()}`,
                );

                projectiles = [...projectiles, projectile];

                addProjectileGraphic(projectile, 0x66ccff);

                shooterAttackCooldownRemaining =
                    shooterConfig.attackCooldownSeconds;
            }

            function handleKeyDown(event: KeyboardEvent) {
                const key = event.key.toLowerCase();

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

            removeKeyboardListeners = () => {
                window.removeEventListener("keydown", handleKeyDown);
                window.removeEventListener("keyup", handleKeyUp);
            };

            application.ticker.add((ticker) => {
                if (isGameOver) {
                    return;
                }

                const deltaTimeSeconds = ticker.deltaMS / 1000;

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

                if (!isChaserDefeated) {
                    currentChaser = updateEnemyPosition(
                        currentChaser,
                        currentPlayer,
                        deltaTimeSeconds,
                    );

                    chaserShip.position.set(
                        currentChaser.transform.position.x,
                        currentChaser.transform.position.y,
                    );

                    const isChaserColliding =
                        areEntitiesColliding(
                            currentPlayer,
                            currentChaser,
                            {
                                playerRadius: 20,
                                enemyRadius: 18,
                            },
                        );

                    updateChaserAppearance(isChaserColliding);

                    chaserContactCooldownRemaining = Math.max(
                        0,
                        chaserContactCooldownRemaining -
                            deltaTimeSeconds,
                    );

                    if (
                        isChaserColliding &&
                        chaserContactCooldownRemaining === 0 &&
                        currentPlayer.health > 0
                    ) {
                        currentPlayer = applyDamageToPlayer(
                            currentPlayer,
                            DEFAULT_GAME_CONFIG.chaser
                                .contactDamage,
                        );

                        chaserContactCooldownRemaining =
                            chaserContactCooldownSeconds;

                        console.log(
                            `Player health: ${currentPlayer.health}`,
                        );
                    }
                }

                if (!isShooterDefeated) {
                    currentShooter = updateShooterPosition(
                        currentShooter,
                        currentPlayer,
                        deltaTimeSeconds,
                    );

                    shooterShip.position.set(
                        currentShooter.transform.position.x,
                        currentShooter.transform.position.y,
                    );

                    shooterShip.rotation =
                        currentShooter.transform.rotation;

                    const distanceToPlayer = calculateDistance(
                        currentShooter.transform.position,
                        currentPlayer.transform.position,
                    );

                    const isShooterInAttackRange =
                        distanceToPlayer <= shooterAttackRange;

                    updateShooterAppearance(
                        isShooterInAttackRange,
                    );

                    const isShooterColliding =
                        areEntitiesColliding(
                            currentPlayer,
                            currentShooter,
                            {
                                playerRadius: playerCollisionRadius,
                                enemyRadius: 18,
                            },
                        );

                    shooterContactCooldownRemaining = Math.max(
                        0,
                        shooterContactCooldownRemaining -
                            deltaTimeSeconds,
                    );

                    if (
                        isShooterColliding &&
                        shooterContactCooldownRemaining === 0 &&
                        currentPlayer.health > 0
                    ) {
                        currentPlayer = applyDamageToPlayer(
                            currentPlayer,
                            shooterConfig.contactDamage,
                        );

                        shooterContactCooldownRemaining =
                            shooterContactCooldownSeconds;

                        console.log(
                            `Player hit by Shooter contact. Health: ${currentPlayer.health}`,
                        );
                    }

                    shooterAttackCooldownRemaining = Math.max(
                        0,
                        shooterAttackCooldownRemaining -
                            deltaTimeSeconds,
                    );

                    if (isShooterInAttackRange) {
                        fireShooterProjectile();
                    }
                }

                if (isPlayerDefeated(currentPlayer)) {
                    isGameOver = true;

                    movementInput.forward = false;
                    movementInput.backward = false;
                    movementInput.left = false;
                    movementInput.right = false;

                    gameOverText.visible = true;

                    chaserShip.clear();
                    chaserShip.circle(0, 0, 24).fill({
                        color: 0x8b0000,
                    });

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

                if (!isChaserDefeated) {
                    for (const projectile of [...projectiles]) {
                        if (
                            projectile.owner !== "player" ||
                            !isProjectileCollidingWithEnemy(
                                projectile,
                                currentChaser,
                                18,
                            )
                        ) {
                            continue;
                        }

                        currentChaser = applyDamageToEnemy(
                            currentChaser,
                            projectile.damage,
                        );

                        console.log(
                            `Chaser health: ${currentChaser.health}`,
                        );

                        removeProjectile(projectile.id);

                        if (currentChaser.health <= 0) {
                            isChaserDefeated = true;
                            chaserShip.visible = false;

                            currentScore = addEnemyDefeatScore(
                                currentScore,
                            );

                            console.log(
                                `Chaser defeated. Current score: ${currentScore.score}`,
                            );
                        }

                        break;
                    }
                }

                if (!isShooterDefeated) {
                    for (const projectile of [...projectiles]) {
                        if (
                            projectile.owner !== "player" ||
                            !isProjectileCollidingWithEnemy(
                                projectile,
                                currentShooter,
                                18,
                            )
                        ) {
                            continue;
                        }

                        currentShooter = applyDamageToEnemy(
                            currentShooter,
                            projectile.damage,
                        );

                        console.log(
                            `Shooter health: ${currentShooter.health}`,
                        );

                        removeProjectile(projectile.id);

                        if (currentShooter.health <= 0) {
                            isShooterDefeated = true;
                            shooterShip.visible = false;

                            currentScore = addEnemyDefeatScore(
                                currentScore,
                            );

                            console.log(
                                `Shooter defeated. Current score: ${currentScore.score}`,
                            );
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

                    console.log(
                        `Player hit by enemy projectile. Health: ${currentPlayer.health}`,
                    );

                    removeProjectile(projectile.id);
                    break;
                }

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
                }
            });
        }

        void initializeGame();

        return () => {
            isMounted = false;

            removeKeyboardListeners();

            if (isInitialized) {
                application.destroy(true);
            }
        };
    }, []);

    return <div ref={canvasContainerRef} />;
}