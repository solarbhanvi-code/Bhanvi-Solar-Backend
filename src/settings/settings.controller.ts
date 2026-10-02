import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/types/enums';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary:
      'Get site-wide CMS settings (company info, hero, statistics, etc.)',
  })
  get() {
    return this.settingsService.get();
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Patch()
  @ApiOperation({ summary: 'Update site-wide CMS settings (admin)' })
  update(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.update(dto);
  }
}
