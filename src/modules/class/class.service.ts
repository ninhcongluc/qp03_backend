import { DataSource, Repository } from 'typeorm';
import { Class } from './class.model';
export class ClassService {
  private classRepository: Repository<Class>;

  constructor(private readonly dataSource: DataSource) {
    this.classRepository = this.dataSource.getRepository(Class);
  }

  async listClassForTeacher(teacherId: String) {
    try {
      return await this.classRepository.find({ where: { teacherId: String(teacherId) } });
    } catch (error) {
      return error;
    }
  }

  async listClass(courseId: String) {
    try {
      return await this.dataSource
        .getRepository('class')
        .createQueryBuilder('class')
        .leftJoinAndSelect('class.teacher', 'user')
        .where('class.courseId = :courseId', { courseId })
        .orderBy('class.name', 'ASC')
        .getMany();
    } catch (error) {
      throw new Error(error);
    }
  }

  async createClass(data: Class) {
    try {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      const code = data.code;
      if (code.length !== 6) {
        throw new Error('Code class must be 6 characters');
      }

      const classExist = await this.classRepository.findOne({
        where: {
          code: data.code,
          courseId: data.courseId
        }
      });
      if (classExist) {
        throw new Error(`Class ${classExist.code} is existed in system`);
      }

      const timeClass = endDate.getTime() - startDate.getTime();
      const minDuration = 35 * 24 * 60 * 60 * 1000;
      if (timeClass < minDuration) {
        throw new Error('Class must last at least 35 days');
      }

      const course = await this.dataSource.getRepository('Course').findOne({ where: { id: data.courseId } });
      const semester = await this.dataSource.getRepository('Semester').findOne({ where: { id: course.semesterId } });
      if (semester.startDate > startDate || semester.endDate < endDate) {
        throw new Error('Class must be in semester');
      }

      const newClass = this.classRepository.create({
        ...data,
        maxParticipants: 30,
        isActive: true
      });
      return await this.classRepository.save(newClass);
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateClass(classId: String, data: Class) {
    try {
      // check khong trung mã code của lớp học trong 1 cousre
      const classExist = await this.classRepository.findOne({
        where: {
          code: data.code,
          courseId: data.courseId
        }
      });

      if (classExist && classExist.id !== classId) {
        throw new Error(`Class ${data.code} is existed in system`);
      }

      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      const timeClass = endDate.getTime() - startDate.getTime();
      const minDuration = 35 * 24 * 60 * 60 * 1000;
      if (timeClass < minDuration) {
        throw new Error('Class must last at least 35 days');
      }
      const course = await this.dataSource.getRepository('Course').findOne({ where: { id: data.courseId } });
      const semester = await this.dataSource.getRepository('Semester').findOne({ where: { id: course.semesterId } });
      if (semester.startDate > data.startDate || semester.endDate < data.endDate) {
        console.log(semester.startDate, data.startDate, semester.endDate, data.endDate);
        throw new Error('Class must be in semester');
      }
      if ((await this.checkClassIsUsed(classId)) || (await this.checkClassHaveQuiz(classId))) {
        throw new Error('Class is used in system');
      }
      return await this.classRepository.update({ id: String(classId) }, data);
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteClass(classId: String) {
    try {
      const classExist = await this.classRepository.findOne({ where: { id: String(classId) } });
      if (!classExist) {
        throw new Error('Class is not existed');
      }

      if ((await this.checkClassIsUsed(classId)) || (await this.checkClassHaveQuiz(classId))) {
        throw new Error('Class is used in system');
      }

      return await this.classRepository.delete({ id: String(classId) });
    } catch (error) {
      throw new Error(error);
    }
  }

  async viewClassDetails(classId: String) {
    try {
      return await this.classRepository.findOne({ where: { id: String(classId) } });
    } catch (error) {
      throw new Error(error);
    }
  }

  async checkClassIsUsed(classId: String) {
    const classIsUsed = await this.dataSource
      .getRepository('ClassParticipants')
      .createQueryBuilder('classParticipants')
      .where('classParticipants.classId = :classId', { classId })
      .getOne();
    return classIsUsed ? true : false;
  }

  async checkClassHaveQuiz(classId: String) {
    const classHaveQuiz = await this.dataSource
      .getRepository('Quiz')
      .createQueryBuilder('quiz')
      .where('quiz.classId = :classId', { classId })
      .getOne();
    return classHaveQuiz ? true : false;
  }

  async listClassByTeacher(teacherId: String) {
    try {
      return await this.dataSource
        .getRepository('class')
        .createQueryBuilder('class')
        .leftJoinAndSelect('class.course', 'course')
        .where('class.teacherId = :teacherId', { teacherId })
        .getMany();
    } catch (error) {
      throw new Error(error);
    }
  }

  async listClassByStudent(userId: String) {
    try {
      return await this.dataSource
        .getRepository('class')
        .createQueryBuilder('class')
        .leftJoin('class.classParticipants', 'classParticipants')
        .leftJoinAndSelect('class.course', 'course')
        .where('classParticipants.userId = :userId AND class.isActive = true', { userId })
        .getMany();
    } catch (error) {
      throw new Error(error);
    }
  }
}
