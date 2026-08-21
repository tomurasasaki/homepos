import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SetupService } from './setup.service';
import { CompleteSetupDto, TestDbDto } from './dto/setup.dto';

@Controller('setup')
export class SetupController {
  constructor(private setupService: SetupService) {}

  @Get('status')
  async getStatus() {
    return this.setupService.getSetupStatus();
  }

  @Post('test-db')
  @HttpCode(HttpStatus.OK)
  async testDbConnection(@Body() dto: TestDbDto) {
    return this.setupService.testDbConnection(dto);
  }

  @Post('complete')
  async completeSetup(@Body() dto: CompleteSetupDto) {
    return this.setupService.completeSetup(dto);
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  async resetSetup() {
    return this.setupService.resetSetup();
  }
}
