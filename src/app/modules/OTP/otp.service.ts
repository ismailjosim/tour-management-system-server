import crypto from 'crypto'
import { redisClient } from '../../configs/redis.config'
import { sendMail } from '../../utils/sendEmail'
import AppError from '../../errorHelpers/AppError'
import { UserModel } from '../user/user.model'
import StatusCodes from 'http-status-codes'

const OTP_EXPIRATION = 2 * 60

const generateOTP = (length = 6) => {
	const OTP = crypto.randomInt(10 ** (length - 1), 10 ** length).toString()
	return OTP
}

const sendOTP = async (name: string, email: string) => {
	// check user is exist & user verified status is true or not
	const isUserExist = await UserModel.findOne({ email })

	if (!isUserExist) {
		throw new AppError(StatusCodes.BAD_REQUEST, 'This User is Not Exist')
	}
	if (isUserExist && isUserExist.isDeleted) {
		throw new AppError(StatusCodes.BAD_REQUEST, "You Can't Verify This Account")
	}
	if (isUserExist && isUserExist.isVerified) {
		throw new AppError(
			StatusCodes.BAD_REQUEST,
			'You are Already Verified Your Account',
		)
	}

	const otp = generateOTP()
	const redisKey = `otp:${email}`
	await redisClient.set(redisKey, otp, {
		expiration: { type: 'EX', value: OTP_EXPIRATION },
	})

	await sendMail({
		to: email,
		subject: 'Your OTP Code:',
		templateName: 'otp',
		templateData: {
			name,
			otp,
		},
	})
}
const verifyOTP = async (email: string, otp: string) => {
	// check user is exist & user verified status is true or not
	const isUserExist = await UserModel.findOne({ email })

	if (!isUserExist) {
		throw new AppError(StatusCodes.BAD_REQUEST, 'This User is Not Exist')
	}
	if (isUserExist && isUserExist.isDeleted) {
		throw new AppError(StatusCodes.BAD_REQUEST, "You Can't Verify This Account")
	}
	if (isUserExist && isUserExist.isVerified) {
		throw new AppError(
			StatusCodes.BAD_REQUEST,
			'You are Already Verified Your Account',
		)
	}

	const redisKey = `otp:${email}`
	const savedOtp = await redisClient.get(redisKey)

	// verify otp
	if (!savedOtp || savedOtp !== otp) {
		throw new AppError(401, 'Invalid OTP')
	}

	// verify user status
	await Promise.all([
		UserModel.updateOne(
			{ email },
			{ isVerified: true },
			{ runValidators: true },
		),
		redisClient.del([redisKey]),
	])
}

export const OTPServices = {
	sendOTP,
	verifyOTP,
}
