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


  async signUpAccount(req, res) {

    try {
      const user = await this.authService.signUpAccount(req.body);
      return res.status(200).send({ data: user, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }
}
