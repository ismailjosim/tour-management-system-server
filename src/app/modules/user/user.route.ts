import { Router } from 'express'
import { UserControllers } from './user.controller'
import validateSchema from '../../middlewares/validateRequest'
import { UserSchemaValidation } from './user.validation'
import checkAuth from '../../middlewares/checkAuth'
import { Role } from './user.interface'

const router = Router()

router.post(
	'/register',
	validateSchema(UserSchemaValidation.createUserSchemaValidation),
	UserControllers.crateUser,
)
router.get(
	'/',
	checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
	UserControllers.getAllUsers,
)

export const UserRoutes = router
