import { Router, Request, Response } from 'express';
import { authentication, authorization } from '../auth/auth.middleware';
import { UserService } from './user.service';
import AppDataSource from '../../configs/connect-db';
import { UserController } from './user.controller';

const userRouter = Router();
const userService = new UserService(AppDataSource);
const userController = new UserController(userService);

// Manager routes
userRouter.post('/manager/create', authentication, authorization(['admin']), (req: Request, res: Response) => {
  res.send('Manager account created!');
});

userRouter.get('/manager/list', authentication, authorization(['admin']), (req: Request, res: Response) => {
  return userController.listManagerAccount(req, res);
});

userRouter.get('/teacher/list', authentication, (req: Request, res: Response) => {
  return userController.listTeacherAccount(req, res);
});

userRouter.get('/student/list', authentication, (req: Request, res: Response) => {
  return userController.listStudentAccount(req, res);
});

export default userRouter;
