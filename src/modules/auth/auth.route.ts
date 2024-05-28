import { Router, Request, Response } from 'express';
import schemaValidator from '../../middleware/schemaValidator';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import AppDataSource from '../../configs/connect-db';
import passport from 'passport';

const authService = new AuthService(AppDataSource);
const authController = new AuthController(authService);

const router = Router();

router.post('/login', schemaValidator('/auth/signIn'), (req: Request, res: Response) => {
  return authController.signIn(req, res);
});

//using only for Admin
router.post('/register-admin', (req: Request, res: Response) => {
  return authController.signUpAdmin(req, res);
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), function (req, res) {
  return authController.googleSignIn(req, res);
});

export default router;
