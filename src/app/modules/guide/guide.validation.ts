import { z } from 'zod';

const applyGuideSchema = z.object({
  user: z.string().optional(),
  country: z.string({ required_error: 'Country is required' }).min(1, 'Country is required'),
  locationDivision: z
    .string({ required_error: 'Local division is required' })
    .min(1, 'Local division is required'),
  division: z
    .string({ required_error: 'Division ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Mongo ObjectId')
    .optional(),
  nidPhoto: z
    .string({
      invalid_type_error: 'nidPhoto must be a string (URL)',
    })
    .url('Invalid URL format for nidPhoto')
    .optional(),
  nidFrontPhoto: z.string().url('Invalid URL format for nidFrontPhoto').optional(),
  nidBackPhoto: z.string().url('Invalid URL format for nidBackPhoto').optional(),
  photo: z.string().url('Invalid URL format for photo').optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
});

export const GuideValidation = {
  applyGuideSchema,
};
