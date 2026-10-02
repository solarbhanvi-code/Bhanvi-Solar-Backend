import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { AppConfig } from '../config/configuration';

export interface UploadResult {
  url: string;
  publicId: string;
}

const LOCAL_UPLOAD_DIR = join(process.cwd(), 'uploads');
const FOLDER = 'bhanvi-solar';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly cloudinaryEnabled: boolean;

  constructor(private readonly configService: ConfigService<AppConfig, true>) {
    const { cloudName, apiKey, apiSecret } = this.configService.get(
      'cloudinary',
      {
        infer: true,
      },
    );
    this.cloudinaryEnabled = Boolean(cloudName && apiKey && apiSecret);

    if (this.cloudinaryEnabled) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
      this.logger.log('Cloudinary image storage enabled');
    } else {
      this.logger.warn(
        'Cloudinary credentials not configured — falling back to local disk storage under /uploads. Configure CLOUDINARY_* env vars for production.',
      );
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<UploadResult> {
    if (this.cloudinaryEnabled) {
      return new Promise<UploadResult>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: FOLDER, resource_type: 'image' },
          (error, result) => {
            if (error || !result) {
              reject(
                error instanceof Error
                  ? error
                  : new Error(error?.message ?? 'Cloudinary upload failed'),
              );
              return;
            }
            resolve({ url: result.secure_url, publicId: result.public_id });
          },
        );
        stream.end(file.buffer);
      });
    }

    await mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
    const ext = (file.originalname.split('.').pop() ?? 'jpg').toLowerCase();
    const filename = `${randomUUID()}.${ext}`;
    await writeFile(join(LOCAL_UPLOAD_DIR, filename), file.buffer);

    const port = this.configService.get('port', { infer: true });
    return {
      url: `http://localhost:${port}/uploads/${filename}`,
      publicId: filename,
    };
  }

  async deleteImage(publicId: string): Promise<void> {
    if (this.cloudinaryEnabled) {
      await cloudinary.uploader.destroy(publicId);
      return;
    }
    try {
      await unlink(join(LOCAL_UPLOAD_DIR, publicId));
    } catch (error) {
      this.logger.warn(
        `Could not delete local upload ${publicId}: ${String(error)}`,
      );
    }
  }
}
