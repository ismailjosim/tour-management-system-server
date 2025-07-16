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
				console.log('Google Strategy Error', error)
				return done(error)
			}
		},
	),
)

//* request travel from localhost:5173(frontend) => localhost:5000(backend) => /api/v1/auth/google => passport => google oauth concent screen => select gmail to login -> successfully -> send callback URL -> localhost:5000/api/v1/auth/google/callback

// * bridge: google -> store info into DB -> token send based on user info -> route access.
// * custom auth process: custom -> email, pass, role:USER ...rest_info -> register -> db -> 1 user crate
// * what google do: google -> req -> successfully -> then we need: Jwt token, role, email etc -> to do that store google info into DB -> api access.

//* if user is exist then it will be login but user is not exist into db then it will be signup.
//* also don't store user info if user is already exist.
// * google login -> if(!userExist) store db -> token.
// * we will do that into callback URL

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
