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

export default {
  '/auth/signIn': authSignIn,
  '/auth/signUp': authSignUp,
  '/manager/create': createManager,
  '/manager/update': updateManager
} as { [key: string]: ObjectSchema };
