import { createHash } from 'node:crypto';

export const ADMIN_SESSION_COOKIE = 'roast-me-admin';

export function getAdminSessionValue() {
	const password = process.env.ADMIN_PASSWORD;

	return password ? createHash('sha256').update(password).digest('hex') : null;
}

export function isAdminSession(value: string | undefined) {
	const sessionValue = getAdminSessionValue();

	return Boolean(sessionValue && value === sessionValue);
}