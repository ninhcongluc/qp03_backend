import { Router, Request, Response } from 'express';
import { authentication, authorization } from '../auth/auth.middleware';
import { SemesterService } from './semester.service';
import AppDataSource from '../../configs/connect-db';
import { SemesterController } from './semester.controller';
import schemaValidator from '../../middleware/schemaValidator';
const semesterRouter = Router();
const semesterService = new SemesterService(AppDataSource);
const semesterController = new SemesterController(semesterService);

semesterRouter.post(
  '/semester',
  authentication,
  authorization(['manager']),
  schemaValidator('/semester/create'),
  (req: Request, res: Response) => {
    return semesterController.createSemester(req, res);
  }
);
semesterRouter.get('/semester', authentication, (req: Request, res: Response) => {
  return semesterController.listSemester(req, res);
});

semesterRouter.delete('/semester/:id', authentication, authorization(['manager']), (req: Request, res: Response) => {
  return semesterController.deleteSemester(req, res);
});

export default semesterRouter;
