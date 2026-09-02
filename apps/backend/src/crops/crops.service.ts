import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Crop, CropDocument, MandiPrice, MandiPriceDocument } from '../database/schemas';

export const FALLBACK_CROPS = [
  { _id: 'crop-tomato', id: 'crop-tomato', name: 'Tomato', category: 'Vegetables', defaultUnit: 'QUINTAL' },
  { _id: 'crop-onion', id: 'crop-onion', name: 'Onion', category: 'Vegetables', defaultUnit: 'QUINTAL' },
  { _id: 'crop-potato', id: 'crop-potato', name: 'Potato', category: 'Vegetables', defaultUnit: 'QUINTAL' },
  { _id: 'crop-wheat', id: 'crop-wheat', name: 'Wheat', category: 'Cereals & Grains', defaultUnit: 'QUINTAL' },
  { _id: 'crop-rice', id: 'crop-rice', name: 'Rice (Basmati)', category: 'Cereals & Grains', defaultUnit: 'QUINTAL' },
  { _id: 'crop-cotton', id: 'crop-cotton', name: 'Cotton', category: 'Commercial Crops', defaultUnit: 'QUINTAL' },
  { _id: 'crop-soybean', id: 'crop-soybean', name: 'Soybean', category: 'Oilseeds', defaultUnit: 'QUINTAL' },
  { _id: 'crop-maize', id: 'crop-maize', name: 'Maize', category: 'Coarse Cereals', defaultUnit: 'QUINTAL' },
];

@Injectable()
export class CropsService {
  private readonly logger = new Logger(CropsService.name);

  constructor(
    @InjectModel(Crop.name) private readonly cropModel: Model<CropDocument>,
    @InjectModel(MandiPrice.name) private readonly mandiPriceModel: Model<MandiPriceDocument>,
  ) {}

  async findAll() {
    try {
      const crops = await this.cropModel.find().sort({ name: 1 }).lean();
      if (crops && crops.length > 0) {
        return crops.map((c) => ({ ...c, id: c._id }));
      }
    } catch (err: any) {
      this.logger.warn(`MongoDB findAll crops fallback: ${err.message}`);
    }
    return FALLBACK_CROPS;
  }

  async findOne(id: string) {
    try {
      const crop = await this.cropModel
        .findOne({
          $or: [{ _id: id }, { name: new RegExp(`^${id}$`, 'i') }],
        })
        .lean();

      if (crop) {
        const prices = await this.mandiPriceModel
          .find({ cropId: crop._id })
          .sort({ date: -1 })
          .limit(10)
          .lean();
        return {
          ...crop,
          id: crop._id,
          mandiPrices: prices.map((p) => ({ ...p, id: p._id })),
        };
      }
    } catch (err: any) {
      this.logger.warn(`MongoDB findOne crop fallback for ${id}: ${err.message}`);
    }

    const found = FALLBACK_CROPS.find(
      (c) => c.id === id || c._id === id || c.name.toLowerCase() === id.toLowerCase(),
    );
    if (found) return found;

    throw new NotFoundException(`Crop with ID ${id} not found.`);
  }
}
