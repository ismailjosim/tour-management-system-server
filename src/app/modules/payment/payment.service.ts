/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status-codes'
import AppError from '../../errorHelpers/AppError'
import { BOOKING_STATUS } from '../booking/booking.interface'
import { BookingModel } from '../booking/booking.model'
import { PAYMENT_STATUS } from './payment.interface'
import { PaymentModel } from './payment.model'
import { ISSlCommerz } from '../sslCommerz/sslCommerz.interface'
import { SSLService } from '../sslCommerz/sslCommerz.service'

const initPaymentIntoDB = async (bookingId: string) => {
	const payment = await PaymentModel.findOne({ booking: bookingId })
	if (!payment) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"Payment not Found. You didn't booked this tour yet!",
		)
	}
	const booking = await BookingModel.findById(payment.booking)

	if (payment.status === PAYMENT_STATUS.PAID) {
		throw new AppError(httpStatus.BAD_REQUEST, 'Payment already completed.')
	}

	if (booking?.status === BOOKING_STATUS.COMPLETE) {
		throw new AppError(httpStatus.BAD_REQUEST, 'Booking is already confirmed.')
	}

	// SSL Commerz payment
	const userAddress = (booking?.user as any).address
	const userEmail = (booking?.user as any).email
	const userPhoneNumber = (booking?.user as any).phone
	const userName = (booking?.user as any).name
	const sslPayload: ISSlCommerz = {
		address: userAddress,
		email: userEmail,
		phoneNumber: userPhoneNumber,
		name: userName,
		amount: payment.amount,
		transactionId: payment.transactionId,
	}
	const sslPayment = await SSLService.sslPaymentInit(sslPayload)
	return {
		paymentUrl: sslPayment.GatewayPageURL,
		booking: booking,
	}
}
const successPaymentIntoDB = async (query: Record<string, string>) => {
	const session = await BookingModel.startSession()
	session.startTransaction()

	try {
		// 1️⃣ Update payment status to PAID
		const updatedPayment = await PaymentModel.findOneAndUpdate(
			{
				transactionId: query.transactionId,
			},
			{ status: PAYMENT_STATUS.PAID },
			{ new: true, runValidators: true, session },
		)

		// 2️⃣ update booking status to Confirm
		await BookingModel.findByIdAndUpdate(
			updatedPayment?.booking,
			{ status: BOOKING_STATUS.COMPLETE },
			{ new: true, runValidators: true, session },
		)

		await session.commitTransaction()
		session.endSession()

		return { success: true, message: 'Payment Completed Successfully' }
	} catch (error) {
		await session.abortTransaction()
		session.endSession()
		throw error
	}
}
const failPaymentIntoDB = async (query: Record<string, string>) => {
	const session = await BookingModel.startSession()
	session.startTransaction()

	try {
		// 1️⃣ Update payment status to PAID
		const updatedPayment = await PaymentModel.findOneAndUpdate(
			{
				transactionId: query.transactionId,
			},
			{ status: PAYMENT_STATUS.FAILED },
			{ runValidators: true, session },
		)

		// 2️⃣ update booking status to Confirm
		await BookingModel.findByIdAndUpdate(
			updatedPayment?.booking,
			{ status: BOOKING_STATUS.FAILED },
			{ runValidators: true, session },
		)

		await session.commitTransaction()
		session.endSession()

		return { success: true, message: 'Payment Failed' }
	} catch (error) {
		await session.abortTransaction()
		session.endSession()
		throw error
	}
}
const cancelPaymentIntoDB = async (query: Record<string, string>) => {
	const session = await BookingModel.startSession()
	session.startTransaction()

	try {
		// 1️⃣ Update payment status to PAID
		const updatedPayment = await PaymentModel.findOneAndUpdate(
			{
				transactionId: query.transactionId,
			},
			{ status: PAYMENT_STATUS.CANCELLED },
			{ runValidators: true, session },
		)

		// 2️⃣ update booking status to Confirm
		await BookingModel.findByIdAndUpdate(
			updatedPayment?.booking,
			{ status: BOOKING_STATUS.CANCEL },
			{ runValidators: true, session },
		)

		await session.commitTransaction()
		session.endSession()

		return { success: true, message: 'Payment Canceled' }
	} catch (error) {
		await session.abortTransaction()
		session.endSession()
		throw error
	}
}

export const PaymentService = {
	initPaymentIntoDB,
	successPaymentIntoDB,
	failPaymentIntoDB,
	cancelPaymentIntoDB,
}
