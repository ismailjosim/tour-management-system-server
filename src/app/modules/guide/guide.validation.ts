import { z } from 'zod'

const applyGuideSchema = z.object({
	body: z.object({
		user: z
			.string({ required_error: 'User ID is required' })
			.regex(/^[0-9a-fA-F]{24}$/, 'Invalid Mongo ObjectId'),
		division: z
			.string({ required_error: 'Division ID is required' })
			.regex(/^[0-9a-fA-F]{24}$/, 'Invalid Mongo ObjectId'),
		nidPhoto: z.string({ required_error: 'NID photo is required' }),
		status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
	}),
})

export const GuideValidation = {
	applyGuideSchema,
}
