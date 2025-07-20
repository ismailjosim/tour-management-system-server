import httpStatus from 'http-status-codes'
import AppError from '../../errorHelpers/AppError'
import { UserModel } from '../user/user.model'
import { BOOKING_STATUS, IBooking } from './booking.interface'
import { BookingModel } from './booking.model'
import { PaymentModel } from '../payment/payment.model'
import { PAYMENT_STATUS } from '../payment/payment.interface'
import { TourModel } from '../tour/tour.model'

const getTransactionId = () => {
	return `tran_${Date.now()}_${Math.floor(Math.random() * 1000)}`
}

const createBookingIntoDB = async (
	payload: Partial<IBooking>,
	userId: string,
) => {
	// step 01: create unique transaction ID
	const transactionId = getTransactionId()

	// step 02: check phone & address is Exist or not
	const checkUserInfo = await UserModel.findById(userId)
	if (!checkUserInfo?.phone || !checkUserInfo?.address) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			'Please Update Your Profile to Book a Tour',
		)
	}
	// step 03: check tour cost from Tour
	const tour = await TourModel.findById(payload.tour).select('costFrom')
	if (!tour?.costFrom) {
		throw new AppError(httpStatus.BAD_REQUEST, 'No Tour Cost Found')
	}

	// step 04: calculate amount based on cost and guestCount
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const amount = Number(tour.costFrom) * Number(payload.guestCount!)

	// step 05: create booking [userId, status: pending and othersInfo]
	const booking = await BookingModel.create({
		user: userId,
		status: BOOKING_STATUS.PENDING,
		...payload,
	})

	// step 06: create payment with booking, status:pending, unique TRXID and amount
	const payment = await PaymentModel.create({
		booking: booking._id,
		status: PAYMENT_STATUS.UNPAID,
		transactionId,
		amount,
	})

	// step 07: update payment info
	const updatedBooking = await BookingModel.findByIdAndUpdate(
		booking._id,
		{
			payment: payment._id,
		},
		{ new: true, runValidators: true },
	)
		.populate('user', 'name email phone address')
		.populate('tour', 'title costFrom')
		.populate('payment')

	return updatedBooking
}

const getAllBookingFromDB = async () => {
	return null
}

const getUserBookingFromDB = async () => {
	return null
}
const getSingleBookingFromDB = async () => {
	return null
}
const updateBookingStatusIntoDB = async () => {
	return null
}

export const BookingService = {
	createBookingIntoDB,
	getAllBookingFromDB,
	getUserBookingFromDB,
	getSingleBookingFromDB,
	updateBookingStatusIntoDB,
	// ...
}
