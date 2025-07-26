import createHttpError from 'http-errors';
import { Session } from '../db/models/session.js';
import { User } from '../db/models/user.js';

export async function authenticate(req, res, next) {
  // const authHeader = req.get('Authorization');
  const { authorization } = req.headers;

  if (typeof authorization !== 'string') {
    next(createHttpError(401, 'Please provide Authorization header'));
    return;
  }
  const [bearer, token] = authorization.split(' ', 2);
  if (bearer !== 'Bearer' || !token) {
    next(createHttpError(401, 'Auth header should be of type Bearer'));
    return;
  }
  const session = await Session.findOne({ accessToken: token });

  if (!session) {
    next(createHttpError.Unauthorized('Session not found'));
  }

  if (new Date(session.accessTokenValidUntill) < new Date()) {
    next(createHttpError.Unauthorized('Access token expired'));
  }
  const user = await User.findById(session.userId);
  if (user === null) {
    next(createHttpError.Unauthorized('User not found'));
  }
  req.user = { id: user._id, name: user.name };
  next();
}
