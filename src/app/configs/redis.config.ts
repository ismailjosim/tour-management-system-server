import { createClient } from 'redis'
import { environmentVariables } from './env'

export const redisClient = createClient({
	username: environmentVariables.REDIS.REDIS_USERNAME,
	password: environmentVariables.REDIS.REDIS_PASSWORD,
	socket: {
		host: environmentVariables.REDIS.REDIS_HOST,
		port: Number(environmentVariables.REDIS.REDIS_PORT),
		connectTimeout: 5000,
	},
})

redisClient.on('error', (err) => console.log('Redis Client Error', err))

export const connectRedis = async () => {
	if (redisClient.isOpen) {
		return
	}

	try {
		await redisClient.connect()
		console.log('Redis Connected')
	} catch (error) {
		console.log('Redis connection failed. OTP features may be unavailable.', error)
	}
}
