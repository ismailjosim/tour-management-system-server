"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DivisionSchemaValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const createDivisionSchemaValidation = zod_1.default.object({
    name: zod_1.default
        .string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be a string',
    })
        .min(1)
        .trim(),
    thumbnail: zod_1.default
        .string({
        invalid_type_error: 'Thumbnail must be a string (URL)',
    })
        .url('Invalid URL format for thumbnail')
        .optional(),
    description: zod_1.default
        .string({
        invalid_type_error: 'Description must be a string',
    })
        .trim()
        .optional(),
});
const updateDivisionSchemaValidation = zod_1.default.object({
    name: zod_1.default
        .string({
        invalid_type_error: 'Name must be a string',
    })
        .trim()
        .min(1)
        .optional(),
    thumbnail: zod_1.default
        .string({
        invalid_type_error: 'Thumbnail must be a string (URL)',
    })
        .url('Invalid URL format for thumbnail')
        .optional(),
    description: zod_1.default
        .string({
        invalid_type_error: 'Description must be a string',
    })
        .trim()
        .optional(),
});
exports.DivisionSchemaValidation = {
    createDivisionSchemaValidation,
    updateDivisionSchemaValidation,
};
