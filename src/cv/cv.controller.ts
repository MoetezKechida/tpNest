import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Req, ForbiddenException } from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import * as authMiddleware from '../middlewares/auth.middleware';

@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Post()
  create(@Body() createCvDto: CreateCvDto, @Req() req: authMiddleware.AuthRequest) {
    // Automatically assign the authenticated user
    createCvDto.userId = req.userId;
    return this.cvService.create(createCvDto);
  }

  @Get()
  findAll() {
    return this.cvService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cvService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateCvDto: UpdateCvDto,
    @Req() req: authMiddleware.AuthRequest
  ) {
    // Check if the authenticated user is the owner of the CV
    const cv = await this.cvService.findOne(id);
    
    if (cv.user?.id !== req.userId) {
      throw new ForbiddenException('You can only update your own CVs');
    }

    return this.cvService.update(id, updateCvDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: authMiddleware.AuthRequest) {
    // Check if the authenticated user is the owner of the CV
    const cv = await this.cvService.findOne(id);
    
    if (cv.user?.id !== req.userId) {
      throw new ForbiddenException('You can only delete your own CVs');
    }

    return this.cvService.remove(id);
  }

  // Additional routes for CV management
  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.cvService.findByUser(userId);
  }

  @Get('skill/:skillId')
  findBySkill(@Param('skillId', ParseIntPipe) skillId: number) {
    return this.cvService.findBySkill(skillId);
  }

  @Post(':id/skills/:skillId')
  addSkillToCv(
    @Param('id', ParseIntPipe) cvId: number, 
    @Param('skillId', ParseIntPipe) skillId: number
  ) {
    return this.cvService.addSkillToCv(cvId, skillId);
  }

  @Delete(':id/skills/:skillId')
  removeSkillFromCv(
    @Param('id', ParseIntPipe) cvId: number, 
    @Param('skillId', ParseIntPipe) skillId: number
  ) {
    return this.cvService.removeSkillFromCv(cvId, skillId);
  }
}
