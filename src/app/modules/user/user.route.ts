import { Router } from 'express';
import { UserControllers } from './user.controller';
import validateSchema from '../../middlewares/validateRequest';
import { UserSchemaValidation } from './user.validation';
import checkAuth from '../../middlewares/checkAuth';
import { Role } from './user.interface';
import { multerUpload } from '../../configs/multer.config';

const router = Router();

router.post(
  '/register',
  validateSchema(UserSchemaValidation.createUserSchemaValidation),
  UserControllers.crateUser
);
router.get('/', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllUsers);
router.get('/me', checkAuth(...Object.values(Role)), UserControllers.getMe);
router.get('/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getSingleUser);

router.patch(
  '/:id',
  checkAuth(...Object.values(Role)),
  validateSchema(UserSchemaValidation.updateUserSchemaValidation),
  UserControllers.updateUser
);
router.patch(
  '/me/picture/:id',
  checkAuth(...Object.values(Role)),
  multerUpload.single('file'),
  validateSchema(UserSchemaValidation.updateUserSchemaValidation),
  UserControllers.updateUserProfilePicture
);

export const UserRoutes = router;
