import express from 'express'
import { GuideController } from './guide.controller'
import validateSchema from '../../middlewares/validateRequest'
import { GuideValidation } from './guide.validation'
import checkAuth from '../../middlewares/checkAuth'
import { Role } from '../user/user.interface'
import { multerUpload } from '../../configs/multer.config'

const router = express.Router()

/**
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

// GET /api/v1/guide?status=APPROVED&division=123
router.get('/', GuideController.getAllGuides)

// GET /api/v1/guide/:id
router.get('/:id', GuideController.getSingleGuide)

// GET /api/v1/guide/me
router.get('/me', GuideController.getMyProfile)

// PATCH /api/v1/guide/me
router.patch(
	'/me',
	// validateRequest(GuideValidation.updateMyProfileSchema),
	GuideController.updateMyProfile,
)

// GET /api/v1/guide/my-tours
router.get('/my-tours', GuideController.getMyTours)

// GET /api/v1/guide/my-stats
router.get('/my-stats', GuideController.getMyStats)

/**
 * ========================
 * Admin Endpoints
 * ========================
 */

// POST /api/v1/guide/approve/:guideId
router.post(
	'/approve/:guideId',
	// validateRequest(GuideValidation.approveGuideSchema),
	GuideController.approveOrRejectGuide,
)

router.patch(
	'/:guideId',
	// validateRequest(GuideValidation.updateGuideSchema),
	GuideController.updateGuide,
)

router.delete('/:guideId', GuideController.deleteGuide)

export const GuideRoutes = router
