/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express'
import catchAsync from '../../utils/catchAsync'
import { PaymentService } from './payment.service'
import httpStatus from 'http-status-codes'
import { environmentVariables } from '../../configs/env'
import sendResponse from '../../utils/sendResponse'
import { SSLService } from '../sslCommerz/sslCommerz.service'

const initPayment = catchAsync(async (req: Request, res: Response) => {
	const bookingId = req.params.bookingId
	const result = await PaymentService.initPaymentIntoDB(bookingId as string)
	sendResponse(res, {
		statusCode: 201,
		success: true,
		message: 'Payment done successfully',
		data: result,
	})
})

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

const getInvoiceDownloadURL = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { paymentId } = req.params
		const result = await PaymentService.getInvoiceDownloadURLFromDB(paymentId)

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: 'Invoice Download URL Retrieved successfully',
			data: result?.invoiceUrl,
		})
	},
)
const validatePayment = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		console.log('SSLCommerz IPN URL Body', req.body)
		await SSLService.validatePayment(req.body)

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: 'Payment Validated successfully',
			data: null,
		})
	},
)

export const PaymentController = {
	initPayment,
	successPayment,
	failPayment,
	cancelPayment,
	getInvoiceDownloadURL,
	validatePayment,
}
