import { StatusCodes } from 'http-status-codes';
import { UserService } from './user.service';

export class UserController {
  constructor(private readonly userService: UserService) {}
  async listManagerAccount(req, res) {
    try {
      const users = await this.userService.listManagerAccount(req, res);
      return res.status(200).send({ data: users, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }
}
