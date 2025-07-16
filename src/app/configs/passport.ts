/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from 'passport'
import {
	Strategy as GoogleStrategy,
	Profile,
	VerifyCallback,
} from 'passport-google-oauth20'
import { environmentVariables } from './env'
import { UserModel } from '../modules/user/user.model'
import { Role } from '../modules/user/user.interface'
import { Strategy as LocalStrategy } from 'passport-local'
import passwordHashing from '../utils/passwordHashing'

passport.use(
	new LocalStrategy(
		{ usernameField: 'email', passwordField: 'password' },
		async (email: string, password: string, done: VerifyCallback) => {
			try {
				const isUserExist = await UserModel.findOne({ email })
				if (!isUserExist) {
					return done(null, false, { message: 'User does not exist' })
				}
				const hashedPassword = await passwordHashing(password)
			} catch (error) {
				console.log(error)
				done(error)
			}
		},
	),
)

// login with google oAuth
passport.use(
	new GoogleStrategy(
		{
			clientID: environmentVariables.GOOGLE_CLIENT_ID,
			clientSecret: environmentVariables.GOOGLE_CLIENT_SECRET,
			callbackURL: environmentVariables.GOOGLE_CALLBACK_URL,
		},
		// * this function will be used to store info into DB also our custom properties
		async (
			accessToken: string,
			refreshToken: string,
			profile: Profile,
			done: VerifyCallback,
		) => {
			try {
				const email = profile.emails?.[0].value
				if (!email) {
					return done(null, false, { message: 'No email Found' })
				}
				// check email is already exist into DB
				let user = await UserModel.findOne({ email })
				if (!user) {
					// crate new user
					user = await UserModel.create({
						email,
						name: profile.displayName,
						picture: profile.photos?.[0].value,
						role: Role.USER,
						isVerified: true,
						auths: [
							{
								provider: 'google',
								providerId: profile.id,
							},
						],
					})
				}
				return done(null, user, { message: '' })
			} catch (error) {
				// console.log('Google Strategy Error', error)
				return done(error)
			}
		},
	),
)

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
	done(null, user._id)
})

passport.deserializeUser(async (id: string, done: any) => {
	try {
		const user = await UserModel.findById(id)
		done(null, user)
	} catch (error) {
		console.log(error)
		done(error)
	}
})
