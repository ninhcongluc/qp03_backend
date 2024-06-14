import { DataSource, Repository } from "typeorm";
import { Semester } from "./semester.model";

export class SemesterService {
    private semesterRepository: Repository<Semester>;
    constructor(private readonly dataSource: DataSource) {
        this.semesterRepository = this.dataSource.getRepository(Semester);
    }

    async createSemester(data) {
        try {
            const semester = await this.semesterRepository.findOne({
                where: {
                    name: data.name
                }
            });

            console.log(semester);
            if(semester) {
                throw new Error("Semester is existed in system")
            }

            // check condition date khong duoc trong date da tao
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
            throw new Error(error);
        }
    }

    async deleteSemester(semesterId: string) {
        console.log('semesterId', semesterId)
        try {
            const semester = await this.semesterRepository.findOne({
                where: {
                    id: semesterId
                }
            });

            console.log(semester);
            if(!semester) {
                throw new Error("Semester is not exist")
            }


            return await this.semesterRepository.delete(semesterId);
        } catch (error) {
            throw new Error(error);
        }
    }
}