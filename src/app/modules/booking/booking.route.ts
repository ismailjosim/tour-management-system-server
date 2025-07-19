import express from 'express';
import { BookingController } from './booking.controller';
// import { BookingValidation } from './booking.validation'; // Uncomment if needed
// import validateRequest from '../../middlewares/validateRequest'; // Assuming you have a validation middleware

const router = express.Router();

router.post(
  '/create-booking',
  // validateRequest(BookingValidation.createBookingZodSchema), // Uncomment and use your validation middleware
  BookingController.createBooking
);

// Add other routes here (e.g., GET /, GET /:id, PATCH /:id, DELETE /:id)

export const BookingRoutes = router;
