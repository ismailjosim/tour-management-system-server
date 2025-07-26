import { createClient } from 'redis'
import { environmentVariables } from './env'

const redisClient = createClient({
	username: environmentVariables.REDIS.REDIS_USERNAME,
	password: environmentVariables.REDIS.REDIS_PASSWORD,
	socket: {
		host: environmentVariables.REDIS.REDIS_HOST,
		port: Number(environmentVariables.REDIS.REDIS_PORT),
	},
})

redisClient.on('error', (err) => console.log('Redis Client Error', err))

// await redisClient.set('foo', 'bar')
// const result = await redisClient.get('foo')
// console.log(result)

export const connectRedis = async () => {
	if (!redisClient.isOpen) {
		await redisClient.connect()
		console.log('Redis Connected')
	}
}
