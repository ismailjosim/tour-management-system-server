"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
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
exports.AuthServices = void 0;
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const user_model_1 = require("../user/user.model");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userTokens_1 = require("../../utils/userTokens");
const passwordHashing_1 = __importDefault(require("../../utils/passwordHashing"));
const user_interface_1 = require("../user/user.interface");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../configs/env");
const sendEmail_1 = require("../../utils/sendEmail");
// const credentialsLogin = async (payload: Partial<IUser>) => {
// 	const { email, password } = payload
// 	// ✅ Check if user exists
// 	const isUserExist = await UserModel.findOne({ email })
// 	if (!isUserExist) {
// 		throw new AppError(httpStatus.BAD_REQUEST, "This user doesn't exist")
// 	}
// 	// 🔐 Verify password
// 	const isPasswordMatched = await bcrypt.compare(
// 		password as string,
// 		isUserExist.password as string,
// 	)
// 	if (!isPasswordMatched) {
// 		throw new AppError(httpStatus.BAD_REQUEST, 'Incorrect password')
// 	}
// 	// generate access & refresh Token
// 	const { accessToken, refreshToken } = createUserToken(isUserExist)
// 	// 🧼 Remove password before returning user data
// 	const userWithoutPassword = isUserExist.toObject()
// 	delete userWithoutPassword.password
// 	return {
// 		accessToken,
// 		refreshToken,
// 		user: userWithoutPassword,
// 	}
// }
const getNewAccessToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const newAccessToken = yield (0, userTokens_1.createNewAccessTokenWithRefreshToken)(refreshToken);
    return {
        accessToken: newAccessToken,
    };
});
const changePasswordIntoDB = (oldPassword, newPassword, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(decodedToken.userId);
    const isOldPasswordMatch = yield bcryptjs_1.default.compare(oldPassword, user.password);
    if (!isOldPasswordMatch) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Old Password doesn't match");
    }
    // check the old password and new password are same
    if (oldPassword === newPassword) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'New Password must be different from Old Password');
    }
    // password can't be incudes user email
    if (newPassword.includes(user.email)) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Password can not includes user email');
    }
    user.password = yield (0, passwordHashing_1.default)(newPassword);
    yield user.save();
});
const setPasswordIntoDB = (userId, plainPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'User not found');
    }
    // check user is google auth or not
    const checkGoogleAuth = user.auths.some((providerObj) => (providerObj.provider = 'google'));
    if (user.password && checkGoogleAuth) {
        // setup user new password
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Password is already set. change password if you forget your previous password');
    }
    const passHashing = yield (0, passwordHashing_1.default)(plainPassword);
    const credentialProvider = {
        provider: 'credentials',
        providerId: user.email,
    };
    const auths = [...user.auths, credentialProvider];
    user.password = passHashing;
    user.auths = auths;
    yield user.save();
});
const forgotPasswordIntoDB = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield user_model_1.UserModel.findOne({ email });
    if (!isUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "This user doesn't exist");
    }
    if (isUserExist.isActive === user_interface_1.IsActive.BLOCKED ||
        isUserExist.isActive === user_interface_1.IsActive.INACTIVE) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `User is ${isUserExist.isActive}`);
    }
    if (isUserExist.isDeleted) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'user is removed');
    }
    if (!isUserExist.isVerified) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'user is not verified');
    }
    const jwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role,
    };
    const resetToken = jsonwebtoken_1.default.sign(jwtPayload, env_1.environmentVariables.JWT_ACCESS_SECRET, {
        expiresIn: '10m',
    });
    const resetUILink = `${env_1.environmentVariables.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`;
    (0, sendEmail_1.sendMail)({
        to: isUserExist.email,
        subject: 'Password Reset',
        templateName: 'forgetPassword',
        templateData: {
            name: isUserExist.name,
            resetUILink,
        },
    });
    // http://localhost:5173/reset-password?id=68834d631567f07b17974762&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODgzNGQ2MzE1NjdmMDdiMTc5NzQ3NjIiLCJlbWFpbCI6Im1kamFzaW0ucGhAZ21haWwuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NTM1Mjk1MTYsImV4cCI6MTc1MzUzMDExNn0.6EwtnsSGMutZTv6Ip787IXbeoVUoJOAeokSoRUNJp2I
});
const resetPasswordIntoDB = (payload, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload.id !== decodedToken.userId) {
        throw new AppError_1.default(401, "you don't have permission to change this password");
    }
    const isUserExist = yield user_model_1.UserModel.findById(decodedToken.userId);
    if (!isUserExist) {
        throw new AppError_1.default(401, "This uer doesn't Exist!");
    }
    isUserExist.password = yield (0, passwordHashing_1.default)(payload.newPassword);
    yield isUserExist.save();
});
exports.AuthServices = {
    getNewAccessToken,
    resetPasswordIntoDB,
    setPasswordIntoDB,
    forgotPasswordIntoDB,
    changePasswordIntoDB,
};
