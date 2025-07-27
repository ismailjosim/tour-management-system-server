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
exports.globalErrorHandler = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../configs/env");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const zod_1 = require("zod");
const handleDuplicateError_1 = require("../helpers/handleDuplicateError");
const handleCastError_1 = require("../helpers/handleCastError");
const handleZodValidationError_1 = require("../helpers/handleZodValidationError");
const handleMongooseValidationError_1 = require("../helpers/handleMongooseValidationError");
const cloudinary_config_1 = require("../configs/cloudinary.config");
const globalErrorHandler = (err, req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (env_1.environmentVariables.NODE_ENV === 'development') {
        console.log(err);
    }
    // ✅ Delete Single File if present
    if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) {
        try {
            yield (0, cloudinary_config_1.deleteImageFromCloudinary)(req.file.path);
        }
        catch (error) {
            console.error('❌ Failed to delete single image:', error);
        }
    }
    // ✅ Delete Multiple Files if present
    if (req.files && Array.isArray(req.files)) {
        const imgUrls = req.files.map((file) => file.path);
        yield Promise.all(imgUrls.map((url) => (0, cloudinary_config_1.deleteImageFromCloudinary)(url).catch((error) => {
            console.error(`❌ Failed to delete image: ${url}`, error);
        })));
    }
    let errorSources = [
    // {
    // 	path: 'isDeleted',
    // 	message: 'Cast Failed',
    // },
    ];
    let statusCode = 500;
    let message = 'Something Went Wrong!!';
    // Mongoose Duplicate Key Error
    if (err.code === 11000) {
        const simplifiedError = (0, handleDuplicateError_1.handleDuplicateError)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }
    // Mongoose CastError (invalid ObjectId, etc.)
    else if (err instanceof mongoose_1.default.Error.CastError) {
        const simplifiedError = (0, handleCastError_1.handleCastError)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }
    // Mongoose ValidationError
    else if (err instanceof mongoose_1.default.Error.ValidationError) {
        const simplifiedError = (0, handleZodValidationError_1.handleMongooseValidationError)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources || [];
    }
    // Zod Validation Error
    else if (err instanceof zod_1.ZodError) {
        const simplifiedError = (0, handleMongooseValidationError_1.handleZodValidationError)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources || [];
    }
    // Custom AppError
    else if (err instanceof AppError_1.default) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // General JS Error
    else if (err instanceof Error) {
        message = err.message;
    }
    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        err: env_1.environmentVariables.NODE_ENV === 'development' ? err : undefined,
        stack: env_1.environmentVariables.NODE_ENV === 'development' ? err.stack : undefined,
    });
});
exports.globalErrorHandler = globalErrorHandler;
