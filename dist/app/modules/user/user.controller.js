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
exports.UserControllers = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const user_service_1 = require("./user.service");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const crateUser = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.UserServices.createUserIntoDB(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: 'User Created successfully',
        data: result,
    });
}));
const getAllUsers = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.UserServices.getAllUsersFromDB(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: 'All User Retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
}));
const getMe = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedToken = req.user;
    const result = yield user_service_1.UserServices.getMeFromDB(decodedToken.userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: 'User info Retrieved successfully',
        data: result,
    });
}));
const getSingleUser = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.UserServices.getSingleUserFromDB(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: 'User Retrieved successfully',
        data: result,
    });
}));
const updateUser = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const token = req.headers.authorization;
    // verify token: method-01
    // const tokenVerify = verifyToken(
    // 	token as string,
    // 	environmentVariables.JWT_ACCESS_SECRET,
    // ) as JwtPayload
    // verify token: method-02
    const tokenVerify = req.body;
    const payload = req.body;
    const result = yield user_service_1.UserServices.updateUserIntoDB(userId, payload, tokenVerify);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: 'User Updated successfully',
        data: result,
    });
}));
exports.UserControllers = {
    crateUser,
    getAllUsers,
    getSingleUser,
    updateUser,
    getMe,
};
