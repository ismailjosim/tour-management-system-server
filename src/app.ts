import express, { Application, Response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import router from './app/routes'
import { globalErrorHandler } from './app/middlewares/globalErrorHandler'
import notFound from './app/middlewares/notFound'
import passport from 'passport'
import expressSession from 'express-session'
import './app/configs/passport'

const app: Application = express()

// parsers
app.use(
	expressSession({
		secret: 'your-secrent',
		resave: false,
		saveUninitialized: false,
	}),
)
app.use(passport.initialize())
app.use(passport.session())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
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

app.use(globalErrorHandler)

// not found route
app.use(notFound)

export default app
