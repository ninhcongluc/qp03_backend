import { DataSource, Repository } from 'typeorm';
import { Course } from './course.model';
import { AppObject } from '../../commons/consts/app.objects';

export class CourseService {
  private courseRepository: Repository<Course>;

  constructor(private readonly dataSource: DataSource) {
    this.courseRepository = this.dataSource.getRepository(Course);
  }

  async createCourse(data) {
    try {
      // validate khong duoc tao trung course trong 1 ky
      const course = await this.courseRepository.findOne({
        where: {
          code: data.code,
          semesterId: data.semesterId
        }
      });

      if (course) {
        throw new Error('You can not create duplicate course in a semester');
      }
      const newCourse = this.courseRepository.create(data);
      return await this.courseRepository.save(newCourse);
    } catch (error) {
      throw new Error(error);
    }
  }

  async listCourse(query) {
    try {
      const { code, page = AppObject.DEFAULT_PAGE, limit = AppObject.DEFAULT_LIMIT, semesterId } = query;
      const queryBuilder = this.courseRepository
        .createQueryBuilder('course')
        .leftJoin('course.classes', 'class')
        .leftJoinAndSelect('course.semester', 'semester')
        .where('1=1');
      if (query.teacherId) {
        queryBuilder.andWhere('class.teacherId = :teacherId', { teacherId: query.teacherId });
      }
      if (code) {
        queryBuilder.andWhere('course.code ILike :code', { code: `%${code}%` });
      }

      if (semesterId) {
        queryBuilder.andWhere('course.semesterId = :semesterId', { semesterId: query.semesterId });
      }
      queryBuilder.orderBy('course.createdAt', 'DESC');
      queryBuilder.skip((Number(page) - 1) * Number(limit));
      queryBuilder.take(Number(limit));

      const [courses, total] = await queryBuilder.getManyAndCount();

      return {
        page: Number(page),
        total,
        courses
      };
    } catch (error) {
      return error;
    }
  }

  async listStudentCourses(userId: string, query) {
    try {
      const { code, page = AppObject.DEFAULT_PAGE, limit = AppObject.DEFAULT_LIMIT, semesterId } = query;
      const queryBuilder = this.courseRepository
        .createQueryBuilder('course')
        .leftJoinAndSelect('course.classes', 'class')
        .leftJoinAndSelect('class.classParticipants', 'classParticipants')
        .leftJoinAndSelect('course.semester', 'semester')
        .where('classParticipants.userId = :userId and course.isActive = true', {
          userId
        });
      if (code) {
        queryBuilder.andWhere('course.code ILike :code', { code: `%${code}%` });
      }

      if (semesterId) {
        queryBuilder.andWhere('course.semesterId = :semesterId', { semesterId: query.semesterId });
      }
      queryBuilder.orderBy('course.createdAt', 'DESC');
      queryBuilder.skip((Number(page) - 1) * Number(limit));
      queryBuilder.take(Number(limit));

      const [courses, total] = await queryBuilder.getManyAndCount();
      console.log('courses', courses);
      const mappedCourses = courses.map(course => {
       return {
        id: course.id,
        semesterId: course.semesterId,
        code: course.code,
        name: course.name,
        description: course.description,
        classId: course?.classes[0].id,
        classCode: course?.classes[0].code,
        className: course?.classes[0].name,
        semester: course.semester
       }
      });

      return {
        page: Number(page),
        total,
        courses: mappedCourses
      };
    } catch (error) {
      return error;
    }
  }




  

  async getDetailCourse(classId: string, query) {
    try {
      const queryBuilder = this.courseRepository
        .createQueryBuilder('course')
        .leftJoinAndSelect('course.classes', 'class')
        .leftJoinAndSelect('course.semester', 'semester')
        .where('class.id = :classId', { classId });

      if (query.teacherId) {
        queryBuilder.andWhere('class.teacherId = :teacherId', { teacherId: query.teacherId });
      }

      return await queryBuilder.getOne();
    } catch (error) {
      return error;
    }
  }

  async updateCourse(courseId: string, data) {
    try {
      const course = await this.courseRepository.findOne({ where: { id: courseId } });
      if (!course) {
        throw new Error('Course not found');
      }
      return await this.courseRepository.save({ ...course, ...data });
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteCourse(courseId: string) {
    try {
      const course = await this.courseRepository.findOne({ where: { id: courseId } });
      if (!course) {
        throw new Error('Course not found');
      }
      return await this.courseRepository.remove(course);
    } catch (error) {
      throw new Error(error);
    }
  }
}
