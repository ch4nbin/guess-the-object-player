import { useEffect, useMemo, useRef, useState } from "react";
import PhaserView from "./components/PhaserView";
import GameOverScreen from "./GameOverScreen";
import "./App.css";

import confetti from "canvas-confetti";

const MAX_GUESSES = 6;
const BLUR_LEVELS = [24, 18, 12, 8, 4, 2, 0];
const API_BASE = import.meta.env.VITE_API_BASE || "";

function normalize(s) {
  return String(s).trim().toLowerCase();
}
function simplify(s) {
  return normalize(s).replace(/[^a-z0-9]/g, "");
}

function findPlayer(players, rawName) {
  const wanted = normalize(rawName);
  let found = players.find((p) => normalize(p.name) === wanted);
  if (found) return found;

  const wanted2 = simplify(rawName);
  return players.find((p) => simplify(p.name) === wanted2) || null;
}

// Arrow indicates where TARGET is relative to GUESS
function higherLowerCorrect(guessVal, targetVal) {
  if (guessVal === targetVal) return "correct";
  return guessVal < targetVal ? "higher" : "lower";
}

function posOverlap(guessPos, targetPos) {
  const g = Array.isArray(guessPos) ? guessPos : [guessPos];
  const t = Array.isArray(targetPos) ? targetPos : [targetPos];
  return g.some((p) => t.includes(p));
}

function formatHMS(totalSeconds) {
  const s = Math.max(0, totalSeconds | 0);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function norm(s) {
  return (s ?? "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")   // drop punctuation
    .replace(/\s+/g, " ")
    .trim();
}

function compareGuess(guess, target) {
  return {
    nameMatch: guess.id === target.id,
    conferenceMatch: guess.conference === target.conference,
    teamMatch: guess.team === target.team,
    positionMatch: posOverlap(guess.position, target.position),
    numberHint: higherLowerCorrect(guess.number, target.number),
    ageHint: higherLowerCorrect(guess.age, target.age),
  };
}

function Badge({ kind, icon, text, className = "" }) {
  return (
    <span className={`badge ${kind} ${className}`}>
      <span className="icon">{icon}</span>
      {text}
    </span>
  );
}

function TriBadge({ value, hint, className = "" }) {
  if (hint === "correct") return <Badge kind="ok" icon="✓" text={value} className={className} />;
  if (hint === "higher")  return <Badge kind="up" icon="↑" text={value} className={className} />;
  if (hint === "lower")   return <Badge kind="down" icon="↓" text={value} className={className} />;
  return <Badge kind="neutral" icon="?" text={value} className={className} />;
}

export default function Game({ profile, onShowLeaderboard, onExitToIntro }) {
  const [players, setPlayers] = useState([]);
  const [target, setTarget] = useState(null);

  const [guessText, setGuessText] = useState("");
  const [rows, setRows] = useState([]); // { player, feedback }
  const [guessedIds, setGuessedIds] = useState(new Set());

  const [inputHint, setInputHint] = useState("Guess a player...");
  const [inputHintKind, setInputHintKind] = useState("normal"); // "normal" | "error"
  const [bannerMsg, setBannerMsg] = useState("");

  const [statusMsg, setStatusMsg] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardStatus, setLeaderboardStatus] = useState("idle"); // idle | loading | error | success
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const [elapsedSec, setElapsedSec] = useState(0);
  const [showTime, setShowTime] = useState(true);

  const inputRef = useRef(null);
  const autoRef = useRef(null);
  const portraitWrapRef = useRef(null);
  const suggestionsRef = useRef(null);
  const itemRefs = useRef([]);

  const timerStartRef = useRef(Date.now());   // when the round started
  const timerIntervalRef = useRef(null);      // interval id

  const playerNames = useMemo(() => {
    return (players || []).map(p => p.name);
  }, [players]);

  // Load dataset from public/
  useEffect(() => {
    (async () => {
      const res = await fetch("/assets/players/players.json");
      const data = await res.json();
      setPlayers(data.players || []);
    })();
  }, []);

  useEffect(() => {
    if (players.length && !target) startNewRound(players);
  }, [players]);

  useEffect(() => {
    function onDocMouseDown(e) {
      if (!autoRef.current) return;
      if (!autoRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  useEffect(() => {
    if (!showSuggestions) return;
    if (activeIndex < 0) return;

    const el = itemRefs.current[activeIndex];
    if (el) {
      el.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, showSuggestions, suggestions]);

  useEffect(() => {
    timerStartRef.current = Date.now();
    setElapsedSec(0);

    timerIntervalRef.current = setInterval(() => {
        const diffMs = Date.now() - timerStartRef.current;
        setElapsedSec(Math.floor(diffMs / 1000));
    }, 250);

    return () => {
        if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
        }
    };
  }, []);

  useEffect(() => {
    if (gameOver && timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, [gameOver]);

  const blurPx = useMemo(() => {
    if (gameOver) return 0;
    const step = Math.min(rows.length, BLUR_LEVELS.length - 1);
    return BLUR_LEVELS[step];
  }, [rows.length, gameOver]);

  const didWin = useMemo(() => {
    if (!gameOver || rows.length === 0) return false;
    return Boolean(rows[rows.length - 1]?.feedback?.nameMatch);
  }, [gameOver, rows]);

  async function fetchLeaderboard() {
    setLeaderboardStatus("loading");
    try {
      const res = await fetch(`${API_BASE}/api/leaderboard`);
      if (!res.ok) throw new Error("Leaderboard fetch failed");
      const data = await res.json();
      const list = Array.isArray(data)
        ? data
        : data?.entries || data?.leaderboard || [];
      setLeaderboard(list);
      setLeaderboardStatus("success");
      return true;
    } catch (err) {
      setLeaderboard([]);
      setLeaderboardStatus("error");
      return false;
    }
  }

  useEffect(() => {
    if (!showLeaderboard) return;
    fetchLeaderboard();
  }, [showLeaderboard]);

  async function submitScore(email, consent) {
    if (!target) return;
    const payload = {
      email,
      consent,
      guesses: rows.length,
      elapsedSec,
    };

    const res = await fetch(`${API_BASE}/api/leaderboard`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Score submit failed");
    }

    await fetchLeaderboard();
  }

  useEffect(() => {
    if (!showLeaderboard) return;
    if (scoreSubmitted) return;
    if (!profile?.email || !profile?.acceptedTerms) return;

    submitScore(profile.email, profile.acceptedTerms)
      .then(() => setScoreSubmitted(true))
      .catch(() => {});
  }, [showLeaderboard, scoreSubmitted, profile, target, elapsedSec, rows.length]);

  function hintInInput(message, kind = "error", ms = 1400) {
    setGuessText("");              // clear whatever they typed
    setInputHint(message);         // show message inside input
    setInputHintKind(kind);

    window.clearTimeout(hintInInput._t);
    hintInInput._t = window.setTimeout(() => {
      setInputHint("Guess a player...");
      setInputHintKind("normal");
    }, ms);
  }

  function startNewRound(list = players) {
    const t = list[Math.floor(Math.random() * list.length)];
    setTarget(t);
    setRows([]);
    setGuessedIds(new Set());
    setGameOver(false);
    setShowLeaderboard(false);
    setScoreSubmitted(false);
    setStatusMsg("");
    setGuessText("");
    setBannerMsg("");
    setInputHint("Guess a player...");
    setInputHintKind("normal");
    setTimeout(() => inputRef.current?.focus(), 0);

    // reset stopwatch
    timerStartRef.current = Date.now();
    setElapsedSec(0);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    timerIntervalRef.current = setInterval(() => {
      const diffMs = Date.now() - timerStartRef.current;
      setElapsedSec(Math.floor(diffMs / 1000));
    }, 250);
  }

  function computeSuggestions(input) {
    const q = input.trim().toLowerCase();
    if (!q) return [];

    const scored = playerNames.map((name) => {
      const norm = name.toLowerCase();
      const parts = norm.split(" ");
      const first = parts[0] ?? "";
      const last = parts[parts.length - 1] ?? "";

      let score = 999;

      if (first.startsWith(q)) score = 0;        // best match
      else if (last.startsWith(q)) score = 1;    // second-best
      else if (norm.includes(q)) score = 2;      // fallback (optional)

      return { name, score };
    });

    return scored
      .filter(x => x.score !== 999)
      .sort((a, b) => {
        if (a.score !== b.score) return a.score - b.score;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 100)
      .map(x => x.name);
  }


  function handleInputChange(e) {
    const v = e.target.value;
    setGuessText(v);

    const next = computeSuggestions(v);
    setSuggestions(next);
    setShowSuggestions(next.length > 0);
    setActiveIndex(-1);
  }

  function chooseSuggestion(name, shouldSubmit = false) {
    setGuessText(name);
    setShowSuggestions(false);
    setSuggestions([]);
    setActiveIndex(-1);

    // focus back to input
    inputRef?.current?.focus();

    if (shouldSubmit) {
      // submit on next tick so state is updated
      setTimeout(() => submitGuess(name), 0);
    }
  }

  function closeSuggestions() {
    setShowSuggestions(false);
    setSuggestions([]);
    setActiveIndex(-1);
  }

  function submitGuess(overrideName) {
    if (gameOver || !target) return;

    // Use overrideName if provided (from autocomplete click),
    // otherwise fall back to what's currently in the input
    const raw = (overrideName ?? guessText).trim();
    if (!raw) return;

    const p = findPlayer(players, raw);
    if (!p) {
      closeSuggestions();
      hintInInput("Player not found - try exact name");
      return;
    }

    if (guessedIds.has(p.id)) {
      closeSuggestions();
      hintInInput("Already guessed - try a different player");
      return;
    }

    closeSuggestions();

    const fb = compareGuess(p, target);

    const nextRows = [...rows, { player: p, feedback: fb, isNew: true }].slice(0, MAX_GUESSES);
    setRows(nextRows);

    setTimeout(() => {
      setRows((prev) =>
        prev.map((r) => (r.isNew ? { ...r, isNew: false } : r))
      );
    }, 800);

    const nextSet = new Set(guessedIds);
    nextSet.add(p.id);
    setGuessedIds(nextSet);

    setGuessText("");

    if (fb.nameMatch) {
      setGameOver(true);
      fireWinConfettiFromPortrait();
      setBannerMsg(`Correct! You got it in ${nextRows.length} guess${nextRows.length === 1 ? "" : "es"}.`);
      return;
    }

    if (nextRows.length >= MAX_GUESSES) {
      setGameOver(true);
      setBannerMsg(""); // no big banner on loss
      setGuessText("");
      setInputHint(`Out of guesses — it was ${target.name}`);
      setInputHintKind("error"); // optional red style
      return;
    }
  }

  function handleKeyDown(e) {
    // TAB → accept the first (or active) suggestion, but don't submit
    if (e.key === "Tab") {
      if (showSuggestions && suggestions.length > 0 && !gameOver) {
        e.preventDefault(); // stops focus moving away

        const choice =
          suggestions[activeIndex] ?? suggestions[0]; // active if available, else first

        // Fill input only (do not submit)
        setGuessText(choice);

        // Optional: close dropdown after accepting
        closeSuggestions();

        // Put cursor at end on next tick
        requestAnimationFrame(() => {
          inputRef.current?.focus();
          const el = inputRef.current;
          if (el) el.setSelectionRange(choice.length, choice.length);
        });
      }
      return; // always stop here for Tab
    }

    if (!showSuggestions) {
      if (e.key === "Enter") submitGuess();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        chooseSuggestion(suggestions[activeIndex], true); // fill + submit
      } else {
        closeSuggestions();
        submitGuess();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  function fireWinConfettiFromPortrait() {
    const el = portraitWrapRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();

    // origin is normalized 0..1 in viewport coordinates
    const originX = (rect.left + rect.width / 2) / window.innerWidth;
    const originY = (rect.top + rect.height * 0.35) / window.innerHeight; 
    // 0.35 so it feels like it "pops out" of the portrait area, not dead center

    confetti({
      particleCount: 140,
      spread: 70,
      startVelocity: 45,
      gravity: 1.1,
      scalar: 0.9,
      origin: { x: originX, y: originY },
    });

    // optional second burst for "premium" feel
    setTimeout(() => {
      confetti({
        particleCount: 90,
        spread: 90,
        startVelocity: 35,
        gravity: 1.2,
        scalar: 0.85,
        origin: { x: originX, y: originY },
      });
    }, 140);
  }

  return (
    <>
        <div className="page">
          <div className="left card arcadeFrame">
            <div className="arcadeContent">
              <h2>Guesses</h2>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: "26%" }}>Name</th>
                    <th style={{ width: "12%" }}>Conf</th>
                    <th style={{ width: "10%" }}>Team</th>
                    <th style={{ width: "10%" }}>Pos</th>
                    <th style={{ width: "12%" }}>No.</th>
                    <th style={{ width: "16%" }}>Age</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: MAX_GUESSES }).map((_, i) => {
                    const row = rows[i];
                    if (!row) {
                      return (
                        <tr key={i}>
                          <td className="empty">—</td>
                          <td className="empty">—</td>
                          <td className="empty">—</td>
                          <td className="empty">—</td>
                          <td className="empty">—</td>
                          <td className="empty">—</td>
                        </tr>
                      );
                    }

                    const { player, feedback } = row;
                    const posLabel = Array.isArray(player.position) ? player.position.join("/") : player.position;

                    return (
                      <tr
                        key={i}
                        className={row.isNew ? "guessRow isNew" : "guessRow"}
                      >
                        <td><Badge kind={feedback.nameMatch ? "ok" : "no"} icon={feedback.nameMatch ? "✓" : "✗"} text={player.name} className="badgeAnim" /></td>
                        <td><Badge kind={feedback.conferenceMatch ? "ok" : "no"} icon={feedback.conferenceMatch ? "✓" : "✗"} text={player.conference} className="badgeAnim" /></td>
                        <td><Badge kind={feedback.teamMatch ? "ok" : "no"} icon={feedback.teamMatch ? "✓" : "✗"} text={player.team} className="badgeAnim" /></td>
                        <td><Badge kind={feedback.positionMatch ? "ok" : "no"} icon={feedback.positionMatch ? "✓" : "✗"} text={posLabel} className="badgeAnim" /></td>
                        <td><TriBadge value={player.number} hint={feedback.numberHint} className="badgeAnim" /></td>
                        <td><TriBadge value={player.age} hint={feedback.ageHint} className="badgeAnim" /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="right">
            <div className="rightTop">
              <div className="autoWrap" ref={autoRef}>
                <input
                  ref={inputRef}
                  value={guessText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={inputHint}
                  className={inputHintKind === "error" ? "inputError" : ""}
                  disabled={gameOver}
                  autoComplete="off"
                  spellCheck={false}
                />

                {showSuggestions && !gameOver && suggestions.length > 0 && (
                  <div className="suggestions" ref={suggestionsRef}>
                    {suggestions.map((name, idx) => (
                      <div
                        key={name}
                        ref={(el) => (itemRefs.current[idx] = el)}
                        className={`suggestionItem ${idx === activeIndex ? "active" : ""}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          chooseSuggestion(name, true);
                        }}
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {gameOver && !showLeaderboard && (
                <button
                    className="playAgain"
                    onClick={() => setShowLeaderboard(true)}
                >
                    See Leaderboard
                </button>
              )}
            </div>

            {gameOver && bannerMsg && (
                <div key={bannerMsg} className="winBanner">
                    {bannerMsg}
                </div>
            )}

            <div className="phaserWrap" ref={portraitWrapRef}>
              <PhaserView playerId={target?.id} blurPx={blurPx} />
            </div>
          </div>

          {(showTime || gameOver) && (
            <div className="stopwatch">
              {formatHMS(elapsedSec)}
            </div>
          )}

          {!gameOver && (
            <button
              type="button"
              className="timeToggle"
              onClick={() => setShowTime((v) => !v)}
            >
              {showTime ? "Hide Time" : "Show Time"}
            </button>
          )}

          <img
            src="/public/assets/wit-logo.png"
            alt="WIT"
            className="witLogo"
          />

          {showLeaderboard && (
            <GameOverScreen
                didWin={didWin}
                target={target}
                guessesUsed={rows.length}
                maxGuesses={MAX_GUESSES}
                timeText={formatHMS(elapsedSec)}
                bannerMsg={bannerMsg}
                leaderboard={leaderboard}
                leaderboardStatus={leaderboardStatus}
                onPlayAgain={() => {
                  setShowLeaderboard(false);
                  startNewRound();
                }}
                onBackToHome={onExitToIntro}
            />
            )}
        </div>
    </>
  );
}
