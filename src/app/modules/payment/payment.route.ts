import express from 'express'
import { PaymentController } from './payment.controller'
import checkAuth from '../../middlewares/checkAuth'
import { Role } from '../user/user.interface'

const router = express.Router()

router.post(
	'/init-payment/:bookingId',
	checkAuth(...Object.values(Role)),
	PaymentController.initPayment,
)
router
	.route('/success')
	.get(PaymentController.successPayment)
	.post(PaymentController.successPayment)
router
	.route('/fail')
	.get(PaymentController.failPayment)
	.post(PaymentController.failPayment)
router
	.route('/cancel')
	.get(PaymentController.cancelPayment)
	.post(PaymentController.cancelPayment)

router.get(
	'/invoice/:paymentId',
	checkAuth(...Object.values(Role)),
	PaymentController.getInvoiceDownloadURL,
)
router
	.route('/validate-payment')
	.get(PaymentController.validatePayment)
	.post(PaymentController.validatePayment)
router
	.route('/ipn')
	.get(PaymentController.validatePayment)
	.post(PaymentController.validatePayment)

export const PaymentRoutes = router
