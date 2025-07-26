// import { ONE_DAY } from '../constants/index.js';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshUserSession,
} from '../services/auth.service.js';

export async function registerController(req, res) {
  const user = await registerUser(req.body);
  res.json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
}
const setupSession = (res, session) => {
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expire: session.refreshTokenValidUntill,
  });

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: session.refreshTokenValidUntill,
  });
};

export async function loginController(req, res) {
  const session = await loginUser(req.body.email, req.body.password);

  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessTocken: session.accessToken,
    },
  });
}

export async function logoutController(req, res) {
  const { sessionId } = req.cookies;
  if (typeof sessionId !== 'undefined') {
    await logoutUser(sessionId);
  }

  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');
  res.status(204).send();
}

export async function refreshUserSessionController(req, res) {
  const { sessionId, refreshToken } = req.cookies;

  const session = await refreshUserSession(sessionId, refreshToken);
  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Session refresh successfully',
    data: {
      accessTocken: session.accessToken,
    },
  });
}
