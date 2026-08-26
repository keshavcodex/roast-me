import { MongoClient, type Db } from 'mongodb';

import type { ResponseMode } from '@/lib/context';

export interface RoastRecordInput {
	userId: string;
	request: string;
	response: string;
	mode: ResponseMode;
}

export interface RoastDocument {
	userId: string;
	request: string;
	response: string;
	mode: ResponseMode;
	createdAt: Date;
}

const ROASTS_COLLECTION = 'roasts';
const DEFAULT_DB_NAME = 'roast_me';

declare global {
	var _mongoClient: MongoClient | undefined;
	var _mongoDb: Db | undefined;
}

function getMongoUri(): string {
	const mongoUri = process.env.MONGODB_URI;

	if (!mongoUri) {
		throw new Error(
			'MONGODB_URI is not configured.'
		);
	}

	return mongoUri;
}

async function getDb(): Promise<Db> {
	if (global._mongoDb) {
		return global._mongoDb;
	}

	let client: MongoClient;

	if (global._mongoClient) {
		client = global._mongoClient;
	} else {
		client = new MongoClient(
			getMongoUri()
		);

		await client.connect();

		global._mongoClient = client;
	}

	const dbName =
		process.env.MONGODB_DB_NAME ||
		DEFAULT_DB_NAME;

	const database = client.db(dbName);

	global._mongoDb = database;

	await database
		.collection(ROASTS_COLLECTION)
		.createIndexes([
			{
				key: { userId: 1 },
				name: 'idx_roasts_userId'
			},
			{
				key: { createdAt: -1 },
				name: 'idx_roasts_createdAt'
			},
			{
				key: { mode: 1 },
				name: 'idx_roasts_mode'
			}
		]);

	return database;
}

export async function saveRoastRecord(
	input: RoastRecordInput
): Promise<void> {
	const database = await getDb();

	await database
		.collection(ROASTS_COLLECTION)
		.insertOne({
			userId: input.userId,
			request: input.request,
			response: input.response,
			mode: input.mode,
			createdAt: new Date()
		});
}

export async function getUniqueUserCount(): Promise<number> {
	const database = await getDb();

	const result = await database
		.collection(ROASTS_COLLECTION)
		.aggregate([
			{ $group: { _id: '$userId' } },
			{ $count: 'count' }
		])
		.toArray();

	return result[0]?.count ?? 0;
}

export async function getTotalRoasts(): Promise<number> {
	const database = await getDb();

	return database
		.collection(ROASTS_COLLECTION)
		.countDocuments();
}

export async function getRoastDocuments(
	skip = 0,
	limit = 25
): Promise<RoastDocument[]> {
	const database = await getDb();

	return database
		.collection<RoastDocument>(
			ROASTS_COLLECTION
		)
		.find(
			{},
			{
				projection: {
					_id: 0,
					userId: 1,
					request: 1,
					response: 1,
					mode: 1,
					createdAt: 1
				}
			}
		)
		.sort({
			createdAt: -1,
			_id: -1
		})
		.skip(skip)
		.limit(limit)
		.toArray();
}

export async function getRoastsPerUser(): Promise<
	Array<{ userId: string; count: number }>
> {
	const database = await getDb();

	return database
		.collection(ROASTS_COLLECTION)
		.aggregate([
			{
				$group: {
					_id: '$userId',
					count: { $sum: 1 }
				}
			},
			{
				$sort: {
					count: -1,
					_id: 1
				}
			},
			{
				$project: {
					_id: 0,
					userId: '$_id',
					count: 1
				}
			}
		])
		.toArray() as Promise<
		Array<{ userId: string; count: number }>
	>;
}

export async function getRoastsGeneratedToday(): Promise<number> {
	const startOfDay = new Date();

	startOfDay.setHours(0, 0, 0, 0);

	const database = await getDb();

	return database
		.collection(ROASTS_COLLECTION)
		.countDocuments({
			createdAt: { $gte: startOfDay }
		});
}

export async function getRoastsGeneratedLast7Days(): Promise<number> {
	const startOfWindow = new Date();

	startOfWindow.setDate(
		startOfWindow.getDate() - 6
	);

	startOfWindow.setHours(0, 0, 0, 0);

	const database = await getDb();

	return database
		.collection(ROASTS_COLLECTION)
		.countDocuments({
			createdAt: { $gte: startOfWindow }
		});
}

export async function getDailyUniqueUsers(): Promise<
	Array<{ date: string; count: number }>
> {
	const startOfWindow = new Date();

	startOfWindow.setDate(
		startOfWindow.getDate() - 6
	);

	startOfWindow.setHours(0, 0, 0, 0);

	const database = await getDb();

	return database
		.collection(ROASTS_COLLECTION)
		.aggregate([
			{
				$match: {
					createdAt: {
						$gte: startOfWindow
					}
				}
			},
			{
				$group: {
					_id: {
						$dateToString: {
							format: '%Y-%m-%d',
							date: '$createdAt'
						}
					},
					users: {
						$addToSet: '$userId'
					}
				}
			},
			{
				$project: {
					_id: 0,
					date: '$_id',
					count: {
						$size: '$users'
					}
				}
			},
			{
				$sort: { date: 1 }
			}
		])
		.toArray() as Promise<
		Array<{ date: string; count: number }>
	>;
}

export async function getRoastAnalytics(): Promise<{
	totalRoasts: number;
	uniqueUsers: number;
	roastsPerUser: Array<{
		userId: string;
		count: number;
	}>;
	roastsGeneratedToday: number;
	roastsGeneratedLast7Days: number;
	dailyUniqueUsers: Array<{
		date: string;
		count: number;
	}>;
}> {
	const [
		totalRoasts,
		uniqueUsers,
		roastsPerUser,
		roastsGeneratedToday,
		roastsGeneratedLast7Days,
		dailyUniqueUsers
	] = await Promise.all([
		getTotalRoasts(),
		getUniqueUserCount(),
		getRoastsPerUser(),
		getRoastsGeneratedToday(),
		getRoastsGeneratedLast7Days(),
		getDailyUniqueUsers()
	]);

	return {
		totalRoasts,
		uniqueUsers,
		roastsPerUser,
		roastsGeneratedToday,
		roastsGeneratedLast7Days,
		dailyUniqueUsers
	};
}

export async function closeMongoConnection(): Promise<void> {
	if (global._mongoClient) {
		await global._mongoClient.close();

		global._mongoClient = undefined;
		global._mongoDb = undefined;
	}
}