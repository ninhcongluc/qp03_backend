import e, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { QuestionService } from './question.service';
import xlsx from 'xlsx';
import fs from 'fs';

export class QuestionController {
    constructor(private readonly questionService: QuestionService) { }

    async createQuestion(req: Request, res: Response) {
        try {
            const newQuestion = await this.questionService.createQuestion(req.body);
            return res.status(201).send({ data: newQuestion, status: StatusCodes.CREATED });
        } catch (error) {
            return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
        }
    }

    async listQuestion(req: Request, res: Response) {
        try {
            const teacherId = req.params.teacherId;
            const questions = await this.questionService.listQuestion(teacherId, req.query);
            return res.status(200).send({ data: questions, status: StatusCodes.OK });
        } catch (error) {
            return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
        }
    }

    async detailQuestion(req: Request, res: Response) {
        try {
            const questionId = req.params.questionId;
            const questions = await this.questionService.getDetailQuestion(questionId);
            return res.status(200).send({ data: questions, status: StatusCodes.OK });
        } catch (error) {
            return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
        }
    }

    async updateQuestion(req: Request, res: Response) {
        try {
            const questionId = req.params.id;
            const updatedQuestion = await this.questionService.updateQuestion(questionId, req.body);
            return res.status(200).send({ data: updatedQuestion, status: StatusCodes.OK });
        } catch (error) {
            return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
        }
    }

    async deleteQuestion(req: Request, res: Response) {
        try {
            const questionId = req.params.id;
            await this.questionService.deleteQuestion(questionId);
            return res.status(204).send({ status: StatusCodes.NO_CONTENT });
        } catch (error) {
            return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
        }
    }

    // // import question and answer by excel
    async importQuestion(req: Request, res: Response) {
        try {
            const teacherId = req.params.teacherId;
            const filePath = req.file.path;
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(sheet);
            await fs.promises.unlink(filePath).catch(console.error);
            const result = await this.questionService.importQuestion(data, teacherId);
            return res.status(200).send({ data: result, status: StatusCodes.OK });
        } catch (error) {
            return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
        }
    }

    // export question and answer by excel
    async exportQuestion(req: Request, res: Response) {
        try {
            const teacherId = req.params.teacherId;
            const excelData = await this.questionService.exportQuestion(teacherId);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=QuestionList.xlsx');
            res.send(excelData);
        } catch (error) {
            console.error('Error exporting Excel file:', error);
            res.status(500).send('Error exporting Excel file');
        }
    }

}
