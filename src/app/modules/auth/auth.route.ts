import { NextFunction, Request, Response, Router } from 'express'
import { AuthControllers } from './auth.controller'
import checkAuth from '../../middlewares/checkAuth'
import { Role } from '../user/user.interface'
import passport from 'passport'

const router = Router()

router.post('/login', AuthControllers.credentialsLogin)
router.post('/refresh-token', AuthControllers.getNewAccessToken)
router.post('/logout', AuthControllers.logout)
router.post(
	'/change-password',
	checkAuth(...Object.values(Role)),
	AuthControllers.changePassword,
)
router.post(
	'/reset-password',
	checkAuth(...Object.values(Role)),
	AuthControllers.resetPassword,
)
router.post(
	'/set-password',
	checkAuth(...Object.values(Role)),
	AuthControllers.setPassword,
)

router.get(
	'/google',
	async (req: Request, res: Response, next: NextFunction) => {
		// * if user click /booking but -> /login -> after successfully google login -> /booking in frontend
		// * if user create directly /login then -> after successfully google login -> / mean homepage in frontend
		const redirect = req.query?.redirect || '/'
		passport.authenticate('google', {
			scope: ['profile', 'email'],
			state: redirect as string,
		})(res, res, next)
	},
)
// api/v1/auth/google/callback?state=/booking or /
router.get(
	'/google/callback',
	passport.authenticate('google', { failureRedirect: '/login' }),
	AuthControllers.googleCallbackController,
)

export const AuthRoutes = router
