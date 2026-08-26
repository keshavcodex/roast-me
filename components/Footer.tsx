"use client";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { usePathname } from "next/navigation";
import packageJson from "../package.json";

export default function Footer() {
  const pathname = usePathname();
  const isAdminPage = pathname === "/analyse";

  return (
    <Box
      component="footer"
      sx={{
        borderTop: "1px solid",
        borderColor: "rgba(255,255,255,.13)",
        py: 3.25,
        textAlign: "center",
      }}
    >
      <Typography
        variant="caption"
        component="p"
        sx={{ m: 0, color: "#81746e" }}
      >
        Built for people who need motivation but prefer emotional damage.
      </Typography>

      <Box
        sx={{
          mt: 1,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
          color: "text.secondary",
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 800 }}>
          Roast Me · v{packageJson.version}
        </Typography>

        <Typography variant="caption" aria-hidden>
          •
        </Typography>

        <Typography variant="caption" sx={{ fontWeight: 800 }}>
          Made by Keshav Kumar
        </Typography>

        <Typography variant="caption" aria-hidden>
          •
        </Typography>

        <Link
          href="mailto:keshavcodex@gmail.com"
          color="inherit"
          underline="hover"
          variant="caption"
        >
          keshavcodex@gmail.com
        </Link>

        <Typography variant="caption" aria-hidden>
          •
        </Typography>

        <Link
          href="https://github.com/keshavcodex"
          target="_blank"
          rel="noreferrer"
          color="inherit"
          underline="hover"
          variant="caption"
        >
          GitHub
        </Link>

        <Typography variant="caption" aria-hidden>
          •
        </Typography>

        <Link
          href="https://www.linkedin.com/in/keshavcodex/"
          target="_blank"
          rel="noreferrer"
          color="inherit"
          underline="hover"
          variant="caption"
        >
          LinkedIn
        </Link>

        <Typography variant="caption" aria-hidden>
          •
        </Typography>

        <Link
          href={isAdminPage ? "/" : "/analyse"}
          color="inherit"
          underline="hover"
          variant="caption"
        >
          {isAdminPage ? "Home" : "Admin"}
        </Link>
      </Box>
    </Box>
  );
}