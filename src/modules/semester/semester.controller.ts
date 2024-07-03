import {Request, Response} from 'express';
import {StatusCodes} from 'http-status-codes';
import {SemesterService} from './semester.service';

export class SemesterController {
    constructor(private readonly semesterService: SemesterService) {}

    async createSemester(req: Request, res: Response) {
        try {
            const newSemester = await this.semesterService.createSemester(req.body);
            return res.status(201).send({data: newSemester, status: StatusCodes.CREATED});
        } catch (error) {
            return res.status(400).send({error: error.message, status: StatusCodes.BAD_REQUEST});
        }
    }

    async listSemester(req: Request, res: Response) {
        try {
            const semesters = await this.semesterService.listSemester();
            return res.status(200).send({data: semesters, status: StatusCodes.OK});
        } catch (error) {
            return res.status(400).send({error: error.message, status: StatusCodes.BAD_REQUEST});
        }
    }

    async deleteSemester(req: Request, res: Response) {
        try {
            const semesterId = req.params.id;
            const result = await this.semesterService.deleteSemester(semesterId);
            return res.status(200).send({data: result, status: StatusCodes.OK});
        } catch (error) {
            return res.status(400).send({error: error.message, status: StatusCodes.BAD_REQUEST});
        }
    }

    async updateSemester(req: Request, res: Response) {
        try {
            const semesterId = req.params.id;
            const result = await this.semesterService.updateSemester(semesterId, req.body);
            return res.status(200).send({data: result, status: StatusCodes.OK});
        } catch (error) {
            return res.status(400).send({error: error.message, status: StatusCodes.BAD_REQUEST});
        }
    }
}