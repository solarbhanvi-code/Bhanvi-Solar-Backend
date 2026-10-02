import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CalculatorService } from './calculator.service';
import { EstimateDto } from './dto/estimate.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('calculator')
@Controller('calculator')
export class CalculatorController {
  constructor(private readonly calculatorService: CalculatorService) {}

  @Public()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post('estimate')
  @ApiOperation({
    summary:
      'Estimate recommended system size, generation, savings and payback',
  })
  estimate(@Body() dto: EstimateDto) {
    return this.calculatorService.estimate(dto);
  }
}
