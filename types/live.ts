import { OutputLanguage, ResponseMode } from '@/lib/context';

export type LiveRoastPhase = "connecting" | "roasting" | "playing" | "paused" | "complete" | "error";

export interface AudioSessionRequest {
  message: string;
  intensity: number;
  mode: ResponseMode;
  language: OutputLanguage;
}

export interface AudioSessionResponse {
  token: string;
  model: string;
}

export interface LiveRoastCallbacks {
  onPhase: (phase: LiveRoastPhase) => void;
  onAudioStart: () => void;
  onTranscript: (text: string) => void;
  onProgress: (value: number) => void;
  onAutoplayBlocked: () => void;
  onComplete: () => void;
  onError: (message: string) => void;
  onGenerationComplete?: () => void;
}
