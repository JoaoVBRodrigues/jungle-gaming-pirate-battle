
import { useEffect, useRef } from "react";
import { Application, Graphics } from "pixi.js";
import type { PlayerEntity } from "../entities";
import {
  updatePlayerTransform,
  type MovementInput,
} from "../systems/playerMovement";
import {
  clampPlayerPosition,
  type ArenaBounds,
} from "../systems/arenaBounds";

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
        forward: false,
        backward: false,
        left: false,
        right: false,
      };

      function handleKeyDown(event: KeyboardEvent) {
        const key = event.key.toLowerCase();

        if (
          key === "arrowup" ||
          key === "arrowdown" ||
          key === "arrowleft" ||
          key === "arrowright"
        ) {
          event.preventDefault();
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