"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPServices = void 0;
const crypto_1 = __importDefault(require("crypto"));
const redis_config_1 = require("../../configs/redis.config");
const sendEmail_1 = require("../../utils/sendEmail");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_model_1 = require("../user/user.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const OTP_EXPIRATION = 2 * 60;
const generateOTP = (length = 6) => {
    const OTP = crypto_1.default.randomInt(10 ** (length - 1), 10 ** length).toString();
    return OTP;
};
const sendOTP = (name, email) => __awaiter(void 0, void 0, void 0, function* () {
    // check user is exist & user verified status is true or not
    const isUserExist = yield user_model_1.UserModel.findOne({ email });
    if (!isUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'This User is Not Exist');
    }
    if (isUserExist && isUserExist.isDeleted) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "You Can't Verify This Account");
    }
    if (isUserExist && isUserExist.isVerified) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'You are Already Verified Your Account');
    }
    const otp = generateOTP();
    const redisKey = `otp:${email}`;
    yield redis_config_1.redisClient.set(redisKey, otp, {
        expiration: { type: 'EX', value: OTP_EXPIRATION },
    });
    yield (0, sendEmail_1.sendMail)({
        to: email,
        subject: 'Your OTP Code:',
        templateName: 'otp',
        templateData: {
            name,
            otp,
        },
    });
});
const verifyOTP = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    // check user is exist & user verified status is true or not
    const isUserExist = yield user_model_1.UserModel.findOne({ email });
    if (!isUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'This User is Not Exist');
    }
    if (isUserExist && isUserExist.isDeleted) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "You Can't Verify This Account");
    }
    if (isUserExist && isUserExist.isVerified) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'You are Already Verified Your Account');
    }
    const redisKey = `otp:${email}`;
    const savedOtp = yield redis_config_1.redisClient.get(redisKey);
    // verify otp
    if (!savedOtp || savedOtp !== otp) {
        throw new AppError_1.default(401, 'Invalid OTP');
    }
    // verify user status
    yield Promise.all([
        user_model_1.UserModel.updateOne({ email }, { isVerified: true }, { runValidators: true }),
        redis_config_1.redisClient.del([redisKey]),
    ]);
});
exports.OTPServices = {
    sendOTP,
    verifyOTP,
};
