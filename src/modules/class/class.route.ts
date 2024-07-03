import { Router, Request, Response } from 'express';
import { authentication, authorization } from '../auth/auth.middleware';
import { ClassService } from './class.service';
import AppDataSource from '../../configs/connect-db';
import { ClassController } from './class.controller';
import schemaValidator from '../../middleware/schemaValidator';
const classRouter = Router();
const classService = new ClassService(AppDataSource);
const classController = new ClassController(classService);

classRouter.get(
  '/listClassForTeacher/:teacherId',
  authentication,
  authorization(['teacher']),
  (req: Request, res: Response) => {
    return classController.listClassForTeacher(req, res);
  }
);

// manager class
classRouter.post('/createClass',
  authentication,
  authorization(['manager']),
  schemaValidator('/class/create'),
  (req: Request, res: Response) => {
    return classController.createClass(req, res);
  });

classRouter.get('/listClass/:courseId',
  authentication,
  authorization(['manager']),
  (req: Request, res: Response) => {
    return classController.listClass(req, res);
  });

classRouter.put('/updateClass/:classId',
  authentication,
  authorization(['manager']),
  (req: Request, res: Response) => {
    return classController.updateClass(req, res);
  });

classRouter.delete(
  '/deleteClass/:classId',
  authentication,
  authorization(['manager']),
  (req: Request, res: Response) => {
    return classController.deleteClass(req, res);
  }
);

classRouter.get(
  'viewClassDetail/:classId',
  authentication,
  authorization(['manager', 'teacher', 'student']),
  (req: Request, res: Response) => {
    return classController.viewClassDetails(req, res);
  }
);
export default classRouter;
