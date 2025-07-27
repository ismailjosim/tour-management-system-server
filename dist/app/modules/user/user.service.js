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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_interface_1 = require("./user.interface");
const user_model_1 = require("./user.model");
const passwordHashing_1 = __importDefault(require("../../utils/passwordHashing"));
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const user_constant_1 = require("./user.constant");
const createUserIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload, rest = __rest(payload, ["email", "password"]);
    const isExist = yield user_model_1.UserModel.findOne({ email });
    if (isExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'This user is already exist.');
    }
    const hashedPassword = yield (0, passwordHashing_1.default)(password);
    const authProvider = {
        provider: 'credentials',
        providerId: email,
    };
    const user = yield user_model_1.UserModel.create(Object.assign({ email, password: hashedPassword, auths: [authProvider] }, rest));
    return user;
});
const getAllUsersFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(user_model_1.UserModel.find(), query);
    const users = queryBuilder
        .search(user_constant_1.userSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        users.build(),
        queryBuilder.getMeta(),
    ]);
    return {
        data,
        meta,
    };
});
const getMeFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield user_model_1.UserModel.findById(userId).select('-password');
    return data;
});
const getSingleUserFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.UserModel.findById(id).select('-password');
    return user;
});
const updateUserIntoDB = (userId, payload, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    //* if user role is not admin and supper. he can't updated other's user info
    if (decodedToken.role !== user_interface_1.Role.USER || decodedToken.role !== user_interface_1.Role.GUIDE) {
        if (userId !== decodedToken.userId) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'You are not authorized');
        }
    }
    // if user is not found
    const isUserExist = yield user_model_1.UserModel.findById(userId);
    if (!isUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'This User is not found');
    }
    // if super admin wants to update user Info
    if (decodedToken.role !== user_interface_1.Role.ADMIN &&
        isUserExist.role === user_interface_1.Role.SUPER_ADMIN) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'You are not authorized');
    }
    // * update user role
    if (payload.role) {
        if (decodedToken.role === user_interface_1.Role.USER || decodedToken.role === user_interface_1.Role.GUIDE) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, 'You are not authorized to this action');
        }
        // if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
        // 	throw new AppError(
        // 		httpStatus.FORBIDDEN,
        // 		'You are not authorized to this action FROM SECOND IF',
        // 	)
        // }
    }
    if (payload.isActive || payload.isDeleted || payload.isVerified) {
        if (decodedToken.role === user_interface_1.Role.USER || decodedToken.role === user_interface_1.Role.GUIDE) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, 'You are not authorized to this action');
        }
    }
    const newUpdatedUser = yield user_model_1.UserModel.findByIdAndUpdate(userId, payload, {
        new: true,
        runValidators: true,
    });
    return newUpdatedUser;
});
exports.UserServices = {
    createUserIntoDB,
    getAllUsersFromDB,
    getSingleUserFromDB,
    updateUserIntoDB,
    getMeFromDB,
};
/*
 * email can't be updated
 * name, phone, password can be updated by the user.role === 'USER'
 * if password update => re-hashing the password
 * role, isDeleted... => only admin and super_admin can update it.
 * Prevent admin to promote => super_admin. only super_admin can promote super_admin
 */
