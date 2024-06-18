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
      const { code, page, limit } = req.query;
      const courses = await this.courseService.listCourse(String(code), Number(page), Number(limit));
      return res.status(200).send({ data: courses, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async getDetailCourse(req: Request, res: Response) {
    try {
      const courseId = req.params.id;
      const course = await this.courseService.getDetailCourse(courseId);
      return res.status(200).send({ data: course, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }
}
