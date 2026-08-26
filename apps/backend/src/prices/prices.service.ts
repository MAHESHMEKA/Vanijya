import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PriceQueryDto,
  PriceTrendsQueryDto,
  PriceCompareQueryDto,
  PriceDashboardQueryDto,
} from './dto/price-query.dto';
import {
  MarketDataProvider,
  NormalizedMandiPrice,
  NormalizedPriceHistory,
  MarketComparisonResult,
} from './providers/market-data-provider.interface';
import { MARKET_DATA_PROVIDER_TOKEN } from './providers/market-data.constants';
import { PriceAnalyticsService } from './services/price-analytics.service';
import { PriceCacheService } from './services/price-cache.service';

@Injectable()
export class PricesService {
  constructor(
    private prisma: PrismaService,
    @Inject(MARKET_DATA_PROVIDER_TOKEN)
    private marketDataProvider: MarketDataProvider,
    private analyticsService: PriceAnalyticsService,
    private cacheService: PriceCacheService,
  ) {}

  async findAll(query: PriceQueryDto): Promise<NormalizedMandiPrice[]> {
    const cacheKey = `prices:all:${query.cropId || ''}:${query.cropName || ''}:${query.district || ''}:${query.state || ''}:${query.marketId || ''}`;
    const cached = this.cacheService.get<NormalizedMandiPrice[]>(cacheKey);
    if (cached) return cached;

    // 1. Check if database has matching live seeded records
    const where: any = {};
    if (query.cropId) where.cropId = query.cropId;
    if (query.marketId) where.marketId = query.marketId;
    if (query.cropName) where.crop = { name: { contains: query.cropName, mode: 'insensitive' } };
    if (query.district) where.market = { district: { contains: query.district, mode: 'insensitive' } };
    if (query.state) where.market = { ...where.market, state: { contains: query.state, mode: 'insensitive' } };

    const dbPrices = await this.prisma.mandiPrice.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 50,
      include: { crop: true, market: true },
    });

    if (dbPrices.length > 0) {
      const normalized: NormalizedMandiPrice[] = dbPrices.map((p) => ({
        id: p.id,
        cropId: p.cropId,
        cropName: p.crop.name,
        category: p.crop.category,
        marketId: p.marketId,
        marketName: p.market.name,
        district: p.market.district,
        state: p.market.state,
        latitude: p.market.latitude ?? undefined,
        longitude: p.market.longitude ?? undefined,
        minPrice: p.minPrice,
        maxPrice: p.maxPrice,
        modalPrice: p.modalPrice,
        arrivalQuantity: p.arrivalQuantity,
        unit: 'QUINTAL',
        date: p.date.toISOString().split('T')[0],
        source: p.source,
        updatedAt: p.createdAt.toISOString(),
      }));

      this.cacheService.set(cacheKey, normalized, 180000);
      return normalized;
    }

    // 2. Fallback to market data provider abstraction
    const providerResults = await this.marketDataProvider.getLatestPrices({
      cropName: query.cropName,
      cropId: query.cropId,
      district: query.district,
      state: query.state,
    });

    this.cacheService.set(cacheKey, providerResults, 180000);
    return providerResults;
  }

  async findLatest(query: PriceQueryDto): Promise<NormalizedMandiPrice[]> {
    const cacheKey = `prices:latest:${query.cropName || query.cropId || 'all'}:${query.district || ''}`;
    const cached = this.cacheService.get<NormalizedMandiPrice[]>(cacheKey);
    if (cached) return cached;

    const allPrices = await this.findAll(query);

    // Group by unique crop + market pair and get the latest
    const map = new Map<string, NormalizedMandiPrice>();
    for (const item of allPrices) {
      const pairKey = `${item.cropName}_${item.marketName}`;
      if (!map.has(pairKey)) {
        map.set(pairKey, item);
      }
    }

    const latest = Array.from(map.values());
    this.cacheService.set(cacheKey, latest, 180000);
    return latest;
  }

  async getPriceTrends(query: PriceTrendsQueryDto) {
    const crop = query.cropName || 'Tomato';
    const days = parseInt(query.days || '7', 10);
    const cacheKey = `prices:trends:${crop}:${query.marketId || ''}:${days}`;

    const cached = this.cacheService.get<any>(cacheKey);
    if (cached) return cached;

    const historyData: NormalizedPriceHistory = await this.marketDataProvider.getPriceHistory(
      crop,
      query.marketId,
      days,
    );

    const modalPrices = historyData.history.map((h) => h.modalPrice);
    const movingAverage = this.analyticsService.calculateMovingAverage(modalPrices);
    const trendDirection = this.analyticsService.detectTrend(modalPrices);
    const volatility = this.analyticsService.calculateVolatility(modalPrices);
    const currentPrice = historyData.currentModalPrice;
    const { percentage } = this.analyticsService.calculatePriceDelta(currentPrice, movingAverage);

    const insight = this.analyticsService.generateRuleBasedInsight(
      currentPrice,
      movingAverage,
      trendDirection,
      volatility,
    );

    const result = {
      crop: historyData.cropName,
      market: historyData.marketName,
      district: historyData.district,
      state: historyData.state,
      todayPrice: currentPrice,
      averageModalPrice: movingAverage,
      trendDirection,
      percentageChange: percentage,
      volatility,
      insight,
      history: historyData.history,
    };

    this.cacheService.set(cacheKey, result, 180000);
    return result;
  }

  async compareMarkets(query: PriceCompareQueryDto): Promise<MarketComparisonResult> {
    const crop = query.cropName || 'Tomato';
    const userLat = query.userLat || 19.9975;
    const userLng = query.userLng || 73.7898;
    const maxDistance = query.maxDistanceKm || 250;

    const cacheKey = `prices:compare:${crop}:${userLat}:${userLng}:${maxDistance}`;
    const cached = this.cacheService.get<MarketComparisonResult>(cacheKey);
    if (cached) return cached;

    const comparison = await this.marketDataProvider.getNearbyMarketComparison(
      crop,
      userLat,
      userLng,
      maxDistance,
    );

    this.cacheService.set(cacheKey, comparison, 180000);
    return comparison;
  }

  async getDashboardSummary(query: PriceDashboardQueryDto) {
    const crop = query.cropName || 'Tomato';
    const district = query.district || 'Nashik';
    const userLat = query.userLat || 19.9975;
    const userLng = query.userLng || 73.7898;

    const cacheKey = `prices:dashboard:${crop}:${district}:${userLat}:${userLng}`;
    const cached = this.cacheService.get<any>(cacheKey);
    if (cached) return cached;

    // Parallel fetch trends and comparisons
    const [trends, comparisons] = await Promise.all([
      this.getPriceTrends({ cropName: crop, days: '7' }),
      this.compareMarkets({ cropName: crop, userLat, userLng }),
    ]);

    const bestMarket = comparisons.bestMarket;
    const sellingWindow = this.analyticsService.generateBestSellingWindow(
      trends.todayPrice,
      trends.averageModalPrice,
      trends.trendDirection as any,
      trends.volatility as any,
      crop,
    );

    const summary = {
      crop,
      district,
      todayPrice: trends.todayPrice,
      weeklyAverage: trends.averageModalPrice,
      trend: trends.trendDirection,
      volatility: trends.volatility,
      bestNearbyMarket: bestMarket?.marketName || trends.market,
      bestNearbyPrice: bestMarket?.modalPrice || trends.todayPrice,
      arbitrageGainPerQuintal: bestMarket?.priceDifference || 0,
      insight: trends.insight,
      sellingWindow,
    };

    this.cacheService.set(cacheKey, summary, 180000);
    return summary;
  }
}
