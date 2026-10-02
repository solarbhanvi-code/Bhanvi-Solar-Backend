import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../config/configuration';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => ({
        uri: configService.get('mongodbUri', { infer: true }),
      }),
    }),
  ],
})
export class DatabaseModule {}
