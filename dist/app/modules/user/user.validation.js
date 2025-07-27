"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchemaValidation = void 0;
const zod_1 = require("zod");
const user_interface_1 = require("./user.interface");
// Password schema with separate validation rules
// Note: superRefine method return all error if every error is true
const passwordSchema = zod_1.z.string().superRefine((val, ctx) => {
    if (val.length < 8) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.too_small,
            type: 'string',
            minimum: 8,
            inclusive: true,
            message: 'Password must be at least 8 characters long',
        });
    }
    if (!/[A-Z]/.test(val)) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: 'Password must contain at least 1 uppercase letter',
        });
    }
    if (!/[a-z]/.test(val)) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: 'Password must contain at least 1 lowercase letter',
        });
    }
    if (!/\d/.test(val)) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: 'Password must contain at least 1 digit',
        });
    }
});
// Auth provider validation
const authProviderSchema = zod_1.z.object({
    provider: zod_1.z.string().min(1, 'Provider is required'),
    providerId: zod_1.z.string().min(1, 'Provider ID is required'),
});
// MongoDB ObjectId validation (basic)
const objectIdSchema = zod_1.z
    .string()
    .length(24, { message: 'Invalid MongoDB ObjectId format' });
// User creation schema
const createUserSchemaValidation = zod_1.z.object({
    name: zod_1.z
        .string({ invalid_type_error: 'Name must be a string value' })
        .min(2, {
        message: 'Name must be minimum 2 characters',
    })
        .max(50, { message: 'Name is too long' }),
    password: passwordSchema.optional(),
    email: zod_1.z.string().email({ message: 'Invalid email address' }),
    phone: zod_1.z
        .string({ invalid_type_error: 'Phone must be a string' })
        .regex(/^(?:\+8801|8801|01)[0-9]{9}$/, {
        message: 'Phone number must be a valid Bangladeshi number',
    })
        .optional(),
    address: zod_1.z
        .string({ invalid_type_error: 'Address must be a string' })
        .max(255, { message: 'Address is too long' })
        .optional(),
});
// Update User Schema
const updateUserSchemaValidation = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, { message: 'Name must be minimum 2 characters' })
        .max(50, { message: 'Name is too long' })
        .optional(),
    phone: zod_1.z
        .string({ invalid_type_error: 'Phone must be a string' })
        .regex(/^(?:\+8801|8801|01)[0-9]{9}$/, {
        message: 'Phone number must be a valid Bangladeshi number',
    })
        .optional(),
    picture: zod_1.z.string().url({ message: 'Invalid picture URL' }).optional(),
    address: zod_1.z.string().max(255, { message: 'Address is too long' }).optional(),
    role: zod_1.z.nativeEnum(user_interface_1.Role).optional(),
    isDeleted: zod_1.z.boolean().optional(),
    isActive: zod_1.z.nativeEnum(user_interface_1.IsActive).optional(),
    isVerified: zod_1.z.boolean().optional(),
    auths: zod_1.z.array(authProviderSchema).optional(),
    booking: zod_1.z.array(objectIdSchema).optional(),
    guides: zod_1.z.array(objectIdSchema).optional(),
});
exports.UserSchemaValidation = {
    createUserSchemaValidation,
    updateUserSchemaValidation,
};
