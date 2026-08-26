import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CropsService } from './crops.service';

@ApiTags('Crops')
@Controller('crops')
export class CropsController {
  constructor(private readonly cropsService: CropsService) {}

  @Get()
  @ApiOperation({ summary: 'List all supported agricultural commodities' })
  @ApiResponse({ status: 200, description: 'List of crops returned' })
  findAll() {
    return this.cropsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific crop by ID' })
  @ApiResponse({ status: 200, description: 'Crop details returned' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  findOne(@Param('id') id: string) {
    return this.cropsService.findOne(id);
  }
}
