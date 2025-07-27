import { z } from 'zod'
import { IsActive, Role } from './user.interface'

// Password schema with separate validation rules
// Note: superRefine method return all error if every error is true
const passwordSchema = z.string().superRefine((val, ctx) => {
	if (val.length < 8) {
		ctx.addIssue({
			code: z.ZodIssueCode.too_small,
			type: 'string',
			minimum: 8,
			inclusive: true,
			message: 'Password must be at least 8 characters long',
		})
	}

	if (!/[A-Z]/.test(val)) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: 'Password must contain at least 1 uppercase letter',
		})
	}

	if (!/[a-z]/.test(val)) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: 'Password must contain at least 1 lowercase letter',
		})
	}

	if (!/\d/.test(val)) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: 'Password must contain at least 1 digit',
		})
	}
})

// Auth provider validation
const authProviderSchema = z.object({
	provider: z.string().min(1, 'Provider is required'),
	providerId: z.string().min(1, 'Provider ID is required'),
})

// MongoDB ObjectId validation (basic)
const objectIdSchema = z
	.string()
	.length(24, { message: 'Invalid MongoDB ObjectId format' })

// User creation schema
const createUserSchemaValidation = z.object({
	name: z
		.string({ invalid_type_error: 'Name must be a string value' })
		.min(2, {
			message: 'Name must be minimum 2 characters',
		})
		.max(50, { message: 'Name is too long' }),

	password: passwordSchema.optional(),
	email: z.string().email({ message: 'Invalid email address' }),
	phone: z
		.string({ invalid_type_error: 'Phone must be a string' })
		.regex(/^(?:\+8801|8801|01)[0-9]{9}$/, {
			message: 'Phone number must be a valid Bangladeshi number',
		})
		.optional(),

	address: z
		.string({ invalid_type_error: 'Address must be a string' })
		.max(255, { message: 'Address is too long' })
		.optional(),
})

// Update User Schema
const updateUserSchemaValidation = z.object({
	name: z
		.string()
		.min(2, { message: 'Name must be minimum 2 characters' })
		.max(50, { message: 'Name is too long' })
		.optional(),

	phone: z
		.string({ invalid_type_error: 'Phone must be a string' })
		.regex(/^(?:\+8801|8801|01)[0-9]{9}$/, {
			message: 'Phone number must be a valid Bangladeshi number',
		})
		.optional(),

	picture: z.string().url({ message: 'Invalid picture URL' }).optional(),

	address: z.string().max(255, { message: 'Address is too long' }).optional(),

	role: z.nativeEnum(Role).optional(),

	isDeleted: z.boolean().optional(),

	isActive: z.nativeEnum(IsActive).optional(),

	isVerified: z.boolean().optional(),

	auths: z.array(authProviderSchema).optional(),

	booking: z.array(objectIdSchema).optional(),

	guides: z.array(objectIdSchema).optional(),
})

export const UserSchemaValidation = {
	createUserSchemaValidation,
	updateUserSchemaValidation,
}
