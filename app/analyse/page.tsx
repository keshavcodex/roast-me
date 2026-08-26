import React from 'react';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getRoastAnalytics } from '@/lib/db';
import { ADMIN_SESSION_COOKIE, getAdminSessionValue, isAdminSession } from '@/lib/admin-auth';

import { Box, Button, Divider, Typography } from '@mui/material';

import PasswordField from '@/components/PasswordField';
import AppShell from '@/components/AppShell';
import AdminDocuments from '@/components/AdminDocuments';

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
			path: '/',
			maxAge: 60 * 60 * 8
		});

		redirect('/analyse');
	}

	redirect('/analyse?error=invalid');
}

async function logoutAdmin() {
	'use server';

	const cookieStore = await cookies();

	cookieStore.set(ADMIN_SESSION_COOKIE, '', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		path: '/',
		expires: new Date(0)
	});

	revalidatePath('/analyse');

	redirect('/analyse');
}

async function page({
	searchParams
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	const cookieStore = await cookies();

	const sessionValue = getAdminSessionValue();

	const isAdmin = isAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

	if (!isAdmin) {
		const { error } = await searchParams;

		return (
			<AppShell>
				<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, minHeight: '10a0vh' }}>
					<Typography variant='h4'>Admin access</Typography>

					<Box
						component='form'
						action={authenticateAdmin}
						sx={{
							display: 'flex',
							flexDirection: 'column',
							gap: 2,
							width: 'min(360px, 100%)',
							px: 2
						}}
					>
						<PasswordField />

						<Button type='submit' variant='contained'>
							Enter analytics
						</Button>

						{error && (
							<Typography color='error'>Incorrect password.</Typography>
						)}
					</Box>
				</Box>
			</AppShell>
		);
	}

	const analytics = await getRoastAnalytics();

	return (
		<AppShell>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					width: '80%',
					mb: 1
				}}
			>
				<Typography variant='h4'>Roast analytics</Typography>

					<Box sx={{ display: 'flex', gap: 1 }}>
						<Box component='form' action={logoutAdmin}>
							<Button type='submit' variant='outlined' color='error'>
								Logout
							</Button>
						</Box>
					</Box>
			</Box>

			<Divider
				sx={{
					width: '80%',
					border: 0,
					borderTop: '1px solid #fff',
					mb: 2
				}}
			/>

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

			<Divider
				sx={{
					width: '80%',
					border: 0,
					borderTop: '1px solid #fff',
					mb: 2
				}}
			/>

			<Typography variant='h4'>Roasts per user</Typography>

			<ul>
				{analytics.roastsPerUser.map(({ userId, count }) => (
					<li key={userId}>
						{userId}: {count}
					</li>
				))}
			</ul>

			<Divider
				sx={{
					width: '80%',
					border: 0,
					borderTop: '1px solid #fff',
					mb: 2
				}}
			/>

			<Typography variant='h4'>Daily unique users</Typography>

			<ul>
				{analytics.dailyUniqueUsers.map(({ date, count }) => (
					<li key={date}>
						{date}: {count}
					</li>
				))}
			</ul>

			<AdminDocuments />
		</AppShell>
	);
}

export default page;
