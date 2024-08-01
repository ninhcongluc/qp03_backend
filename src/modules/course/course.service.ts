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
      if (!(data.code.length >= 6 && data.code.length <= 8)) {
        throw new Error('Code must be 6 - 8 characters.');
      }
      if (!(data.name.length >= 10 && data.name.length <= 50)) {
        throw new Error('Name must be 10 - 50 characters.');
      }
      if (!(data.description.length >= 1 && data.description.length <= 80)) {
        throw new Error('Description must be 1 - 80 characters.');
      }
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

      // check end date of semester vs current date có cách nhau 35 ngày không
      const semester = await this.dataSource
        .getRepository('semester')
        .createQueryBuilder('semester')
        .where('semester.id = :semesterId', { semesterId: data.semesterId })
        .getOne();
      // semster có active = true
      console.log('semester', semester.isActive);
      if (!semester.isActive) {
        throw new Error('Semester is not active');
      }

      if (semester) {
        const currentDate = new Date();
        const endDate = new Date(semester.endDate);
        const diffTime = endDate.getTime() - currentDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        console.log('diffDays', diffDays);
        if (diffDays < 0) {
          throw new Error('You can not create course in a semester that has ended');
        }

        if (diffDays < 35) {
          throw new Error('You can not create course in a semester that end less than 35 days');
        }
      }

      const newCourse = this.courseRepository.create({
        ...data,
        isActive: false
      });

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
        .leftJoinAndSelect('course.manager', 'manager')
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
        };
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

  async getDetailCourse(courseId: string, query) {
    try {
      const queryBuilder = this.courseRepository
        .createQueryBuilder('course')
        .leftJoinAndSelect('course.classes', 'class')
        .leftJoinAndSelect('course.semester', 'semester')
        .where('course.id = :courseId', { courseId });

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
      //check khong trung mã code của môn học trong cùng 1 semester
      const course1 = await this.courseRepository.findOne({
        where: {
          code: data.code,
          semesterId: data.semesterId
        }
      });

      if (course1 && course1.id !== courseId) {
        throw new Error(`Course ${data.code} is existed in system`);
      }

      const isSemesterUsed = await this.checkSemesterIsUsed(courseId);
      if (isSemesterUsed && data.isActive === false) {
        throw new Error('There are classes in this course');
      }

      // check end date of semester vs current date có cách nhau 35 ngày không
      const semester = await this.dataSource
        .getRepository('semester')
        .createQueryBuilder('semester')
        .where('semester.id = :semesterId', { semesterId: data.semesterId })
        .getOne();

      if (!semester.isActive) {
        throw new Error('Semester is not active');
      }


      if (semester) {
        const currentDate = new Date();
        const endDate = new Date(semester.endDate);
        const diffTime = endDate.getTime() - currentDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        console.log('diffDays', diffDays);
        if (diffDays < 0) {
          throw new Error('You can not update course in a semester that has ended');
        }

        if (diffDays < 35) {
          throw new Error('You can not update course in a semester that end less than 35 days');
        }
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
      if (course.isActive) {
        throw new Error('Course is in used');
      }
      return await this.courseRepository.remove(course);
    } catch (error) {
      throw new Error(error);
    }
  }

  async getCourseDetails(courseId: string) {
    try {
      return await this.dataSource
        .getRepository('course')
        .createQueryBuilder('course')
        .leftJoinAndSelect('course.manager', 'user')
        .leftJoinAndSelect('course.semester', 'semester')
        .where('course.id = :courseId', { courseId })
        .getOne();
    } catch (error) {
      throw new Error(error);
    }
  }

  async checkSemesterIsUsed(courseId: string) {
    // kiểm tra xem semester có được sử dụng trong course không
    const course = await this.dataSource
      .getRepository('class')
      .createQueryBuilder('class')
      .where('class.courseId = :courseId', { courseId })
      .getOne();

    return course ? true : false;
  }

  //check semester have end less than current date
  async checkSemesterStart(semesterId: string): Promise<boolean> {
    const semester = await this.dataSource
      .getRepository('semester')
      .createQueryBuilder('semester')
      .where('semester.id = :semesterId', { semesterId })
      .andWhere('semester.endDate > :currentDate', { currentDate: new Date() })
      .getOne();

    return semester ? true : false;
  }

  async getCoursesList(teacherId: string) {
    try {
      const courses = this.courseRepository
        .createQueryBuilder('course')
        .leftJoin('course.classes', 'class')
        .where('class.teacherId = :teacherId', { teacherId })
        .getMany();

      return courses;
    } catch (error) {
      throw new Error(error);
    }
  }

}
