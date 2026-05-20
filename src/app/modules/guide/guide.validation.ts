import { z } from 'zod';

const applyGuideSchema = z.object({
  user: z.string().optional(),
  division: z
    .string({ required_error: 'Division ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Mongo ObjectId'),
  nidPhoto: z
    .string({
      invalid_type_error: 'nidPhoto must be a string (URL)',
    })
    .url('Invalid URL format for nidPhoto')
    .optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
});

export const GuideValidation = {
  applyGuideSchema,
};
