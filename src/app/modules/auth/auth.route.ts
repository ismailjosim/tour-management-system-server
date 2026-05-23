import { NextFunction, Request, Response, Router } from 'express';
import { AuthControllers } from './auth.controller';
import checkAuth from '../../middlewares/checkAuth';
import { Role } from '../user/user.interface';
import passport from 'passport';
import { environmentVariables } from '../../configs/env';
import { createRateLimiter } from '../../middlewares/security';

const router = Router();

const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts. Please try again later.',
  keyPrefix: 'auth',
});

router.post('/login', authRateLimiter, AuthControllers.credentialsLogin);
router.post('/refresh-token', AuthControllers.getNewAccessToken);
router.post('/logout', AuthControllers.logout);
router.post('/change-password', checkAuth(...Object.values(Role)), AuthControllers.changePassword);
router.post('/set-password', checkAuth(...Object.values(Role)), AuthControllers.setPassword);

router.post('/forgot-password', authRateLimiter, AuthControllers.forgotPassword);
router.post('/reset-password', authRateLimiter, AuthControllers.resetPassword);

router.get('/google', async (req: Request, res: Response, next: NextFunction) => {
  const redirect = req.query?.redirect || '/';
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: redirect as string,
  })(req, res, next);
});
// api/v1/auth/google/callback?state=/booking or /
const message = 'there is something wrong. Please Contact With our Team';
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${environmentVariables.FRONTEND_URL}/login?error=${message}`,
  }),
  AuthControllers.googleCallbackController
);

export const AuthRoutes = router;
