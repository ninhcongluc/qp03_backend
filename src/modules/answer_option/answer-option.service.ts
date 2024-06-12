import { DataSource, Repository } from 'typeorm';
import { AnswerOption } from './answer-option.model';

export class AnswerOptionService {
  private answerOptionRepository: Repository<AnswerOption>;

  constructor(private readonly dataSource: DataSource) {
    this.answerOptionRepository = this.dataSource.getRepository(AnswerOption);
  }

  // Create a new answer option
  async createAnswerOption(data: AnswerOption): Promise<AnswerOption> {
    try {
      const newAnswerOption = this.answerOptionRepository.create(data);
      return await this.answerOptionRepository.save(newAnswerOption);
    } catch (error) {
      throw new Error(`Failed to create answer option: ${error.message}`); // Specific error message
    }
  }

  // List all answer options for a question
  async listAnswerOptions(questionId: string): Promise<AnswerOption[]> {
    try {
      return await this.answerOptionRepository.find({ where: { questionId } });
    } catch (error) {
      console.error('Error fetching answer options:', error);
      if (error.message.includes('QuestionNotFound')) {
        throw new Error('Question with ID does not exist'); // Specific error for question not found
      }
      throw new Error('Failed to list answer options'); // Generic error for other issues
    }
  }

  // Get an answer option by its ID
  async getAnswerOptionById(id: string): Promise<AnswerOption | null> {
    try {
      return await this.answerOptionRepository.findOne({ where: { id } });
    } catch (error) {
      console.error('Error fetching answer option by ID:', error);
      throw new Error('Failed to get answer option'); // Generic error
    }
  }

  // Update an existing answer option
  async updateAnswerOption(id: string, data: Partial<AnswerOption>): Promise<AnswerOption> {
    try {
      const answerOption = await this.answerOptionRepository.findOne({ where: { id } });
      if (!answerOption) {
        throw new Error('Answer option not found');
      }

      // Update only the specified properties
      Object.assign(answerOption, data);
      return await this.answerOptionRepository.save(answerOption);
    } catch (error) {
      throw new Error(`Failed to update answer option: ${error.message}`); // Specific error message
    }
  }

  // Delete an answer option
  async deleteAnswerOption(id: string): Promise<void> {
    try {
      const answerOption = await this.answerOptionRepository.findOne({ where: { id } });
      if (!answerOption) {
        throw new Error('Answer option not found');
      }
      await this.answerOptionRepository.delete(answerOption);
    } catch (error) {
      throw new Error(`Failed to delete answer option: ${error.message}`); // Specific error message
    }
  }
}
