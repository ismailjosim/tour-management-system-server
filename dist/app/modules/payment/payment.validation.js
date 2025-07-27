"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentValidation = void 0;
const zod_1 = require("zod"); // Assuming you use Zod for validation
const createPaymentZodSchema = zod_1.z.object({
    body: zod_1.z.object({
    // Define your validation schema here
    // Example:
    // title: z.string({ required_error: 'Title is required' }),
    // description: z.string().optional(),
    }),
});
// Add other validation schemas here (e.g., update, get by ID)
exports.PaymentValidation = {
    createPaymentZodSchema,
    // ...
};
