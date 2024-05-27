import { DataSource, Repository } from 'typeorm';
import { User } from '../user/user.model';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthService {
  private userRepository: Repository<User>;

  constructor(private readonly dataSource: DataSource) {
    this.userRepository = this.dataSource.getRepository(User);
  }

  async signIn(userInput) {
    const { username, password } = userInput;
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.username = :username', { username })
      .getOne();
    if (!user) throw new Error('User not found');
    const isPasswordMatch = bcrypt.compareSync(password, user.password);
    if (!isPasswordMatch) throw new Error('Password is incorrect');

    const accessToken = jwt.sign(
      {
        id: user.id,
        role: user?.role.name,
        email: user.email,
        timeOut: Math.floor(Date.now() / 1000) + 2 * 60 * 60 // Expires after 2 hours
      },
      process.env.ACCESS_TOKEN_SECRET_KEY,
      {
        expiresIn: '2h'
      }
    );
    return { userInfo: user, token: accessToken };
  }

  async signUpAdmin() {
    const userExist = await this.userRepository.findOne({ where: { username: 'administrator' } });
    const salt = bcrypt.genSaltSync(+process.env.SALT_ROUNDS);
    const hashPassword = bcrypt.hashSync('123@123aZ', salt);
    if (userExist) throw new Error('User already exists');
    const user = await this.userRepository.save({
      username: 'administrator',
      password: hashPassword,
      email: 'lucnche140648@fpt.edu.vn',
      gender: 1,
      roleId: 1
    });
    return user;
  }
}
