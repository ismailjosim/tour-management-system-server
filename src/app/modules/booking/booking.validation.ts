import { z } from 'zod';
import { BOOKING_STATUS } from './booking.interface';

const createBookingSchema = z.object({
  tour: z.string(),
  guide: z.string().optional(),
  guestCount: z.number().int().positive(),
});
const updateBookingStatusSchema = z.object({
  status: z.nativeEnum(BOOKING_STATUS),
});

// NEW: Approve or reject booking schema
const approveBookingSchema = z.object({
  approved: z.boolean(),
  rejectionReason: z.string().optional(),
});

// NEW: Mark tour complete schema
const completeBookingSchema = z.object({
  completedBy: z.enum(['user', 'guide']),
});

export const BookingValidation = {
  createBookingSchema,
  updateBookingStatusSchema,
  approveBookingSchema,
  completeBookingSchema,
};
