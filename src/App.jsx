import { useCallback, useState } from "react";
import Intro from "./Intro";
import Game from "./Game";
import GameOverScreen from "./GameOverScreen"; 
import "./App.css";

export default function App() {
  const [screen, setScreen] = useState("intro"); // "intro" | "game" | "gameover"
  const [profile, setProfile] = useState(null);

  // result payload from Game -> used by GameOverScreen
  const [result, setResult] = useState(null);

  // forces Game to fully reset when you “Play Again”
  const [gameKey, setGameKey] = useState(0);

  const handleStart = useCallback((p) => {
    setProfile(p);
    setResult(null);
    setGameKey((k) => k + 1);
    setScreen("game");
  }, []);

  const handleShowLeaderboard = useCallback((payload) => {
    // payload comes from Game ONLY when user clicks the button
    setResult(payload);
    setScreen("gameover");
  }, []);

  const handlePlayAgain = useCallback(() => {
    setResult(null);
    setGameKey((k) => k + 1);
    setScreen("game");
  }, []);

  return (
    <>
      {screen === "intro" && <Intro onStart={handleStart} />}

      {screen === "game" && (
        <Game
          key={gameKey}
          profile={profile}
          onShowLeaderboard={handleShowLeaderboard}
          onExitToIntro={() => setScreen("intro")}
        />
      )}
    </>
  );
}
