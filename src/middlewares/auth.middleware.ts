import { Injectable, NestMiddleware, UnauthorizedException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

export interface JwtPayload {
  userId: number;
  username: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  use(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn(`Missing or invalid authorization header on ${req.method} ${req.url}`);
      throw new UnauthorizedException('Authorization header with Bearer token required');
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verify(token, process.env.JWT_SECRET || 'fallback_secret_key') as JwtPayload;

      if (!decoded.userId) {
        this.logger.warn(`Decoded token without userId on ${req.method} ${req.url}`);
        throw new UnauthorizedException('Invalid token: userId not found');
      }

      req.userId = decoded.userId;
      req.userRole = decoded.role;
      this.logger.debug(`User ${req.userId} authenticated successfully for ${req.method} ${req.url}`);
      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        this.logger.warn(`Expired token used on ${req.method} ${req.url}`);
        throw new UnauthorizedException('Token expired');
      }
      this.logger.warn(`Invalid token signature on ${req.method} ${req.url}`);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
