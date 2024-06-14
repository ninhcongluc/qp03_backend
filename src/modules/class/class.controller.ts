import { Response, Request } from "express";
import { ClassService } from "./class.service";
import { StatusCodes } from "http-status-codes";


export class ClassController {
    constructor(private readonly classService: ClassService) {}

    async listClassForTeacher(req: Request, res: Response) {
        const teacherId = String(req.params.teacherId);
        try {
            const classes = await this.classService.listClassForTeacher(teacherId);
            return res.status(200).send({ data: classes, status: StatusCodes.OK });
        } catch (error) {
            return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
        }
    }
}