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

export default {
  '/auth/signIn': authSignIn,
  '/auth/signUp': authSignUp
} as { [key: string]: ObjectSchema };
