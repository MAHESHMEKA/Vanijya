import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MandiPriceItemDto {
  @ApiProperty({ example: 'Tomato' })
  cropName: string;

  @ApiProperty({ example: 'Vegetable' })
  category: string;

  @ApiProperty({ example: 'Nashik APMC' })
  marketName: string;

  @ApiProperty({ example: 'Nashik' })
  district: string;

  @ApiProperty({ example: 'Maharashtra' })
  state: string;

  @ApiProperty({ example: 1950 })
  minPrice: number;

  @ApiProperty({ example: 2450 })
  maxPrice: number;

  @ApiProperty({ example: 2200 })
  modalPrice: number;

  @ApiProperty({ example: 185 })
  arrivalQuantity: number;

  @ApiProperty({ example: 'QUINTAL' })
  unit: string;

  @ApiProperty({ example: '2024-10-25' })
  date: string;

  @ApiProperty({ example: 'AGMARKNET' })
  source: string;
}

export class PriceTrendHistoryPointDto {
  @ApiProperty({ example: '2024-10-19' })
  date: string;

  @ApiProperty({ example: 2150 })
  modalPrice: number;

  @ApiProperty({ example: 1900 })
  minPrice: number;

  @ApiProperty({ example: 2350 })
  maxPrice: number;

  @ApiProperty({ example: 170 })
  arrivalQuantity: number;
}

export class PriceTrendsResponseDto {
  @ApiProperty({ example: 'Tomato' })
  crop: string;

  @ApiProperty({ example: 'Nashik APMC' })
  market: string;

  @ApiProperty({ example: 2200 })
  todayPrice: number;

  @ApiProperty({ example: 2120 })
  averageModalPrice: number;

  @ApiProperty({ example: 'BULLISH', enum: ['BULLISH', 'BEARISH', 'STABLE'] })
  trendDirection: string;

  @ApiProperty({ example: 3.77 })
  percentageChange: number;

  @ApiProperty({ example: 'LOW', enum: ['LOW', 'MEDIUM', 'HIGH'] })
  volatility: string;

  @ApiProperty({ example: 'Today’s rate (₹2200/Qtl) is 3.77% above the 7-day average.' })
  insight: string;

  @ApiProperty({ type: [PriceTrendHistoryPointDto] })
  history: PriceTrendHistoryPointDto[];
}

export class MarketDistanceItemDto {
  @ApiProperty({ example: 'Lasalgaon Mandi' })
  marketName: string;

  @ApiProperty({ example: 'Nashik' })
  district: string;

  @ApiProperty({ example: 'Maharashtra' })
  state: string;

  @ApiProperty({ example: 2320 })
  modalPrice: number;

  @ApiProperty({ example: 45.2 })
  distanceKm: number;

  @ApiProperty({ example: 22.6 })
  estimatedTransportCost: number;

  @ApiProperty({ example: 2297.4 })
  netRealizablePrice: number;

  @ApiProperty({ example: 97.4 })
  priceDifference: number;
}

export class PriceCompareResponseDto {
  @ApiProperty({ example: 'Tomato' })
  cropName: string;

  @ApiPropertyOptional({ example: 'Nashik APMC' })
  baseMarket?: string;

  @ApiProperty({ type: MarketDistanceItemDto })
  bestMarket: MarketDistanceItemDto;

  @ApiProperty({ type: [MarketDistanceItemDto] })
  markets: MarketDistanceItemDto[];

  @ApiProperty({ example: 'Lasalgaon Mandi offers ₹97.4/Qtl higher net return after transport.' })
  arbitrageInsight: string;
}

export class BestSellingWindowDto {
  @ApiProperty({ example: 'Tomato' })
  cropName: string;

  @ApiProperty({ example: 'Sell within the next 1–2 days to capture premium rates.' })
  recommendation: string;

  @ApiProperty({ example: 'Next 24 - 48 Hours' })
  recommendedWindowDays: string;

  @ApiProperty({ example: 'HIGH', enum: ['HIGH', 'MEDIUM', 'MODERATE'] })
  confidence: string;

  @ApiProperty({ example: 'Current Tomato price is 5.4% above the 7-day baseline with upward momentum.' })
  reasoning: string;
}

export class PriceDashboardResponseDto {
  @ApiProperty({ example: 'Tomato' })
  crop: string;

  @ApiProperty({ example: 'Nashik' })
  district: string;

  @ApiProperty({ example: 2200 })
  todayPrice: number;

  @ApiProperty({ example: 2135 })
  weeklyAverage: number;

  @ApiProperty({ example: 'BULLISH' })
  trend: string;

  @ApiProperty({ example: 'Lasalgaon Mandi' })
  bestNearbyMarket: string;

  @ApiProperty({ example: 2320 })
  bestNearbyPrice: number;

  @ApiProperty({ example: 97.4 })
  arbitrageGainPerQuintal: number;

  @ApiProperty({ example: 'Today price is 3.1% above weekly average. Lasalgaon offers highest return.' })
  insight: string;

  @ApiProperty({ type: BestSellingWindowDto })
  sellingWindow: BestSellingWindowDto;
}
