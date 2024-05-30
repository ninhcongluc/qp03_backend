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
    const { email, password } = userInput;
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) throw new Error('User not found');
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) throw new Error('Password is incorrect');

    const accessToken = await jwt.sign(
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

  async signUpAccount(body) {
    const { email, password, gender, roleId } = body;
    const salt = bcrypt.genSaltSync(+process.env.SALT_ROUNDS);
    const hashPassword = bcrypt.hashSync(password, salt);
    const user = await this.userRepository.save({
      password: hashPassword,
      email,
      gender,
      roleId
    });
    return user;
  }

  findByConditions = async condition => {
    console.log('condition', condition);
    return this.userRepository.findOne({ where: condition });
  };
}
