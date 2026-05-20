/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status-codes'
import AppError from '../../errorHelpers/AppError'
import { UserModel } from '../user/user.model'
import { BOOKING_STATUS, IBooking } from './booking.interface'
import { BookingModel } from './booking.model'
import { PaymentModel } from '../payment/payment.model'
import { PAYMENT_STATUS } from '../payment/payment.interface'
import { TourModel } from '../tour/tour.model'
import { SSLService } from '../sslCommerz/sslCommerz.service'
import { ISSlCommerz } from '../sslCommerz/sslCommerz.interface'
import { getTransactionId } from '../../utils/getTransactionId'
import { QueryBuilder } from '../../utils/QueryBuilder'

const createBookingIntoDB = async (
	payload: Partial<IBooking>,
	userId: string,
) => {
	const session = await BookingModel.startSession()
	session.startTransaction()

	try {
		// 1️⃣ Generate Unique Transaction ID
		const transactionId = getTransactionId()

		// 2️⃣ Check User Info
		const checkUserInfo = await UserModel.findById(userId).session(session)
		if (!checkUserInfo?.phone || !checkUserInfo?.address) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				'Please Update Your Profile to Book a Tour',
			)
		}

		// 3️⃣ Fetch Tour Info
		const tour = await TourModel.findById(payload.tour)
			.select('costFrom')
			.session(session)
		if (!tour?.costFrom) {
			throw new AppError(httpStatus.BAD_REQUEST, 'No Tour Cost Found')
		}

		// 4️⃣ Calculate Total Amount
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const amount = Number(tour.costFrom) * Number(payload.guestCount!)

		// 5️⃣ Create Booking
		const booking = await BookingModel.create(
			[
				{
					user: userId,
					status: BOOKING_STATUS.PENDING,
					...payload,
				},
			],
			{ session },
		)

		// 6️⃣ Create Payment
		const payment = await PaymentModel.create(
			[
				{
					booking: booking[0]._id,
					status: PAYMENT_STATUS.UNPAID,
					transactionId,
					amount,
				},
			],
			{ session },
		)

		// 7️⃣ Update Booking with Payment ID
		const updatedBooking = await BookingModel.findByIdAndUpdate(
			booking[0]._id,
			{ payment: payment[0]._id },
			{ new: true, session },
		)
			.populate('user', 'name email phone address')
			.populate('tour', 'title costFrom')
			.populate('payment')

		// 8️⃣ SSL Commerz payment
		const userAddress = (updatedBooking?.user as any).address
		const userEmail = (updatedBooking?.user as any).email
		const userPhoneNumber = (updatedBooking?.user as any).phone
		const userName = (updatedBooking?.user as any).name
		const sslPayload: ISSlCommerz = {
			address: userAddress,
			email: userEmail,
			phoneNumber: userPhoneNumber,
			name: userName,
			amount: amount,
			transactionId: transactionId,
		}
		const sslPayment = await SSLService.sslPaymentInit(sslPayload)

		// ✅ Commit transaction
		await session.commitTransaction()
		session.endSession()

		return {
			paymentUrl: sslPayment.GatewayPageURL,
			booking: updatedBooking,
		}
	} catch (error) {
		await session.abortTransaction()
		session.endSession()
		throw error
	}
}

const getAllBookingFromDB = async (query: Record<string, string>) => {
	const queryBuilder = new QueryBuilder(
		BookingModel.find()
			.populate('user', 'name email -_id')
			.populate('tour', 'costFrom title images location startDate endDate -_id')
			.populate('payment'),
		query,
	)
	const bookings = queryBuilder.filter().sort().fields().paginate()
	const [data, meta] = await Promise.all([
		bookings.build(),
		queryBuilder.getMeta(),
	])
	return {
		data,
		meta,
	}
}

const getUserBookingFromDB = async (
	userId: string,
	query: Record<string, string>,
) => {
	const queryBuilder = new QueryBuilder(
		BookingModel.find({ user: userId })
			.populate('tour', 'title slug images location costFrom startDate endDate')
			.populate('payment', 'transactionId status amount invoiceUrl'),
		query,
	)
	const bookings = queryBuilder.filter().sort().fields().paginate()

	const [data, meta] = await Promise.all([
		bookings.build(),
		queryBuilder.getMeta(),
	])
	return {
		data,
		meta,
	}
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
}
