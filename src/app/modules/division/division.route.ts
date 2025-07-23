import { Router } from 'express'
import { Role } from '../user/user.interface'
import checkAuth from '../../middlewares/checkAuth'
import validateSchema from '../../middlewares/validateRequest'
import { DivisionSchemaValidation } from './division.validation'
import { DivisionControllers } from './division.controller'
import { multerUpload } from '../../configs/multer.config'

const router = Router()

router.post(
	'/create',
	checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
	multerUpload.single('file'),
	validateSchema(DivisionSchemaValidation.createDivisionSchemaValidation),
	DivisionControllers.createDivision,
)
router.get('/', DivisionControllers.getAllDivisions)
router.get('/:slug', DivisionControllers.getSingleDivision)
router.patch(
	'/:id',
	checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
	multerUpload.single('file'),
	validateSchema(DivisionSchemaValidation.updateDivisionSchemaValidation),
	DivisionControllers.updateDivision,
)
router.delete(
	'/:id',
	checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
	DivisionControllers.deleteDivision,
)

export const DivisionRoutes = router
