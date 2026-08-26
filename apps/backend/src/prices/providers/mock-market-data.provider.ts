import { Injectable } from '@nestjs/common';
import {
  MarketDataProvider,
  NormalizedMandiPrice,
  NormalizedPriceHistory,
  MarketComparisonResult,
  MarketDistanceComparison,
} from './market-data-provider.interface';

interface MockMarketRecord {
  cropName: string;
  category: string;
  marketName: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  baseModalPrice: number;
  dailyArrivals: number;
}

@Injectable()
export class MockMarketDataProvider implements MarketDataProvider {
  private readonly mockCatalog: MockMarketRecord[] = [
    // Tomato
    {
      cropName: 'Tomato',
      category: 'Vegetable',
      marketName: 'Nashik APMC',
      district: 'Nashik',
      state: 'Maharashtra',
      latitude: 19.9975,
      longitude: 73.7898,
      baseModalPrice: 2200,
      dailyArrivals: 185,
    },
    {
      cropName: 'Tomato',
      category: 'Vegetable',
      marketName: 'Lasalgaon Mandi',
      district: 'Nashik',
      state: 'Maharashtra',
      latitude: 20.1477,
      longitude: 74.2259,
      baseModalPrice: 2320,
      dailyArrivals: 210,
    },
    {
      cropName: 'Tomato',
      category: 'Vegetable',
      marketName: 'Azadpur Mandi',
      district: 'North Delhi',
      state: 'Delhi',
      latitude: 28.7159,
      longitude: 77.1788,
      baseModalPrice: 2450,
      dailyArrivals: 340,
    },

    // Onion
    {
      cropName: 'Onion',
      category: 'Vegetable',
      marketName: 'Nashik APMC',
      district: 'Nashik',
      state: 'Maharashtra',
      latitude: 19.9975,
      longitude: 73.7898,
      baseModalPrice: 1950,
      dailyArrivals: 420,
    },
    {
      cropName: 'Onion',
      category: 'Vegetable',
      marketName: 'Lasalgaon Mandi',
      district: 'Nashik',
      state: 'Maharashtra',
      latitude: 20.1477,
      longitude: 74.2259,
      baseModalPrice: 2020,
      dailyArrivals: 580,
    },

    // Paddy
    {
      cropName: 'Paddy',
      category: 'Grain',
      marketName: 'Karnal Mandi',
      district: 'Karnal',
      state: 'Haryana',
      latitude: 29.6857,
      longitude: 76.9905,
      baseModalPrice: 2183,
      dailyArrivals: 600,
    },
    {
      cropName: 'Paddy',
      category: 'Grain',
      marketName: 'Ludhiana Mandi',
      district: 'Ludhiana',
      state: 'Punjab',
      latitude: 30.901,
      longitude: 75.8573,
      baseModalPrice: 2210,
      dailyArrivals: 550,
    },

    // Cotton
    {
      cropName: 'Cotton',
      category: 'Cash Crop',
      marketName: 'Warangal Market',
      district: 'Warangal',
      state: 'Telangana',
      latitude: 17.9689,
      longitude: 79.5941,
      baseModalPrice: 6850,
      dailyArrivals: 140,
    },

    // Chilli
    {
      cropName: 'Chilli',
      category: 'Spice',
      marketName: 'Guntur Market',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      latitude: 16.3067,
      longitude: 80.4365,
      baseModalPrice: 18500,
      dailyArrivals: 230,
    },

    // Maize
    {
      cropName: 'Maize',
      category: 'Grain',
      marketName: 'Warangal Market',
      district: 'Warangal',
      state: 'Telangana',
      latitude: 17.9689,
      longitude: 79.5941,
      baseModalPrice: 2090,
      dailyArrivals: 290,
    },
    {
      cropName: 'Maize',
      category: 'Grain',
      marketName: 'Karimnagar Mandi',
      district: 'Karimnagar',
      state: 'Telangana',
      latitude: 18.4386,
      longitude: 79.1288,
      baseModalPrice: 2140,
      dailyArrivals: 210,
    },
  ];

  async getLatestPrices(filter?: {
    cropName?: string;
    cropId?: string;
    district?: string;
    state?: string;
  }): Promise<NormalizedMandiPrice[]> {
    let list = this.mockCatalog;

    if (filter?.cropName) {
      const q = filter.cropName.toLowerCase();
      list = list.filter((item) => item.cropName.toLowerCase().includes(q));
    }

    if (filter?.district) {
      const d = filter.district.toLowerCase();
      list = list.filter((item) => item.district.toLowerCase().includes(d));
    }

    if (filter?.state) {
      const s = filter.state.toLowerCase();
      list = list.filter((item) => item.state.toLowerCase().includes(s));
    }

    const todayStr = new Date().toISOString().split('T')[0];

    return list.map((m, idx) => {
      const minPrice = Math.round(m.baseModalPrice * 0.88);
      const maxPrice = Math.round(m.baseModalPrice * 1.12);
      return {
        id: `mock-price-${idx + 1}`,
        cropName: m.cropName,
        category: m.category,
        marketName: m.marketName,
        district: m.district,
        state: m.state,
        latitude: m.latitude,
        longitude: m.longitude,
        minPrice,
        maxPrice,
        modalPrice: m.baseModalPrice,
        arrivalQuantity: m.dailyArrivals,
        unit: 'QUINTAL',
        date: todayStr,
        source: 'MOCK',
        updatedAt: new Date().toISOString(),
      };
    });
  }

  async getPriceHistory(
    cropNameOrId: string,
    marketNameOrId?: string,
    days: number = 7,
  ): Promise<NormalizedPriceHistory> {
    const q = (cropNameOrId || 'Tomato').toLowerCase();
    const matches = this.mockCatalog.filter((m) => m.cropName.toLowerCase().includes(q));
    
    let matchedMarket = matches[0] || this.mockCatalog[0];
    if (marketNameOrId) {
      const mQ = marketNameOrId.toLowerCase();
      const specific = matches.find((m) => m.marketName.toLowerCase().includes(mQ));
      if (specific) matchedMarket = specific;
    }

    const today = new Date();
    const history = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      // Realistic non-linear multi-day fluctuation
      const dayFactor = Math.sin(i * 1.2) * 0.04 + ((i % 2 === 0 ? 1 : -1) * 0.015);
      const modalPrice = Math.round(matchedMarket.baseModalPrice * (1 + dayFactor));
      const minPrice = Math.round(modalPrice * 0.88);
      const maxPrice = Math.round(modalPrice * 1.12);
      const arrivalQuantity = Math.round(matchedMarket.dailyArrivals + Math.cos(i) * 35);

      history.push({
        date: dateStr,
        modalPrice,
        minPrice,
        maxPrice,
        arrivalQuantity,
      });
    }

    return {
      cropName: matchedMarket.cropName,
      marketName: matchedMarket.marketName,
      district: matchedMarket.district,
      state: matchedMarket.state,
      currentModalPrice: history[history.length - 1].modalPrice,
      unit: 'QUINTAL',
      history,
    };
  }

  async getNearbyMarketComparison(
    cropNameOrId: string,
    userLat: number = 19.9975, // Default Nashik lat
    userLng: number = 73.7898, // Default Nashik lng
    maxDistanceKm: number = 200,
  ): Promise<MarketComparisonResult> {
    const q = (cropNameOrId || 'Tomato').toLowerCase();
    const cropMarkets = this.mockCatalog.filter((m) => m.cropName.toLowerCase().includes(q));

    const todayStr = new Date().toISOString().split('T')[0];
    const comparisons: MarketDistanceComparison[] = cropMarkets.map((m) => {
      const distanceKm = this.calculateHaversineDistance(userLat, userLng, m.latitude, m.longitude);
      // Transport cost model: ₹0.50 per quintal per km
      const estimatedTransportCost = Math.round(distanceKm * 0.5 * 10) / 10;
      const netRealizablePrice = Math.round(m.baseModalPrice - estimatedTransportCost);
      const minPrice = Math.round(m.baseModalPrice * 0.88);
      const maxPrice = Math.round(m.baseModalPrice * 1.12);

      return {
        marketName: m.marketName,
        district: m.district,
        state: m.state,
        modalPrice: m.baseModalPrice,
        minPrice,
        maxPrice,
        distanceKm: Math.round(distanceKm * 10) / 10,
        estimatedTransportCost,
        netRealizablePrice,
        priceDifference: 0, // Computed relative to base below
        date: todayStr,
      };
    });

    // Filter within reasonable radius if any exist, otherwise return available
    const filtered = comparisons.filter((c) => c.distanceKm <= maxDistanceKm);
    const resultMarkets = filtered.length > 0 ? filtered : comparisons;

    // Find nearest as base, and best by net realizable price
    resultMarkets.sort((a, b) => a.distanceKm - b.distanceKm);
    const baseMarket = resultMarkets[0];

    // Compute price differences against base market
    resultMarkets.forEach((m) => {
      m.priceDifference = Math.round((m.netRealizablePrice - baseMarket.netRealizablePrice) * 10) / 10;
    });

    // Best market is the one with highest net realizable price after transport
    const sortedByNet = [...resultMarkets].sort((a, b) => b.netRealizablePrice - a.netRealizablePrice);
    const bestMarket = sortedByNet[0] || null;

    let arbitrageInsight = 'All regional mandis are operating within standard price bands.';
    if (bestMarket && baseMarket && bestMarket.marketName !== baseMarket.marketName && bestMarket.priceDifference > 0) {
      arbitrageInsight = `${bestMarket.marketName} offers ₹${bestMarket.priceDifference}/Qtl higher net return after factoring in ₹${bestMarket.estimatedTransportCost}/Qtl transport cost over ${bestMarket.distanceKm} km.`;
    }

    return {
      cropName: cropMarkets[0]?.cropName || cropNameOrId,
      userLocation: { latitude: userLat, longitude: userLng },
      baseMarket: baseMarket?.marketName,
      bestMarket,
      markets: sortedByNet,
      arbitrageInsight,
    };
  }

  private calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
