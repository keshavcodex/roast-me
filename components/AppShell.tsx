import { Box } from '@mui/material';
import React from 'react';
import Footer from './Footer';

function AppShell({ children }: { children: React.ReactNode }) {
	return (
		<Box
			component='main'
			sx={{
				width: 'min(1220px, 100%)',
				minHeight: '100vh',
				mx: 'auto',
				px: { xs: 2.25, sm: 4 },
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between'
			}}
		>
			<Box>{children}</Box>
			<Footer />
		</Box>
	);
}

export default AppShell;
