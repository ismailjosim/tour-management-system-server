import z from 'zod'

const tourTypeValidationSchema = z.object({
	name: z
		.string({ invalid_type_error: 'Name must be a string value' })
		.min(2, {
			message: 'Name must be minimum 2 characters',
		})
		.max(50, { message: 'Name is too long' }),
})

const createTourValidationSchema = z.object({
	title: z.string(),
	description: z.string().optional(),
	location: z.string().optional(),
	costFrom: z.number().optional(),
	startDate: z.string().optional().optional(),
	endDate: z.string().optional().optional(),
	tourType: z.string(), // <- changed here
	included: z.array(z.string()).optional(),
	excluded: z.array(z.string()).optional(),
	amenities: z.array(z.string()).optional(),
	tourPlan: z.array(z.string()).optional(),
	maxGuest: z.number().optional(),
	minAge: z.number().optional(),
	division: z.string(),
	departureLocation: z.string().optional(),
	arrivalLocation: z.string().optional(),
})

const updateTourValidationSchema = z.object({
	title: z.string().optional(),
	description: z.string().optional(),
	location: z.string().optional(),
	costFrom: z.number().optional(),
	startDate: z.string().optional().optional(),
	endDate: z.string().optional().optional(),
	tourType: z.string().optional(), // <- changed here
	included: z.array(z.string()).optional(),
	excluded: z.array(z.string()).optional(),
	amenities: z.array(z.string()).optional(),
	tourPlan: z.array(z.string()).optional(),
	maxGuest: z.number().optional(),
	minAge: z.number().optional(),
	departureLocation: z.string().optional(),
	arrivalLocation: z.string().optional(),
})

export const TourSchemaValidation = {
	tourTypeValidationSchema,
	createTourValidationSchema,
	updateTourValidationSchema,
}
