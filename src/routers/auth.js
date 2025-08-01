import express from 'express';
import {
  registerController,
  loginController,
  logoutController,
  refreshUserSessionController,
  requestResetPasswordController,
  resetPasswordController,
} from '../controllers/auth.controller.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  createAuthSchema,
  loginShcema,
  requestResetPasswordShcema,
  resetPasswordShcema,
} from '../validation/auth.js';

const router = express.Router();

router.post(
  '/register',
  validateBody(createAuthSchema),
  ctrlWrapper(registerController),
);

router.post('/login', validateBody(loginShcema), ctrlWrapper(loginController));

router.post('/logout', ctrlWrapper(logoutController));

router.post('/refresh', ctrlWrapper(refreshUserSessionController));

router.post(
  '/send-reset-email',
  validateBody(requestResetPasswordShcema),
  ctrlWrapper(requestResetPasswordController),
);

router.post(
  '/reset-pwd',
  validateBody(resetPasswordShcema),
  ctrlWrapper(resetPasswordController),
);
export default router;
