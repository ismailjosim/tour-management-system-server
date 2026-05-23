import { z } from 'zod';

const createReviewZodSchema = z.object({
  bookingId: z.string().optional(),
  booking: z.string().optional(),
  tour: z.string(),
  user: z.string().optional(),
  guide: z.string().optional(),
  rating: z.number().min(1).max(5),
  comments: z.string().min(1),
});

const guideRatingZodSchema = z.object({
  guideRating: z.number().min(1).max(5),
  guideComments: z.string().min(1),
});

export const ReviewValidation = {
  createReviewZodSchema,
  guideRatingZodSchema,
};
