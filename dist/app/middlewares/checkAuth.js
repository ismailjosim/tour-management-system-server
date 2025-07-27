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
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const jwt_1 = require("../utils/jwt");
const env_1 = require("../configs/env");
const user_model_1 = require("../modules/user/user.model");
const user_interface_1 = require("../modules/user/user.interface");
const checkAuth = (...authRoles) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = req.headers.authorization;
        if (!accessToken) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Token not received');
        }
        const tokenVerification = (0, jwt_1.verifyToken)(accessToken, env_1.environmentVariables.JWT_ACCESS_SECRET);
        // ✅ Check if user exists
        const isUserExist = yield user_model_1.UserModel.findOne({
            email: tokenVerification.email,
        });
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
        if (!authRoles.includes(tokenVerification.role)) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, 'Access Denied');
        }
        req.user = tokenVerification;
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.default = checkAuth;
