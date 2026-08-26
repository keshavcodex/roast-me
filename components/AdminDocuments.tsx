'use client';

import { useEffect, useRef, useState } from 'react';

import {
	Box,
	Button,
	CircularProgress,
	Paper,
	Stack,
	Typography
} from '@mui/material';

interface RoastDocument {
	userId: string;
	request: string;
	response: string;
	createdAt: string;
}

interface DocumentsResponse {
	documents?: RoastDocument[];
	hasMore?: boolean;
	error?: string;
}

const PAGE_SIZE = 10;

function AdminDocuments() {
	const [documents, setDocuments] = useState<RoastDocument[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const loadMoreRef = useRef<HTMLDivElement>(null);

	async function loadDocuments(reset = false) {
		if (isLoading || (!reset && !hasMore)) return;

		setIsLoading(true);
		setError(null);

		try {
			const skip = reset ? 0 : documents.length;
			const response = await fetch(
				`/api/v1/admin/documents?skip=${skip}&limit=${PAGE_SIZE}`
			);
			const payload = (await response.json()) as DocumentsResponse;

			if (!response.ok || !payload.documents) {
				throw new Error(payload.error ?? 'Documents could not be loaded.');
			}

			setDocuments((current) =>
				reset
					? (payload.documents ?? [])
					: [...current, ...(payload.documents ?? [])]
			);
			setHasMore(payload.hasMore ?? false);
			setIsOpen(true);
		} catch (loadError) {
			setError(
				loadError instanceof Error
					? loadError.message
					: 'Documents could not be loaded.'
			);
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		if (!isOpen || !loadMoreRef.current) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) void loadDocuments();
			},
			{ rootMargin: '240px' }
		);

		observer.observe(loadMoreRef.current);

		return () => observer.disconnect();
	}, [documents.length, hasMore, isLoading, isOpen]);

	return (
		<Box sx={{ width: '80%', mt: 5, pb: 8 }}>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'end',
					gap: 2,
					mb: 2
				}}
			>
				<Box>
					<Typography variant='h4'>Roast archive</Typography>
					<Typography color='text.secondary'>Newest roasts first</Typography>
				</Box>
				{isOpen && (
					<Typography color='text.secondary'>
						{documents.length} loaded
					</Typography>
				)}
			</Box>

			{!isOpen && (
				<Button
					onClick={() => void loadDocuments(true)}
					variant='contained'
					disabled={isLoading}
				>
					{isLoading ? 'Loading archive...' : 'Load documents'}
				</Button>
			)}

			{error && (
				<Typography color='error' sx={{ mt: 2 }}>
					{error}
				</Typography>
			)}

			{isOpen && documents.length === 0 && !isLoading && (
				<Paper sx={{ p: 3, mt: 2 }}>
					<Typography color='text.secondary'>
						No roasts have been recorded yet.
					</Typography>
				</Paper>
			)}

			<Stack spacing={2} sx={{ mt: 2 }}>
				{documents.map((document, index) => (
					<Paper
						key={`${document.createdAt}-${index}`}
						sx={{
							p: { xs: 2, sm: 2.5 },
							borderLeft: '3px solid',
							borderColor: 'primary.main'
						}}
					>
						<Stack spacing={1}>
							<Box
								sx={{
									display: 'flex',
									justifyContent: 'space-between',
									gap: 2,
									flexWrap: 'wrap'
								}}
							>
								<Typography variant='caption' color='secondary.main'>
									{document.userId}
								</Typography>
								<Typography variant='caption' color='text.secondary'>
									{new Date(document.createdAt).toLocaleString('en-GB')}
								</Typography>
							</Box>
							<Typography>
								<strong>Excuse:</strong> {document.request}
							</Typography>
							<Typography sx={{ color: '#ff9090' }}>
								<strong>Roast:</strong> {document.response}
							</Typography>
						</Stack>
					</Paper>
				))}
			</Stack>

			{isOpen && (
				<Box
					ref={loadMoreRef}
					sx={{
						display: 'flex',
						justifyContent: 'center',
						minHeight: 72,
						alignItems: 'center'
					}}
				>
					{isLoading && <CircularProgress size={24} />}
					{!isLoading && !hasMore && documents.length > 0 && (
						<Typography variant='caption' color='text.secondary'>
							You have reached the end of the archive.
						</Typography>
					)}
				</Box>
			)}
		</Box>
	);
}

export default AdminDocuments;
