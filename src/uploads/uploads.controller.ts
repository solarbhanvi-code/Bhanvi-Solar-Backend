import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { DeleteImageDto } from './dto/delete-image.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/types/enums';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
];

@ApiTags('uploads')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a product/project image (admin)' })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE_BYTES } }),
  )
  async uploadImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }
    return this.uploadsService.uploadImage(file);
  }

  @Post('image/delete')
  @ApiOperation({ summary: 'Delete a previously uploaded image (admin)' })
  async deleteImage(@Body() dto: DeleteImageDto) {
    await this.uploadsService.deleteImage(dto.publicId);
    return { success: true };
  }
}
