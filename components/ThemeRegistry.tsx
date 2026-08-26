'use client';

import {
	useEffect,
	useMemo
} from 'react';

import {
	createTheme,
	ThemeProvider
} from '@mui/material/styles';

import {
	MODE_COLORS,
	type ResponseMode
} from '@/lib/context';

export default function ThemeRegistry({
	children,
	mode
}: {
	children: React.ReactNode;
	mode: ResponseMode;
}) {
	const color = MODE_COLORS[mode];

	const theme = useMemo(
		() =>
			createTheme({
				palette: {
					mode: 'dark',

					primary: {
						main: color.main,
						contrastText: '#ffffff'
					},

					secondary: {
						main: color.main
					},

					background: {
						default: color.background,
						paper: color.paper
					},

					text: {
						primary: '#fff5eb',
						secondary: '#b7aaa3'
					},

					error: {
						main: '#ff735f'
					}
				},

				typography: {
					fontFamily:
						'Arial, Helvetica, sans-serif',

					h1: {
						fontFamily:
							'Impact, "Arial Black", sans-serif',

						letterSpacing: '-0.05em',

						lineHeight: 0.85
					},

					button: {
						fontWeight: 900,
						letterSpacing: '0.08em'
					}
				},

				shape: {
					borderRadius: 3
				},

				components: {
					MuiButton: {
						styleOverrides: {
							root: {
								borderRadius: 3
							}
						}
					},

					MuiPaper: {
						styleOverrides: {
							root: {
								backgroundImage: 'none'
							}
						}
					}
				}
			}),
		[color]
	);

	useEffect(() => {
		const html = document.documentElement;
		const body = document.body;

		html.style.backgroundColor =
			color.background;

		body.style.background = `
			radial-gradient(
				ellipse 52% 42% at 50% 37%,
				${color.glow},
				transparent 72%
			),
			${color.background}
		`;

		body.style.color = '#fff5eb';

		return () => {
			html.style.backgroundColor = '';
			body.style.background = '';
			body.style.color = '';
		};
	}, [color]);

	return (
		<ThemeProvider theme={theme}>
			{children}
		</ThemeProvider>
	);
}