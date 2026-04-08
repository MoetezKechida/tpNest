import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Req, ForbiddenException } from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: number;
}

@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Post()
  create(@Body() createCvDto: CreateCvDto, @Req() req: AuthRequest) {
    createCvDto.userId = req.userId;
    return this.cvService.create(createCvDto);
  }

  @Get()
  findAll() {
    return this.cvService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.cvService.findByUser(userId);
  }

  @Get('skill/:skillId')
  findBySkill(@Param('skillId', ParseIntPipe) skillId: number) {
    return this.cvService.findBySkill(skillId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cvService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCvDto: UpdateCvDto,
    @Req() req: AuthRequest,
  ) {
    const cv = await this.cvService.findOne(id);

    if (cv.user?.id !== req.userId) {
      throw new ForbiddenException('You can only update your own CVs');
    }

    return this.cvService.update(id, updateCvDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    const cv = await this.cvService.findOne(id);

    if (cv.user?.id !== req.userId) {
      throw new ForbiddenException('You can only delete your own CVs');
    }

    return this.cvService.remove(id);
  }

  @Post(':id/skills/:skillId')
  addSkillToCv(
    @Param('id', ParseIntPipe) cvId: number,
    @Param('skillId', ParseIntPipe) skillId: number,
  ) {
    return this.cvService.addSkillToCv(cvId, skillId);
  }

  @Delete(':id/skills/:skillId')
  removeSkillFromCv(
    @Param('id', ParseIntPipe) cvId: number,
    @Param('skillId', ParseIntPipe) skillId: number,
  ) {
    return this.cvService.removeSkillFromCv(cvId, skillId);
  }
}
