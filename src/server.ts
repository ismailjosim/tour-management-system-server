import app from './app'
import configs from './app/configs'
import connectDB from './app/configs/db'
import { Server } from 'http'

let server: Server

async function startServer() {
	try {
		await connectDB()

		server = app.listen(configs.port, () => {
			console.log(`Traveler Server is running on port ${configs.port}`)
		})
	} catch (error) {
		console.log(`Failed to connect to database or start server: ${error}`)
	}
}
startServer()
