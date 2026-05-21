// ========================================
// tour.validation.ts
// ========================================
import z from 'zod';

const tourTypeValidationSchema = z.object({
  name: z
    .string({ invalid_type_error: 'Name must be a string value' })
    .min(2, {
      message: 'Name must be minimum 2 characters',
    })
    .max(50, { message: 'Name is too long' }),
});

const locationInMapSchema = z.object({
  title: z.string().min(1, 'Location title is required'),
  lat: z.number(),
  lng: z.number(),
});

const createTourValidationSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  location: z.string().optional(),
  costFrom: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  tourType: z.string(),
  included: z.array(z.string()).optional(),
  excluded: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  tourPlan: z.array(z.string()).optional(),
  maxGuest: z.number().optional(),
  minAge: z.number().optional(),
  division: z.string(),
  departureLocation: z.string().optional(),
  arrivalLocation: z.string().optional(),
  departureLocationInMap: locationInMapSchema.optional(),
  arrivalLocationInMap: locationInMapSchema.optional(),
});

const updateTourValidationSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  images: z.array(z.string()).optional(),
  costFrom: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  tourType: z.string().optional(),
  included: z.array(z.string()).optional(),
  excluded: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  tourPlan: z.array(z.string()).optional(),
  maxGuest: z.number().optional(),
  minAge: z.number().optional(),
  departureLocation: z.string().optional(),
  arrivalLocation: z.string().optional(),
  departureLocationInMap: locationInMapSchema.optional(),
  arrivalLocationInMap: locationInMapSchema.optional(),
  deleteImage: z.array(z.string()).optional(),
});

export const TourSchemaValidation = {
  tourTypeValidationSchema,
  createTourValidationSchema,
  updateTourValidationSchema,
};
