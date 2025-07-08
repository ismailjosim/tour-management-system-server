/* eslint-disable no-console */
import mongoose from 'mongoose'
import config from './index'
import 'colors'

const connectDB = async () => {
	try {
		await mongoose.connect(config.database_url as string)
		console.log('Traveler Database Connected successfully'.bgBlue.bold)
	} catch (error) {
		console.log(`Failed to connect to database: ${error}`.bgRed.bold)
		process.exit(1)
	}
}

export default connectDB
