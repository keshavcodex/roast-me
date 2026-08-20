"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import type { LiveRoastPhase } from "@/types/live";

export default function RoastResult({ roast, phase, progress, needsTap, audioUnavailable, onPlay, onPause, onReplay, onVolumeChange, onAgain }: {
  roast: string;
  phase: LiveRoastPhase;
  progress: number;
  needsTap: boolean;
  audioUnavailable: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReplay: () => void;
  onVolumeChange: (value: number) => void;
  onAgain: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const isPlaying = phase === "playing" || phase === "roasting";
  const isComplete = phase === "complete" || audioUnavailable;
  async function copyRoast() {
    try {
      await navigator.clipboard.writeText(roast);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2600);
    } catch { setCopied(false); }
  }

  return <Paper component="article" aria-live="polite" elevation={0} sx={{ mt: 3.5, p: { xs: 2.25, sm: 3 }, overflow: "hidden", border: "1px solid", borderColor: "#ffad429e", bgcolor: "#231612", boxShadow: "7px 7px 0 #ff492e57", animation: "result-in .45s cubic-bezier(.2,.8,.2,1) both" }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
      <Typography variant="caption" sx={{ color: "secondary.main", fontWeight: 900, letterSpacing: ".12em" }}>{isComplete ? "🔥 ROASTED" : "🔊 ROASTING..."}</Typography>
      <Chip label={audioUnavailable ? "TEXT FALLBACK" : isComplete ? "EMOTIONAL DAMAGE" : "AUDIO FIRST"} size="small" sx={{ color: "#f0ae92", bgcolor: "rgba(255,73,46,.12)", fontSize: 9, fontWeight: 900, letterSpacing: ".08em" }} />
    </Box>
    {!audioUnavailable && <Box sx={{ mt: 2.5, mb: 2 }}><LinearProgress variant="determinate" value={progress * 100} color="secondary" sx={{ height: 5, bgcolor: "rgba(255,255,255,.1)" }} /></Box>}
    {needsTap && <Typography variant="body2" sx={{ mt: 2.25, color: "secondary.main", fontWeight: 800 }}>Tap to hear the damage 🔊</Typography>}
    {roast ? <Typography sx={{ m: "24px 0 28px", color: "#fff4e9", fontFamily: "sans-serif", fontSize: { xs: 20, sm: 27 }, letterSpacing: "-.025em", lineHeight: 1.28, textWrap: "balance" }}>{roast}</Typography> : <Typography sx={{ m: "24px 0 28px", color: "#b7aaa3", fontStyle: "italic" }}>The insult is loading its voice...</Typography>}
    <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
      {!audioUnavailable && <>
        <Button variant="text" size="small" onClick={isPlaying ? onPause : onPlay} sx={{ color: "#dec2b2" }}>{isPlaying ? "PAUSE" : "PLAY"}</Button>
        <Button variant="text" size="small" onClick={onReplay} sx={{ color: "#dec2b2" }}>REPLAY</Button>
        <Box sx={{ width: 78, display: "flex", alignItems: "center", gap: .5 }}><Typography variant="caption">🔊</Typography><Slider aria-label="Volume" defaultValue={80} size="small" color="secondary" onChange={(_, value) => onVolumeChange((Array.isArray(value) ? value[0] : value) / 100)} /></Box>
      </>}
      {roast && <Button variant="text" size="small" onClick={copyRoast} sx={{ color: "#dec2b2" }}>{copied ? "COPIED ✓" : "COPY"}</Button>}
      <Button variant="outlined" size="small" color="secondary" onClick={onAgain}>ROAST ANOTHER →</Button>
    </Box>
    {copied && <Typography variant="caption" sx={{ display: "block", mt: 1.5, color: "#f8c497", fontStyle: "italic" }}>Copied. Now go do something about that excuse.</Typography>}
  </Paper>;
}
