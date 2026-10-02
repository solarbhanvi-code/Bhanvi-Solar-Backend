import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { ProjectsModule } from './projects/projects.module';
import { ServicesModule } from './services/services.module';
import { LeadsModule } from './leads/leads.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { FaqsModule } from './faqs/faqs.module';
import { SettingsModule } from './settings/settings.module';
import { CalculatorModule } from './calculator/calculator.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 100 }],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    ProjectsModule,
    ServicesModule,
    LeadsModule,
    TestimonialsModule,
    FaqsModule,
    SettingsModule,
    CalculatorModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
