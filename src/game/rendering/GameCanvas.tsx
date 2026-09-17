import { useEffect, useRef } from "react";
import { Application, Graphics } from "pixi.js";
import type { PlayerEntity } from "../entities";
import {
  updatePlayerTransform,
  type MovementInput,
} from "../systems/playerMovement";

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

      const playerShip = new Graphics();

      playerShip
        .poly([
          0, -25,
          18, 20,
          0, 12,
          -18, 20,
        ])
        .fill({
          color: 0xf4c542,
        });

      playerShip.position.set(
        currentPlayer.transform.position.x,
        currentPlayer.transform.position.y,
      );

      application.stage.addChild(playerShip);
      currentContainer.appendChild(application.canvas);

      const movementInput: MovementInput = {
        forward: true,
        backward: false,
        left: false,
        right: false,
      };

      application.ticker.add((ticker) => {
        const deltaTimeSeconds = ticker.deltaMS / 1000;

        currentPlayer = updatePlayerTransform(
          currentPlayer,
          movementInput,
          deltaTimeSeconds,
        );

        playerShip.position.set(
          currentPlayer.transform.position.x,
          currentPlayer.transform.position.y,
        );

        playerShip.rotation = currentPlayer.transform.rotation;
      });
    }

    void initializeGame();

    return () => {
      isMounted = false;

      if (isInitialized) {
        application.destroy(true);
      }
    };
  }, []);

  return <div ref={canvasContainerRef} />;
}