import { Router } from 'express'
import { TourControllers } from './tour.controller'
import validateSchema from '../../middlewares/validateRequest'
import { TourSchemaValidation } from './tour.validation'
import checkAuth from '../../middlewares/checkAuth'
import { Role } from '../user/user.interface'
import { multerUpload } from '../../configs/multer.config'

const router = Router()

// Tour type routes
router.post(
	'/create-tour-types',
	checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
	validateSchema(TourSchemaValidation.tourTypeValidationSchema),
	TourControllers.crateTourType,
)
router.get('/tour-types', TourControllers.getAllTourType)
router.get('/tour-types/:id', TourControllers.getSingleTourType)
router.patch(
	'/tour-types/:id',
	checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
	validateSchema(TourSchemaValidation.tourTypeValidationSchema),
	TourControllers.updateTourType,
)
router.delete(
	'/tour-types/:id',
	checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
	TourControllers.deleteTourType,
)
// Tour route
router.post(
	'/create',
	checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
	multerUpload.array('files'),
	validateSchema(TourSchemaValidation.createTourValidationSchema),
	TourControllers.crateTour,
)

router.get('/', TourControllers.getAllTour)
router.get('/:slug', TourControllers.getSingleTour)
router.patch(
	'/:id',
	checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
	multerUpload.array('files'),
	validateSchema(TourSchemaValidation.updateTourValidationSchema),
	TourControllers.updateTour,
)
router.delete(
	'/:id',
	checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
	TourControllers.deleteTour,
)

export const TourRoutes = router
