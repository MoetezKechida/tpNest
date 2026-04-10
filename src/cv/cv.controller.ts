import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Req,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type {
  AuthenticatedRequest,
  AuthenticatedUser,
} from '../auth/types/authenticated-request.type';



@Controller('cv')
@UseGuards(AuthGuard('jwt'))
export class CvController {
  constructor(private readonly cvService: CvService) {}

  private getAuthenticatedUser(req: AuthenticatedRequest): AuthenticatedUser {
    if (!req.user?.id) {
      throw new ForbiddenException('Authenticated user required');
    }

    return req.user;
  }

  private isAdmin(user: AuthenticatedUser): boolean {
    return user.role.trim().toLowerCase() === 'admin';
  }

  @Post()
  create(@Body() createCvDto: CreateCvDto, @Req() req: AuthenticatedRequest) {
    const user = this.getAuthenticatedUser(req);
    createCvDto.userId = user.id;
    return this.cvService.create(createCvDto);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    const user = this.getAuthenticatedUser(req);

    if (!this.isAdmin(user)) {
      return this.cvService.findByUser(user.id);
    }

    return this.cvService.findAll();
  }

  @Get('user/:userId')
  @Roles('admin')
  @UseGuards(RolesGuard)
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.cvService.findByUser(userId);
  }

  @Get('skill/:skillId')
  @Roles('admin')
  @UseGuards(RolesGuard)
  findBySkill(@Param('skillId', ParseIntPipe) skillId: number) {
    return this.cvService.findBySkill(skillId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const user = this.getAuthenticatedUser(req);
    const cv = await this.cvService.findOne(id);

    if (this.isAdmin(user) || cv.user?.id === user.id) {
      return cv;
    }

    throw new ForbiddenException('You can only view your own CVs');
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCvDto: UpdateCvDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const user = this.getAuthenticatedUser(req);
    const cv = await this.cvService.findOne(id);

    if (cv.user?.id !== user.id) {
      throw new ForbiddenException('You can only update your own CVs');
    }

    // Prevent ownership transfer through update payload.
    delete updateCvDto.userId;

    return this.cvService.update(id, updateCvDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const user = this.getAuthenticatedUser(req);
    const cv = await this.cvService.findOne(id);

    if (cv.user?.id !== user.id) {
      throw new ForbiddenException('You can only delete your own CVs');
    }

    return this.cvService.remove(id);
  }

  @Post(':id/skills/:skillId')
  async addSkillToCv(
    @Param('id', ParseIntPipe) cvId: number,
    @Param('skillId', ParseIntPipe) skillId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const user = this.getAuthenticatedUser(req);
    const cv = await this.cvService.findOne(cvId);

    if (cv.user?.id !== user.id) {
      throw new ForbiddenException('You can only update your own CVs');
    }

    return this.cvService.addSkillToCv(cvId, skillId);
  }

  @Delete(':id/skills/:skillId')
  async removeSkillFromCv(
    @Param('id', ParseIntPipe) cvId: number,
    @Param('skillId', ParseIntPipe) skillId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const user = this.getAuthenticatedUser(req);
    const cv = await this.cvService.findOne(cvId);

    if (cv.user?.id !== user.id) {
      throw new ForbiddenException('You can only update your own CVs');
    }

    return this.cvService.removeSkillFromCv(cvId, skillId);
  }
}