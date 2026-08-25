'use client';

import {
	GoogleGenAI,
	Modality,
	type LiveServerMessage,
	type Session
} from '@google/genai';
import type {
	AudioSessionResponse,
	LiveRoastCallbacks,
	LiveRoastPhase
} from '@/types/live';

const SAMPLE_RATE = 24_000;

export class LiveRoastError extends Error {}

function decodePcm(base64: string): Float32Array<ArrayBuffer> {
	const binary = window.atob(base64);
	const bytes = new Uint8Array(binary.length);

	for (let index = 0; index < binary.length; index += 1) {
		bytes[index] = binary.charCodeAt(index);
	}

	const pcm = new Int16Array(bytes.buffer);
	const output = new Float32Array(new ArrayBuffer(pcm.length * 4));

	for (let index = 0; index < pcm.length; index += 1) {
		output[index] = pcm[index] / 0x8000;
	}

	return output;
}

export class LiveRoastController {
	private readonly audioContext: AudioContext;
	private readonly gain: GainNode;
	private readonly chunks: Float32Array[] = [];
	private readonly sources = new Set<AudioBufferSourceNode>();
	private session: Session | null = null;
	private nextStartTime = 0;
	private duration = 0;
	private playStartTime = 0;
	private phase: LiveRoastPhase = 'connecting';
	private hasAudio = false;
	private generationComplete = false;
	private progressFrame: number | null = null;

	constructor(private readonly callbacks: LiveRoastCallbacks) {
		this.audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
		this.gain = this.audioContext.createGain();
		this.gain.connect(this.audioContext.destination);
	}

	async start(message: string, intensity: number): Promise<void> {
		// This happens synchronously from the Roast button gesture, which gives autoplay its best chance.
		try {
			await this.audioContext.resume();
		} catch {
			this.callbacks.onAutoplayBlocked();
		}

		const response = await fetch('/api/v1/audio-session', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ message, intensity })
		});
		if (!response.ok) throw new LiveRoastError('Audio roast setup failed.');

		const payload: unknown = await response.json();
		if (!this.isSessionResponse(payload))
			throw new LiveRoastError(
				'Audio roast setup returned an invalid response.'
			);

		const ai = new GoogleGenAI({
			apiKey: payload.token,
			httpOptions: { apiVersion: 'v1alpha' }
		});
		this.session = await ai.live.connect({
			model: payload.model,
			config: {
				responseModalities: [Modality.AUDIO],
				outputAudioTranscription: {}
			},
			callbacks: {
				onmessage: (event) => this.handleMessage(event),
				onerror: () => this.callbacks.onError('Audio connection failed.'),
				onclose: () => {
					if (!this.generationComplete && !this.hasAudio)
						this.callbacks.onError('Audio connection ended early.');
				}
			}
		});

		this.setPhase('roasting');
		this.session.sendRealtimeInput({
			text: `Roast intensity: ${intensity}/5. User's excuse: "${message}". Respond now.`
		});
	}

	pause(): void {
		if (this.audioContext.state === 'running') {
			void this.audioContext.suspend();
			this.setPhase('paused');
		}
	}

	play(): void {
		void this.audioContext.resume().then(() => {
			if (this.audioContext.state === 'running')
				this.setPhase(this.generationComplete ? 'playing' : 'roasting');
			else this.callbacks.onAutoplayBlocked();
		});
	}

	replay(): void {
		if (!this.chunks.length) return;
		this.stopSources();
		this.nextStartTime = this.audioContext.currentTime + 0.05;
		this.duration = 0;
		this.playStartTime = this.nextStartTime;
		this.chunks.forEach((chunk) => this.queueChunk(chunk, false));
		this.setPhase('playing');
		void this.audioContext.resume();
	}

	setVolume(value: number): void {
		this.gain.gain.setTargetAtTime(value, this.audioContext.currentTime, 0.02);
	}

	close(): void {
		this.session?.close();
		this.stopSources();
		if (this.progressFrame !== null)
			window.cancelAnimationFrame(this.progressFrame);
		void this.audioContext.close();
	}

	private handleMessage(event: LiveServerMessage): void {
		const content = event.serverContent;
		if (!content) return;

		content.modelTurn?.parts?.forEach((part) => {
			if (part.inlineData?.data)
				this.queueChunk(decodePcm(part.inlineData.data), true);
		});
		if (content.outputTranscription?.text)
			this.callbacks.onTranscript(content.outputTranscription.text);
		if ((content.generationComplete || content.turnComplete) && !this.generationComplete) {
			this.generationComplete = true;
			this.callbacks.onGenerationComplete?.();
			this.finishWhenPlaybackEnds();
		}
	}

private queueChunk(
  chunk: Float32Array<ArrayBufferLike>,
  shouldStore: boolean
): void {
  if (shouldStore) this.chunks.push(chunk);

  if (!this.hasAudio) {
    this.hasAudio = true;
    this.playStartTime = this.audioContext.currentTime + 0.05;
    this.nextStartTime = this.playStartTime;
    this.callbacks.onAudioStart();

    if (this.audioContext.state !== "running") {
      this.callbacks.onAutoplayBlocked();
    }
  }

  const buffer = this.audioContext.createBuffer(
    1,
    chunk.length,
    SAMPLE_RATE
  );

  // Create a Float32Array backed by a guaranteed ArrayBuffer.
  const audioData = new Float32Array(new ArrayBuffer(chunk.length * 4));
  audioData.set(chunk);

  buffer.copyToChannel(audioData, 0);

  const source = this.audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(this.gain);

  source.start(this.nextStartTime);

  source.onended = () => this.sources.delete(source);
  this.sources.add(source);

  this.nextStartTime += buffer.duration;
  this.duration += buffer.duration;

  this.setPhase("playing");
  this.trackProgress();
}

	private finishWhenPlaybackEnds(): void {
		if (!this.hasAudio) {
			this.callbacks.onError('Gemini returned no playable audio.');
			return;
		}
		const waitMs = Math.max(
			0,
			(this.nextStartTime - this.audioContext.currentTime) * 1000
		);
		window.setTimeout(() => {
			this.callbacks.onProgress(1);
			this.setPhase('complete');
			this.callbacks.onComplete();
			this.session?.close();
		}, waitMs + 80);
	}

	private trackProgress = (): void => {
		if (!this.duration || this.phase === 'complete') return;
		const elapsed = Math.max(
			0,
			this.audioContext.currentTime - this.playStartTime
		);
		this.callbacks.onProgress(Math.min(0.99, elapsed / this.duration));
		this.progressFrame = window.requestAnimationFrame(this.trackProgress);
	};

	private stopSources(): void {
		this.sources.forEach((source) => source.stop());
		this.sources.clear();
	}

	private setPhase(phase: LiveRoastPhase): void {
		this.phase = phase;
		this.callbacks.onPhase(phase);
	}

	private isSessionResponse(value: unknown): value is AudioSessionResponse {
		return (
			typeof value === 'object' &&
			value !== null &&
			typeof (value as AudioSessionResponse).token === 'string' &&
			typeof (value as AudioSessionResponse).model === 'string'
		);
	}
}
