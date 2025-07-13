import dotenv from 'dotenv'
dotenv.config()

interface EnvConfig {
	PORT: string
	DATABASE_URL: string
	NODE_ENV: string
	JWT_ACCESS_SECRET: string
	JWT_ACCESS_EXPIRES: string
	BCRYPT_SALT_ROUND: string
}
console.log(typeof process.env.BCRYPT_SALT_ROUND)

const loadEnvironmentVars = (): EnvConfig => {
	const requiredEnvironmentVars: string[] = ['PORT', 'DATABASE_URL', 'NODE_ENV']
	requiredEnvironmentVars.forEach((key) => {
		if (!process.env[key]) {
			throw new Error(`Missing required environment variable ${key}`)
		}
	})

	return {
		PORT: process.env.PORT as string,
		DATABASE_URL: process.env.DATABASE_URL as string,
		NODE_ENV: process.env.NODE_ENV as 'development' | 'production',
		JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
		JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
		BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,
	}
}

export const environmentVariables = loadEnvironmentVars()
