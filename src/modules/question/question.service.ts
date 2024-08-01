import { DataSource, QueryBuilder, Repository } from 'typeorm';
import { AppObject } from '../../commons/consts/app.objects';
import { Question } from './question.model';
import { QuestionBank } from '../question_bank/question_bank.model';
import { AnswerOption } from '../answer_option/answer-option.model';
import XLSX from 'xlsx';
import { Course } from '../course/course.model';

export class QuestionService {
    private questionRepository: Repository<Question>;

    constructor(private readonly dataSource: DataSource) {
        this.questionRepository = this.dataSource.getRepository(Question);
    }

    async createQuestion(data) {
        console.log(data);
        try {
            const textQuestion = data.question.text.replace(/\s+/g, ' ').trim();
            const question = await this.questionRepository.findOne({ where: { text: textQuestion } });
            if (question) {
                throw new Error('Question already exists');
            }
            const answerOptions = data.question.answerOptions.map((answerOption) => {
                return {
                    answer: answerOption.optionText,
                    isCorrect: answerOption.isCorrect
                };
            });
            //check duplicate answer
            const answerTexts = answerOptions.map((answerOption) => answerOption.answer.replace(/\s+/g, ' ').trim());
            const isDuplicateAnswer = answerTexts.some((answer, index) => answerTexts.indexOf(answer) !== index);
            if (isDuplicateAnswer) {
                throw new Error('Duplicate answer');
            }

            if (answerOptions.length < 2) {
                throw new Error('Answer options must be at least 2');

            }
            const newQuestion = this.questionRepository.create({
                text: textQuestion,
                type: data.question.type,
                score: 0,
                order: 0,
                quizId: null
            });

            await this.questionRepository.save(newQuestion);

            const addedQuestion = await this.questionRepository.findOne({ where: { text: textQuestion } });
            const newAnswerOptions = this.dataSource.getRepository(AnswerOption)
                .create(answerOptions.map((answerOption) => {
                    const answerText = answerOption.answer.replace(/\s+/g, ' ').trim();
                    const answer = {
                        optionText: answerText,
                        isCorrect: answerOption.isCorrect,
                        questionId: addedQuestion.id
                    };
                    return answer;
                }));
            await this.dataSource.getRepository(AnswerOption).save(newAnswerOptions);
            const newQuestionBank = this.dataSource.getRepository(QuestionBank).create({
                questionId: addedQuestion.id,
                teacherId: data.teacherId,
                courseId: data.courseId
            });
            await this.dataSource.getRepository(QuestionBank).save(newQuestionBank);
            return await this.questionRepository.findOne({ where: { text: textQuestion } });
        } catch (error) {
            throw new Error(error);
        }
    }

    async listQuestion(teacherId, query) {
        try {
            const answerList = await this.questionRepository
                .createQueryBuilder('question')
                .leftJoinAndSelect('question.answerOptions', 'answerOptions')
                .getMany();

            for (const answer of answerList) {
                if (answer.answerOptions === null || answer.answerOptions.length === 0) {
                    // Delete question and questionBank
                    await this.dataSource.getRepository(QuestionBank).delete({ questionId: answer.id });
                    await this.questionRepository.delete({ id: answer.id });
                }
            }


            const {
                page = AppObject.DEFAULT_PAGE,
                limit = AppObject.DEFAULT_LIMIT,
                courseId = "",
                searchQuestion = ""
            } = query;
            const pageNumber = Number(page);
            const limitNumber = Number(limit);
            console.log(decodeURIComponent(searchQuestion.replace(/\+/g, ' ')));
            console.log(courseId);
            // Ensure page and limit are valid numbers
            if (isNaN(pageNumber) || isNaN(limitNumber)) {
                throw new Error('Page and limit must be valid numbers');
            }

            const queryBuilder = this.dataSource
                .getRepository(QuestionBank)
                .createQueryBuilder('questionBank')
                .leftJoinAndSelect('questionBank.question', 'question')
                .leftJoinAndSelect('questionBank.course', 'course')
                .leftJoinAndSelect('question.answerOptions', 'answerOptions')
                .where('questionBank.teacherId = :teacherId', { teacherId: teacherId });

            if (courseId) {
                queryBuilder.andWhere('questionBank.courseId = :courseId', { courseId: courseId });
            }
            if (searchQuestion) {
                queryBuilder.andWhere(
                    'question.text like :searchQuestion',
                    { searchQuestion: `%${searchQuestion}%` }
                );
            }
            queryBuilder.orderBy('question.updatedAt', 'DESC');
            queryBuilder.skip((pageNumber - 1) * limitNumber);
            queryBuilder.take(limitNumber);
            const [data, total] = await queryBuilder.getManyAndCount();
            return {
                page: pageNumber,
                total: total,
                questionList: data,
            };
        } catch (error) {
            throw new Error(error);
        }
    }

    async getDetailQuestion(questionId) {
        try {
            return await this.questionRepository
                .createQueryBuilder('question')
                .leftJoinAndSelect('question.answerOptions', 'answerOptions')
                .where('question.id = :questionId', { questionId })
                .getOne();
        } catch (error) {
            throw new Error(error);
        }
    }

    async updateQuestion(questionId, data) {
        console.log(data);
        try {
            const question = await this.questionRepository.findOne({ where: { id: questionId } });
            if (!question) {
                throw new Error('Question not found');
            }

            if (question.quizId) {
                throw new Error('Question is used in quiz');
            }

            const textQuestion = data.question.text.replace(/\s+/g, ' ').trim();
            const questionExist = await this.questionRepository.findOne({ where: { text: textQuestion } });
            if (questionExist && questionExist.id !== questionId) {
                throw new Error('Question already exists');
            }
            console.log(1);
            const newQuestion = {
                text: textQuestion,
                type: data.question.type,
                score: 0,
                order: 0,
                quizId: null
            };

            await this.questionRepository.update(questionId, newQuestion);
            console.log(1);

            const answerOptions = data.question.answerOptions.map((answerOption) => ({
                id: answerOption.id,
                answer: answerOption.optionText.replace(/\s+/g, ' ').trim(),
                isCorrect: answerOption.isCorrect
            }));
            console.log(answerOptions);
            //check duplicate answer
            const answerTexts = answerOptions.map((answerOption) => answerOption.answer.replace(/\s+/g, ' ').trim());
            const isDuplicateAnswer = answerTexts.some((answer, index) => answerTexts.indexOf(answer) !== index);
            if (isDuplicateAnswer) {
                throw new Error('Duplicate answer');
            }
            console.log(1);
            if (answerOptions.length < 2) {
                throw new Error('Answer options must be at least 2');
            }
            console.log(1);
            // Lấy danh sách câu trả lời hiện tại
            const existingAnswerOptions = await this.dataSource.getRepository(AnswerOption).find({ where: { questionId } });
            console.log(1);
            for (const option of answerOptions) {
                const existingOption = existingAnswerOptions.find(opt => opt.id === option.id);
                if (existingOption) {
                    await this.dataSource.getRepository(AnswerOption).update(option.id, {
                        optionText: option.answer,
                        isCorrect: option.isCorrect
                    });
                } else {
                    // Nếu câu trả lời không tồn tại, tạo mới nó
                    await this.dataSource.getRepository(AnswerOption).save({
                        optionText: option.answer,
                        isCorrect: option.isCorrect,
                        questionId
                    });
                }
            }
            console.log(1);
            // Xóa các câu trả lời không còn trong danh sách mới
            for (const existingOption of existingAnswerOptions) {
                if (!answerOptions.find(opt => opt.id === existingOption.id)) {
                    await this.dataSource.getRepository(AnswerOption).remove(existingOption);
                }
            }
            //update course
            if (data.courseId) {
                const questionBank = await this.dataSource.getRepository(QuestionBank).findOne({ where: { questionId: questionId } });
                await this.dataSource.getRepository(QuestionBank).update(questionBank.id, { courseId: data.courseId });
            }
            return await this.questionRepository.findOne({ where: { id: questionId } });
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async deleteQuestion(questionId) {
        try {
            // Find the question by its ID
            const question = await this.questionRepository.findOne({ where: { id: questionId } });
            console.log(questionId);

            // Check if the question exists
            if (!question) {
                throw new Error('Question not found');
            }

            // Check if the question is used in a quiz
            if (question.quizId) {
                throw new Error('Question is used in quiz');
            }

            // Delete from QuestionBank
            await this.dataSource.getRepository(QuestionBank).delete({ questionId });

            // Delete from AnswerOption
            await this.dataSource.getRepository(AnswerOption).delete({ questionId });

            // Delete the question itself
            await this.questionRepository.delete({ id: questionId });
        } catch (error) {
            console.error('Error deleting question:', error.message);
            throw new Error(`Failed to delete question: ${error.message}`);
        }
    }

    // // import question and answer by excel
    async importQuestion(data, teacherId) {
        try {
            if (data === null || data === undefined || data.length === 0) {
                throw new Error('No data found');
            }
            const convertData = (data) => {
                return data.map(item => {
                    // Tạo mảng các tùy chọn từ các thuộc tính với định dạng "AnswerOptionX" và "IsCorrectX"
                    const answerOptions = Object.keys(item)
                        .filter(key => key.startsWith('AnswerOption'))
                        .map((key, index) => {
                            // Tạo các thuộc tính "AnswerOptionX" và "IsCorrectX"
                            const optionIndex = index + 1;
                            if (item[`AnswerOption${optionIndex}`]
                                && (item[`IsCorrect${optionIndex}`] === '' ||
                                    item[`IsCorrect${optionIndex}`] === undefined)) {
                                throw new Error(`IsCorrect${optionIndex} cannot be empty`);
                            }
                            return {
                                optionText: item[`AnswerOption${optionIndex}`],
                                isCorrect: item[`IsCorrect${optionIndex}`]
                            };
                        });
                    if (item.Course === undefined || item.Course.trim === '') {
                        throw new Error('Course code is required');
                    }
                    if (item.Question === undefined || item.Question.trim === '') {
                        throw new Error('Question is required');
                    }
                    if (item.Type === undefined || item.Type.trim === '') {
                        throw new Error('Type is required');
                    }
                    return {
                        course: item.Course.toUpperCase(),
                        question: item.Question,
                        type: item.Type.toLowerCase(),
                        answerOptions: answerOptions
                    };
                });
            };

            const convertedData = convertData(data);
            console.log(convertedData);
            for (const item of convertedData) {
                if (item.type !== 'multiple_choice' && item.type !== 'select_one') {
                    throw new Error(`Question type is multiple_choice or select_one`);
                }
                const course = await this.dataSource.getRepository(Course).findOne({ where: { code: item.course } });
                if (!course) {
                    throw new Error(`Course not found: ${item.course}`);
                }
                const questionText = item.question.replace(/\s+/g, ' ').trim();
                const question = await this.questionRepository.findOne({ where: { text: questionText } });
                if (question) {
                    const existingAnswerOptions = await this.dataSource.getRepository(AnswerOption)
                        .createQueryBuilder('answerOption')
                        .where('questionId = :questionId', { questionId: question.id });
                    // Nếu không có câu trả lời, xóa câu hỏi
                    if (!existingAnswerOptions) {
                        await this.questionRepository.delete(question.id);
                    } else {
                        continue;
                    }
                }

                const newQuestion = this.questionRepository.create({
                    text: questionText,
                    type: item.type,
                    score: 0,
                    order: 0,
                    quizId: null
                });
                await this.questionRepository.save(newQuestion);
                const addedQuestion = await this.questionRepository.findOne({ where: { text: questionText } });
                if (item.answerOptions.length < 2) {
                    throw new Error('Answer options must be at least 2');
                }
                const newAnswerOptions = this.dataSource.getRepository(AnswerOption).create(
                    item.answerOptions.map(answerOption => {
                        const answerText = String(answerOption.optionText).replace(/\s+/g, ' ').trim();
                        if (answerText) {
                            return {
                                optionText: answerText,
                                isCorrect: answerOption.isCorrect,
                                questionId: addedQuestion.id
                            };
                        }
                        return null;
                    })
                        .filter(option => option !== null) // Loại bỏ các giá trị null
                );

                // Kiểm tra có ít nhất một đáp án đúng
                const hasCorrectAnswer = newAnswerOptions.some(option => option.isCorrect === true);
                if (!hasCorrectAnswer) {
                    throw new Error(`At least one correct answer is required for the question: ${questionText}`);
                }

                // Nếu type là 'multiple choice', kiểm tra có ít nhất 2 đáp án đúng
                if (item.type === 'multiple_choice') {
                    const correctAnswersCount = newAnswerOptions.filter(option => option.isCorrect === true).length;
                    if (correctAnswersCount < 2) {
                        throw new Error(`For 'multiple choice' questions, at least 2 correct answers are required: ${questionText}`);
                    }
                }
                await this.dataSource.getRepository(AnswerOption).save(newAnswerOptions);

                const newQuestionBank = this.dataSource.getRepository(QuestionBank).create({
                    questionId: addedQuestion.id,
                    teacherId: teacherId,
                    courseId: course.id
                });
                await this.dataSource.getRepository(QuestionBank).save(newQuestionBank);
            }
            return 'Import data successfully';
        } catch (error) {

            throw new Error(error.message);
        }
    }

    // // export question and answer by excel
    async exportQuestion(teacherId) {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet([]);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        try {
            const questions = await this.dataSource.getRepository(QuestionBank)
                .createQueryBuilder('questionBank')
                .leftJoinAndSelect('questionBank.question', 'question')
                .leftJoinAndSelect('question.answerOptions', 'answerOptions')
                .leftJoinAndSelect('questionBank.course', 'course')
                .where('questionBank.teacherId = :teacherId', { teacherId })
                .getMany();

            // Prepare data for export
            const data = questions.map(qb => {
                const questionData = {
                    Course: qb.course.code,
                    Type: qb.question.type,
                    Question: qb.question.text,
                };

                qb.question.answerOptions.forEach((ao, index) => {
                    questionData[`AnswerOption${index + 1}`] = ao.optionText;
                    questionData[`IsCorrect${index + 1}`] = ao.isCorrect ? 'True' : 'False';
                });

                return questionData;
            });

            // Determine the maximum number of answer options to create headers
            const maxAnswerOptions = Math.max(...questions.map(qb => qb.question.answerOptions.length));

            // Add headers to the data
            const headers = {
                Course: 'Course',
                Type: 'Type',
                Question: 'Question',
                ...Array.from({ length: maxAnswerOptions }, (_, i) => ({
                    [`AnswerOption${i + 1}`]: `AnswerOption${i + 1}`,
                    [`IsCorrect${i + 1}`]: `IsCorrect${i + 1}`
                })).reduce((acc, header) => ({ ...acc, ...header }), {}),
                ...Array.from({ length: maxAnswerOptions }, (_, i) => ({
                    [`AnswerOption${i + 1}`]: `AnswerOption${i + 1}`,
                    [`IsCorrect${i + 1}`]: `IsCorrect${i + 1}`
                })).reduce((acc, header) => ({ ...acc, ...header }), {})
            };

            // Convert data to worksheet with headers
            const dataWithHeaders = [headers, ...data];
            const newWorksheet = XLSX.utils.json_to_sheet(dataWithHeaders, { skipHeader: true });
            workbook.Sheets['Sheet1'] = newWorksheet;

            // Export the workbook
            const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

            // Here you can return the buffer, save it to the server, or send it as a response
            return buffer;

        } catch (error) {
            throw new Error(error.message);
        }
    }


}