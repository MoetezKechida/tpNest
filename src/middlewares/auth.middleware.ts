import { Injectable, NestMiddleware, UnauthorizedException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';


export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
  iat?: number;  // Issued at (timestamp de création du token)
  exp?: number;  // Expiration (timestamp d'expiration du token)
}

// Extend Express Request to include userId
export interface AuthRequest extends Request {
  userId?: number;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  use(req: AuthRequest, res: Response, next: NextFunction) {
    // Get Authorization header
    const authHeader = req.headers['authorization'];

    // Check if Authorization header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn('Authentication attempt without valid Authorization header');
      throw new UnauthorizedException('Authorization header with Bearer token required');
    }

    // Extract token after "Bearer "
    const token = authHeader.substring(7); // Remove "Bearer " (7 characters)

    try {
      
      const decoded = verify(token, process.env.JWT_SECRET || 'fallback_secret_key') as JwtPayload;

      
      if (!decoded.userId) {
        throw new UnauthorizedException('Invalid token: userId not found');
      }

      
      req.userId = decoded.userId;

      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        this.logger.error('Invalid token provided');
        throw new UnauthorizedException('Invalid token');
      }
      if (error.name === 'TokenExpiredError') {
        this.logger.warn('Token expired');
        throw new UnauthorizedException('Token expired');
      }
      this.logger.error(`Authentication error: ${error.message}`);
      throw error;
    }
  }
}