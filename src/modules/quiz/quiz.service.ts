import { DataSource, Repository } from "typeorm";
import { Quiz } from "./quiz.model";
import { Class } from "../class/class.model";

export class QuizService {
    private quizRepository: Repository<Quiz>;

    constructor(private readonly dataSource: DataSource) {
        this.quizRepository = this.dataSource.getRepository(Quiz);
    }

    async createQuiz(data: any, classId: String) {
        try {
            const classExisted = await this.dataSource.getRepository(Class).findOne({ where: { id: String(classId) } });
            if (!classExisted) {
                throw new Error("Class not found");
            }
            const startDate = new Date(data.startDate);
            const endDate = new Date(data.endDate);
            if (startDate < classExisted.startDate || endDate > classExisted.endDate ||
                startDate > classExisted.endDate || endDate > classExisted.startDate) {
                throw new Error("Start date or end date is invalid");
            }
            const newQuiz = this.quizRepository
                .create({
                    classId: String(classId),
                    ...data,
                    isActive: true,
                });
            return await this.quizRepository.save(newQuiz);
        } catch (error) {
            throw new Error(error);
        }
    }

    async listQuiz(classId: String) {
        try {
            const classExisted = await this.dataSource.getRepository(Class).findOne({ where: { id: String(classId) } });
            if (!classExisted) {
                throw new Error("Class not found");
            }
            return await this.quizRepository.find({ where: { classId: String(classId) } });
        } catch (error) {
            return error;
        }
    }

    async getDetailQuiz(quizName: String, classId: String) {
        try {
            const classExisted = await this.dataSource.getRepository(Class).findOne({ where: { id: String(classId) } });
            if (!classExisted) {
                throw new Error("Class not found");
            }
            return await this.quizRepository.findOne({ where: { name: String(quizName), classId: String(classId) } });
        } catch (error) {
            return error;
        }
    }

    async deleteQuiz(quizName: String, classId: String) {
        try {
            const classExisted = await this.dataSource.getRepository(Class).findOne({ where: { id: String(classId) } });
            if (!classExisted) {
                throw new Error("Class not found");
            }
            const quiz = await this.quizRepository.findOne({ where: { name: String(quizName), classId: String(classId) } });
            if (!quiz) {
                throw new Error("Quiz not found");
            }
            return await this.quizRepository.remove(quiz);
        } catch (error) {
            throw new Error(error);
        }
    }

    async updateQuiz(quizName: String, classId: String, data: any) {
        try {
            const classExisted = await this.dataSource.getRepository(Class).findOne({ where: { id: String(classId) } });
            if (!classExisted) {
                throw new Error("Class not found");
            }
            const startDate = new Date(data.startDate);
            const endDate = new Date(data.endDate);
            if (startDate < classExisted.startDate || endDate > classExisted.endDate ||
                startDate > classExisted.endDate || endDate > classExisted.startDate) {
                throw new Error("Start date or end date is invalid");
            }
            const quiz = await this.quizRepository.findOne({ where: { name: String(quizName), classId: String(classId) } });
            if (!quiz) {
                throw new Error("Quiz not found");
            }
            return await this.quizRepository.save({ ...quiz, ...data });
        } catch (error) {
            throw new Error(error);
        }
    }
}