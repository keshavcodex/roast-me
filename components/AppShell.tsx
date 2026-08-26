import { Box } from '@mui/material';
import React from 'react';

import Footer from './Footer';
import ThemeRegistry from './ThemeRegistry';

import type { ResponseMode } from '@/lib/context';

function AppShell({
	children,
	mode
}: {
	children: React.ReactNode;
	mode: ResponseMode;
}) {
	return (
		<ThemeRegistry mode={mode}>
			<Box
				component="main"
				sx={{
					width: 'min(1220px, 100%)',
					minHeight: '100vh',
					mx: 'auto',
					px: { xs: 2.25, sm: 4 },

					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',

					color: 'text.primary'
				}}
			>
				<Box>{children}</Box>

				<Footer />
			</Box>
		</ThemeRegistry>
	);
}

export default AppShell;