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
	GOOGLE_CLIENT_ID: string
	GOOGLE_CLIENT_SECRET: string
	GOOGLE_CALLBACK_URL: string
	EXPRESS_SESSION_SECRET: string
	FRONTEND_URL: string
	SSL: {
		SSL_STORE_ID: string
		SSL_STORE_PASS: string
		SSL_PAYMENT_API: string
		SSL_VALIDATION_API: string
		SSL_SUCCESS_FRONTEND_URL: string
		SSL_FAIL_FRONTEND_URL: string
		SSL_CANCEL_FRONTEND_URL: string
		SSL_SUCCESS_BACKEND_URL: string
		SSL_FAIL_BACKEND_URL: string
		SSL_CANCEL_BACKEND_URL: string
	}
	CLOUDINARY: {
		CLOUDINARY_CLOUD_NAME: string
		CLOUDINARY_API_KEY: string
		CLOUDINARY_API_SECRET: string
	}
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
		'GOOGLE_CLIENT_ID',
		'GOOGLE_CLIENT_SECRET',
		'GOOGLE_CALLBACK_URL',
		'EXPRESS_SESSION_SECRET',
		'FRONTEND_URL',
		'SSL_STORE_ID',
		'SSL_STORE_PASS',
		'SSL_PAYMENT_API',
		'SSL_VALIDATION_API',
		'SSL_SUCCESS_FRONTEND_URL',
		'SSL_FAIL_FRONTEND_URL',
		'SSL_CANCEL_FRONTEND_URL',
		'SSL_SUCCESS_BACKEND_URL',
		'SSL_FAIL_BACKEND_URL',
		'SSL_CANCEL_BACKEND_URL',
		'CLOUDINARY_CLOUD_NAME',
		'CLOUDINARY_API_KEY',
		'CLOUDINARY_API_SECRET',
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
		GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
		GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
		GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
		EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET as string,
		FRONTEND_URL: process.env.FRONTEND_URL as string,
		// SSL
		SSL: {
			SSL_STORE_ID: process.env.SSL_STORE_ID as string,
			SSL_STORE_PASS: process.env.SSL_STORE_PASS as string,
			SSL_PAYMENT_API: process.env.SSL_PAYMENT_API as string,
			SSL_VALIDATION_API: process.env.SSL_VALIDATION_API as string,
			SSL_SUCCESS_FRONTEND_URL: process.env.SSL_SUCCESS_FRONTEND_URL as string,
			SSL_FAIL_FRONTEND_URL: process.env.SSL_FAIL_FRONTEND_URL as string,
			SSL_CANCEL_FRONTEND_URL: process.env.SSL_CANCEL_FRONTEND_URL as string,
			SSL_SUCCESS_BACKEND_URL: process.env.SSL_SUCCESS_BACKEND_URL as string,
			SSL_FAIL_BACKEND_URL: process.env.SSL_FAIL_BACKEND_URL as string,
			SSL_CANCEL_BACKEND_URL: process.env.SSL_CANCEL_BACKEND_URL as string,
		},
		CLOUDINARY: {
			CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
			CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
			CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
		},
	}
}

export const environmentVariables = loadEnvironmentVars()
