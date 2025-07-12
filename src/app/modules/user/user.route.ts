import { Router } from 'express'
import { UserControllers } from './user.controller'
import validateSchema from '../../middlewares/validateRequest'
import { UserSchemaValidation } from './user.validation'

const router = Router()

router.post(
	'/register',
	validateSchema(UserSchemaValidation.createUserSchemaValidation),
	UserControllers.crateUser,
)
router.get('/', UserControllers.getAllUsers)

export const UserRoutes = router
