'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';

import {
	MODE_LABELS,
	MODE_COLORS,
	type ResponseMode
} from '@/lib/context';

export default function Header({
	mode,
	intensity,
	onIntensityChange
}: {
	mode: ResponseMode;
	intensity: number;
	onIntensityChange: (value: number) => void;
}) {
	const color = MODE_COLORS[mode];

	return (
		<Box
			component="header"
			sx={{
				width: '100%',
				pt: { xs: 2.5, sm: 3 },
				pb: 2,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				gap: 2
			}}
		>
			{/* Brand */}
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					gap: 1.25,
					minWidth: 0
				}}
			>
				<Box
					sx={{
						width: 34,
						height: 34,
						flexShrink: 0,
						display: 'grid',
						placeItems: 'center',
						border: '2px solid',
						borderColor: color.main,
						borderRadius: '8px',
						color: color.main,
						fontWeight: 1000,
						fontSize: 15,
						transform: 'rotate(-4deg)',
						boxShadow: `3px 3px 0 ${color.main}`
					}}
				>
					R
				</Box>

				<Box sx={{ minWidth: 0 }}>
					<Typography
						sx={{
							fontFamily:
								'Impact, "Arial Black", sans-serif',
							fontSize: { xs: 20, sm: 23 },
							lineHeight: 0.9,
							letterSpacing: '-0.03em'
						}}
					>
						ROASTBRO
					</Typography>

					<Typography
						variant="caption"
						sx={{
							display: 'block',
							mt: 0.35,
							color: 'text.secondary',
							fontSize: 9,
							fontWeight: 900,
							letterSpacing: '.14em',
							whiteSpace: 'nowrap'
						}}
					>
						SAY IT. FEEL IT.
					</Typography>
				</Box>
			</Box>

			{/* Current mode + intensity */}
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					gap: { xs: 1, sm: 2 }
				}}
			>
				<Chip
					label={MODE_LABELS[mode]}
					size="small"
					sx={{
						height: 30,
						borderRadius: 1.5,
						fontWeight: 1000,
						fontSize: 10,
						letterSpacing: '.08em',
						color: color.main,
						border: '1px solid',
						borderColor: color.main,
						bgcolor: 'transparent',
						'& .MuiChip-label': {
							px: 1.25
						}
					}}
				/>

				<Box
					sx={{
						display: {
							xs: 'none',
							sm: 'block'
						},
						width: 110
					}}
				>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							mb: 0.2
						}}
					>
						<Typography
							variant="caption"
							sx={{
								fontSize: 8,
								fontWeight: 900,
								letterSpacing: '.12em',
								color: 'text.secondary'
							}}
						>
							INTENSITY
						</Typography>

						<Typography
							variant="caption"
							sx={{
								fontSize: 8,
								fontWeight: 900,
								color: color.main
							}}
						>
							{intensity}/5
						</Typography>
					</Box>

					<Slider
						value={intensity}
						min={1}
						max={5}
						step={1}
						onChange={(_, value) => {
							if (typeof value === 'number') {
								onIntensityChange(value);
							}
						}}
						sx={{
							color: color.main,
							height: 3,
							py: 0,

							'& .MuiSlider-thumb': {
								width: 10,
								height: 10,
								boxShadow: `0 0 10px ${color.main}`
							},

							'& .MuiSlider-track': {
								border: 0
							}
						}}
					/>
				</Box>
			</Box>
		</Box>
	);
}