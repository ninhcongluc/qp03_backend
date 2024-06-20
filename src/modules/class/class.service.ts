import { DataSource, Repository } from "typeorm";
import { Class } from "./class.model";
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

}