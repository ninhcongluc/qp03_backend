import { StatusCodes } from 'http-status-codes';
import { UserService } from './user.service';
import { AppObject } from '../../commons/consts/app.objects';

export class UserController {
  constructor(private readonly userService: UserService) {}
  async listManagerAccount(req, res) {
    try {
      const users = await this.userService.listAccountByRole(AppObject.ROLE_CODE.MANAGER);
      return res.status(200).send({ data: users, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async listTeacherAccount(req, res) {
    try {
      const users = await this.userService.listAccountByRole(AppObject.ROLE_CODE.TEACHER);
      return res.status(200).send({ data: users, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async listStudentAccount(req, res) {
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
