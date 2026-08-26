import type { OutputLanguage, ResponseMode } from '@/lib/context';

export interface RoastRequest {
	message: string;
	intensity: number;
	mode: ResponseMode;
  language: OutputLanguage;
}

export interface RoastResponse {
	roast: string;
	intensity: number;
	mode: ResponseMode;
}

export type RoastApiErrorKind =
	| 'configuration'
	| 'network'
	| 'timeout'
	| 'server'
	| 'response';

export class RoastApiError extends Error {
	constructor(
		message: string,
		public readonly kind: RoastApiErrorKind
	) {
		super(message);
		this.name = 'RoastApiError';
	}
}