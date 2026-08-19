"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

export default function RoastResult({ roast, onAgain }: { roast: string; onAgain: () => void }) {
  const [copied, setCopied] = useState(false);
  async function copyRoast() {
    try {
      await navigator.clipboard.writeText(roast);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2600);
    } catch { setCopied(false); }
  }
  return <Paper component="article" aria-live="polite" elevation={0} sx={{ mt: 3.5, p: { xs: 2.25, sm: 3 }, overflow: "hidden", border: "1px solid", borderColor: "#ffad429e", bgcolor: "#231612", boxShadow: "7px 7px 0 #ff492e57", animation: "result-in .45s cubic-bezier(.2,.8,.2,1) both" }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
      <Typography variant="caption" sx={{ color: "secondary.main", fontWeight: 900, letterSpacing: ".12em" }}>🔥 YOUR ROAST</Typography>
      <Chip label="EMOTIONAL DAMAGE" size="small" sx={{ color: "#f0ae92", bgcolor: "rgba(255,73,46,.12)", fontSize: 9, fontWeight: 900, letterSpacing: ".08em" }} />
    </Box>
    <Typography sx={{ m: "24px 0 28px", color: "#fff4e9", fontFamily: 'sans-serif', fontSize: { xs: 20, sm: 27 }, letterSpacing: "-.025em", lineHeight: 1.28, textWrap: "balance" }}>
      {roast}
    </Typography>
    <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
      <Button variant="text" size="small" onClick={copyRoast} sx={{ color: "#dec2b2" }}>{copied ? "COPIED ✓" : "COPY"}</Button>
      <Button variant="outlined" size="small" color="secondary" onClick={onAgain}>ROAST ANOTHER →</Button>
    </Box>
    {copied && <Typography variant="caption" sx={{ display: "block", mt: 1.5, color: "#f8c497", fontStyle: "italic" }}>Copied. Now go do something about that excuse.</Typography>}
  </Paper>;
}
