"use client";

import { useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LoadingState from "@/components/LoadingState";
import RoastInput from "@/components/RoastInput";
import RoastResult from "@/components/RoastResult";
import { roastExcuse } from "@/lib/api";
import { LiveRoastController } from "@/lib/live-roast";
import type { LiveRoastPhase } from "@/types/live";

const errorCopy = {
  configuration: "The roast server is still putting its gloves on. Try again in a bit.",
  network: "Even the roast server is tired of your excuses. Try again.",
  timeout: "Your excuse took so long, the roast went cold. Try again.",
  server: "The roast server is having a tiny emotional breakdown. Try again.",
  response: "The roast came back incomprehensible. Honestly, relatable.",
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [intensity, setIntensity] = useState(1);
  const [roast, setRoast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<LiveRoastPhase>("complete");
  const [progress, setProgress] = useState(0);
  const [audioStarted, setAudioStarted] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  const sessionRef = useRef<LiveRoastController | null>(null);
  const pendingTranscriptRef = useRef("");
  const audioStartedRef = useRef(false);
  const loadingRef = useRef(false);

  useEffect(() => () => sessionRef.current?.close(), []);

  async function handleRoast() {
    if (loadingRef.current) return;
    loadingRef.current = true;

    const trimmedMessage = message.trim();
    setError(null);
    setRoast(null);
    setProgress(0);
    setAudioStarted(false);
    setNeedsTap(false);
    setAudioUnavailable(false);
    sessionRef.current?.close();
    pendingTranscriptRef.current = "";
    audioStartedRef.current = false;

    if (!trimmedMessage) {
      setError("Give me an excuse first. I can't roast an empty personality.");
      loadingRef.current = false;
      return;
    }

    setIsLoading(true);
    let handledAudioFailure = false;
    const fallBackToText = async () => {
      if (handledAudioFailure) return;
      handledAudioFailure = true;
      sessionRef.current?.close();
      setAudioUnavailable(true);
      try {
        const response = await roastExcuse(trimmedMessage, intensity);
        setRoast(response.roast);
      } catch (caught) {
        const kind = caught instanceof Error && "kind" in caught
          ? (caught as { kind?: keyof typeof errorCopy }).kind
          : undefined;
        setError(kind ? errorCopy[kind] : errorCopy.network);
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
      }
    };

    const persistAudioRoast = async () => {
      const transcript = pendingTranscriptRef.current.trim();
      if (!transcript) return;

      try {
        await fetch("/api/v1/audio-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "persist",
            message: trimmedMessage,
            response: transcript,
            intensity,
          }),
        });
      } catch (caught) {
        console.warn("Audio transcript persistence failed.", caught);
      }
    };

    const controller = new LiveRoastController({
      onPhase: setPhase,
      onAudioStart: () => {
        audioStartedRef.current = true;
        setAudioStarted(true);
        setIsLoading(false);
        loadingRef.current = false;
        setRoast(pendingTranscriptRef.current);
      },
      onTranscript: (text) => {
        pendingTranscriptRef.current += text;
        if (audioStartedRef.current && sessionRef.current === controller) setRoast(pendingTranscriptRef.current);
      },
      onProgress: setProgress,
      onAutoplayBlocked: () => setNeedsTap(true),
      onComplete: () => {
        setIsLoading(false);
        loadingRef.current = false;
      },
      onGenerationComplete: async () => {
        await persistAudioRoast();
      },
      onError: () => { void fallBackToText(); },
    });
    sessionRef.current = controller;
    try {
      await controller.start(trimmedMessage, intensity);
    } catch { await fallBackToText(); }
  }

  function handleAgain() {
    setMessage("");
    setRoast(null);
    setError(null);
    setIsLoading(false);
    loadingRef.current = false;
    sessionRef.current?.close();
    sessionRef.current = null;
    pendingTranscriptRef.current = "";
    audioStartedRef.current = false;
    setAudioStarted(false);
    setAudioUnavailable(false);
    setNeedsTap(false);
    setProgress(0);
    document.getElementById("excuse")?.focus();
  }

  return (
    <Box component="main" sx={{ width: "min(1220px, 100%)", minHeight: "100vh", mx: "auto", px: { xs: 2.25, sm: 4 }, display: "flex", flexDirection: "column" }}>
      <Header intensity={intensity} onIntensityChange={setIntensity} />
      <Box component="section" aria-labelledby="hero-heading" sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", py: { xs: 8, md: 14 } }}>
        <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 1, color: "secondary.main", fontWeight: 900, letterSpacing: ".18em" }}><Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "primary.main", boxShadow: "0 0 15px #ff492e" }} /> ZERO MOTIVATION. MAXIMUM CONSEQUENCES.</Typography>
        <Typography id="hero-heading" variant="h1" sx={{ mt: 3, mb: 2.25, fontSize: { xs: "clamp(4rem, 19vw, 6.25rem)", md: "clamp(6.25rem, 12vw, 8.9rem)" }, textTransform: "uppercase" }}>Got an <Box component="em" sx={{ color: "primary.main", fontStyle: "normal", textShadow: "3px 4px 0 #7a190e, 0 0 40px rgba(255,73,46,.25)" }}>excuse?</Box></Typography>
        <Typography variant="body1" sx={{ maxWidth: 440, color: "text.secondary", fontSize: { xs: 17, sm: 20 }, lineHeight: 1.45 }}>Give me your excuse. I&apos;ll make you regret saying it.</Typography>

        <Container disableGutters maxWidth="sm" sx={{ mt: { xs: 5, sm: 6.5 }, textAlign: "left" }}>
          <RoastInput
            message={message}
            onMessageChange={setMessage}
            onSubmit={handleRoast}
            disabled={isLoading}
          />
          {isLoading && !audioStarted && !audioUnavailable && <LoadingState />}
          {error && <Alert severity="error" sx={{ mt: 2, borderLeft: "3px solid", borderColor: "error.main", bgcolor: "rgba(255,73,46,.1)", color: "#ffd0c9" }}>{error}</Alert>}
          {(audioStarted || audioUnavailable) && <RoastResult roast={roast ?? ""} phase={phase} progress={progress} needsTap={needsTap} audioUnavailable={audioUnavailable} onPlay={() => sessionRef.current?.play()} onPause={() => sessionRef.current?.pause()} onReplay={() => sessionRef.current?.replay()} onVolumeChange={(value) => sessionRef.current?.setVolume(value)} onAgain={handleAgain} />}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
