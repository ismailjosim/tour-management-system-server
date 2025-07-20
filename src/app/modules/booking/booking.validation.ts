import { z } from 'zod'
import { BOOKING_STATUS } from './booking.interface'

const createBookingSchema = z.object({
	tour: z.string(),
	guestCount: z.number().int().positive(),
})
const updateBookingStatusSchema = z.object({
	status: z.nativeEnum(BOOKING_STATUS),
})

export const BookingValidation = {
	createBookingSchema,
	updateBookingStatusSchema,
}
