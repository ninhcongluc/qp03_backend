import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserService } from './user.service';
import { AppObject } from '../../commons/consts/app.objects';

export class UserController {
  constructor(private readonly userService: UserService) {}

  async createManagerAccount(req: Request, res: Response) {
    try {
      const newUser = await this.userService.createManagerAccount(req.body);
      return res.status(201).send({ data: newUser, status: StatusCodes.CREATED });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async listManagerAccount(req: Request, res: Response) {
    try {
      const users = await this.userService.listAccountByRole(AppObject.ROLE_CODE.MANAGER);
      return res.status(200).send({ data: users, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async getDetailManager(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const user = await this.userService.getDetailUser(userId);
      return res.status(200).send({ data: user, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async updateManagerAccount(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const updatedUser = await this.userService.updateManagerAccount(id, req.body);
      return res.status(201).send({ data: updatedUser, status: StatusCodes.CREATED });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async deleteManagerAccount(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const newUser = await this.userService.deleteManagerAccount(id);
      return res.status(201).send({ data: newUser, status: StatusCodes.CREATED });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async listTeacherAccount(req: Request, res: Response) {
    try {
      const users = await this.userService.listAccountByRole(AppObject.ROLE_CODE.TEACHER);
      return res.status(200).send({ data: users, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async listStudentAccount(req: Request, res: Response) {
    try {
      const users = await this.userService.listAccountByRole(AppObject.ROLE_CODE.STUDENT);
      return res.status(200).send({ data: users, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async getUserProfile(req, res) {
    try {
      console.log('data', req.user);
      const userId = req.user._id;
      const users = await this.userService.getUserProfile(userId);
      return res.status(200).send({ data: users, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }
}
