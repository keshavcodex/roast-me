import { NextResponse } from 'next/server';

import { getRoastDocuments } from '@/lib/db';
import { ADMIN_SESSION_COOKIE, isAdminSession } from '@/lib/admin-auth';

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 50;

export async function GET(request: Request) {
	const cookieHeader = request.headers.get('cookie') ?? '';
	const sessionCookie = cookieHeader
		.split(';')
		.map((cookie) => cookie.trim().split('='))
		.find(([name]) => name === ADMIN_SESSION_COOKIE)?.[1];

	if (!isAdminSession(sessionCookie)) {
		return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
	}

	const searchParams = new URL(request.url).searchParams;
	const parsedSkip = Number(searchParams.get('skip') ?? 0);
	const parsedLimit = Number(searchParams.get('limit') ?? DEFAULT_LIMIT);
	const skip = Number.isInteger(parsedSkip) && parsedSkip >= 0 ? parsedSkip : 0;
	const limit = Number.isInteger(parsedLimit) && parsedLimit > 0
		? Math.min(parsedLimit, MAX_LIMIT)
		: DEFAULT_LIMIT;

	try {
		const documents = await getRoastDocuments(skip, limit + 1);

		return NextResponse.json({
			documents: documents.slice(0, limit),
			hasMore: documents.length > limit,
		});
	} catch {
		return NextResponse.json({ error: 'Documents could not be loaded.' }, { status: 500 });
	}
}