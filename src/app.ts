import express, { Application, Response } from 'express'
import cors from 'cors'
import router from './app/routes'

const app: Application = express()

// parsers
app.use(express.json())
app.use(cors())

//* Application Routes
app.use('/api/v1', router)

//* Basic Route for testing
app.get('/', async (_, res: Response) => {
	res.send({
		status: true,
		message: 'Welcome to Traveler: Your Next Tour Partner 🚀',
	})
})

export default app
