import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET must be set in environment variables');
    }

    super({
      // Extract the token from the Authorization header (Bearer prefix)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Use the same secret you use to sign the token
      secretOrKey: secret,
    });
  }

  // This method is called automatically if the token is valid
  async validate(payload: JwtPayload) {
    // Optional: We can check if the user actually still exists in the database
    const user = await this.userRepository.findOne({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    // Whatever we return here gets attached to req.user
    // So in our controllers, we can just use req.user.id or req.user.role
    return user;
  }
}
