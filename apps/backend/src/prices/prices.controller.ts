import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PricesService } from './prices.service';
import {
  PriceQueryDto,
  PriceTrendsQueryDto,
  PriceCompareQueryDto,
  PriceDashboardQueryDto,
} from './dto/price-query.dto';
import {
  MandiPriceItemDto,
  PriceTrendsResponseDto,
  PriceCompareResponseDto,
  PriceDashboardResponseDto,
} from './dto/price-response.dto';

@ApiTags('Prices & Mandi Intelligence')
@Controller('prices')
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  @Get()
  @ApiOperation({
    summary: 'Query Mandi Benchmark Prices',
    description: 'Filter prices by commodity, market, district, or state.',
  })
  @ApiResponse({
    status: 200,
    type: [MandiPriceItemDto],
    description: 'Filtered list of mandi prices returned.',
  })
  findAll(@Query() query: PriceQueryDto) {
    return this.pricesService.findAll(query);
  }

  @Get('latest')
  @ApiOperation({
    summary: 'Get Latest Mandi Benchmark Rates',
    description: 'Returns latest single benchmark rate for each unique crop and market pair.',
  })
  @ApiResponse({
    status: 200,
    type: [MandiPriceItemDto],
    description: 'Latest mandi benchmarks returned.',
  })
  findLatest(@Query() query: PriceQueryDto) {
    return this.pricesService.findLatest(query);
  }

  @Get('trends')
  @ApiOperation({
    summary: '7-Day Price Analytics & Directional Trends',
    description:
      'Calculates 7-day Simple Moving Average (SMA), percentage delta, trend direction (BULLISH/BEARISH/STABLE), volatility, and rule-based insights.',
  })
  @ApiResponse({
    status: 200,
    type: PriceTrendsResponseDto,
    description: 'Historical trend analytics returned.',
  })
  getTrends(@Query() query: PriceTrendsQueryDto) {
    return this.pricesService.getPriceTrends(query);
  }

  @Get('compare')
  @ApiOperation({
    summary: 'Compare Rates Across Nearby APMC Mandis (Haversine Arbitrage)',
    description:
      'Calculates geographic distance via Haversine formula, factors in estimated transport offsets, and identifies the best market for maximum net return.',
  })
  @ApiResponse({
    status: 200,
    type: PriceCompareResponseDto,
    description: 'Regional market comparison and arbitrage recommendation returned.',
  })
  compareMarkets(@Query() query: PriceCompareQueryDto) {
    return this.pricesService.compareMarkets(query);
  }

  @Get('dashboard')
  @ApiOperation({
    summary: 'Farmer Market Intelligence Dashboard (SIH Winner Feature)',
    description:
      'Returns a consolidated market snapshot including today’s price, 7-day moving average, best regional market, and rule-based Best Selling Window recommendation.',
  })
  @ApiResponse({
    status: 200,
    type: PriceDashboardResponseDto,
    description: 'Farmer-friendly market snapshot returned.',
  })
  getDashboard(@Query() query: PriceDashboardQueryDto) {
    return this.pricesService.getDashboardSummary(query);
  }
}
