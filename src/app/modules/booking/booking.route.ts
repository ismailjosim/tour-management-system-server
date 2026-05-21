import express from 'express';
import { BookingController } from './booking.controller';
import checkAuth from '../../middlewares/checkAuth';
import { Role } from '../user/user.interface';
import { BookingValidation } from './booking.validation';
import validateSchema from '../../middlewares/validateRequest';

const router = express.Router();

router.post(
  '/',
  checkAuth(...Object.values(Role)),
  validateSchema(BookingValidation.createBookingSchema),
  BookingController.createBooking
);

router.get('/', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), BookingController.getAllBookings);

router.get('/my-bookings', checkAuth(...Object.values(Role)), BookingController.getUserBookings);

router.get('/:bookingId', checkAuth(...Object.values(Role)), BookingController.getSingleBooking);

router.patch(
  '/:bookingId/status',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateSchema(BookingValidation.updateBookingStatusSchema),
  BookingController.updateBookingStatus
);

export const BookingRoutes = router;
