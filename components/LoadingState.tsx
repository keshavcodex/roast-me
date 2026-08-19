"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

const messages = ["Analyzing your pathetic excuse...", "Calculating the appropriate level of disrespect...", "Consulting the Department of Bad Decisions...", "Preparing emotional damage...", "Sharpening the insults..."];

export default function LoadingState() {
  const [message, setMessage] = useState(messages[0]);
  useEffect(() => {
    const interval = window.setInterval(() => setMessage(messages[Math.floor(Math.random() * messages.length)]), 1800);
    return () => window.clearInterval(interval);
  }, []);
  return <Box role="status" sx={{ minHeight: 52, display: "flex", justifyContent: "center", alignItems: "center", gap: 1.25, color: "secondary.main" }}><CircularProgress color="secondary" size={17} thickness={5} /><Typography variant="body2" sx={{ fontWeight: 700, fontStyle: "italic" }}>{message}</Typography></Box>;
}
