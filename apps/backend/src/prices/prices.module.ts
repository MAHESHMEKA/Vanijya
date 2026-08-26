import { Module } from '@nestjs/common';
import { PricesService } from './prices.service';
import { PricesController } from './prices.controller';
import { PriceAnalyticsService } from './services/price-analytics.service';
import { PriceCacheService } from './services/price-cache.service';
import { MockMarketDataProvider } from './providers/mock-market-data.provider';
import { GovernmentMarketDataProvider } from './providers/government-market-data.provider';
import { MARKET_DATA_PROVIDER_TOKEN } from './providers/market-data.constants';

@Module({
  controllers: [PricesController],
  providers: [
    PricesService,
    PriceAnalyticsService,
    PriceCacheService,
    MockMarketDataProvider,
    GovernmentMarketDataProvider,
    {
      provide: MARKET_DATA_PROVIDER_TOKEN,
      useFactory: (
        mockProvider: MockMarketDataProvider,
        govProvider: GovernmentMarketDataProvider,
      ) => {
        const providerType = (process.env.MARKET_DATA_PROVIDER || 'mock').toLowerCase();
        if (providerType === 'government') {
          return govProvider;
        }
        return mockProvider;
      },
      inject: [MockMarketDataProvider, GovernmentMarketDataProvider],
    },
  ],
  exports: [PricesService, PriceAnalyticsService, MARKET_DATA_PROVIDER_TOKEN],
})
export class PricesModule {}
