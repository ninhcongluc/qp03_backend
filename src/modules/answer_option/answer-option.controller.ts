import { Request, Response,  } from "express";
import { StatusCodes } from "http-status-codes";
import { AnswerOptionService } from "./answer-option.service";

export class AnswerOptionController {
  constructor (private readonly answerOptionService: AnswerOptionService) {}

  // create Answer Option 
  async createAnswerOption(req: Request, res: Response) {
    try {
      const newAnswerOption = await this.answerOptionService.createAnswerOption(req.body);
      return res.status(201).send({ data: newAnswerOption, status: StatusCodes.CREATED });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  // list Answer Option by ...
  async listAnswerOptions(req: Request, res: Response) {
    try {
      const questionId = req.params.questionId; // Assuming question ID is in the URL params
      const answerOptions = await this.answerOptionService.listAnswerOptions(questionId);
      return res.status(200).send({ data: answerOptions, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  // get Answer Option by ...
  async getAnswerOptionById(req: Request, res: Response) {
    try {
      const answerOptionId = req.params.id; // Assuming answer option ID is in the URL params
      const answerOption = await this.answerOptionService.getAnswerOptionById(answerOptionId);
      return res.status(200).send({ data: answerOption, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  // update Answer Option 
  async updateAnswerOption(req: Request, res: Response) {
    try {
      const answerOptionId = req.params.id; // Assuming answer option ID is in the URL params
      const updatedAnswerOption = await this.answerOptionService.updateAnswerOption(answerOptionId, req.body);
      return res.status(200).send({ data: updatedAnswerOption, status: StatusCodes.OK });
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

  // delete Answer Option 
  async deleteAnswerOption(req: Request, res: Response) {
    try {
      const answerOptionId = req.params.id; // Assuming answer option ID is in the URL params
      await this.answerOptionService.deleteAnswerOption(answerOptionId);
      return res.status(204).send({ status: StatusCodes.NO_CONTENT }); // No content to return on successful deletion
    } catch (error) {
      return res.status(400).send({ error: error.message, status: StatusCodes.BAD_REQUEST });
    }
  }

}