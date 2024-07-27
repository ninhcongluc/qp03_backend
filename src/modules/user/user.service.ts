import { DataSource, In, Repository } from 'typeorm';
import { User } from '../user/user.model';
import { AppObject } from '../../commons/consts/app.objects';
import * as bcrypt from 'bcrypt';
import { exist, string } from 'joi';
import { ClassParticipants } from '../class_participants/class-participants.model';
import XLSX from 'xlsx';

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
      const { email, code } = data;
      const userExisted = await this.userRepository.findOne({ where: { email } });
      console.log('userExisted', userExisted);
      if (userExisted) {
        throw new Error('Email already exists');
      }

      const codeExisted = await this.userRepository.findOne({ where: { code } });
      if (codeExisted) {
        throw new Error('Code already exists');
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

  async forgotPassword(email: string) {
    try {
      // find user with email
      const user = await this.userRepository.findOne({ where: { email } });
      // check user existed
      if (!user) {
        throw new Error('User not found');
      }
      // generate otp code with 5 characters (numbers, letters, special characters)
      const otpCode = this.generateRandomOTP();
      console.log('otpCode', otpCode);

      // otpCode + otpExpiredAt (after 5 minutes) => save to user
      const otpExpiredAt = new Date();
      otpExpiredAt.setMinutes(otpExpiredAt.getMinutes() + 5);
      await this.userRepository.update({ id: user.id }, { otpCode, otpExpiredAt });

      // Send OTP code in email
      const mailOptions = {
        from: 'hongndhs171344@fpt.edu.vn',
        to: email,
        subject: 'Reset your password',
        html: `
        <div style="background-color: #f2f2f2; padding: 20px;">
          <h2>Reset your password</h2>
          <p>Please use the following OTP to reset your password:</p>
          <h3>${otpCode}</h3>
          <p>This OTP will expire in 5 minutes.</p>
        </div>
      `
      };
      await emailService.sendEmail(mailOptions);
    } catch (error) {
      throw new Error(error);
    }
  }

  async resetPassword(data: { email: string; otpCode: string; newPassword: string }) {
    try {
      const { email, otpCode, newPassword } = data;

      // Find user with email
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new Error('User not found');
      }

      // Check OTP code
      if (user.otpCode !== otpCode) {
        throw new Error('OTP code is incorrect');
      }
      if (user.otpExpiredAt < new Date()) {
        throw new Error('OTP code is expired');
      }

      // Validate newPassword length
      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      // Update password
      const salt = bcrypt.genSaltSync(+process.env.SALT_ROUNDS);
      const hashPassword = bcrypt.hashSync(newPassword, salt);
      await this.userRepository.update({ id: user.id }, { password: hashPassword, otpCode: null, otpExpiredAt: null });
    } catch (error) {
      throw new Error(error.message);
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
      return await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .where('user.id = :userId', { userId })
        .getOne();
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

      const managerIsUsed = await this.dataSource
        .getRepository('course')
        .createQueryBuilder('course')
        .where('course.managerId = :id', { id })
        .getOne();

      if (managerIsUsed) {
        throw new Error('Manager is used in course');
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
      if (!(data.firstName.length >= 2 && data.firstName.length <= 50)) {
        throw new Error('First name must be 2 - 50 characters.');
      }
      if (!(data.lastName.length >= 2 && data.lastName.length <= 50)) {
        throw new Error('Last name must be 2 - 50 characters.');
      }
      if (data.code.length !== 8) {
        throw new Error('Code must be 8 characters.');
      }
      if (data.phoneNumber.length !== 10) {
        throw new Error('Code must be 10 characters.');
      }
      const date = new Date();
      if (data.dateOfBirth > date) {
        throw new Error('Date of birth must be less than current date.');
      }
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
        isActive: true
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

  async exportStudentExcel(classId: string) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const students = await this.listStudentInClass(classId);
    const data = [
      ['Code', 'Email', 'FirstName', 'LastName', 'Phone', 'DOB'],
      ...students.map(student => [
        student.code,
        student.email,
        student?.firstName || '',
        student?.lastName || '',
        student?.phoneNumber.trim() || '',
        student?.dateOfBirth || ''
      ])
    ];

    XLSX.utils.sheet_add_aoa(worksheet, data, { origin: 'A1' });

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async importStudent(data, classId: string) {
    try {
      this.validateDataExcel(data);
      for (const row of data) {
        const { Code, Email, FirstName, LastName, Phone, DOB } = row;
        const userCodeOrEmailExists = await this.userRepository.findOne({
          where: [{ code: Code }, { email: Email }]
        });
        // save user not existed, if existed -> continue
        if (!userCodeOrEmailExists) {
          const salt = bcrypt.genSaltSync(+process.env.SALT_ROUNDS);
          const hashPassword = bcrypt.hashSync('12345678', salt);

          const preparedData = {
            code: Code,
            email: Email,
            firstName: FirstName || '',
            lastName: LastName || '',
            phoneNumber: Phone || '',
            dateOfBirth: DOB || '',
            isActive: true,
            password: hashPassword,
            roleId: AppObject.ROLE_CODE.STUDENT
          };

          const newStudent = await this.userRepository.save(preparedData);
          const userClass = {
            userId: newStudent.id,
            classId
          };
          await this.classParticipantsRepository.save(userClass);
        }
      }
      return 'Import data successfully';
    } catch (error) {
      throw new Error(error);
    }
  }

  async importTeacher(data) {
    try {
      this.validateDataExcel(data);

      for (const row of data) {
        const { Code, Email, FirstName, LastName, Phone, DOB } = row;
        const userCodeOrEmailExists = await this.userRepository.findOne({
          where: [{ code: Code }, { email: Email }]
        });
        // save user not existed, if existed -> continue
        if (!userCodeOrEmailExists) {
          const salt = bcrypt.genSaltSync(+process.env.SALT_ROUNDS);
          const hashPassword = bcrypt.hashSync('12345678', salt);

          const preparedData = {
            code: Code,
            email: Email,
            firstName: FirstName || '',
            lastName: LastName || '',
            phoneNumber: Phone || '',
            dateOfBirth: DOB || '',
            isActive: true,
            password: hashPassword,
            roleId: AppObject.ROLE_CODE.TEACHER
          };

          await this.userRepository.save(preparedData);
        }
      }
      return 'Import data successfully';
    } catch (error) {
      throw new Error(error);
    }
  }

  async exportExcel() {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const teachers = await this.userRepository.find({
      where: {
        roleId: 3,
        isDeleted: false,
        isActive: true
      }
    });

    const data = [
      ['Code', 'Email', 'FirstName', 'LastName', 'Phone', 'DOB'],
      ...teachers.map(teacher => [
        teacher.code,
        teacher.email,
        teacher?.firstName || '',
        teacher?.lastName || '',
        teacher?.phoneNumber.trim() || '',
        teacher?.dateOfBirth || ''
      ])
    ];

    XLSX.utils.sheet_add_aoa(worksheet, data, { origin: 'A1' });
    console.log('workbook', workbook);

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
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
      // check k có hai teacher cùng mã code và email
      const userCodeOrEmailExists = await this.userRepository.findOne({
        where: [{ code: data.code }, { email: data.email }]
      });
        if (userCodeOrEmailExists && userCodeOrEmailExists.id !== id) {
        throw new Error('Code or email already exists');
      }
      if (await this.checkUserIsUsed(id) && data.isActive === false) {
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

  generateRandomOTP(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
    const otpLength = 5;
    let otp = '';
    for (let i = 0; i < otpLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      otp += characters[randomIndex];
    }
    return otp;
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

  validateDataExcel(data) {
    // const requiredColumns = ['Code', 'Email', 'FirstName', 'LastName', 'Phone', 'DOB'];
    const requiredColumns = ['Code', 'Email'];

    const header = Object.keys(data[0]);
    console.log('header', header);

    // Validate header
    for (const column of requiredColumns) {
      if (!header.includes(column)) {
        throw new Error(`Column "${column}" is missing`);
      }
    }

    const codeSet = new Set();
    const emailSet = new Set();
    const phoneSet = new Set();
    const errors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    data.forEach((row, index) => {
      const { Code, Email, Phone } = row;
      const lineNumber = index + 2;

      // Validate required fields
      if (!Code || Code.length < 1)
        errors.push(`Line ${lineNumber}: Code is required and must be at least 1 character`);
      if (!Email || !emailRegex.test(Email))
        errors.push(`Line ${lineNumber}: Email is required and must be in a valid format`);

      // Check for duplicate in the file
      if (codeSet.has(Code)) errors.push(`Line ${lineNumber}: Duplicate Code: ${Code}`);
      if (emailSet.has(Email)) errors.push(`Line ${lineNumber}: Duplicate Email: ${Email}`);
      if (phoneSet.has(Phone)) errors.push(`Line ${lineNumber}: Duplicate Phone: ${Phone}`);

      codeSet.add(Code);
      emailSet.add(Email);
      phoneSet.add(Phone);
    });

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    return true;
  }
}
