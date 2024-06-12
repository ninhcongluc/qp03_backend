import { Router, Request, Response } from 'express';
import { authentication } from '../auth/auth.middleware'; // Assuming only authentication is needed (no authorization)
import { AnswerOptionService } from './answer-option.service'; // Import the answer option service
import AppDataSource from '../../configs/connect-db'; // Assuming your data source is in 'connect-db.js'

export class AnswerOptionRoute {
  private readonly answerOptionService: AnswerOptionService;
  private readonly router: Router;

  constructor() {
    this.answerOptionService = new AnswerOptionService(AppDataSource); // Create the answer option service
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    // Create an answer option
    this.router.post('/', authentication, async (req: Request, res: Response) => {
      try {
        const newAnswerOption = await this.answerOptionService.createAnswerOption(req.body);
        return res.status(201).send({ data: newAnswerOption, status: 201 });
      } catch (error) {
        console.error('Error creating answer option:', error);
        return res.status(400).send({ error: error.message, status: 400 });
      }
    });

    // List answer options for a question (assuming question ID is in the URL params)
    this.router.get('/:questionId', authentication, async (req: Request, res: Response) => {
      try {
        const questionId = req.params.questionId;
        const answerOptions = await this.answerOptionService.listAnswerOptions(questionId);
        return res.status(200).send({ data: answerOptions, status: 200 });
      } catch (error) {
        console.error('Error listing answer options:', error);
        return res.status(400).send({ error: error.message, status: 400 });
      }
    });

    // Get an answer option by its ID
    this.router.get('/:id', authentication, async (req: Request, res: Response) => {
      try {
        const answerOptionId = req.params.id;
        const answerOption = await this.answerOptionService.getAnswerOptionById(answerOptionId);
        return res.status(200).send({ data: answerOption, status: 200 });
      } catch (error) {
        console.error('Error getting answer option by ID:', error);
        return res.status(400).send({ error: error.message, status: 400 });
      }
    });

    // Update an answer option (assuming ID is in the URL params)
    this.router.put('/:id', authentication, async (req: Request, res: Response) => {
      try {
        const answerOptionId = req.params.id;
        const updatedAnswerOption = await this.answerOptionService.updateAnswerOption(answerOptionId, req.body);
        return res.status(200).send({ data: updatedAnswerOption, status: 200 });
      } catch (error) {
        console.error('Error updating answer option:', error);
        return res.status(400).send({ error: error.message, status: 400 });
      }
    });

    // Delete an answer option
    this.router.delete('/:id', authentication, async (req: Request, res: Response) => {
      try {
        const answerOptionId = req.params.id;
        await this.answerOptionService.deleteAnswerOption(answerOptionId);
        return res.status(204).send({ status: 204 }); // No content to return on successful deletion
      } catch (error) {
        console.error('Error deleting answer option:', error);
        return res.status(400).send({ error: error.message, status: 400 });
      }
    });
  }

  getRouter() {
    return this.router;
  }
}

export default new AnswerOptionRoute().getRouter(); // Export the router directly
