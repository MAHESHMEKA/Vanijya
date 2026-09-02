import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DatabaseService } from '../database/database.service';

@ApiTags('Demo & Simulation')
@Controller('demo')
export class DemoController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset Demo State (SIH 1-Click Reset)',
    description: 'Resets lots, bids, transactions, and payments back to initial demo baseline in MongoDB.',
  })
  @ApiResponse({ status: 200, description: 'Demo database state reset successfully.' })
  async resetDemoState() {
    await this.databaseService.seedInitialData();

    return {
      success: true,
      message: 'Demo dataset reset successfully to baseline state in MongoDB.',
      timestamp: new Date().toISOString(),
    };
  }
}
