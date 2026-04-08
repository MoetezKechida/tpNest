import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string; user: Partial<User> }> {
    
    const existingUsername = await this.userRepository.findOne({
      where: { username: registerDto.username }
    });
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    
    const existingEmail = await this.userRepository.findOne({
      where: { email: registerDto.email }
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    
    const user = this.userRepository.create({
      username: registerDto.username,
      email: registerDto.email,
      password: hashedPassword,
      role: registerDto.role || 'user'
    });

    const savedUser = await this.userRepository.save(user);

    
    const { password, ...result } = savedUser;
    return {
      message: 'User registered successfully',
      user: result
    };
  }

  async login(loginDto: LoginDto): Promise<{ token: string; user: Partial<User> }> {
    
    const user = await this.userRepository.findOne({
      where: { username: loginDto.username }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    
    const payload = { userId: user.id, username: user.username, role: user.role };
    const token = this.jwtService.sign(payload);

    
    const { password, ...result } = user;
    return {
      token,
      user: result
    };
  }
}