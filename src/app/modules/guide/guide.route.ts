import express from 'express'
import { GuideController } from './guide.controller'
import validateSchema from '../../middlewares/validateRequest'
import { GuideValidation } from './guide.validation'
import checkAuth from '../../middlewares/checkAuth'
import { Role } from '../user/user.interface'
import { multerUpload } from '../../configs/multer.config'

const router = express.Router()

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
	GuideController.applyGuide,
)

router.get('/:id', GuideController.getSingleGuide)

router.get(
	'/me/profile',
	checkAuth(...Object.values(Role)),
	GuideController.getMyProfile,
)

router.patch(
	'/me', // validateRequest(GuideValidation.updateMyProfileSchema),
	GuideController.updateMyProfile,
)

// GET /api/v1/guide/my-tours
router.get('/my-tours', GuideController.getMyTours)

// GET /api/v1/guide/my-stats
router.get('/my-stats', GuideController.getMyStats)

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
	GuideController.approveOrRejectGuide,
)

router.get(
	'/',
	checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
	GuideController.getAllGuides,
)

router.delete('/:guideId', GuideController.deleteGuide)

export const GuideRoutes = router
