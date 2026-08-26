import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MarketsService } from './markets.service';

@ApiTags('Markets')
@Controller('markets')
export class MarketsController {
  constructor(private readonly marketsService: MarketsService) {}

  @Get()
  @ApiOperation({ summary: 'List all registered APMC Mandis' })
  @ApiResponse({ status: 200, description: 'List of markets returned' })
  findAll() {
    return this.marketsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details and price snapshots of a specific APMC Mandi' })
  @ApiResponse({ status: 200, description: 'Market details returned' })
  @ApiResponse({ status: 404, description: 'Market not found' })
  findOne(@Param('id') id: string) {
    return this.marketsService.findOne(id);
  }
}
