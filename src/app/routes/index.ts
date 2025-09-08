import { Router } from 'express'
import { UserRoutes } from '../modules/user/user.route'
import { AuthRoutes } from '../modules/auth/auth.route'
import { TourRoutes } from '../modules/tour/tour.route'
import { DivisionRoutes } from '../modules/division/division.route'
import { BookingRoutes } from '../modules/booking/booking.route'
import { PaymentRoutes } from '../modules/payment/payment.route'
import { OTPRoutes } from '../modules/OTP/otp.route'
import { StatsRoutes } from '../modules/stats/stats.route'
import { ReviewRoutes } from '../modules/review/review.route'

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
	{
		path: '/division',
		route: DivisionRoutes,
	},
	{
		path: '/booking',
		route: BookingRoutes,
	},
	{
		path: '/payment',
		route: PaymentRoutes,
	},
	{
		path: '/otp',
		route: OTPRoutes,
	},
	{
		path: '/stats',
		route: StatsRoutes,
	},
	{
		path: '/review',
		route: ReviewRoutes,
	},
]

moduleRoutes.forEach(({ path, route }) => router.use(path, route))

export default router
