import { NextResponse } from 'next/server';

import {
	ANONYMOUS_USER_COOKIE,
	resolveAnonymousUserId
} from '@/lib/anonymous-user';

import { saveRoastRecord } from '@/lib/db';

import {
	getTextContext,
	type OutputLanguage,
	type ResponseMode
} from '@/lib/context';

export const runtime = 'nodejs';

const GEMINI_API_URL =
	'https://generativelanguage.googleapis.com/v1beta/models';

const GEMINI_TIMEOUT_MS = 15_000;

interface RoastBody {
	message?: unknown;
	intensity?: unknown;
	mode?: unknown;
	outputLanguage?: unknown;
}

interface GeminiResponse {
	candidates?: Array<{
		content?: {
			parts?: Array<{
				text?: string;
			}>;
		};
		finishReason?: string;
	}>;
}

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

function getRoastText(
	payload: unknown
): string | null {
	if (
		typeof payload !== 'object' ||
		payload === null
	) {
		return null;
	}

	const candidate =
		(payload as GeminiResponse)
			.candidates?.[0];

	if (
		candidate?.finishReason ===
		'MAX_TOKENS'
	) {
		return null;
	}

	const text =
		candidate?.content?.parts
			?.map(
				(part) =>
					part.text ?? ''
			)
			.join('')
			.trim();

	return text || null;
}

function prompt(
	message: string,
	intensity: number,
	mode: ResponseMode,
	language: OutputLanguage = 'auto'
): string {
	return `${getTextContext(
		mode,
		language
	)}

Intensity: ${intensity}/5.

User's message:

"${message}"

Respond according to the selected mode.

Return only the response.`;
}

export async function POST(
	request: Request
) {
	const apiKey =
		process.env.GEMINI_API_KEY;

	if (!apiKey) {
		return NextResponse.json(
			{
				error:
					'Response engine is not configured.'
			},
			{ status: 503 }
		);
	}

	let body: RoastBody;

	try {
		body =
			await request.json() as RoastBody;
	} catch {
		return NextResponse.json(
			{
				error:
					'That excuse arrived in pieces.'
			},
			{ status: 400 }
		);
	}

	const message =
		typeof body.message === 'string'
			? body.message.trim()
			: '';

	const intensity =
		typeof body.intensity === 'number' &&
		Number.isInteger(body.intensity)
			? body.intensity
			: 1;

	const mode: ResponseMode =
		isResponseMode(body.mode)
			? body.mode
			: 'roast';

	const language: OutputLanguage =
		isOutputLanguage(
			body.outputLanguage
		)
			? body.outputLanguage
			: 'auto';

	if (!message) {
		return NextResponse.json(
			{
				error:
					'A message is required.'
			},
			{ status: 400 }
		);
	}

	if (message.length > 600) {
		return NextResponse.json(
			{
				error:
					'Keep the message under 600 characters.'
			},
			{ status: 400 }
		);
	}

	if (
		intensity < 1 ||
		intensity > 5
	) {
		return NextResponse.json(
			{
				error:
					'Invalid intensity.'
			},
			{ status: 400 }
		);
	}

	const controller =
		new AbortController();

	const timeout = setTimeout(
		() => controller.abort(),
		GEMINI_TIMEOUT_MS
	);

	const model =
		process.env.GEMINI_MODEL ||
		'gemini-3.5-flash';

	const { userId } =
		resolveAnonymousUserId(
			request.headers.get('cookie')
		);

	try {
		const geminiResponse =
			await fetch(
				`${GEMINI_API_URL}/${encodeURIComponent(
					model
				)}:generateContent`,
				{
					method: 'POST',

					headers: {
						'Content-Type':
							'application/json',

						'x-goog-api-key':
							apiKey
					},

					signal: controller.signal,

					body: JSON.stringify({
						contents: [
							{
								role: 'user',

								parts: [
									{
										text: prompt(
											message,
											intensity,
											mode,
											language
										)
									}
								]
							}
						],

						generationConfig: {
							maxOutputTokens: 130,

							thinkingConfig: {
								thinkingLevel:
									'MINIMAL'
							}
						}
					})
				}
			);

		if (!geminiResponse.ok) {
			return NextResponse.json(
				{
					error:
						'The response engine is unavailable.'
				},
				{ status: 502 }
			);
		}

		const data: unknown =
			await geminiResponse.json();

		const roast =
			getRoastText(data);

		if (!roast) {
			return NextResponse.json(
				{
					error:
						'The response engine drew a blank.'
				},
				{ status: 502 }
			);
		}

		const response =
			NextResponse.json({
				roast,
				intensity,
				mode,
				outputLanguage: language
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
				request: message,
				response: roast,
				mode
			});

			console.log(
				'Response persisted successfully.',
				{
					mode,
					outputLanguage: language
				}
			);
		} catch (error) {
			console.warn(
				'Response persistence failed.',
				error
			);
		}

		return response;
	} catch {
		return NextResponse.json(
			{
				error:
					'The response engine timed out.'
			},
			{ status: 504 }
		);
	} finally {
		clearTimeout(timeout);
	}
}