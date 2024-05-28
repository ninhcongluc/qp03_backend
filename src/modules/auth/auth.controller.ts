import { StatusCodes } from 'http-status-codes';
import { AuthService } from './auth.service';

export class AuthController {
  constructor(private readonly authService: AuthService) {}
  async signIn(req, res) {
    try {
      console.log(req.body);
      const user = await this.authService.signIn(req.body);

      return res.status(200).send({ data: user, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async signUpAdmin(req, res) {
    try {
      const user = await this.authService.signUpAdmin();
      return res.status(201).send({ data: user, status: StatusCodes.CREATED });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  async googleSignIn(req, res) {
    try {
      console.log('req', req);
      return res.status(201).send({ message: 'Success!', status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }
}
