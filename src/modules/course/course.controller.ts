import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CourseService } from './course.service';

export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  async createCourse(req: Request, res: Response) {
    try {
      const newCourse = await this.courseService.createCourse(req.body);
      return res.status(201).send({ data: newCourse, status: StatusCodes.CREATED });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async listCourse(req: Request, res: Response) {
    try {
      const courses = await this.courseService.listCourse(req.query);
      return res.status(200).send({ data: courses, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  
  async listStudentCourses(req, res) {
    try {
      const userId = req.user._id;
      const courses = await this.courseService.listStudentCourses(userId, req.query);
      return res.status(200).send({ data: courses, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async getDetailCourse(req: Request, res: Response) {
    try {
      const classId = req.params.classId;
      const query = req.query;
      const courseDetail = await this.courseService.getDetailCourse(classId, query);
      res.status(200).send({ data: courseDetail });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  }
}
