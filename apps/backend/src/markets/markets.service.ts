import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Market, MarketDocument, MandiPrice, MandiPriceDocument } from '../database/schemas';

export const FALLBACK_MARKETS = [
  {
    _id: 'mkt-nashik',
    id: 'mkt-nashik',
    name: 'Pimpalgaon Baswant APMC',
    district: 'Nashik',
    state: 'Maharashtra',
    latitude: 20.1718,
    longitude: 73.9854,
    geoPoint: { type: 'Point', coordinates: [73.9854, 20.1718] },
  },
  {
    _id: 'mkt-lasalgaon',
    id: 'mkt-lasalgaon',
    name: 'Lasalgaon Main APMC',
    district: 'Nashik',
    state: 'Maharashtra',
    latitude: 20.1472,
    longitude: 74.2281,
    geoPoint: { type: 'Point', coordinates: [74.2281, 20.1472] },
  },
  {
    _id: 'mkt-vashi',
    id: 'mkt-vashi',
    name: 'Vashi Wholesale APMC',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    latitude: 19.076,
    longitude: 73.0033,
    geoPoint: { type: 'Point', coordinates: [73.0033, 19.076] },
  },
  {
    _id: 'mkt-azadpur',
    id: 'mkt-azadpur',
    name: 'Azadpur National Mandi',
    district: 'North Delhi',
    state: 'Delhi',
    latitude: 28.7041,
    longitude: 77.1025,
    geoPoint: { type: 'Point', coordinates: [77.1025, 28.7041] },
  },
  {
    _id: 'mkt-khanna',
    id: 'mkt-khanna',
    name: 'Khanna Grain Market',
    district: 'Ludhiana',
    state: 'Punjab',
    latitude: 30.7046,
    longitude: 76.2167,
    geoPoint: { type: 'Point', coordinates: [76.2167, 30.7046] },
  },
];

@Injectable()
export class MarketsService {
  private readonly logger = new Logger(MarketsService.name);

  constructor(
    @InjectModel(Market.name) private readonly marketModel: Model<MarketDocument>,
    @InjectModel(MandiPrice.name) private readonly mandiPriceModel: Model<MandiPriceDocument>,
  ) {}

  async findAll() {
    try {
      const markets = await this.marketModel.find().sort({ name: 1 }).lean();
      if (markets && markets.length > 0) {
        return markets.map((m) => ({ ...m, id: m._id }));
      }
    } catch (err: any) {
      this.logger.warn(`MongoDB findAll markets fallback: ${err.message}`);
    }
    return FALLBACK_MARKETS;
  }

  async findOne(id: string) {
    try {
      const market = await this.marketModel.findById(id).lean();
      if (market) {
        const prices = await this.mandiPriceModel
          .find({ marketId: market._id })
          .sort({ date: -1 })
          .limit(10)
          .lean();
        return {
          ...market,
          id: market._id,
          mandiPrices: prices.map((p) => ({ ...p, id: p._id })),
        };
      }
    } catch (err: any) {
      this.logger.warn(`MongoDB findOne market fallback for ${id}: ${err.message}`);
    }

    const found = FALLBACK_MARKETS.find((m) => m.id === id || m._id === id);
    if (found) return found;

    throw new NotFoundException(`Market APMC with ID ${id} not found.`);
  }
}
