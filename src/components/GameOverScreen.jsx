import { useState } from "react";

export default function GameOverScreen({
  didWin,
  target,
  guessesUsed,
  maxGuesses,
  timeText,
  bannerMsg,
  leaderboard,
  leaderboardStatus,
  onSubmitScore,
  onPlayAgain,
}) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitState, setSubmitState] = useState("idle"); // idle | submitting | success | error
  const [submitError, setSubmitError] = useState("");

  function maskEmail(value) {
    if (!value || typeof value !== "string") return "Anonymous";
    const [user, domain] = value.split("@");
    if (!domain) return value;
    const safeUser = user.length <= 2 ? user : `${user.slice(0, 2)}***`;
    return `${safeUser}@${domain}`;
  }

  function formatDuration(value) {
    if (typeof value !== "number" || Number.isNaN(value)) return value;
    const s = Math.max(0, Math.floor(value));
    const hh = String(Math.floor(s / 3600)).padStart(2, "0");
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }

  const posLabel = Array.isArray(target?.position)
    ? target.position.join("/")
    : target?.position;

  const statusText = didWin ? "Victory" : "Defeat";
  const headline = didWin ? "You Win!" : "Game Over";
  const subtitle = didWin
    ? bannerMsg || "Nice work!"
    : `Out of guesses${target?.name ? ` — it was ${target.name}` : ""}.`;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    if (!onSubmitScore) {
      setSubmitError("Score submission is unavailable.");
      return;
    }

    if (!email.includes("@")) {
      setSubmitError("Enter a valid email to submit.");
      return;
    }

    if (!consent) {
      setSubmitError("Consent is required to submit.");
      return;
    }

    try {
      setSubmitState("submitting");
      await onSubmitScore(email, consent);
      setSubmitState("success");
    } catch (err) {
      setSubmitState("error");
      setSubmitError("Submission failed. Try again.");
    }
  }

  return (
    <div className="gameOverOverlay" role="dialog" aria-modal="true">
      <div className="gameOverCard">
        <div className="gameOverLeft">
          <span className={`resultPill ${didWin ? "win" : "loss"}`}>
            {statusText}
          </span>
          <h2 className="gameOverTitle">{headline}</h2>
          <p className="gameOverSubtitle">{subtitle}</p>

          <div className="playerReveal">
            <div className="playerLabel">The player was</div>
            <div className="playerName">{target?.name || "Unknown"}</div>
            <div className="playerMeta">
              {[target?.team, target?.conference, posLabel, target?.number, target?.age]
                .filter((x) => x !== undefined && x !== null && x !== "")
                .join(" • ")}
            </div>
          </div>

          <div className="runStats">
            <div className="runStat">
              <span className="runStatLabel">Guesses</span>
              <span className="runStatValue">
                {guessesUsed}/{maxGuesses}
              </span>
            </div>
            <div className="runStat">
              <span className="runStatLabel">Time</span>
              <span className="runStatValue">{timeText}</span>
            </div>
          </div>

          <div className="gameOverActions">
            <button className="gameOverButton primary" onClick={onPlayAgain}>
              Play Again
            </button>
          </div>

          <form className="emailCapture" onSubmit={handleSubmit}>
            <div className="emailCaptureTitle">Submit your score</div>
            <label className="emailLabel" htmlFor="emailCaptureInput">
              Email
            </label>
            <input
              id="emailCaptureInput"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="emailInput"
              disabled={submitState === "submitting"}
              required
            />

            <label className="consentRow">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                disabled={submitState === "submitting"}
              />
              <span>I agree to receive marketing emails.</span>
            </label>

            {submitError && (
              <div className="submitError">{submitError}</div>
            )}

            {submitState === "success" ? (
              <div className="submitSuccess">Score submitted. Thanks!</div>
            ) : (
              <button
                type="submit"
                className="gameOverButton"
                disabled={submitState === "submitting"}
              >
                {submitState === "submitting" ? "Submitting..." : "Submit Score"}
              </button>
            )}
          </form>
        </div>

        <div className="gameOverRight">
          <div className="leaderboardHeader">
            <h3 className="leaderboardTitle">Global Leaderboard</h3>
            <div className="leaderboardHint">Top runs this week</div>
          </div>

          {leaderboardStatus === "loading" && (
            <div className="leaderboardState">Loading leaderboard...</div>
          )}

          {leaderboardStatus === "error" && (
            <div className="leaderboardState">Leaderboard unavailable.</div>
          )}

          {leaderboardStatus !== "loading" && leaderboard.length === 0 && (
            <div className="leaderboardState">No scores yet. Be the first!</div>
          )}

          {leaderboard.length > 0 && (
            <div className="leaderboardList">
              {leaderboard.slice(0, 8).map((entry, idx) => (
                <div className="leaderboardRow" key={entry.id || entry._id || `${entry.name}-${idx}`}>
                  <div className="leaderboardRank">#{idx + 1}</div>
                  <div className="leaderboardName">
                    {entry.name ||
                      entry.playerName ||
                      entry.username ||
                      maskEmail(entry.email) ||
                      "Anonymous"}
                  </div>
                  <div className="leaderboardScore">
                    {entry.guesses ?? entry.score ?? "-"}
                  </div>
                  <div className="leaderboardTime">
                    {formatDuration(
                      entry.time ?? entry.elapsedSec ?? entry.duration ?? "-"
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
