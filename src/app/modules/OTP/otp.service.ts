import crypto from 'crypto';
import { redisClient } from '../../configs/redis.config';
import { sendMail } from '../../utils/sendEmail';
import AppError from '../../errorHelpers/AppError';
import { UserModel } from '../user/user.model';
import StatusCodes from 'http-status-codes';

const OTP_EXPIRATION = 2 * 60;
const OTP_RESEND_COOLDOWN = 60;
const OTP_MAX_ATTEMPTS = 5;

const generateOTP = (length = 6) => {
  const OTP = crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
  return OTP;
};

const sendOTP = async (name: string, email: string) => {
  // check user is exist & user verified status is true or not
  const isUserExist = await UserModel.findOne({ email });

  if (!isUserExist) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'This User is Not Exist');
  }
  if (isUserExist && isUserExist.isDeleted) {
    throw new AppError(StatusCodes.BAD_REQUEST, "You Can't Verify This Account");
  }
  if (isUserExist && isUserExist.isVerified) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'You are Already Verified Your Account');
  }

  const otp = generateOTP();
  const redisKey = `otp:${email}`;
  const cooldownKey = `otp:cooldown:${email}`;
  const cooldown = await redisClient.get(cooldownKey);

  if (cooldown) {
    throw new AppError(StatusCodes.TOO_MANY_REQUESTS, 'Please wait before requesting another OTP');
  }

  await Promise.all([
    redisClient.set(redisKey, otp, {
      expiration: { type: 'EX', value: OTP_EXPIRATION },
    }),
    redisClient.set(cooldownKey, '1', {
      expiration: { type: 'EX', value: OTP_RESEND_COOLDOWN },
    }),
    redisClient.del([`otp:attempts:${email}`]),
  ]);

  await sendMail({
    to: email,
    subject: 'Your OTP Code:',
    templateName: 'otp',
    templateData: {
      name,
      otp,
    },
  });
};
const verifyOTP = async (email: string, otp: string) => {
  // check user is exist & user verified status is true or not
  const isUserExist = await UserModel.findOne({ email });

  if (!isUserExist) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'This User is Not Exist');
  }
  if (isUserExist && isUserExist.isDeleted) {
    throw new AppError(StatusCodes.BAD_REQUEST, "You Can't Verify This Account");
  }
  if (isUserExist && isUserExist.isVerified) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'You are Already Verified Your Account');
  }

  const redisKey = `otp:${email}`;
  const attemptKey = `otp:attempts:${email}`;
  const savedOtp = await redisClient.get(redisKey);
  const attempts = Number((await redisClient.get(attemptKey)) ?? 0);

  if (attempts >= OTP_MAX_ATTEMPTS) {
    throw new AppError(StatusCodes.TOO_MANY_REQUESTS, 'Too many invalid OTP attempts');
  }

  // verify otp
  if (!savedOtp || savedOtp !== otp) {
    await redisClient.set(attemptKey, String(attempts + 1), {
      expiration: { type: 'EX', value: OTP_EXPIRATION },
    });
    throw new AppError(401, 'Invalid OTP');
  }

  // verify user status
  await Promise.all([
    UserModel.updateOne({ email }, { isVerified: true }, { runValidators: true }),
    redisClient.del([redisKey, attemptKey]),
  ]);
};

export const OTPServices = {
  sendOTP,
  verifyOTP,
};
