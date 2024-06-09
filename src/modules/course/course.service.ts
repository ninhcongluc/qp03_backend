import { DataSource, Repository } from "typeorm";
import { Course } from "./course.model";
import { AppObject } from "../../commons/consts/app.objects";

export class CourseService {
  private courseRepository: Repository<Course>;

  constructor(private readonly dataSource: DataSource) {
    this.courseRepository = this.dataSource.getRepository(Course);
  }

  async createCourse(data) {
    try {
      const newCourse = this.courseRepository.create({
        ...data,
        status: AppObject.STATUS_CODE.ACTIVE,
      });
      return await this.courseRepository.save(newCourse);
    } catch (error) {
      throw new Error(error);
    }
  }

  async listCourse() {
    try {
      return await this.courseRepository.find();
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
        throw new Error("Course not found");
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
        throw new Error("Course not found");
      }
      return await this.courseRepository.remove(course);
    } catch (error) {
      throw new Error(error);
    }
  }
}