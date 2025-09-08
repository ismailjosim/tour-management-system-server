import { z } from 'zod'

const createReviewZodSchema = z.object({
	tour: z.string(),
	user: z.string(),
	rating: z.number(),
	comments: z.string(),
})

export const ReviewValidation = {
	createReviewZodSchema,
}
