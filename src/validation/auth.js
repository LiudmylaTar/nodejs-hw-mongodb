import Joi from 'joi';

export const createAuthSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(5).max(20).required(),
});

export const loginShcema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(5).max(20).required(),
});

export const requestResetPasswordShcema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordShcema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(5).max(20).required(),
});
