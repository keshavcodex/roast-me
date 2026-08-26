import {
	RoastApiError,
	type RoastRequest,
	type RoastResponse
} from '@/types/roast';

import type { OutputLanguage, ResponseMode } from '@/lib/context';

const REQUEST_TIMEOUT_MS = 12_000;

function isRoastResponse(
	value: unknown
): value is RoastResponse {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const candidate = value as Record<string, unknown>;

	return (
		typeof candidate.roast === 'string' &&
		typeof candidate.intensity === 'number' &&
		typeof candidate.mode === 'string' &&
		typeof candidate.outputLanguage === 'string'
	);
}

export async function roastExcuse(
	message: string,
	intensity: number,
	mode: ResponseMode,
	language: OutputLanguage
): Promise<RoastResponse> {
	const baseUrl =
		process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');

	const controller = new AbortController();

	const timer = window.setTimeout(
		() => controller.abort(),
		REQUEST_TIMEOUT_MS
	);

	const payload: RoastRequest = {
		message,
		intensity,
		mode,
    language
	};

	try {
		const response = await fetch(
			`${baseUrl ?? ''}/api/v1/roast`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload),
				signal: controller.signal
			}
		);

		if (!response.ok) {
			throw new RoastApiError(
				'The response server declined to participate.',
				'server'
			);
		}

		const data: unknown = await response.json();

		if (!isRoastResponse(data)) {
			throw new RoastApiError(
				'The response arrived scrambled.',
				'response'
			);
		}

		return data;
	} catch (error) {
		if (error instanceof RoastApiError) {
			throw error;
		}

		if (
			error instanceof DOMException &&
			error.name === 'AbortError'
		) {
			throw new RoastApiError(
				'The response took too long to land.',
				'timeout'
			);
		}

		throw new RoastApiError(
			'Could not reach the response server.',
			'network'
		);
	} finally {
		window.clearTimeout(timer);
	}
}