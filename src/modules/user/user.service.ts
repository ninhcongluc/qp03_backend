import { DataSource, In, Repository } from 'typeorm';
import { User } from '../user/user.model';
import { AppObject } from '../../commons/consts/app.objects';
import * as bcrypt from 'bcrypt';
import { exist } from 'joi';
import { ClassParticipants } from '../class_participants/class-participants.model';

const EmailService = require('../../configs/send-mail');
const emailService = new EmailService();

export class UserService {
  private userRepository: Repository<User>;
  private classParticipantsRepository: Repository<ClassParticipants>;

  constructor(private readonly dataSource: DataSource) {
    this.userRepository = this.dataSource.getRepository(User);
    this.classParticipantsRepository = this.dataSource.getRepository(ClassParticipants);
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

  async getDetailUser(userId: string): Promise<User | null> {
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

  async listTeacherAccounts(): Promise<User[]> {
    try {
      return await this.userRepository.find({ where: { roleId: AppObject.ROLE_CODE.TEACHER } });
    } catch (error) {
      throw new Error(error);
    }
  }

  async getTeacherDetails(userId: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { id: userId, roleId: AppObject.ROLE_CODE.TEACHER },
        relations: ['courses']
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteTeacherAccount(id) {
    try {
      const user = await this.userRepository.findOne({ where: { id, roleId: AppObject.ROLE_CODE.TEACHER } });
      if (!user) {
        throw new Error('Teacher not found');
      }
      await this.userRepository.delete({ id });
    } catch (error) {
      throw new Error(error);
    }
  }

  async importStudent(preparedData, classId) {
    try {
      console.log('preparedData', preparedData);

      // Remove all students from the class
      const oldParticipants = await this.classParticipantsRepository.find({ where: { classId: classId } });
      await this.classParticipantsRepository.remove(oldParticipants);

      const newUsers = await Promise.all(
        preparedData.map(async user => {
          // Check if a user with the same email already exists
          let existingUser = await this.userRepository.findOne({ where: { email: user.email } });

          if (!existingUser) {
            // If the user does not exist, create a new user
            existingUser = await this.userRepository.save(user);
          }

          // Create a new class participant
          const classParticipant = new ClassParticipants();
          classParticipant.userId = existingUser.id;
          classParticipant.classId = classId;
          await this.classParticipantsRepository.save(classParticipant);

          return existingUser;
        })
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  async listStudentInClass(classId: string) {
    try {
      const students = await this.userRepository
        .createQueryBuilder('user')
        .leftJoin('user.classParticipants', 'classParticipants')
        .where('user.roleId = :roleId', { roleId: AppObject.ROLE_CODE.STUDENT })
        .andWhere('classParticipants.classId = :classId', { classId })
        .getMany();
      return students;
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateTeacherAccount(id, data) {
    try {
      const user = await this.userRepository.findOne({ where: { id, roleId: AppObject.ROLE_CODE.TEACHER } });
      if (!user) {
        throw new Error('Teacher not found');
      }
      return await this.userRepository.update({ id }, data);
    } catch (error) {
      throw new Error(error);
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { email } });
    } catch (error) {
      throw new Error(error);
    }
  }

  async getUserByCode(code: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { id: code } });
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
