import { Router, Request, Response } from 'express';
import { authentication, authorization } from '../auth/auth.middleware';
import { UserService } from './user.service';
import AppDataSource from '../../configs/connect-db';
import { UserController } from './user.controller';
import schemaValidator from '../../middleware/schemaValidator';
const userRouter = Router();
const userService = new UserService(AppDataSource);
const userController = new UserController(userService);
import axios from 'axios';

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
  return userController.getDetailManager(req, res);
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

userRouter.get('/student/list', authentication, (req: Request, res: Response) => {
  return userController.listStudentAccount(req, res);
});

// Teacher routes
userRouter.get('/teacher/:id', authentication, authorization(['manager', 'teacher']), (req: Request, res: Response) => {
  return userController.getUserProfile(req, res);
});



//Profile
userRouter.get('/user/profile', authentication, (req: Request, res: Response) => {
  return userController.getUserProfile(req, res);
});

userRouter.get('/user/profile', authentication, async (req: Request, res: Response) => {
  try {
    // Call the /api/profile endpoint to fetch the user's name
    const response = await axios.get('/api/profile');
    const userName = response.data.name;

    // Pass the user's name to the getUserProfile method
    const { firstName, lastName, error } = await userController.getUserProfile(req, res, userName);
    if (error) {
      return res.status(500).json({ error });
    }
    return res.status(200).json({ firstName, lastName });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default userRouter;
