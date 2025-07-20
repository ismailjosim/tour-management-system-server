/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express'
import catchAsync from '../../utils/catchAsync'
import { PaymentService } from './payment.service'
import { environmentVariables } from '../../configs/env'

// const initPayment = catchAsync(async (req: Request, res: Response) => {
// 	const bookingId = req.params.bookingId
// 	const result = await PaymentService.initPayment(bookingId as string)
// 	sendResponse(res, {
// 		statusCode: 201,
// 		success: true,
// 		message: 'Payment done successfully',
// 		data: result,
// 	})
// })

const successPayment = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const query = req.query
		const result = await PaymentService.successPaymentIntoDB(
			req.query as Record<string, string>,
		)

		if (result.success) {
			res.redirect(
				`${environmentVariables.SSL.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.transactionId}&amount=${query.amount}&status=${query.status}&message=${result.message}`,
			)
		}
	},
)
const failPayment = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const query = req.query
		const result = await PaymentService.failPaymentIntoDB(
			req.query as Record<string, string>,
		)

		if (result.success) {
			res.redirect(
				`${environmentVariables.SSL.SSL_FAIL_FRONTEND_URL}?transactionId=${query.transactionId}&amount=${query.amount}&status=${query.status}&message=${result.message}`,
			)
		}
	},
)
const cancelPayment = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const query = req.query
		const result = await PaymentService.cancelPaymentIntoDB(
			req.query as Record<string, string>,
		)

		if (result.success) {
			res.redirect(
				`${environmentVariables.SSL.SSL_CANCEL_FRONTEND_URL}?transactionId=${query.transactionId}&amount=${query.amount}&status=${query.status}&message=${result.message}`,
			)
		}
	},
)

// Add other controller methods here (e.g., get, update, delete)

export const PaymentController = {
	successPayment,
	failPayment,
	cancelPayment,
}
