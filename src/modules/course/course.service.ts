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

  async listCourse(code: string, page = 1, limit = 20) {
    try {
      const query = this.courseRepository.createQueryBuilder('course');
      if (code) {
        query.where('course.code = :code', { code });
      }
      query.orderBy('course.createdAt', 'ASC');
      query.skip((page - 1) * limit);
      query.take(limit);
      return await query.getMany();
    } catch (error) {
      return error;
    }
  }

  async getDetailCourse(courseId: string) {
    try {
      return await this.courseRepository.findOne({ where: { id: courseId } });
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
