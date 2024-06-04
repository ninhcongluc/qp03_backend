import { DataSource, Repository } from 'typeorm';
import { User } from '../user/user.model';
import { AppObject } from '../../commons/consts/app.objects';

export class UserService {
  private userRepository: Repository<User>;

  constructor(private readonly dataSource: DataSource) {
    this.userRepository = this.dataSource.getRepository(User);
  }

  async listAccountByRole(roleId: number) {
    try {
      return await this.userRepository.find({ where: { roleId } });
    } catch (error) {
      return error;
    }
  }

  async getUserProfile(userId: string) {
    try {
      return await this.userRepository.findOne({ where: { id: userId } });
    } catch (error) {
      return error;
    }
  }
}
