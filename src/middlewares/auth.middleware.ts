import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

// Extend Express Request to include userId
export interface AuthRequest extends Request {
  userId?: number;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: AuthRequest, res: Response, next: NextFunction) {
    // Get token from header
    const token = req.headers['auth-user'] as string;

    if (!token) {
      throw new UnauthorizedException('Token not found. Please provide auth-user header.');
    }

    try {
      // Verify and decode token
      const decoded = verify(token, 'SECRET_KEY_CHANGE_THIS') as any;

      // Check if userId exists in token
      if (!decoded.userId) {
        throw new UnauthorizedException('Invalid token: userId not found');
      }

      // Inject userId into request object
      req.userId = decoded.userId;

      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      }
      throw error;
    }
  }
}