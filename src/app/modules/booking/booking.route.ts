import express from 'express';
import { BookingController } from './booking.controller';
import checkAuth from '../../middlewares/checkAuth';
import { Role } from '../user/user.interface';
import { BookingValidation } from './booking.validation';
import validateSchema from '../../middlewares/validateRequest';

const router = express.Router();

router.post(
  '/',
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN), // Prevent GUIDE role from booking
  validateSchema(BookingValidation.createBookingSchema),
  BookingController.createBooking
);

router.get('/', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), BookingController.getAllBookings);

router.get('/my-bookings', checkAuth(...Object.values(Role)), BookingController.getUserBookings);

// NEW: Get pending approvals for guide
router.get('/guide/pending-approvals', checkAuth(Role.GUIDE), BookingController.getGuideApprovals);

router.get('/:bookingId', checkAuth(...Object.values(Role)), BookingController.getSingleBooking);

// NEW: Approve or reject booking by guide
router.patch(
  '/:bookingId/guide-approval',
  checkAuth(Role.GUIDE),
  validateSchema(BookingValidation.approveBookingSchema),
  BookingController.approveOrRejectBooking
);

// NEW: Mark tour as complete
router.patch(
  '/:bookingId/complete',
  checkAuth(Role.USER, Role.GUIDE),
  validateSchema(BookingValidation.completeBookingSchema),
  BookingController.markTourComplete
);

router.patch(
  '/:bookingId/status',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateSchema(BookingValidation.updateBookingStatusSchema),
  BookingController.updateBookingStatus
);

export const BookingRoutes = router;
