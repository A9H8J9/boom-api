import { Controller, Get } from '@nestjs/common';
import { Public } from '@nestjs/authentication';
import { ApiTags } from '@nestjs/swagger';
import { PlanService } from './plan.service.js';

@ApiTags('plans')
@Public()
@Controller('plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get()
  list() {
    return this.planService.list();
  }
}
