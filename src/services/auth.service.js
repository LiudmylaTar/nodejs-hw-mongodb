import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import createHttpError from 'http-errors';
import { User } from '../db/models/user.js';
import { Session } from '../db/models/session.js';
import { FIFTEEN_MINUTES, THIRTY_DAYS } from '../constants/index.js';

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
