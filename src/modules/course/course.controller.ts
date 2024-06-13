import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CourseService } from "./course.service";

// CourseController class handles the course-related HTTP requests
export class CourseController {
  constructor(private courseService: CourseService) {}

  // createCourse method handles the creation of a new course
  async createCourse(req: Request, res: Response, body: any) {
    try {
      const newCourse = await this.courseService.createCourse(body);
      res.status(StatusCodes.CREATED).json(newCourse);
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }

  // listCourses method handles the retrieval of courses based on the roleId query parameter
  async listCourses(req: Request, res: Response, query: { roleId?: number }) {
    try {
      const courses = await this.courseService.listCourseByRole(query.roleId);
      res.status(StatusCodes.OK).json(courses);
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }

  // getCourseDetails method handles the retrieval of a specific course details
  async getCourseDetails(req: Request, res: Response, params: { id: string }) {
    try {
      const course = await this.courseService.getDetailCourse(params.id);
      res.status(StatusCodes.OK).json(course);
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }

  // updateCourse method handles the updating of a specific course
  async updateCourse(
    req: Request,
    res: Response,
    params: { id: string },
    body: any
  ) {
    try {
      const updatedCourse = await this.courseService.updateCourse(
        params.id,
        body
      );
      res.status(StatusCodes.OK).json(updatedCourse);
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }

  // deleteCourse method handles the deletion of a specific course
  async deleteCourse(req: Request, res: Response, params: { id: string }) {
    try {
      await this.courseService.deleteCourse(params.id);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }
}