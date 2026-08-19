"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IntensitySelector from "./IntensitySelector";

export default function Header({ intensity, onIntensityChange }: { intensity: number; onIntensityChange: (value: number) => void }) {
  return <Box component="header" sx={{ minHeight: { xs: 128, sm: 98 }, py: { xs: 2.5, sm: 0 }, borderBottom: "1px solid", borderColor: "rgba(255,255,255,.13)", display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", gap: 1.5 }}>
    <Typography component="a" href="#main" aria-label="Roast Me home" sx={{ color: "text.primary", textDecoration: "none", fontWeight: 950, letterSpacing: "-1.5px", fontSize: 24, transform: "skew(-5deg)" }}>ROAST ME <span>🔥</span></Typography>
    <Box sx={{ display: "flex", width: { xs: "100%", sm: "auto" }, alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>How brutal?</Typography>
      <IntensitySelector intensity={intensity} onChange={onIntensityChange} />
    </Box>
  </Box>;
}
