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

      // 1 semester có ít là 70 ngày
      const minDuration = 70 * 24 * 60 * 60 * 1000;
      if (endDate.getTime() - startDate.getTime() < minDuration) {
        throw new Error('Semester must last at least 70 days');
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

  async listSemester(isActive: boolean) {
    try {
      // Auto inactivate semester if current date > endDate
      await this.semesterRepository
        .createQueryBuilder('semester')
        .update()
        .set({ isActive: false })
        .where(`semester."endDate" < :currentDate`, { currentDate: new Date() })
        .execute();

      const qb = this.semesterRepository
        .createQueryBuilder('semester')
        .where('1=1')
        .orderBy('semester.startDate', 'DESC')
        .addOrderBy('semester.createdAt', 'DESC');
      if (isActive) {
        qb.andWhere('semester.isActive = :isActive', { isActive });
      }
      return await qb.getMany();
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

      const isSemesterUsed = await this.checkSemesterIsUsed(semesterId);
      if (isSemesterUsed) {
        throw new Error('Semester is used in course');
      }

      return await this.semesterRepository.delete(semesterId);
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateSemester(semesterId: string, data) {
    try {
      const semester = await this.semesterRepository.findOne({
        where: {
          id: semesterId
        }
      });
      //if currentDate > endDate => can not active semester that is ended
      if (data.isActive && new Date() > semester.endDate) {
        throw new Error('Semester is ended. Can not active');
      }

      const isSemesterUsed = await this.checkSemesterIsUsed(semesterId);
      if (isSemesterUsed) {
        throw new Error('Semester is used in course');
      }

      return await this.semesterRepository.update(semesterId, data);
    } catch (error) {
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
