import { DataSource, Repository } from "typeorm";
import { Semester } from "./semester.model";

export class SemesterService {
    private semesterRepository: Repository<Semester>;

    constructor(private readonly dataSource: DataSource) {
        this.semesterRepository = this.dataSource.getRepository(Semester);
    }

    async createSemester(data) {
        try {
            const newSemester = this.semesterRepository.create({
                ...data,
                isActive: true
            });
            return await this.semesterRepository.save(newSemester);
        } catch (error) {
            throw new Error(error);
        }
    }

    async listSemester() {
        try {
            return await this.semesterRepository.find();
        } catch (error) {
            return error;
        }
    }

    async deleteSemester(semesterId: string) {
        try {
            return await this.semesterRepository.delete(semesterId);
        } catch (error) {
            return error;
        }
    }
}