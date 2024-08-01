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
classRouter.post(
  '/create-class',
  authentication,
  authorization(['manager']),
  schemaValidator('/class/create'),
  (req: Request, res: Response) => {
    return classController.createClass(req, res);
  }
);

classRouter.get('/list-class/:id', authentication, authorization(['manager']), (req: Request, res: Response) => {
  return classController.listClass(req, res);
});

classRouter.put(
  '/update-class/:id',
  authentication,
  authorization(['manager']),
  schemaValidator('/class/update'),
  (req: Request, res: Response) => {
    return classController.updateClass(req, res);
  }
);

classRouter.delete('/delete-class/:id', authentication, authorization(['manager']), (req: Request, res: Response) => {
  return classController.deleteClass(req, res);
});

classRouter.get('/view-class-detail/:id', authentication, authorization(['manager']), (req: Request, res: Response) => {
  return classController.viewClassDetails(req, res);
});

classRouter.get('/class/list-by-student', authentication, (req: Request, res: Response) => {
  return classController.listClassByStudentId(req, res);
});

classRouter.get('/class/list-by-teacher/:teacherId', authentication, (req: Request, res: Response) => {
  return classController.listClassByTeacherId(req, res);
});

export default classRouter;
