import express, { Application, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './app/routes';
import { globalErrorHandler } from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import passport from 'passport';
import expressSession from 'express-session';
import './app/configs/passport';
import { environmentVariables } from './app/configs/env';
import {
  createRateLimiter,
  lightweightCompression,
  securityHeaders,
} from './app/middlewares/security';

const app: Application = express();

// parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(securityHeaders);
app.use(lightweightCompression);
app.use(
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 300,
    keyPrefix: 'global',
  })
);

app.use(
  expressSession({
    secret: environmentVariables.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: environmentVariables.NODE_ENV === 'production',
      sameSite: environmentVariables.NODE_ENV === 'production' ? 'none' : 'lax',
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.set('trust proxy', 1);
app.use(
  cors({
    origin: environmentVariables.FRONTEND_URL,
    credentials: true,
  })
);

//* Application Routes
app.use('/api/v1', router);

//* Basic Route for testing
app.get('/', async (_, res: Response) => {
  res.send({
    status: true,
    message: 'Welcome to Traveler: Your Next Tour Partner 🚀',
  });
});

app.use(globalErrorHandler);

// not found route
app.use(notFound);

export default app;
