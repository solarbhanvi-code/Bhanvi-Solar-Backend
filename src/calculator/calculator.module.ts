import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { CalculatorService } from './calculator.service';
import { CalculatorController } from './calculator.controller';

@Module({
  imports: [SettingsModule],
  controllers: [CalculatorController],
  providers: [CalculatorService],
})
export class CalculatorModule {}
