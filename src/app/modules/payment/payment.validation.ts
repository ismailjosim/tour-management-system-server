import { z } from 'zod'; // Assuming you use Zod for validation

const createPaymentZodSchema = z.object({
  body: z.object({
    // Define your validation schema here
    // Example:
    // title: z.string({ required_error: 'Title is required' }),
    // description: z.string().optional(),
  }),
});

// Add other validation schemas here (e.g., update, get by ID)

export const PaymentValidation = {
  createPaymentZodSchema,
  // ...
};
