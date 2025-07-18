import z from 'zod'

const createDivisionSchemaValidation = z.object({
	name: z
		.string({
			required_error: 'Name is required',
			invalid_type_error: 'Name must be a string',
		})
		.min(1)
		.trim(),
	thumbnail: z
		.string({
			invalid_type_error: 'Thumbnail must be a string (URL)',
		})
		.url('Invalid URL format for thumbnail')
		.optional(),
	description: z
		.string({
			invalid_type_error: 'Description must be a string',
		})
		.trim()
		.optional(),
})
const updateDivisionSchemaValidation = z.object({
	name: z
		.string({
			invalid_type_error: 'Name must be a string',
		})
		.trim()
		.min(1)
		.optional(),

	thumbnail: z
		.string({
			invalid_type_error: 'Thumbnail must be a string (URL)',
		})
		.url('Invalid URL format for thumbnail')
		.optional(),

	description: z
		.string({
			invalid_type_error: 'Description must be a string',
		})
		.trim()
		.optional(),
})

export const DivisionSchemaValidation = {
	createDivisionSchemaValidation,
	updateDivisionSchemaValidation,
}
