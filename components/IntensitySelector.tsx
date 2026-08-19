"use client";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

const levels = [
  { value: 1, label: "Mild" },
  { value: 2, label: "Spicy" },
  { value: 3, label: "Savage" },
  { value: 4, label: "Brutal" },
  { value: 5, label: "Nuclear ☢️" },
];

export default function IntensitySelector({ intensity, onChange }: { intensity: number; onChange: (value: number) => void }) {
  return <ToggleButtonGroup exclusive size="small" value={intensity} aria-label="Roast intensity"
    onChange={(_, value: number | null) => { if (value) onChange(value); }}
    sx={{ "& .MuiToggleButton-root": { minWidth: 34, color: "text.secondary", borderColor: "rgba(255,255,255,.18)", fontWeight: 900 }, "& .Mui-selected": { bgcolor: "secondary.main !important", color: "#251308 !important" } }}>
    {levels.map((level) => <ToggleButton key={level.value} value={level.value} aria-label={`${level.value} — ${level.label}`}>{level.value}</ToggleButton>)}
  </ToggleButtonGroup>;
}
