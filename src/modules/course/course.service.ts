import { DataSource, Repository } from "typeorm";
import { Course } from "./course.model";
import { AppObject } from "../../commons/consts/app.objects";


export class CourseService {
  private courseRepository: Repository<Course>;

  constructor(private readonly dataSource: DataSource) {
    this.courseRepository = this.dataSource.getRepository(Course);
  }

  // create Course and not same course in a semester
  async createCourse(data) {
    try {

      const existingCourse = await this.courseRepository.findOne({
        where: {
          code: data.code,
          semesterId: data.semesterId
        }
      });

      if (existingCourse) {
        throw new Error("You can't create the same course in a semester")
      }

      // create new course 
      const newCourse = this.courseRepository.create(data);
      return await this.courseRepository.save(newCourse);
    } catch (error) {
      // catch the bug to save trace stack
      throw new Error(error.message || "Fail when create the Course");
    }
  }

  // finding about filter semesterId
  // pagging 

  // listCourse
  async listCourseByRole(roleId: number) {
    try {
      return await this.courseRepository.find({ where: {} });
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


  // update Course
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