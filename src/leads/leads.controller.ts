import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { AddNoteDto } from './dto/add-note.dto';
import { QueryLeadsDto } from './dto/query-leads.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/types/enums';

@ApiTags('leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Submit a quote/enquiry (public lead capture form)',
  })
  create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({ summary: 'List leads with filtering/search (admin)' })
  findAll(@Query() query: QueryLeadsDto) {
    return this.leadsService.findAll(query);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Get full lead details (admin)' })
  findOne(@Param('id') id: string) {
    return this.leadsService.findById(id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update lead status (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leadsService.updateStatus(id, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post(':id/notes')
  @ApiOperation({ summary: 'Add an internal note to a lead (admin)' })
  addNote(@Param('id') id: string, @Body() dto: AddNoteDto) {
    return this.leadsService.addNote(id, dto.text);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lead (admin)' })
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
