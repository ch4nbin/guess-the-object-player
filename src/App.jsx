import { useCallback, useState } from "react";
import Intro from "./Intro";
import Game from "./Game";
import "./App.css";

export default function App() {
  const [screen, setScreen] = useState("intro"); // "intro" | "game"
  const [profile, setProfile] = useState(null);

  const handleStart = useCallback((p) => {
    setProfile(p);
    setScreen("game");
  }, []);

  return (
    <>
      {screen === "intro" && <Intro onStart={handleStart} />}
      {screen === "game" && (
        <Game
          profile={profile}
          onExitToIntro={() => setScreen("intro")}
        />
      )}
    </>
  );
}
