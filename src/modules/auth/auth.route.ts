import { Router, Request, Response } from 'express';
import schemaValidator from '../../middleware/schemaValidator';

const router = Router();

router.post('/signIn', schemaValidator('/auth/signIn'), (req: Request, res: Response) => {
  return res.send("You've successfully logged in ✔");
});

router.post('/signUp', schemaValidator('/auth/signUp'), (req: Request, res: Response) => {
  return res.send('Sign up complete ✔');
});

export default router;
