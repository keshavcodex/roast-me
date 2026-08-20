'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export default function RoastInput({
	message,
	onMessageChange,
	onSubmit,
	disabled
}: {
	message: string;
	onMessageChange: (message: string) => void;
	onSubmit: () => void;
	disabled: boolean;
}) {
	return (
		<Paper
			component='section'
			id='main'
			elevation={0}
			sx={{
				p: { xs: 2, sm: 2.5 },
				border: '1px solid',
				borderColor: 'hsla(0, 0%, 100%, 0.22)',
				boxShadow: '8px 8px 0 rgba(255,73,46,.22)'
			}}
		>
			<Typography
				component='label'
				htmlFor='excuse'
				variant='caption'
				sx={{
					display: 'block',
					mb: 1,
					color: 'secondary.main',
					fontWeight: 900,
					letterSpacing: '.15em'
				}}
			>
				YOUR EXCUSE
			</Typography>
			<TextField
				id='excuse'
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
				onChange={(event) => onMessageChange(event.target.value)}
				onKeyDown={(event) => {
					if (event.key !== 'Enter') return;

					// Shift + Enter → new line
					if (event.shiftKey) {
						return;
					}

					// Enter / Cmd + Enter / Ctrl + Enter → submit
					event.preventDefault();
					onSubmit();
				}}
				placeholder="e.g. I don't want to go to the gym today..."
				sx={{
					'& .MuiOutlinedInput-root': {
						p: 1,
						fontSize: { xs: 19, sm: 21 },
						bgcolor: 'transparent',
						'& fieldset': {
							border: 0
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
				sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, mb: 2 }}
			>
				<Typography
					variant='caption'
					sx={{
						color: '#897b74',
						fontWeight: 800,
						letterSpacing: '.06em',
						fontSize: 10
					}}
				>
					⌘ + ENTER TO UNLEASH
				</Typography>
				<Typography
					variant='caption'
					sx={{ color: '#897b74', fontWeight: 800 }}
				>
					{message.length}/600
				</Typography>
			</Box>
			<Button
				fullWidth
				variant='contained'
				size='large'
				disabled={disabled}
				onClick={onSubmit}
				sx={{
					minHeight: 58,
					fontSize: 16,
					boxShadow: '4px 4px 0 #8f1e11',
					'&:hover': {
						boxShadow: '6px 6px 0 #8f1e11',
						transform: 'translate(-2px,-2px)'
					}
				}}
			>
				{disabled ? 'Preparing Damage...' : 'Roast Me 🔥'}
			</Button>
		</Paper>
	);
}
