'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import {
	MODE_COLORS,
	MODE_LABELS,
	RESPONSE_MODES,
	type ResponseMode
} from '@/lib/context';

export default function RoastInput({
	message,
	mode,
	onModeChange,
	onMessageChange,
	onSubmit,
	disabled
}: {
	message: string;
	mode: ResponseMode;
	onModeChange: (mode: ResponseMode) => void;
	onMessageChange: (message: string) => void;
	onSubmit: () => void;
	disabled: boolean;
}) {
	const color = MODE_COLORS[mode];

	return (
		<Paper
			component="section"
			id="main"
			elevation={0}
			sx={{
				p: { xs: 2, sm: 2.5 },
				border: '1px solid',
				borderColor: color.main,
				boxShadow: `8px 8px 0 ${color.glow}`,
				transition:
					'border-color .25s ease, box-shadow .25s ease'
			}}
		>
			<Typography
				variant="caption"
				sx={{
					display: 'block',
					mb: 1,
					color: color.main,
					fontWeight: 900,
					letterSpacing: '.15em',
					transition: 'color .25s ease'
				}}
			>
				CHOOSE YOUR VIBE
			</Typography>

			<Box
				sx={{
					display: 'flex',
					gap: 1,
					flexWrap: 'wrap',
					mb: 2
				}}
			>
				{RESPONSE_MODES.map((item) => {
					const itemColor = MODE_COLORS[item];
					const selected = mode === item;

					return (
						<Button
							key={item}
							size="small"
							variant={
								selected
									? 'contained'
									: 'outlined'
							}
							disabled={disabled}
							onClick={() =>
								onModeChange(item)
							}
							sx={{
								minWidth: 0,
								textTransform: 'none',
								fontWeight: 800,

								color: selected
									? '#fff'
									: itemColor.main,

								borderColor:
									itemColor.main,

								bgcolor: selected
									? itemColor.main
									: 'transparent',

								'&:hover': {
									borderColor:
										itemColor.main,
									bgcolor: selected
										? itemColor.main
										: itemColor.glow
								},

								transition:
									'background-color .2s ease, border-color .2s ease, color .2s ease'
							}}
						>
							{MODE_LABELS[item]}
						</Button>
					);
				})}
			</Box>

			<Typography
				component="label"
				htmlFor="excuse"
				variant="caption"
				sx={{
					display: 'block',
					mb: 1,
					color: color.main,
					fontWeight: 900,
					letterSpacing: '.15em',
					transition: 'color .25s ease'
				}}
			>
				YOUR MESSAGE
			</Typography>

			<TextField
				id="excuse"
				multiline
				minRows={4}
				fullWidth
				value={message}
				disabled={disabled}
				slotProps={{
					htmlInput: {
						maxLength: 600
					}
				}}
				onChange={(event) =>
					onMessageChange(event.target.value)
				}
				onKeyDown={(event) => {
					if (event.key !== 'Enter') {
						return;
					}

					if (event.shiftKey) {
						return;
					}

					event.preventDefault();
					onSubmit();
				}}
				placeholder="Tell me what's on your mind..."
				sx={{
					'& .MuiOutlinedInput-root': {
						p: 1,
						fontSize: {
							xs: 19,
							sm: 21
						},
						bgcolor: 'transparent',

						'& fieldset': {
							border: 0
						},

						'&.Mui-focused textarea': {
							caretColor: color.main
						}
					},

					'& textarea': {
						lineHeight: 1.35
					},

					'& textarea::placeholder': {
						color: '#746762',
						opacity: 1
					}
				}}
			/>

			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					mt: 1,
					mb: 2
				}}
			>
				<Typography
					variant="caption"
					sx={{
						color: '#897b74',
						fontWeight: 800,
						letterSpacing: '.06em',
						fontSize: 10
					}}
				>
					⌘ + ENTER TO GO
				</Typography>

				<Typography
					variant="caption"
					sx={{
						color: '#897b74',
						fontWeight: 800
					}}
				>
					{message.length}/600
				</Typography>
			</Box>

			<Button
				fullWidth
				variant="contained"
				size="large"
				disabled={disabled}
				onClick={onSubmit}
				sx={{
					minHeight: 58,
					fontSize: 16,
					bgcolor: color.main,
					boxShadow: `4px 4px 0 ${color.dark}`,

					'&:hover': {
						bgcolor: color.main,
						boxShadow: `6px 6px 0 ${color.dark}`,
						transform: 'translate(-2px,-2px)'
					},

					'&.Mui-disabled': {
						bgcolor: color.dark,
						color: 'rgba(255,255,255,.6)'
					},

					transition:
						'background-color .25s ease, box-shadow .25s ease, transform .15s ease'
				}}
			>
				{disabled
					? 'GENERATING...'
					: `${MODE_LABELS[mode]} →`}
			</Button>
		</Paper>
	);
}