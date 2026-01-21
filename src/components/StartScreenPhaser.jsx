import { useEffect, useRef } from "react";
import Phaser from "phaser";
import StartScreenScene from "../phaser/StartScreenScene";

export default function StartScreenPhaser({ onStart }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const onStartRef = useRef(onStart);

  useEffect(() => {
    onStartRef.current = onStart;
  }, [onStart]);

  useEffect(() => {
    if (!containerRef.current) return;

    const config = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: "#427aa1",
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    game.scene.add(
      "StartScreen",
      StartScreenScene,
      true,
      {
        onStart: () => {
          if (onStartRef.current) onStartRef.current();
        },
      }
    );

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div className="startScreenOverlay" ref={containerRef} />;
}
