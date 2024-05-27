import { DataSource, Repository } from 'typeorm';
import { User } from '../user/user.model';
import { AppObject } from '../../commons/consts/app.objects';

export class UserService {
  private userRepository: Repository<User>;

  constructor(private readonly dataSource: DataSource) {
    this.userRepository = this.dataSource.getRepository(User);
  }

  async listManagerAccount(req, res) {
    try {
      return await this.userRepository.find({ where: { roleId: AppObject.ROLE_CODE.MANAGER } });
    } catch (error) {
      return res.status(400).send({ error: error.message });
    }
  }
}
