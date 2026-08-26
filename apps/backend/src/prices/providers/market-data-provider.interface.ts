export interface NormalizedMandiPrice {
  id: string;
  cropId?: string;
  cropName: string;
  category: string;
  marketId?: string;
  marketName: string;
  district: string;
  state: string;
  latitude?: number;
  longitude?: number;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  arrivalQuantity: number;
  unit: string;
  date: string;
  source: 'AGMARKNET' | 'MOCK' | 'DATA_GOV';
  updatedAt: string;
}

export interface PriceHistoryPoint {
  date: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  arrivalQuantity: number;
}

export interface NormalizedPriceHistory {
  cropName: string;
  marketName: string;
  district: string;
  state: string;
  currentModalPrice: number;
  unit: string;
  history: PriceHistoryPoint[];
}

export interface MarketDistanceComparison {
  marketId?: string;
  marketName: string;
  district: string;
  state: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  distanceKm: number;
  estimatedTransportCost: number;
  netRealizablePrice: number;
  priceDifference: number;
  date: string;
}

export interface MarketComparisonResult {
  cropName: string;
  userLocation?: { latitude: number; longitude: number };
  baseMarket?: string;
  bestMarket: MarketDistanceComparison | null;
  markets: MarketDistanceComparison[];
  arbitrageInsight: string;
}

export interface MarketDataProvider {
  getLatestPrices(filter?: {
    cropName?: string;
    cropId?: string;
    district?: string;
    state?: string;
  }): Promise<NormalizedMandiPrice[]>;

  getPriceHistory(
    cropNameOrId: string,
    marketNameOrId?: string,
    days?: number,
  ): Promise<NormalizedPriceHistory>;

  getNearbyMarketComparison(
    cropNameOrId: string,
    userLat?: number,
    userLng?: number,
    maxDistanceKm?: number,
  ): Promise<MarketComparisonResult>;
}
