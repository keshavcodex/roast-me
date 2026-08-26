'use client';

import { useState } from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function PasswordField() {
	const [isVisible, setIsVisible] = useState(false);

	return (
		<TextField
			name='password'
			type={isVisible ? 'text' : 'password'}
			label='Password'
			required
			autoComplete='current-password'
			slotProps={{
				input: {
					endAdornment: (
						<InputAdornment position='end'>
							<IconButton
								aria-label={isVisible ? 'Hide password' : 'Show password'}
								edge='end'
								onClick={() => setIsVisible((visible) => !visible)}
								onMouseDown={(event) => event.preventDefault()}
							>
								{isVisible ? <VisibilityOff /> : <Visibility />}
							</IconButton>
						</InputAdornment>
					)
				}
			}}
		/>
	);
}
