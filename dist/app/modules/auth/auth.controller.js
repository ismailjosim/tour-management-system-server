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
exports.AuthControllers = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const auth_service_1 = require("./auth.service");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const setCookie_1 = require("../../utils/setCookie");
const userTokens_1 = require("../../utils/userTokens");
const env_1 = require("../../configs/env");
const passport_1 = __importDefault(require("passport"));
// googleCallbackController
const googleCallbackController = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let redirectTo = req.query.state ? req.query.state : '';
    if (redirectTo.startsWith('/')) {
        redirectTo = redirectTo.slice(1);
    }
    const user = req.user;
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'User Not Found');
    }
    const token = (0, userTokens_1.createUserToken)(user);
    (0, setCookie_1.setAuthCookie)(res, token);
    res.redirect(`${env_1.environmentVariables.FRONTEND_URL}/${redirectTo}`);
}));
// credentialsLogin
const credentialsLogin = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // const loginInfo = await AuthServices.credentialsLogin(req.body)
    passport_1.default.authenticate('local', (err, user, info) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            //! this don't work
            // return new AppError(httpStatus.BAD_REQUEST, err)
            // * to do that
            // return next(err) //* way-01
            return next(new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, err)); //* way-2: this is organized way.
        }
        if (!user) {
            return next(new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, info === null || info === void 0 ? void 0 : info.message));
        }
        // generate access & refresh Token
        const tokens = (0, userTokens_1.createUserToken)(user);
        // 🧼 Remove password before returning user data
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;
        // * set token access and refresh
        (0, setCookie_1.setAuthCookie)(res, tokens);
        (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_codes_1.default.CREATED,
            message: 'User login successfully',
            data: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                user: userWithoutPassword,
            },
        });
    }))(req, res, next);
}));
// getNewAccessToken
const getNewAccessToken = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    // const refreshToken = req.headers.authorization as string
    // show error message if refreshToken is not available
    if (!refreshToken) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'No Refresh Token received for cookies');
    }
    const loginInfo = yield auth_service_1.AuthServices.getNewAccessToken(refreshToken);
    // send accessToken in cookies
    // res.cookie('accessToken', loginInfo.accessToken, {
    // 	httpOnly: true,
    // 	secure: false,
    // })
    (0, setCookie_1.setAuthCookie)(res, loginInfo);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: 'New Access Token Generate successfully',
        data: {
            accessToken: loginInfo.accessToken,
        },
    });
}));
// user logout
const logout = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // ❌ Clear access token cookie
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: false, // ✅ Set to true in production (HTTPS)
        sameSite: 'lax',
    });
    // ❌ Clear refresh token cookie
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
    });
    // ✅ Send logout confirmation
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: 'User Logged Out Successfully',
        data: null,
    });
}));
// section: Password change, forget, reset and set
//* if a logged in your want to change password
const changePassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedToken = req.user;
    yield auth_service_1.AuthServices.changePasswordIntoDB(oldPassword, newPassword, decodedToken);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'Password reset Successfully',
        data: null,
    });
}));
//* if a google login in user want to set a password
const setPassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { password } = req.body;
    const decodedToken = req.user;
    yield auth_service_1.AuthServices.setPasswordIntoDB(decodedToken.userId, password);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'Password set Successfully',
        data: null,
    });
}));
// user forget password but not currently logged in
const forgotPassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    yield auth_service_1.AuthServices.forgotPasswordIntoDB(email);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'Email sent Successfully',
        data: null,
    });
}));
const resetPassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    const decodedToken = req.user;
    yield auth_service_1.AuthServices.resetPasswordIntoDB(payload, decodedToken);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'Password reset Successfully',
        data: null,
    });
}));
exports.AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logout,
    resetPassword,
    changePassword,
    setPassword,
    forgotPassword,
    googleCallbackController,
};
