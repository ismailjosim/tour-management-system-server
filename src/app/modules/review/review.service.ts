/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status-codes'
import AppError from '../../errorHelpers/AppError'
import { UserModel } from '../user/user.model'
import { IReview } from './review.interface'
import { BookingModel } from '../booking/booking.model'
import { BOOKING_STATUS } from '../booking/booking.interface'
import { PAYMENT_STATUS } from '../payment/payment.interface'
import { ReviewModel } from './review.model'
import { QueryBuilder } from '../../utils/QueryBuilder'

const createReviewIntoDB = async (payload: IReview, userId: string) => {
	// 1️⃣ check user is exist

	const user = await UserModel.findById(userId)
	if (!user) {
		throw new AppError(httpStatus.NOT_FOUND, 'User Not Found!')
	}

	//2️⃣ check booking and payment status
	const booking = await BookingModel.findOne({
		user: payload.user,
		tour: payload.tour,
		status: BOOKING_STATUS.COMPLETE,
	})
		.populate('payment', 'status')
		.exec()

	console.log(booking)

	if (!booking) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			'You must book this tour before posting a review',
		)
	}
	//3️⃣ check payment status is successful
	const paymentStatus = (booking.payment as any)?.status
	if (paymentStatus !== PAYMENT_STATUS.PAID) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			'Review allowed only after successful payment',
		)
	}

	// 4️⃣ Check if review already exists for this user-tour pair
	const existingReview = await ReviewModel.findOne({
		user: payload.user,
		tour: payload.tour,
	})
	if (existingReview) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			'You already submitted a review for this tour',
		)
	}

	// 5️⃣ Create Review
	const review = await ReviewModel.create(payload)
	return review
}

const getSpecificTourReviewsFromDB = async (
	tourId: string,
	query: Record<string, string>,
) => {
	const queryBuilder = new QueryBuilder(
		ReviewModel.find({ tour: tourId }).populate('user', 'name picture -_id'),
		query,
	)

	const reviews = queryBuilder.filter().sort().fields().paginate()

	const [data, meta] = await Promise.all([
		reviews.build(),
		queryBuilder.getMeta(),
	])

	return {
		data,
		meta,
	}
}

export const ReviewService = {
	createReviewIntoDB,
	getSpecificTourReviewsFromDB,
}
