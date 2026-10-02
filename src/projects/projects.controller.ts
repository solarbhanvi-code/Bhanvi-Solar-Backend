import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectsDto } from './dto/query-projects.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/types/enums';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List published projects with filtering' })
  findAll(@Query() query: QueryProjectsDto) {
    return this.projectsService.findAll(query);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Get('admin/all')
  @ApiOperation({ summary: 'List all projects including inactive (admin)' })
  findAllForAdmin(@Query() query: QueryProjectsDto) {
    return this.projectsService.findAllForAdmin(query);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Get('admin/:id')
  @ApiOperation({ summary: 'Get a project by id (admin)' })
  findOneById(@Param('id') id: string) {
    return this.projectsService.findById(id);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get a published project by slug' })
  findOne(@Param('slug') slug: string) {
    return this.projectsService.findBySlug(slug);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a project (admin)' })
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a project (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project (admin)' })
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
