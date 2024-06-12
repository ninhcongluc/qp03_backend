import { DataSource, Repository } from 'typeorm';
import { User } from '../user/user.model';
import { AppObject } from '../../commons/consts/app.objects';
import * as bcrypt from 'bcrypt';

const EmailService = require('../../configs/send-mail');
const emailService = new EmailService();

export class UserService {
  private userRepository: Repository<User>;

  constructor(private readonly dataSource: DataSource) {
    this.userRepository = this.dataSource.getRepository(User);
  }

  async createManagerAccount(data) {
    try {
      const email = data.email;
      const userExisted = await this.userRepository.findOne({ where: { email } });
      console.log('userExisted', userExisted);
      if (userExisted) {
        throw new Error('Email already exists');
      }
      const generatedPassword = this.generateRandomPassword();
      const salt = bcrypt.genSaltSync(+process.env.SALT_ROUNDS);
      const hashPassword = bcrypt.hashSync(generatedPassword, salt);

      console.log('generatedPassword', generatedPassword);

      const newUser = this.userRepository.create({
        ...data,
        password: hashPassword,
        roleId: AppObject.ROLE_CODE.MANAGER,
        isActive: true
      });
      console.log('newUser', newUser);

      //SEND MAIL HERE
      const mailOptions = {
        from: 'hongndhs171344@fpt.edu.vn',
        to: email,
        subject: 'Your account has been created',
        text: `Your account has been created with password: ${generatedPassword}`
      };
      await emailService.sendEmail(mailOptions);
      console.log('Welcome email sent to', email);

      return await this.userRepository.save(newUser);
    } catch (error) {
      throw new Error(error);
    }
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

  async getDetailUser(userId) {
    try {
      return await this.userRepository.findOne({ where: { id: userId } });
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateManagerAccount(id, data) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new Error('User not found');
      }
      return await this.userRepository.update({ id }, data);
      //SEND MAIL HERE
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteManagerAccount(id) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new Error('User not found');
      }
      await this.userRepository.delete({ id });
    } catch (error) {
      throw new Error(error);
    }
  }

  generateRandomPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';

    // Generate one character
    password += chars.charAt(Math.floor(Math.random() * chars.length));

    // Generate one number
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));

    // Generate one special symbol
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));

    // Generate remaining characters
    const remainingChars = chars + numbers + symbols;
    for (let i = 0; i < 5; i++) {
      password += remainingChars.charAt(Math.floor(Math.random() * remainingChars.length));
    }

    // Shuffle the password
    password = this.shuffleString(password);

    return password;
  }

  shuffleString(str) {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  }
}
