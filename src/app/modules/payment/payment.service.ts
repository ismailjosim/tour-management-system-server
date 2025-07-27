/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus, { StatusCodes } from 'http-status-codes'
import AppError from '../../errorHelpers/AppError'
import { BOOKING_STATUS } from '../booking/booking.interface'
import { BookingModel } from '../booking/booking.model'
import { PAYMENT_STATUS } from './payment.interface'
import { PaymentModel } from './payment.model'
import { ISSlCommerz } from '../sslCommerz/sslCommerz.interface'
import { SSLService } from '../sslCommerz/sslCommerz.service'
import { generatePDF, IInvoiceData } from '../../utils/invoice'
import { IUser } from '../user/user.interface'
import { ITour } from '../tour/tour.interface'
import { sendMail } from '../../utils/sendEmail'
import { uploadBufferToCloudinary } from '../../configs/cloudinary.config'

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
		const updatedPayment = await PaymentModel.findOneAndUpdate(
			{
				transactionId: query.transactionId,
			},
			{ status: PAYMENT_STATUS.PAID },
			{ new: true, runValidators: true, session },
		)
		if (!updatedPayment) {
			throw new AppError(StatusCodes.BAD_REQUEST, 'Payment Not Found')
		}

		// 🧠 Tell TypeScript: "This is a PopulatedBooking"
		const updatedBooking = await BookingModel.findByIdAndUpdate(
			updatedPayment.booking,
			{ status: BOOKING_STATUS.COMPLETE },
			{ new: true, runValidators: true, session },
		)
			.populate('user', 'name email phone address')
			.populate('tour', 'title')
			.populate('payment', 'transactionId amount')

		if (!updatedBooking) {
			throw new AppError(StatusCodes.BAD_REQUEST, 'Tour Not Found')
		}
		const user = updatedBooking.user as unknown as IUser

		const invoiceData: IInvoiceData = {
			bookingDate: updatedBooking.createdAt as Date,
			guestCount: updatedBooking.guestCount,
			totalAmount: updatedPayment.amount,
			tourTitle: (updatedBooking.tour as unknown as ITour).title,
			transactionId: updatedPayment.transactionId,
			userName: user.name,
			userEmail: user.email,
		}

		const pdfBuffer = await generatePDF(invoiceData)

		// manually upload PDF into our cloudinary store
		const cloudinaryResult = await uploadBufferToCloudinary(
			pdfBuffer,
			'invoice',
		)
		await PaymentModel.findByIdAndUpdate(
			updatedPayment._id,
			{
				invoiceUrl: cloudinaryResult?.secure_url,
			},
			{ runValidators: true, session },
		)

		// send user email
		await sendMail({
			to: user.email,
			subject: 'Your Booking Invoice',
			templateName: 'invoice',
			templateData: {
				userName: invoiceData.userName,
				tourTitle: invoiceData.tourTitle,
				transactionId: invoiceData.transactionId,
				totalAmount: invoiceData.totalAmount,
				bookingDate: invoiceData.bookingDate,
				userEmail: invoiceData.userEmail,
			},
			attachments: [
				{
					filename: 'invoice.pdf',
					content: pdfBuffer,
					contentType: 'application/pdf',
				},
			],
		})

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

const getInvoiceDownloadURLFromDB = async (id: string) => {
	const payment = await PaymentModel.findById(id).select('invoiceUrl')

	if (!payment) {
		throw new AppError(httpStatus.BAD_REQUEST, 'Payment Not Found')
	}
	if (!payment.invoiceUrl) {
		throw new AppError(httpStatus.BAD_REQUEST, 'InvoiceUrl Not Found')
	}

	return payment
}

export const PaymentService = {
	initPaymentIntoDB,
	successPaymentIntoDB,
	failPaymentIntoDB,
	cancelPaymentIntoDB,
	getInvoiceDownloadURLFromDB,
}
