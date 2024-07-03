import { DataSource, Repository } from 'typeorm';
import { Semester } from './semester.model';

export class SemesterService {
  private semesterRepository: Repository<Semester>;
  constructor(private readonly dataSource: DataSource) {
    this.semesterRepository = this.dataSource.getRepository(Semester);
  }

  async createSemester(data) {
    try {
      const { name, startDate, endDate } = data;
      const semester = await this.semesterRepository.findOne({
        where: {
          name
        }
      });

      console.log(semester);
      if (semester) {
        throw new Error('Semester is existed in system');
      }

      if (startDate > endDate) {
        throw new Error('Start date must be less than end date');
      }
      // Kiểm tra xem có semester nào có thời gian chồng chéo không
      const overlappingSemesters = await this.semesterRepository
        .createQueryBuilder('semester')
        .where('semester.startDate < :endDate AND semester.endDate > :startDate', {
          startDate,
          endDate
        })
        .getOne();

      if (overlappingSemesters) {
        throw new Error('Semester is overlapping with another semester');
      }

      const newSemester = this.semesterRepository.create({
        ...data,
        isActive: false
      });
      return await this.semesterRepository.save(newSemester);
    } catch (error) {
      throw new Error(error);
    }
  }

  async listSemester() {
    try {
      return await this.semesterRepository.find({
        order: {
          startDate: 'DESC'
        }
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteSemester(semesterId: string) {
    try {
      
      const semester = await this.semesterRepository.findOne({
        where: {
          id: semesterId
        }
      });
      if (!semester) {
        throw new Error('Semester is not exist');
      }
      if(semester.isActive){
          throw new Error('Semester is active');
      }

      return await this.semesterRepository.delete(semesterId);
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateSemester(semesterId: string, data) {
    try{
      const isSemesterUsed = await this.checkSemesterIsUsed(semesterId);
      if (isSemesterUsed && data.isActive === false) {
        throw new Error('Semester is used in course');
      }

      return await this.semesterRepository.update(semesterId, data);
    }catch(error){
      throw new Error(error);
    }
  }

  async checkSemesterIsUsed(semesterId: string): Promise<boolean> {
    // kiểm tra xem semester có được sử dụng trong course không
    const course = await this.dataSource
      .getRepository('course')
      .createQueryBuilder('course')
      .where('course.semesterId = :semesterId', { semesterId })
      .getOne();

    return course ? true : false;
  }
}
