import z from 'zod'

const tourTypeValidation = z.object({
	name: z
		.string({ invalid_type_error: 'Name must be a string value' })
		.min(2, {
			message: 'Name must be minimum 2 characters',
		})
		.max(50, { message: 'Name is too long' }),
})

export const TourSchemaValidation = {
	tourTypeValidation,
}
