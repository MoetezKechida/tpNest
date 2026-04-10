import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ message: string; user: Partial<User> }> {
    const existingUser = await this.userRepository.findOne({
      where: [{ username: registerDto.username }, { email: registerDto.email }],
    });

    if (existingUser) {
      if (existingUser.username === registerDto.username) {
        this.logger.warn(
          `Failed registration: Username ${registerDto.username} already exists`,
        );
        throw new ConflictException('Username already exists');
      }
      this.logger.warn(
        `Failed registration: Email ${registerDto.email} already exists`,
      );
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      username: registerDto.username,
      email: registerDto.email,
      password: hashedPassword,
      role: 'user',
    });

    const savedUser = await this.userRepository.save(user);
    const { password, ...result } = savedUser;

    this.logger.log(
      `User registered successfully: ${result.username} (ID: ${result.id})`,
    );
    return { message: 'User registered successfully', user: result };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ token: string; user: Partial<User> }> {
    const user = await this.userRepository.findOne({
      where: { username: loginDto.username },
    });

    if (!user) {
      this.logger.warn(
        `Login failed: Invalid username attempted (${loginDto.username})`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      this.logger.warn(
        `Login failed: Invalid password for user ${user.username}`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);

    const { password, ...result } = user;
    this.logger.log(
      `User logged in successfully: ${user.username} (ID: ${user.id})`,
    );
    return { token, user: result };
  }
}
