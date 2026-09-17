
import { useEffect, useRef } from "react";
import { Application, Graphics } from "pixi.js";
import type {
  EnemyEntity,
  PlayerEntity,
  ProjectileEntity,
} from "../entities";
import { DEFAULT_GAME_CONFIG } from "../config/gameConfig";
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
import { updateProjectiles } from "../systems/projectileManager";
import { updateEnemyPosition } from "../systems/enemyMovement";
import { areEntitiesColliding } from "../systems/entityCollision";

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

      const weaponConfig = DEFAULT_GAME_CONFIG.frontalWeapon;
      const lateralWeaponConfig = DEFAULT_GAME_CONFIG.lateralWeapon;

      let projectiles: ProjectileEntity[] = [];

      let projectileCooldownRemaining = 0;
      let lateralProjectileCooldownRemaining = 0;

      const projectileGraphics = new Map<string, Graphics>();

      const playerShip = new Graphics();

      playerShip.poly([0, -25, 18, 20, 0, 12, -18, 20]).fill({
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

      application.stage.addChild(playerShip);
      application.stage.addChild(chaserShip);

      currentContainer.appendChild(application.canvas);

      const movementInput: MovementInput = {
        forward: false,
        backward: false,
        left: false,
        right: false,
      };

      function addProjectileGraphic(
        projectile: ProjectileEntity,
        color: number,
      ) {
        const projectileGraphic = new Graphics().circle(0, 0, 5).fill({
          color,
        });

        projectileGraphic.position.set(
          projectile.transform.position.x,
          projectile.transform.position.y,
        );

        application.stage.addChild(projectileGraphic);
        projectileGraphics.set(projectile.id, projectileGraphic);
      }

      function fireFrontalProjectile() {
        if (projectileCooldownRemaining > 0) {
          return;
        }

        const projectile = createFrontalProjectile(
          currentPlayer,
          weaponConfig,
          `projectile-${crypto.randomUUID()}`,
        );

        projectiles = [...projectiles, projectile];

        addProjectileGraphic(projectile, 0xffffff);

        projectileCooldownRemaining = weaponConfig.cooldownSeconds;
      }

      function fireLateralProjectiles() {
        if (lateralProjectileCooldownRemaining > 0) {
          return;
        }

        const lateralProjectiles = createBothLateralProjectiles(
          currentPlayer,
          lateralWeaponConfig,
          `lateral-${crypto.randomUUID()}`,
        );

        projectiles = [...projectiles, ...lateralProjectiles];

        for (const projectile of lateralProjectiles) {
          addProjectileGraphic(projectile, 0xffd166);
        }

        lateralProjectileCooldownRemaining =
          lateralWeaponConfig.cooldownSeconds;
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

        if (event.code === "Space" || event.key === " ") {
          if (!event.repeat) {
            fireFrontalProjectile();
          }

          return;
        }

        if (
          event.code === "ShiftLeft" ||
          event.code === "ShiftRight"
        ) {
          event.preventDefault();

          if (!event.repeat) {
            fireLateralProjectiles();
          }

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

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      removeKeyboardListeners = () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };

      application.ticker.add((ticker) => {
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

        currentPlayer = {
          ...nextPlayer,
          transform: {
            ...nextPlayer.transform,
            position: boundedPosition,
          },
        };

        playerShip.position.set(
          currentPlayer.transform.position.x,
          currentPlayer.transform.position.y,
        );

        playerShip.rotation = currentPlayer.transform.rotation;

        currentChaser = updateEnemyPosition(
          currentChaser,
          currentPlayer,
          deltaTimeSeconds,
        );

        chaserShip.position.set(
          currentChaser.transform.position.x,
          currentChaser.transform.position.y,
        );

        const isChaserColliding = areEntitiesColliding(
          currentPlayer,
          currentChaser,
          {
            playerRadius: 20,
            enemyRadius: 18,
          },
        );

        updateChaserAppearance(isChaserColliding);

        projectileCooldownRemaining = Math.max(
          0,
          projectileCooldownRemaining - deltaTimeSeconds,
        );

        lateralProjectileCooldownRemaining = Math.max(
          0,
          lateralProjectileCooldownRemaining - deltaTimeSeconds,
        );

        projectiles = updateProjectiles(
          projectiles,
          deltaTimeSeconds,
        );

        const activeProjectileIds = new Set(
          projectiles.map((projectile) => projectile.id),
        );

        for (const [projectileId, graphic] of projectileGraphics) {
          if (!activeProjectileIds.has(projectileId)) {
            graphic.destroy();
            projectileGraphics.delete(projectileId);
          }
        }

        for (const projectile of projectiles) {
          const graphic = projectileGraphics.get(projectile.id);

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