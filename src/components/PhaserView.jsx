import { useEffect, useRef } from "react";
import Phaser from "phaser";
import PortraitScene from "../phaser/PortraitScene";

export default function PhaserView({ playerId, blurPx }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const sceneRef = useRef(null);

  // Create Phaser game once
  useEffect(() => {
    if (!containerRef.current) return;

    const config = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 350,   // canvas size for the portrait area (tweak)
      height: 350,
      backgroundColor: "#f7f7fb",
      scene: [PortraitScene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    game.events.once("ready", () => {});

    // Wait a tick for scene to exist
    setTimeout(() => {
      const scene = game.scene.keys["PortraitScene"];
      sceneRef.current = scene;
      if (playerId) scene.showPortrait(playerId);
    }, 0);

    return () => {
      // Cleanup on unmount
      game.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update portrait when playerId changes
  useEffect(() => {
    if (sceneRef.current && playerId) {
      sceneRef.current.showPortrait(playerId);
    }
  }, [playerId]);

  // Apply blur via CSS filter to the actual canvas (reliable)
  // Apply blur by setting a CSS variable (survives canvas re-creation)
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.style.setProperty("--blurPx", `${blurPx}px`);
  }, [blurPx]);

  return (
    <div
      ref={containerRef}
      style={{
        width: 350,
        height: 350,
        borderRadius: 0,
        overflow: "hidden",
        boxShadow: "0 12px 34px rgba(0,0,0,0.14)",
        background: "transparent",
      }}
    />
  );
}
