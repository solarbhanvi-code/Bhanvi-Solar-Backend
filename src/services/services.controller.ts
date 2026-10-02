import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/types/enums';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List published services' })
  findAll() {
    return this.servicesService.findAll();
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Get('admin/all')
  @ApiOperation({ summary: 'List all services including inactive (admin)' })
  findAllForAdmin() {
    return this.servicesService.findAll(true);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Get('admin/:id')
  @ApiOperation({ summary: 'Get a service by id (admin)' })
  findOneById(@Param('id') id: string) {
    return this.servicesService.findById(id);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get a published service by slug' })
  findOne(@Param('slug') slug: string) {
    return this.servicesService.findBySlug(slug);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a service (admin)' })
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a service (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a service (admin)' })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
