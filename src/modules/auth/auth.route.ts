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

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', function (req, res, next) {
  passport.authenticate('google', async function (err, user, info) {
    console.log('user', user);
    const displayName = user?.displayName;
    const email = user?.emails[0].value;
    const avatar = user?.photos[0]?.value;

    const userFound = await authService.findByConditions({ email });
    if (userFound) {
      switch (userFound.roleId) {
        case 3:
          res.redirect(`${process.env.CLIENT_URL}teacher/course-management`);
          break;
        case 4:
          res.redirect(`${process.env.CLIENT_URL}student/course-management`);
          break;
        default:
          res.redirect(`${process.env.CLIENT_URL}`);
          break;
      }
    }
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  res.redirect(process.env.CLIENT_URL);
});
export default router;
