import { DataSource, Repository } from 'typeorm';
import { User } from '../user/user.model';
import * as bcrypt from 'bcrypt';

export class AuthService {
  private userRepository: Repository<User>;

  constructor(private readonly dataSource: DataSource) {
    this.userRepository = this.dataSource.getRepository(User);
  }

  async signIn(userInput) {
    const { username, password } = userInput;
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) throw new Error('User not found');
    const isPasswordMatch = bcrypt.compareSync(password, user.password);
    if (!isPasswordMatch) throw new Error('Password is incorrect');
    return user;
  }

  async signUp(userInput) {
    const { email, password } = userInput;
    const userExist = await this.userRepository.findOne({ where: { email } });

    const salt = bcrypt.genSaltSync(+process.env.SALT_ROUNDS);
    const hashPassword = bcrypt.hashSync(password, salt);
    if (userExist) throw new Error('User already exists');
    const user = await this.userRepository.save({
      ...userInput,
      password: hashPassword
    });
    return user;
  }
}
