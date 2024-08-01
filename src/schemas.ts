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
  firstName: Joi.string().optional().allow(''),
  lastName: Joi.string().optional().allow(''),
  gender: Joi.number().optional().allow(null),
  isActive: Joi.boolean().optional(),
  phoneNumber: Joi.string().optional().allow(null),
  dateOfBirth: Joi.date().optional().allow(null)
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
  description: Joi.string().optional()
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
  type: Joi.string().valid('practice', 'exam').required(),
  timeLimitMinutes: Joi.number().min(0).max(500).required(),
  isLimitedAttempts: Joi.boolean().optional(),
  maxAttempts: Joi.number().integer().optional().allow(null),
  score: Joi.number().required(),
  showAnswer: Joi.boolean().optional()
});

const updateQuiz = Joi.object().keys({
  classId: Joi.string().required(),
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  type: Joi.string().valid('practice', 'exam').required(),
  timeLimitMinutes: Joi.number().min(0).max(500).required(),
  isLimitedAttempts: Joi.boolean().optional(),
  maxAttempts: Joi.number().integer().optional().allow(null),
  score: Joi.number().optional(),
  showAnswer: Joi.boolean().optional()
});

const createClass = Joi.object().keys({
  courseId: Joi.string().required(),
  teacherId: Joi.string().required(),
  code: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().optional(),
  maxParticipants: Joi.number().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required()
});

const updateClass = Joi.object().keys({
  courseId: Joi.string().optional(),
  teacherId: Joi.string().optional(),
  code: Joi.string().optional(),
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  maxParticipants: Joi.number().optional(),
  isActive: Joi.boolean().optional()
});

const changePassword = Joi.object().keys({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().required(),
  confirmPassword: Joi.string().required(),
  userId: Joi.string().required()
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
  '/class/create': createClass,
  '/class/update': updateClass,
  '/user/change-password': changePassword
} as { [key: string]: ObjectSchema };
