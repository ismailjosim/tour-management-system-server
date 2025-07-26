import crypto from 'crypto'
import { redisClient } from '../../configs/redis.config'
import { sendMail } from '../../utils/sendEmail'

const OTP_EXPIRATION = 2 * 60

const generateOTP = (length = 6) => {
	const OTP = crypto.randomInt(10 ** (length - 1), 10 ** length).toString()
	return OTP
}

const sendOTP = async (name: string, email: string) => {
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
const verifyOTP = async () => {
	return {}
}

export const OTPServices = {
	sendOTP,
	verifyOTP,
}
