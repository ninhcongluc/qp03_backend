import { Router, Request, Response } from 'express';
import { authentication, authorization } from '../auth/auth.middleware';
import { CourseService } from './course.service';
import AppDataSource from '../../configs/connect-db';
import { CourseController } from './course.controller';
import schemaValidator from '../../middleware/schemaValidator';
const courseRouter = Router();
const courseService = new CourseService(AppDataSource);
const courseController = new CourseController(courseService);

courseRouter.post(
  '/course/create',
  authentication,
  authorization(['manager']),
  schemaValidator('/course/create'),
  (req: Request, res: Response) => {
    return courseController.createCourse(req, res);
  }
);
courseRouter.get(
  '/course/student-courses',
  authentication,
  authorization(['student']),
  (req: Request, res: Response) => {
    return courseController.listStudentCourses(req, res);
  }
);

courseRouter.get('/course', (req: Request, res: Response) => {
  return courseController.listCourse(req, res);
});

courseRouter.get('/course/:courseId', (req: Request, res: Response) => {
  return courseController.detailCourse(req, res);
});

courseRouter.put('/course/:id', schemaValidator('/course/update'), (req: Request, res: Response) => {
  return courseController.updateCourse(req, res);
});

courseRouter.delete('/course/:id', (req: Request, res: Response) => {
  return courseController.deleteCourse(req, res);
});

courseRouter.get('/course/:id', (req: Request, res: Response) => {
  return courseController.getDetailCourse(req, res);
});

courseRouter.get('/course-management/:id', (req: Request, res: Response) => {
  return courseController.getDetailCourses(req, res);
});

courseRouter.get('/course-list/:teacherId', (req: Request, res: Response) => {
  return courseController.getCoursesList(req, res);
});

export default courseRouter;
