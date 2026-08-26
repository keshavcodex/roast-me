import {
	GoogleGenAI,
	Modality,
	ThinkingLevel
} from '@google/genai';

import { NextResponse } from 'next/server';

import {
	ANONYMOUS_USER_COOKIE,
	resolveAnonymousUserId
} from '@/lib/anonymous-user';

import { saveRoastRecord } from '@/lib/db';

import {
	getAudioContext,
	type OutputLanguage,
	type ResponseMode
} from '@/lib/context';

import type { AudioSessionRequest } from '@/types/live';

export const runtime = 'nodejs';

const RESPONSE_MODES: ResponseMode[] = [
	'roast',
	'senti',
	'motivate',
	'comfort',
	'savage-motivation',
	'dramatic',
	'jealous',
	'heartbroken',
	'angry',
	'chaotic'
];

const OUTPUT_LANGUAGES: OutputLanguage[] = [
	'auto',
	'english',
	'hindi',
	'hinglish'
];

function isResponseMode(
	value: unknown
): value is ResponseMode {
	return (
		typeof value === 'string' &&
		RESPONSE_MODES.includes(
			value as ResponseMode
		)
	);
}

function isOutputLanguage(
	value: unknown
): value is OutputLanguage {
	return (
		typeof value === 'string' &&
		OUTPUT_LANGUAGES.includes(
			value as OutputLanguage
		)
	);
}

function isValidRequest(
	value: unknown
): value is Required<AudioSessionRequest> {
	if (
		typeof value !== 'object' ||
		value === null
	) {
		return false;
	}

	const body =
		value as AudioSessionRequest;

	return (
		typeof body.message === 'string' &&
		body.message.trim().length > 0 &&
		body.message.trim().length <= 600 &&
		Number.isInteger(body.intensity) &&
		body.intensity >= 1 &&
		body.intensity <= 5 &&
		isResponseMode(body.mode) &&
		isOutputLanguage(body.language)
	);
}

function isPersistRequest(
	value: unknown
): value is {
	kind: 'persist';
	message: string;
	response: string;
	intensity: number;
	mode: ResponseMode;
	language: OutputLanguage;
} {
	if (
		typeof value !== 'object' ||
		value === null
	) {
		return false;
	}

	const body =
		value as Record<string, unknown>;

	return (
		body.kind === 'persist' &&
		typeof body.message === 'string' &&
		body.message.trim().length > 0 &&
		body.message.trim().length <= 600 &&
		typeof body.response === 'string' &&
		body.response.trim().length > 0 &&
		typeof body.intensity === 'number' &&
		Number.isInteger(body.intensity) &&
		body.intensity >= 1 &&
		body.intensity <= 5 &&
		isResponseMode(body.mode) &&
		isOutputLanguage(body.language)
	);
}

export async function POST(
	request: Request
) {
	let body: unknown;

	try {
		body = await request.json();
	} catch {
		return NextResponse.json(
			{
				error:
					'That excuse arrived in pieces.'
			},
			{ status: 400 }
		);
	}

	/*
	 * Persist completed audio response
	 */
	if (isPersistRequest(body)) {
		const { userId } =
			resolveAnonymousUserId(
				request.headers.get('cookie')
			);

		const response =
			NextResponse.json({
				ok: true
			});

		response.cookies.set(
			ANONYMOUS_USER_COOKIE,
			userId,
			{
				httpOnly: true,
				sameSite: 'lax',
				secure:
					process.env.NODE_ENV ===
					'production',
				path: '/',
				maxAge:
					60 *
					60 *
					24 *
					365 *
					2
			}
		);

		try {
			await saveRoastRecord({
				userId,
				request: body.message,
				response:
					body.response.trim(),
				mode: body.mode
			});

		} catch (error) {
			console.warn(
				'Audio response persistence failed.',
				error
			);
		}

		return response;
	}

	/*
	 * Start Gemini audio session
	 */
	const apiKey =
		process.env.GEMINI_API_KEY;

	const model =
		process.env.GEMINI_AUDIO_MODEL;

	if (!apiKey) {
		return NextResponse.json(
			{
				error:
					'Audio response engine is not configured.'
			},
			{ status: 503 }
		);
	}

	if (!model) {
		return NextResponse.json(
			{
				error:
					'GEMINI_AUDIO_MODEL is required for audio responses.'
			},
			{ status: 503 }
		);
	}

	if (!isValidRequest(body)) {
		return NextResponse.json(
			{
				error:
					'Give me a valid message, intensity, mode, and output language.'
			},
			{ status: 400 }
		);
	}

	const mode = body.mode;

	const language = body.language;

	try {
		const client =
			new GoogleGenAI({
				apiKey,
				httpOptions: {
					apiVersion: 'v1alpha'
				}
			});

		const token =
			await client.authTokens.create({
				config: {
					uses: 1,

					expireTime:
						new Date(
							Date.now() +
								5 *
									60 *
									1000
						).toISOString(),

					newSessionExpireTime:
						new Date(
							Date.now() +
								60 *
									1000
						).toISOString(),

					liveConnectConstraints: {
						model,

						config: {
							responseModalities: [
								Modality.AUDIO
							],

							outputAudioTranscription:
								{},

							speechConfig: {
								voiceConfig: {
									prebuiltVoiceConfig: {
										voiceName:
											'Kore'
									}
								}
							},

							thinkingConfig: {
								thinkingLevel:
									ThinkingLevel.MINIMAL
							},

							systemInstruction: {
								parts: [
									{
										text:
											getAudioContext(
												mode,
												language
											)
									}
								]
							}
						}
					}
				}
			});

		if (!token.name) {
			return NextResponse.json(
				{
					error:
						'Could not prepare the audio session.'
				},
				{ status: 502 }
			);
		}

		return NextResponse.json({
			token: token.name,
			model,
			mode,
			outputLanguage:
				language
		});
	} catch {
		return NextResponse.json(
			{
				error:
					'Gemini could not start the audio session.'
			},
			{ status: 502 }
		);
	}
}