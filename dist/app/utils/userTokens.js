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
exports.createNewAccessTokenWithRefreshToken = exports.createUserToken = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const env_1 = require("../configs/env");
const user_interface_1 = require("../modules/user/user.interface");
const jwt_1 = require("./jwt");
const user_model_1 = require("../modules/user/user.model");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
// create access token and user token with user info
const createUserToken = (user) => {
    // 🧾 Payload for token
    const tokenPayload = {
        userId: user._id,
        email: user.email,
        role: user.role,
    };
    // 🔑 Generate access token
    const accessToken = (0, jwt_1.generateToken)(tokenPayload, env_1.environmentVariables.JWT_ACCESS_SECRET, env_1.environmentVariables.JWT_ACCESS_EXPIRES);
    // 🔄 Generate refresh token
    const refreshToken = (0, jwt_1.generateToken)(tokenPayload, env_1.environmentVariables.REFRESH_TOKEN_SECRET, env_1.environmentVariables.REFRESH_TOKEN_EXPIRES);
    return { accessToken, refreshToken };
};
exports.createUserToken = createUserToken;
const createNewAccessTokenWithRefreshToken = (ParamsRefreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const verifyRefreshToken = (0, jwt_1.verifyToken)(ParamsRefreshToken, env_1.environmentVariables.REFRESH_TOKEN_SECRET);
    // ✅ Check if user exists
    const isUserExist = yield user_model_1.UserModel.findOne({
        email: verifyRefreshToken.email,
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
    // 🧾 Payload for token
    const tokenPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role,
    };
    // 🔑 Generate access token
    const accessToken = (0, jwt_1.generateToken)(tokenPayload, env_1.environmentVariables.JWT_ACCESS_SECRET, env_1.environmentVariables.JWT_ACCESS_EXPIRES);
    return accessToken;
});
exports.createNewAccessTokenWithRefreshToken = createNewAccessTokenWithRefreshToken;
