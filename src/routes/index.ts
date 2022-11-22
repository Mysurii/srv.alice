import { IntentsController } from './../controllers/intents.controller';
import { rateLimiter } from './../middlewares/rateLimiter';
import type { Application, Router } from 'express';
import type { RateLimitRequestHandler } from 'express-rate-limit';
import userController from '../controllers/user.controller';
import { loginRateLimiter } from '../middlewares/rateLimiter';
import CustomizationController from '../controllers/customization.controller';

export const _routes: [string, Router, RateLimitRequestHandler?][] = [
  ['/api/auth', userController, loginRateLimiter],
  ['/api/intents', IntentsController, rateLimiter],
  ['/api/builder/customization', CustomizationController],
];

export const routes = (app: Application) => {
  _routes.forEach(([url, controller, rateLimiter]) => {
    if (typeof rateLimiter !== 'undefined') {
      app.use(url, controller, rateLimiter);
    } else {
      app.use(url, controller);
    }
  });
};
