import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role: string;
    accessToken: string;
  };
}

const authentication = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ code: StatusCodes.UNAUTHORIZED, message: 'Token not found' });
    }

    const accessToken = authHeader.split(' ')[1];
    if (!accessToken) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ code: StatusCodes.UNAUTHORIZED, message: 'Token not found' });
    }

    const user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY) as { id: string; role: string };
    req.user = {
      _id: user.id,
      role: user.role,
      accessToken: accessToken
    };

    next();
  } catch (error) {
    if (!res.headersSent) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        code: StatusCodes.UNAUTHORIZED,
        message: 'Invalid token',
        error: error.message
      });
    }
  }
};

const authorization = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ code: StatusCodes.UNAUTHORIZED, message: 'User not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({ code: StatusCodes.FORBIDDEN, message: 'Unauthorized' });
    }

    next();
  };
};

export { authentication, authorization };
