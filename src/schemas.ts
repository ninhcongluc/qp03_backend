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
  code: Joi.string().required(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  gender: Joi.number().optional(),
  phoneNumber: Joi.string().optional(),
  dateOfBirth: Joi.date().optional()
});

const updateManager = Joi.object().keys({
  email: Joi.string().email().min(6).optional(),
  code: Joi.string().optional(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  gender: Joi.number().optional(),
  phoneNumber: Joi.string().optional(),
  dateOfBirth: Joi.date().optional()
});

const createSemester = Joi.object().keys({
  name: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required()
});

const createQuiz = Joi.object().keys({
  name: Joi.string().required(),
  description: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  timeLimitMinutes: Joi.number().required(),
  score: Joi.number().required(),
  isHidden: Joi.boolean().required(),
});

const updateQuiz = Joi.object().keys({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  timeLimitMinutes: Joi.number().optional(),
  score: Joi.number().optional(),
  isHidden: Joi.boolean().optional(),
});


export default {
  '/auth/signIn': authSignIn,
  '/auth/signUp': authSignUp,
  '/manager/create': createManager,
  '/manager/update': updateManager,
  '/semester/create': createSemester,
  '/quiz/create': createQuiz,
  '/quiz/update': updateQuiz
} as { [key: string]: ObjectSchema };
