import React from 'react';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getRoastAnalytics } from '@/lib/db';

import {
    ADMIN_SESSION_COOKIE,
    getAdminSessionValue,
    isAdminSession
} from '@/lib/admin-auth';

import {
    Box,
    Button,
    Divider,
    Typography
} from '@mui/material';

import PasswordField from '@/components/PasswordField';
import AppShell from '@/components/AppShell';
import AdminDocuments from '@/components/AdminDocuments';

async function authenticateAdmin(formData: FormData) {
    'use server';

    const password = formData.get('password');
    const sessionValue = getAdminSessionValue();

    if (
        sessionValue &&
        password === process.env.ADMIN_PASSWORD
    ) {
        const cookieStore = await cookies();

        cookieStore.set(
            ADMIN_SESSION_COOKIE,
            sessionValue,
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 8
            }
        );

        redirect('/analyse');
    }

    redirect('/analyse?error=invalid');
}

async function logoutAdmin() {
    'use server';

    const cookieStore = await cookies();

    cookieStore.set(
        ADMIN_SESSION_COOKIE,
        '',
        {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            expires: new Date(0)
        }
    );

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

    const isAdmin = isAdminSession(
        cookieStore.get(
            ADMIN_SESSION_COOKIE
        )?.value
    );

    if (!isAdmin) {
        const { error } = await searchParams;

        return (
            <AppShell mode="jealous"> 
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: 500,
                        mx: 'auto',
                        py: { xs: 8, md: 14 },
                        minHeight: '70vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            mb: 1,
                            textAlign: 'center'
                        }}
                    >
                        Admin access
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            mb: 4,
                            textAlign: 'center'
                        }}
                    >
                        Enter the admin password to view analytics.
                    </Typography>

                    <Box
                        component="form"
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

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                        >
                            Enter analytics
                        </Button>

                        {error && (
                            <Typography
                                color="error"
                                sx={{
                                    textAlign: 'center'
                                }}
                            >
                                Incorrect password.
                            </Typography>
                        )}
                    </Box>
                </Box>
            </AppShell>
        );
    }

    const analytics = await getRoastAnalytics();

    return (
        <AppShell mode="senti">
            <Box
                sx={{
                    width: '100%',
                    maxWidth: 1100,
                    mx: 'auto',
                    pb: 8,
					pt: 2
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: {
                            xs: 'flex-start',
                            sm: 'center'
                        },
                        justifyContent: 'space-between',
                        flexDirection: {
                            xs: 'column',
                            sm: 'row'
                        },
                        gap: 2,
                        mb: 2
                    }}
                >
                    <Box>
                        <Typography variant="h4">
                            Response analytics
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                        >
                            Performance across all response modes.
                        </Typography>
                    </Box>

                    <Box
                        component="form"
                        action={logoutAdmin}
                    >
                        <Button
                            type="submit"
                            variant="outlined"
                            color="error"
                        >
                            Logout
                        </Button>
                    </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Summary */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(4, 1fr)'
                        },
                        gap: 2
                    }}
                >
                    <Box
                        sx={{
                            p: 2.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2
                        }}
                    >
                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            TOTAL RESPONSES
                        </Typography>

                        <Typography
                            variant="h4"
                            sx={{ mt: 0.5 }}
                        >
                            {analytics.totalRoasts}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            p: 2.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2
                        }}
                    >
                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            UNIQUE USERS
                        </Typography>

                        <Typography
                            variant="h4"
                            sx={{ mt: 0.5 }}
                        >
                            {analytics.uniqueUsers}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            p: 2.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2
                        }}
                    >
                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            TODAY
                        </Typography>

                        <Typography
                            variant="h4"
                            sx={{ mt: 0.5 }}
                        >
                            {analytics.roastsGeneratedToday}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            p: 2.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2
                        }}
                    >
                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            LAST 7 DAYS
                        </Typography>

                        <Typography
                            variant="h4"
                            sx={{ mt: 0.5 }}
                        >
                            {analytics.roastsGeneratedLast7Days}
                        </Typography>
                    </Box>
                </Box>

                {/* Roasts per user */}
                <Box sx={{ mt: 5 }}>
                    <Typography variant="h5">
                        Responses per user
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        Number of responses generated by each anonymous user.
                    </Typography>

                    {analytics.roastsPerUser.length === 0 ? (
                        <Typography color="text.secondary">
                            No users yet.
                        </Typography>
                    ) : (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1
                            }}
                        >
                            {analytics.roastsPerUser.map(
                                ({ userId, count }) => (
                                    <Box
                                        key={userId}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: 2,
                                            px: 2,
                                            py: 1.5,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 1.5
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontFamily:
                                                    'monospace',
                                                overflow: 'hidden',
                                                textOverflow:
                                                    'ellipsis'
                                            }}
                                        >
                                            {userId}
                                        </Typography>

                                        <Typography
                                            fontWeight={800}
                                            color="primary.main"
                                        >
                                            {count}
                                        </Typography>
                                    </Box>
                                )
                            )}
                        </Box>
                    )}
                </Box>

                {/* Daily unique users */}
                <Box sx={{ mt: 5 }}>
                    <Typography variant="h5">
                        Daily unique users
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        Unique anonymous users who generated at least one response.
                    </Typography>

                    {analytics.dailyUniqueUsers.length === 0 ? (
                        <Typography color="text.secondary">
                            No data yet.
                        </Typography>
                    ) : (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1
                            }}
                        >
                            {analytics.dailyUniqueUsers.map(
                                ({ date, count }) => (
                                    <Box
                                        key={date}
                                        sx={{
                                            display: 'flex',
                                            justifyContent:
                                                'space-between',
                                            alignItems:
                                                'center',
                                            px: 2,
                                            py: 1.5,
                                            border: '1px solid',
                                            borderColor:
                                                'divider',
                                            borderRadius: 1.5
                                        }}
                                    >
                                        <Typography>
                                            {new Date(
                                                `${date}T00:00:00`
                                            ).toLocaleDateString(
                                                'en-GB'
                                            )}
                                        </Typography>

                                        <Typography
                                            fontWeight={800}
                                            color="primary.main"
                                        >
                                            {count}
                                        </Typography>
                                    </Box>
                                )
                            )}
                        </Box>
                    )}
                </Box>

                <AdminDocuments />
            </Box>
        </AppShell>
    );
}

export default page;