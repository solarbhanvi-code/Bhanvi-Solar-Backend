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
import { FaqsService } from './faqs.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/types/enums';

@ApiTags('faqs')
@Controller('faqs')
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List published FAQs' })
  findAll() {
    return this.faqsService.findAll();
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Get('admin/all')
  @ApiOperation({ summary: 'List all FAQs including unpublished (admin)' })
  findAllForAdmin() {
    return this.faqsService.findAll(true);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a FAQ (admin)' })
  create(@Body() dto: CreateFaqDto) {
    return this.faqsService.create(dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a FAQ (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateFaqDto) {
    return this.faqsService.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a FAQ (admin)' })
  remove(@Param('id') id: string) {
    return this.faqsService.remove(id);
  }
}
