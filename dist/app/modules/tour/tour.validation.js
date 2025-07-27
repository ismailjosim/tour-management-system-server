"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TourSchemaValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const tourTypeValidationSchema = zod_1.default.object({
    name: zod_1.default
        .string({ invalid_type_error: 'Name must be a string value' })
        .min(2, {
        message: 'Name must be minimum 2 characters',
    })
        .max(50, { message: 'Name is too long' }),
});
const createTourValidationSchema = zod_1.default.object({
    title: zod_1.default.string(),
    description: zod_1.default.string().optional(),
    images: zod_1.default.array(zod_1.default.string()).optional(),
    location: zod_1.default.string().optional(),
    costFrom: zod_1.default.number().optional(),
    startDate: zod_1.default.string().optional().optional(),
    endDate: zod_1.default.string().optional().optional(),
    tourType: zod_1.default.string(), // <- changed here
    included: zod_1.default.array(zod_1.default.string()).optional(),
    excluded: zod_1.default.array(zod_1.default.string()).optional(),
    amenities: zod_1.default.array(zod_1.default.string()).optional(),
    tourPlan: zod_1.default.array(zod_1.default.string()).optional(),
    maxGuest: zod_1.default.number().optional(),
    minAge: zod_1.default.number().optional(),
    division: zod_1.default.string(),
    departureLocation: zod_1.default.string().optional(),
    arrivalLocation: zod_1.default.string().optional(),
});
const updateTourValidationSchema = zod_1.default.object({
    title: zod_1.default.string().optional(),
    description: zod_1.default.string().optional(),
    location: zod_1.default.string().optional(),
    images: zod_1.default.array(zod_1.default.string()).optional(),
    costFrom: zod_1.default.number().optional(),
    startDate: zod_1.default.string().optional().optional(),
    endDate: zod_1.default.string().optional().optional(),
    tourType: zod_1.default.string().optional(), // <- changed here
    included: zod_1.default.array(zod_1.default.string()).optional(),
    excluded: zod_1.default.array(zod_1.default.string()).optional(),
    amenities: zod_1.default.array(zod_1.default.string()).optional(),
    tourPlan: zod_1.default.array(zod_1.default.string()).optional(),
    maxGuest: zod_1.default.number().optional(),
    minAge: zod_1.default.number().optional(),
    departureLocation: zod_1.default.string().optional(),
    arrivalLocation: zod_1.default.string().optional(),
    deleteImage: zod_1.default.array(zod_1.default.string()).optional(),
});
exports.TourSchemaValidation = {
    tourTypeValidationSchema,
    createTourValidationSchema,
    updateTourValidationSchema,
};
