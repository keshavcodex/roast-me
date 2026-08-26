import React from 'react';
import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getRoastAnalytics } from '@/lib/db';
import { Box, Button, Divider, Typography } from '@mui/material';
import PasswordField from '@/components/PasswordField';

const ADMIN_SESSION_COOKIE = 'roast-me-admin';

function getAdminSessionValue() {
	const password = process.env.ADMIN_PASSWORD;
	return password ? createHash('sha256').update(password).digest('hex') : null;
}

async function authenticateAdmin(formData: FormData) {
	'use server';

	const password = formData.get('password');
	  const sessionValue = getAdminSessionValue();

	if (sessionValue && password === process.env.ADMIN_PASSWORD) {
		const cookieStore = await cookies();
		cookieStore.set(ADMIN_SESSION_COOKIE, sessionValue, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			path: '/analyse',
			maxAge: 60 * 60 * 8
		});
	}

	redirect('/analyse?error=invalid');
}

async function page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
	const cookieStore = await cookies();
	const sessionValue = getAdminSessionValue();
	const isAdmin = sessionValue && cookieStore.get(ADMIN_SESSION_COOKIE)?.value === sessionValue;

	if (!isAdmin) {
		const { error } = await searchParams;
		return (
			<Box component='main' sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 2 }}>
				<Typography variant='h4'>Admin access</Typography>
				<Box component='form' action={authenticateAdmin} sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 'min(360px, 100%)', px: 2 }}>
					<PasswordField />
					<Button type='submit' variant='contained'>Enter analytics</Button>
					{error && <Typography color='error'>Incorrect password.</Typography>}
				</Box>
			</Box>
		);
	}

	const analytics = await getRoastAnalytics();

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				minHeight: '50vh'
			}}
		>
			<Typography variant='h4'>Roast analytics</Typography>
			<Divider sx={{ width: '80%', border: 0, borderTop: '1px solid #fff', mb: 2 }} />
			<Typography variant='h5' sx={{ fontStyle: 'italic' }}>
				Total roasts: {analytics.totalRoasts}
			</Typography>
			<Typography variant='h5' sx={{ fontStyle: 'italic' }}>
				Unique users: {analytics.uniqueUsers}
			</Typography>
			<Typography variant='h5'>
				Roasts today: {analytics.roastsGeneratedToday}
			</Typography>
			<Typography variant='h5'>
				Roasts in the last 7 days: {analytics.roastsGeneratedLast7Days}
			</Typography>
			<Divider sx={{ width: '80%', border: 0, borderTop: '1px solid #fff', mb: 2 }} />
			<Typography variant='h4'>Roasts per user</Typography>
			<ul>
				{analytics.roastsPerUser.map(({ userId, count }) => (
					<li key={userId}>
						{userId}: {count}
					</li>
				))}
			</ul>
			<Divider sx={{ width: '80%', border: 0, borderTop: '1px solid #fff', mb: 2 }} />
			<Typography variant='h4'>Daily unique users</Typography>
			<ul>
				{analytics.dailyUniqueUsers.map(({ date, count }) => (
					<li key={date}>
						{date}: {count}
					</li>
				))}
			</ul>
		</Box>
	);
}

export default page;
