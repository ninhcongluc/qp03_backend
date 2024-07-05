import Joi, { ObjectSchema } from 'joi';

const PASSWORD_REGEX = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!.@#$%^&*])(?=.{8,})');

const authSignUp = Joi.object().keys({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  username: Joi.string().min(6).required(),
  password: Joi.string().pattern(PASSWORD_REGEX).min(8).required()
});

const authSignIn = Joi.object().keys({
  email: Joi.string().email().min(6).required(),
  password: Joi.string().required()
});

const createManager = Joi.object().keys({
  email: Joi.string().email().min(6).required(),
  code: Joi.string().min(1).required(),
  firstName: Joi.string().optional().allow(''),
  lastName: Joi.string().optional().allow(''),
  isActive: Joi.boolean().optional(),
  gender: Joi.number().optional(),
  phoneNumber: Joi.string().optional().allow(''),
  dateOfBirth: Joi.date().optional()
});

const updateManager = Joi.object().keys({
  email: Joi.string().email().min(6).optional(),
  code: Joi.string().min(1).optional(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  gender: Joi.number().optional(),
  isActive: Joi.boolean().optional(),
  phoneNumber: Joi.string().optional(),
  dateOfBirth: Joi.date().optional()
});

const createSemester = Joi.object().keys({
  name: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required()
});

const createCourse = Joi.object().keys({
  managerId: Joi.string().required(),
  semesterId: Joi.string().required(),
  code: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().optional(),
});

const updateCourse = Joi.object().keys({
  semesterId: Joi.string().optional(),
  code: Joi.string().optional(),
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  isActive: Joi.boolean().optional()
});
const createQuiz = Joi.object().keys({
  classId: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().optional(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  timeLimitMinutes: Joi.number().required(),
  isLimitedAttempts: Joi.boolean().optional(),
  maxAttempts: Joi.number().optional(),
  score: Joi.number().required(),
  showAnswer: Joi.boolean().optional()
});

const updateQuiz = Joi.object().keys({
  classId: Joi.string().required(),
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  timeLimitMinutes: Joi.number().optional(),
  isLimitedAttempts: Joi.boolean().optional(),
  maxAttempts: Joi.number().optional(),
  score: Joi.number().optional(),
  showAnswer: Joi.boolean().optional()
});

export default {
  '/auth/signIn': authSignIn,
  '/auth/signUp': authSignUp,
  '/manager/create': createManager,
  '/manager/update': updateManager,
  '/semester/create': createSemester,
  '/course/create': createCourse,
  '/quiz/create': createQuiz,
  '/quiz/update': updateQuiz,
  '/course/update': updateCourse, 
} as { [key: string]: ObjectSchema };
