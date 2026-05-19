import { IncomingMessage, ServerResponse } from 'http'
import app from './app'
import connectDB from './app/configs/db'
import { connectRedis } from './app/configs/redis.config'
import seedSuperAdmin from './app/utils/seedSuperAdmin'

let bootstrapPromise: Promise<void> | null = null

const bootstrap = async () => {
	await connectDB()
	await connectRedis()
	await seedSuperAdmin()
}

export default async function handler(
	req: IncomingMessage,
	res: ServerResponse,
) {
	bootstrapPromise ??= bootstrap()
	await bootstrapPromise

	return app(req, res)
}
