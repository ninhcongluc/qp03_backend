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

router.get('/login/failed', (req, res) => {
  res.status(401).send({ message: 'Login failed' });
});
//using only for Admin
router.post('/register-admin', (req: Request, res: Response) => {
  return authController.signUpAdmin(req, res);
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: `${process.env.CLIENT_URL}/manager`,
    failureRedirect: '/login/failed'
  })
);

router.get('/logout', (req, res) => {
  res.redirect(process.env.CLIENT_URL);
});
export default router;
