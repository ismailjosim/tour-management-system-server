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
exports.cloudinaryUpload = exports.deleteImageFromCloudinary = exports.uploadBufferToCloudinary = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const cloudinary_1 = require("cloudinary");
const env_1 = require("./env");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const stream_1 = __importDefault(require("stream"));
cloudinary_1.v2.config({
    cloud_name: env_1.environmentVariables.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: env_1.environmentVariables.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: env_1.environmentVariables.CLOUDINARY.CLOUDINARY_API_SECRET,
});
const uploadBufferToCloudinary = (buffer, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return new Promise((resolve, reject) => {
            const public_id = `pdf/${fileName}-${Date.now()}`;
            const bufferStream = new stream_1.default.PassThrough();
            bufferStream.end(buffer);
            cloudinary_1.v2.uploader
                .upload_stream({
                resource_type: 'auto',
                public_id: public_id,
                folder: 'pdf',
            }, (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            })
                .end(buffer);
        });
    }
    catch (error) {
        if (env_1.environmentVariables.NODE_ENV === 'development') {
            console.error('❌ Cloudinary Deletion Error:', error);
        }
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Error while Uploading File: ${error.message}`);
    }
});
exports.uploadBufferToCloudinary = uploadBufferToCloudinary;
// Delete Image from Cloudinary
const deleteImageFromCloudinary = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp)$/i;
        const match = url.match(regex);
        if (match && match[1]) {
            const publicId = match[1];
            yield cloudinary_1.v2.uploader.destroy(publicId);
            console.log(`✅ File deleted: ${publicId}`);
        }
    }
    catch (error) {
        if (env_1.environmentVariables.NODE_ENV === 'development') {
            console.error('❌ Cloudinary Deletion Error:', error);
        }
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Cloudinary Image Deletion Failed: ${error.message}`);
    }
});
exports.deleteImageFromCloudinary = deleteImageFromCloudinary;
exports.cloudinaryUpload = cloudinary_1.v2;
