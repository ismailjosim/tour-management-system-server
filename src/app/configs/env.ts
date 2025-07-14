import dotenv from 'dotenv'
dotenv.config()

interface EnvConfig {
	PORT: string
	DATABASE_URL: string
	NODE_ENV: string
	JWT_ACCESS_SECRET: string
	JWT_ACCESS_EXPIRES: string
	BCRYPT_SALT_ROUND: string
	REFRESH_TOKEN_SECRET: string
	REFRESH_TOKEN_EXPIRES: string
	SUPER_ADMIN_EMAIL: string
	SUPER_ADMIN_PASS: string
}

const loadEnvironmentVars = (): EnvConfig => {
	const requiredEnvironmentVars: string[] = [
		'PORT',
		'DATABASE_URL',
		'NODE_ENV',
		'JWT_ACCESS_SECRET',
		'JWT_ACCESS_EXPIRES',
		'REFRESH_TOKEN_SECRET',
		'REFRESH_TOKEN_EXPIRES',
		'BCRYPT_SALT_ROUND',
		'SUPER_ADMIN_EMAIL',
		'SUPER_ADMIN_PASS',
	]
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
		REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
		REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES as string,
		BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,
		SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
		SUPER_ADMIN_PASS: process.env.SUPER_ADMIN_PASS as string,
	}
}

export const environmentVariables = loadEnvironmentVars()
