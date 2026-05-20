import express from 'express';
import { GuideController } from './guide.controller';
import validateSchema from '../../middlewares/validateRequest';
import { GuideValidation } from './guide.validation';
import checkAuth from '../../middlewares/checkAuth';
import { Role } from '../user/user.interface';
import { multerUpload } from '../../configs/multer.config';

const router = express.Router();

/*
 * ========================
 * User (Guide) Endpoints
 * ========================
 */
router.post(
  '/apply',
  checkAuth(...Object.values(Role)),
  multerUpload.single('file'),
  validateSchema(GuideValidation.applyGuideSchema),
  GuideController.applyGuide
);

router.get('/public', GuideController.getPublicGuides);

router.get('/me/profile', checkAuth(...Object.values(Role)), GuideController.getMyProfile);

router.patch(
  '/me/profile', // validateRequest(GuideValidation.updateMyProfileSchema),
  checkAuth(Role.GUIDE),
  GuideController.updateMyProfile
);

router.patch('/me/availability', checkAuth(Role.GUIDE), GuideController.updateMyAvailability);

router.get('/me/tours', checkAuth(Role.GUIDE), GuideController.getMyTours);

router.get('/me/bookings', checkAuth(Role.GUIDE), GuideController.getMyBookings);

router.get('/me/bookings/:bookingId', checkAuth(Role.GUIDE), GuideController.getMyBookingDetails);

router.get('/me/schedule', checkAuth(Role.GUIDE), GuideController.getMyUpcomingSchedule);

router.get('/me/stats', checkAuth(Role.GUIDE), GuideController.getMyStats);

router.get('/me/earnings', checkAuth(Role.GUIDE), GuideController.getMyEarnings);

router.get('/me/reviews', checkAuth(Role.GUIDE), GuideController.getMyReviews);

// Backward-compatible guide dashboard aliases.
router.get('/my-tours', checkAuth(Role.GUIDE), GuideController.getMyTours);

router.get('/my-stats', checkAuth(Role.GUIDE), GuideController.getMyStats);

// Get available guides for a specific tour
router.get('/available/:tourId', GuideController.getAvailableGuidesForTour);

router.get('/:id', GuideController.getSingleGuide);

/*
 * ========================
 * Admin Endpoints
 * 1st route: update guide application
 * 2nd route: get all guides
 * ========================
 */

router.patch(
  '/:guideId',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  GuideController.approveOrRejectGuide
);

router.get('/', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), GuideController.getAllGuides);

router.delete('/:guideId', GuideController.deleteGuide);

export const GuideRoutes = router;
