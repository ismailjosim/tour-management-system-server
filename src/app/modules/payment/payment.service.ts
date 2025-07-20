import { BOOKING_STATUS } from '../booking/booking.interface'
import { BookingModel } from '../booking/booking.model'
import { PAYMENT_STATUS } from './payment.interface'
import { PaymentModel } from './payment.model'

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
	successPaymentIntoDB,
	failPaymentIntoDB,
	cancelPaymentIntoDB,
}
