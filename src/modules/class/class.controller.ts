import { Response, Request } from 'express';
import { ClassService } from './class.service';
import { StatusCodes } from 'http-status-codes';

export class ClassController {
  constructor(private readonly classService: ClassService) {}

  async listClassForTeacher(req: Request, res: Response) {
    const teacherId = String(req.params.teacherId);
    try {
      const classes = await this.classService.listClassForTeacher(teacherId);
      return res.status(200).send({ data: classes, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  // manager class
  async listClass(req: Request, res: Response) {
    try {
      const courseId = String(req.params.id);
      const classes = await this.classService.listClass(courseId);
      return res.status(200).send({ data: classes, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async createClass(req: Request, res: Response) {
    try {
      await this.classService.createClass(req.body);
      return res.status(200).send({ message: 'Create class successfully', status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async updateClass(req: Request, res: Response) {
    const classId = String(req.params.id);
    try {
      await this.classService.updateClass(classId, req.body);
      return res.status(200).send({ message: 'Update class successfully', status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async deleteClass(req: Request, res: Response) {
    const classId = String(req.params.id);
    try {
      await this.classService.deleteClass(classId);
      return res.status(200).send({ message: 'Delete class successfully', status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async viewClassDetails(req: Request, res: Response) {
    const classId = String(req.params.id);
    try {
      const classDetails = await this.classService.viewClassDetails(classId);
      return res.status(200).send({ data: classDetails, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async listClassByTeacherId(req: Request, res: Response) {
    const teacherId = String(req.params.teacherId);
    try {
      const classes = await this.classService.listClassByTeacher(teacherId);
      return res.status(200).send({ data: classes, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }
  async listClassByStudentId(req, res) {
    const studentId = req.user._id;
    try {
      const classes = await this.classService.listClassByStudent(studentId);
      return res.status(200).send({ data: classes, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

}
