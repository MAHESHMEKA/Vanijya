import { PriceAnalyticsService } from './price-analytics.service';

describe('PriceAnalyticsService', () => {
  let service: PriceAnalyticsService;

  beforeEach(() => {
    service = new PriceAnalyticsService();
  });

  describe('calculateMovingAverage', () => {
    it('should calculate 7-day Simple Moving Average correctly', () => {
      const prices = [2100, 2150, 2200, 2180, 2220, 2250, 2300];
      const sma = service.calculateMovingAverage(prices);
      expect(sma).toBe(2200);
    });

    it('should return 0 for empty array', () => {
      expect(service.calculateMovingAverage([])).toBe(0);
    });
  });

  describe('calculatePriceDelta', () => {
    it('should calculate positive price delta and percentage accurately', () => {
      const { absolute, percentage } = service.calculatePriceDelta(2310, 2200);
      expect(absolute).toBe(110);
      expect(percentage).toBe(5);
    });

    it('should calculate negative price delta accurately', () => {
      const { absolute, percentage } = service.calculatePriceDelta(2090, 2200);
      expect(absolute).toBe(-110);
      expect(percentage).toBe(-5);
    });
  });

  describe('detectTrend', () => {
    it('should identify BULLISH trend when prices increase >= 2%', () => {
      const prices = [2000, 2050, 2100, 2150, 2200]; // +10%
      expect(service.detectTrend(prices)).toBe('BULLISH');
    });

    it('should identify BEARISH trend when prices decrease <= -2%', () => {
      const prices = [2200, 2150, 2100, 2050, 2000]; // -9%
      expect(service.detectTrend(prices)).toBe('BEARISH');
    });

    it('should identify STABLE trend for minimal fluctuations', () => {
      const prices = [2200, 2210, 2190, 2205, 2210];
      expect(service.detectTrend(prices)).toBe('STABLE');
    });
  });

  describe('calculateVolatility', () => {
    it('should return LOW volatility for steady prices', () => {
      const prices = [2200, 2210, 2205, 2195, 2200];
      expect(service.calculateVolatility(prices)).toBe('LOW');
    });

    it('should return HIGH volatility for wide swings', () => {
      const prices = [1500, 2500, 1400, 2600, 1800];
      expect(service.calculateVolatility(prices)).toBe('HIGH');
    });
  });

  describe('calculateHaversineDistance', () => {
    it('should calculate accurate distance between Nashik and Lasalgaon (~45 km)', () => {
      const nashikLat = 19.9975;
      const nashikLng = 73.7898;
      const lasalgaonLat = 20.1477;
      const lasalgaonLng = 74.2259;

      const distance = service.calculateHaversineDistance(
        nashikLat,
        nashikLng,
        lasalgaonLat,
        lasalgaonLng,
      );

      expect(distance).toBeGreaterThan(40);
      expect(distance).toBeLessThan(55);
    });
  });

  describe('generateBestSellingWindow', () => {
    it('should recommend immediate selling during BULLISH high-price windows', () => {
      const result = service.generateBestSellingWindow(
        2350,
        2200,
        'BULLISH',
        'LOW',
        'Tomato',
      );

      expect(result.confidence).toBe('HIGH');
      expect(result.recommendedWindowDays).toBe('Next 24 - 48 Hours');
      expect(result.calculation.deltaPercentage).toBeGreaterThan(0);
      expect(result.reasoning).toContain('Tomato');
    });

    it('should recommend holding during BEARISH low-price troughs', () => {
      const result = service.generateBestSellingWindow(
        1900,
        2200,
        'BEARISH',
        'LOW',
        'Tomato',
      );

      expect(result.confidence).toBe('MEDIUM');
      expect(result.recommendedWindowDays).toContain('Hold');
    });
  });
});
