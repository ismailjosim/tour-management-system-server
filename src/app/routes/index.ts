import { Router } from 'express'
import { UserRoutes } from '../modules/user/user.route'
import { AuthRoutes } from '../modules/auth/auth.route'
import { TourRoutes } from '../modules/tour/tour.route'

export const router = Router()
const moduleRoutes = [
	{
		path: '/user',
		route: UserRoutes,
	},
	{
		path: '/auth',
		route: AuthRoutes,
	},
	{
		path: '/tour',
		route: TourRoutes,
	},
]

moduleRoutes.forEach(({ path, route }) => router.use(path, route))

export default router
