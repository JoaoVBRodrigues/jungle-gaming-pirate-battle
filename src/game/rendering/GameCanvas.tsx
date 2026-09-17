import { useEffect, useRef } from "react";
import { Application, Graphics } from "pixi.js";

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

      playerShip.position.set(400, 300);

      application.stage.addChild(playerShip);
      currentContainer.appendChild(application.canvas);

      console.log("Player ship created:", playerShip);
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