import { DataSource, In, Repository } from 'typeorm';
import { User } from '../user/user.model';
import { AppObject } from '../../commons/consts/app.objects';
import * as bcrypt from 'bcrypt';
import { exist, string } from 'joi';
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

      //SEND MAIL HERE
      const mailOptions = {
        from: 'hongndhs171344@fpt.edu.vn',
        to: email,
        subject: 'Your are invited to join Quiz Practice System',
        html: `
          <div style="background-color: #f2f2f2; padding: 20px;">
        <h2>Welcome to Quiz Practice System</h2>
        <p>Thank you for joining our platform. Here are your login details:</p>
        <p>Email: ${email}</p>
        <p><strong>Password: ${generatedPassword}</strong></p>
          </div>
        `
      };
      await emailService.sendEmail(mailOptions);
      console.log('Welcome email sent to', email);

      return await this.userRepository.save(newUser);
    } catch (error) {
      throw new Error(error);
    }
  }

  async changePassword(data) {
    try {
      const { email, oldPassword, newPassword, confirmPassword } = data;
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new Error('User not found');
      }
      // check mat khau cu co dung khong
      const isMatch = bcrypt.compareSync(oldPassword, user.password);
      if (!isMatch) {
        throw new Error('Old password is incorrect');
      }

      // check mat khau moi va mat khau xac nhan co giong nhau khong
      if (newPassword !== confirmPassword) {
        throw new Error('New password and confirm password do not match');
      }
      // ma hoa mat khau moi
      const salt = bcrypt.genSaltSync(+process.env.SALT_ROUNDS);
      const hashPassword = bcrypt.hashSync(newPassword, salt);
      return await this.userRepository.update({ email }, { password: hashPassword });
    } catch (error) {
      throw new Error(error);
    }
  }

  async listAccountByRole(roleId: number) {
    try {
      return await this.userRepository.find({ 
        where: { roleId, isDeleted: false },
        order: {
          firstName: 'DESC'
        } 
      });
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

  async forgotPassword(email: string) {
    try {
      // find user with email
      const user = await this.userRepository.findOne({ where: { email } });
      // check user existed
      if (!user) {
        throw new Error('User not found');
      }
      // generate otp code with 5 numbers
      const otpCode = Math.floor(10000 + Math.random() * 90000).toString();
      // otpCode + otpExpiredAt (after 5 minutes) => save to user
      const otpExpiredAt = new Date();
      otpExpiredAt.setMinutes(otpExpiredAt.getMinutes() + 5);
      await this.userRepository.update({ id: user.id }, { otpCode, otpExpiredAt });

      // send otp code to email
      const mailOptions = {
        from: 'hongndhs171344@fpt.edu.vn',
        to: email,
        subject: 'Your are invited to join Quiz Practice System',
        html: `
          <div style="background-color: #f2f2f2; padding: 20px;">
        <h2>Welcome to Quiz Practice System</h2>
        <p>Thank you for joining our platform. Here are your login details:</p>
          </div>
        `
      };
      await emailService.sendEmail(mailOptions);
    } catch (error) {
      throw new Error(error);
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
  //teacher routes
  async createTeacherAccount(data) {
    try {
      const email = data.email;
      const userExisted = await this.userRepository.findOne({ where: { email } });
      if (userExisted) {
        throw new Error('Email already exists');
      }
      const code = data.code;
      const codeExisted = await this.userRepository.findOne({ where: { code } });
      if (codeExisted) {
        throw new Error('Code already exists');
      }
      const newUser = this.userRepository.create({
        ...data,
        roleId: 3,
        isActive: false
      });
      return await this.userRepository.save(newUser);
    } catch (error) {
      throw new Error(error);
    }
  }
  
  async getTeacherDetails(userId: string): Promise<User | null> {
    try {
      return await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.class', 'class')
        .where('user.id = :userId', { userId })
        .getOne();
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteTeacherAccount(teacherId) {
    try {
      const user = await this.userRepository.findOne({ where: { id: teacherId } });
      if (user.isActive) {
        throw new Error('Teacher is active, cannot delete');
      }
      await this.userRepository.delete({ id: teacherId });
    } catch (error) {
      throw new Error(error);
    }
  }

  async importStudent(preparedData, classId) {
    try {
      console.log('preparedData', preparedData);

      // Remove all students from the class
      const oldParticipants = await this.classParticipantsRepository.find({ where: { classId: classId } });
      const participantIds = oldParticipants.map(participant => participant.id);
      await this.classParticipantsRepository.delete({ id: In(participantIds) });

      // Remove students from the user table
      await this.userRepository.delete({ id: In(participantIds) });

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

  async importTeacher(preparedData) {
    try {
      console.log('preparedData', preparedData);
      await Promise.all(
        preparedData.map(async (user: User) => {
          // Check if a user with the same email already exists
          let existingUser = await this.userRepository.findOne({ where: { email: user.email } });
          // Check if a user with the same code already exists
          const existingCode = await this.userRepository.findOne({ where: { code: user.code } });

          if (!existingUser && !existingCode) {
            // If the user does not exist, create a new user
            existingUser = await this.userRepository.save(user);
          }

          return existingUser;
        })
      );
    } catch (error) {
      throw new Error(error);
    }

  }

  async listStudentInClass(classId: string) {
    console.log('classId', classId);
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
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new Error('User not found');
      }

      if(await this.checkUserIsUsed(id) && !data.isActive){
        throw new Error('Teacher account is used in class');
      }
      return await this.userRepository.update({ id }, data);
    } catch (error) {
      throw new Error(error);
    }
  }

  async checkUserIsUsed(userId: string): Promise<boolean> {
    //const isUsed = await this
    const isUsed = await this.dataSource
    .getRepository('class')
    .createQueryBuilder('class')
    .where('class.teacherId = :userId', { userId })
    .getOne();
    
    return isUsed ? true : false;
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

  validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  validatePhoneNumber(phoneNumber) {
    const re = /^\d{10,11}$/;
    return re.test(phoneNumber);
  }

  validateCode(code) {
    const re = /^\d{4,}$/;
    return re.test(code);
  }

}
