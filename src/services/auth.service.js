import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';
import { randomBytes } from 'crypto';

import { sendEmail } from '../utils/sendMail.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { User } from '../db/models/user.js';
import { Session } from '../db/models/session.js';
import {
  FIFTEEN_MINUTES,
  THIRTY_DAYS,
  SMTP,
  TEMPLATES_DIR,
} from '../constants/index.js';

function generateRandomToken() {
  return randomBytes(30).toString('base64');
}

function createSession(userId) {
  return Session.create({
    userId,
    accessToken: generateRandomToken(),
    refreshToken: generateRandomToken(),
    accessTokenValidUntill: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntill: new Date(Date.now() + THIRTY_DAYS),
  });
}

export async function registerUser(payload) {
  const user = await User.findOne({ email: payload.email });
  if (user) {
    throw new createHttpError.Conflict('Email is already in use');
  }
  const saltRounds = 10;
  payload.password = await bcrypt.hash(payload.password, saltRounds);
  return await User.create(payload);
}

export async function loginUser(email, password) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new createHttpError.Unauthorized('Email or password is incorrect');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (isMatch !== true) {
    throw new createHttpError.Unauthorized('Email or password is incorrect');
  }
  await Session.deleteOne({ userId: user._id });
  return createSession(user._id);
}

export async function logoutUser(sessionId) {
  await Session.deleteOne({ _id: sessionId });
}
export async function refreshUserSession(sessionId, refreshToken) {
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new createHttpError.Unauthorized('Session not found');
  }
  if (session.refreshToken !== refreshToken) {
    throw new createHttpError.Unauthorized('RefreshToken is invalid');
  }

  if (session.refreshTokenValidUntill < new Date()) {
    throw new createHttpError.Unauthorized('RefreshToken is expired');
  }

  await Session.deleteOne({ _id: session._id });
  return createSession(session.userId);
}

// Request Password update
export async function resetPasswordRequest(email) {
  const user = await User.findOne({ email });
  if (user === null) {
    throw new createHttpError.NotFound('User not found');
  }
  const resetToken = jwt.sign(
    {
      sub: user._id,
      name: user.name,
    },
    getEnvVar('JWT_SECRET'),
    {
      expiresIn: '15m',
    },
  );
  console.log(resetToken);

  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.hbs',
  );
  const templateSource = (
    await fs.readFile(resetPasswordTemplatePath)
  ).toString();

  const template = handlebars.compile(templateSource);

  const html = template({
    name: user.name,
    link: `${getEnvVar('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });

  await sendEmail({
    from: getEnvVar(SMTP.SMTP_FROM),
    to: email,
    subject: 'Reset your password',
    html,
  });
}
// Password update
export const resetPassword = async (token, password) => {
  try {
    const decoded = jwt.verify(token, getEnvVar('JWT_SECRET'));
    const user = await User.findById(decoded.sub);

    if (user === null) {
      throw new createHttpError.NotFound('User not found');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new createHttpError.Unauthorized('Token is expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new createHttpError.Unauthorized('Token is unauthorized');
    }
    throw error;
  }
};
