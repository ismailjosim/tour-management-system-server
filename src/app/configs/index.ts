import dotenv from 'dotenv'
import path from 'path'

// Load Environment variables from the .env file
dotenv.config({ path: path.join(process.cwd(), '.env') })

// export config variables
export default {
	port: process.env.PORT,
	database_url: process.env.DATABASE_URL,
	node_env: process.env.NODE_ENV,
}
