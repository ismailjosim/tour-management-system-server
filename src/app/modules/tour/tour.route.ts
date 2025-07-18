import { Router } from 'express'
import { TourControllers } from './tour.controller'
import validateSchema from '../../middlewares/validateRequest'
import { TourSchemaValidation } from './tour.validation'
import checkAuth from '../../middlewares/checkAuth'
import { Role } from '../user/user.interface'

const router = Router()

router.post(
	'/create-tour-types',
	checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
	validateSchema(TourSchemaValidation.tourTypeValidation),
	TourControllers.crateTourType,
)
router.get('/tour-types', TourControllers.getAllTourType)
router.patch(
	'/tour-types/:id',
	checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
	validateSchema(TourSchemaValidation.tourTypeValidation),
	TourControllers.updateTourType,
)
router.delete(
	'/tour-types/:id',
	checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
	TourControllers.deleteTourType,
)

export const TourRoutes = router
