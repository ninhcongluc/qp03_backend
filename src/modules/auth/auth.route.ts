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
router.post('/register-account', (req: Request, res: Response) => {
  return authController.signUpAccount(req, res);
});

router.post('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', function (req, res, next) {
  passport.authenticate('google', async function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect('/login');
    }

    const { displayName, emails, photos } = user;
    const email = emails[0].value;
    const avatar = photos[0].value;

    try {
      const userFound = await authService.findByConditions({ email });
      if (userFound) {
        // Existing user, handle login
        // ...
      } else {
      }
      res.redirect('/dashboard');
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});
router.get('/logout', (req, res) => {
  res.redirect(process.env.CLIENT_URL);
});
export default router;
