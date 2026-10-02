import { Injectable } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { calculateSolarEstimate } from './calculator.util';
import { EstimateDto } from './dto/estimate.dto';

@Injectable()
export class CalculatorService {
  constructor(private readonly settingsService: SettingsService) {}

  async estimate(dto: EstimateDto) {
    const settings = await this.settingsService.get();
    const assumptions = settings.calculatorConfig;
    const result = calculateSolarEstimate(dto, assumptions);
    return {
      input: dto,
      assumptions,
      result,
      disclaimer:
        'These figures are estimates. Actual results depend on location, roof orientation, shading, electricity tariff, system design and other factors.',
    };
  }
}
