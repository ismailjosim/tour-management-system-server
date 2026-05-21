import { z } from 'zod';

const createReviewZodSchema = z.object({
  tour: z.string(),
  user: z.string().optional(),
  guide: z.string().optional(),
  rating: z.number().min(1).max(5),
  comments: z.string().min(1),
  guideRating: z.number().min(1).max(5).optional(),
  guideComments: z.string().min(1).optional(),
});

export const ReviewValidation = {
  createReviewZodSchema,
};
