import { Router, Request, Response } from 'express';
import { authentication, authorization } from '../auth/auth.middleware';
import { UserService } from './user.service';
import AppDataSource from '../../configs/connect-db';
import { UserController } from './user.controller';
import schemaValidator from '../../middleware/schemaValidator';
const userRouter = Router();
const userService = new UserService(AppDataSource);
const userController = new UserController(userService);

// Manager routes
userRouter.post(
  '/manager/create',
  authentication,
  authorization(['admin']),
  schemaValidator('/manager/create'),
  (req: Request, res: Response) => {
    return userController.createManagerAccount(req, res);
  }
);

userRouter.get('/manager/list', authentication, authorization(['admin']), (req: Request, res: Response) => {
  return userController.listManagerAccount(req, res);
});

userRouter.get('/manager/:id', authentication, authorization(['admin']), (req: Request, res: Response) => {
  return userController.getDetailUser(req, res);
});

userRouter.put(
  '/manager/:id',
  authentication,
  authorization(['admin']),
  schemaValidator('/manager/update'),
  (req: Request, res: Response) => {
    return userController.updateManagerAccount(req, res);
  }
);

userRouter.delete('/manager/:id', authentication, authorization(['admin']), (req: Request, res: Response) => {
  return userController.deleteManagerAccount(req, res);
});

userRouter.get('/teacher/list', authentication, (req: Request, res: Response) => {
  return userController.listTeacherAccount(req, res);
});

userRouter.put(
  '/teacher/:id',
  authentication,
  authorization(['manager']),
  schemaValidator('/manager/update'),
  (req: Request, res: Response) => {
    return userController.updateTeacherAccount(req, res);
  }
);

userRouter.delete('/teacher/:id', authentication, authorization(['manager']), (req: Request, res: Response) => {
  return userController.deleteTeacherAccount(req, res);
});

userRouter.get('/teacher/:id', authentication, authorization(['manager', 'teacher']), (req: Request, res: Response) => {
  return userController.getDetailUser(req, res);
});

userRouter.get('/student/list', authentication, (req: Request, res: Response) => {
  return userController.listStudentAccount(req, res);
});

//Profile
userRouter.get('/user/profile', authentication, (req: Request, res: Response) => {
  return userController.getUserProfile(req, res);
});

export default userRouter;
