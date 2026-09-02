import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CropLot,
  CropLotDocument,
  Crop,
  CropDocument,
  User,
  UserDocument,
  Bid,
  BidDocument,
  Transaction,
  TransactionDocument,
  Payment,
  PaymentDocument,
  CropLotStatus,
  Role,
  AuditAction,
} from '../database/schemas';
import { CreateCropLotDto, UpdateCropLotDto, QueryLotsDto } from './dto/create-lot.dto';
import { FALLBACK_CROPS } from '../crops/crops.service';
import { AuditService } from '../audit/audit.service';
import { UsersService } from '../users/users.service';

export const FALLBACK_LOTS: any[] = [
  {
    _id: 'lot-demo-1',
    id: 'lot-demo-1',
    farmerId: 'usr-farmer-1',
    cropId: 'crop-tomato',
    quantity: 100,
    unit: 'QUINTAL',
    expectedPrice: 2200,
    qualityGrade: 'GRADE_A',
    location: 'Village Pimpalgaon, Niphad Taluka, Nashik',
    geoPoint: { type: 'Point', coordinates: [73.9854, 20.1718] },
    harvestDate: new Date(),
    status: CropLotStatus.BIDDING,
    createdAt: new Date(Date.now() - 3600000 * 4),
    updatedAt: new Date(),
    crop: { id: 'crop-tomato', name: 'Tomato', category: 'Vegetables' },
    farmer: {
      id: 'usr-farmer-1',
      name: 'Ramesh Patel',
      phone: '9876543210',
      district: 'Nashik',
      state: 'Maharashtra',
      isVerified: true,
      profilePhoto: { url: '/images/avatars/farmer-ramesh.svg' },
    },
    bids: [],
    _count: { bids: 1 },
  },
  {
    _id: 'lot-demo-2',
    id: 'lot-demo-2',
    farmerId: 'usr-farmer-1',
    cropId: 'crop-onion',
    quantity: 80,
    unit: 'QUINTAL',
    expectedPrice: 1650,
    qualityGrade: 'GRADE_A',
    location: 'Lasalgaon Road, Niphad, Nashik',
    geoPoint: { type: 'Point', coordinates: [74.2281, 20.1472] },
    harvestDate: new Date(),
    status: CropLotStatus.OPEN,
    createdAt: new Date(Date.now() - 3600000 * 2),
    updatedAt: new Date(),
    crop: { id: 'crop-onion', name: 'Onion', category: 'Vegetables' },
    farmer: {
      id: 'usr-farmer-1',
      name: 'Ramesh Patel',
      phone: '9876543210',
      district: 'Nashik',
      state: 'Maharashtra',
      isVerified: true,
      profilePhoto: { url: '/images/avatars/farmer-ramesh.svg' },
    },
    bids: [],
    _count: { bids: 0 },
  },
  {
    _id: 'lot-demo-3',
    id: 'lot-demo-3',
    farmerId: 'usr-farmer-2',
    cropId: 'crop-wheat',
    quantity: 200,
    unit: 'QUINTAL',
    expectedPrice: 2450,
    qualityGrade: 'GRADE_A',
    location: 'Khanna Mandi Gate 2, Ludhiana',
    geoPoint: { type: 'Point', coordinates: [76.2167, 30.7046] },
    harvestDate: new Date(),
    status: CropLotStatus.OPEN,
    createdAt: new Date(Date.now() - 3600000 * 5),
    updatedAt: new Date(),
    crop: { id: 'crop-wheat', name: 'Wheat', category: 'Cereals & Grains' },
    farmer: {
      id: 'usr-farmer-2',
      name: 'Gurpreet Singh',
      phone: '9876543211',
      district: 'Ludhiana',
      state: 'Punjab',
      isVerified: true,
      profilePhoto: { url: '/images/avatars/farmer-gurpreet.svg' },
    },
    bids: [],
    _count: { bids: 0 },
  },
  {
    _id: 'lot-demo-4',
    id: 'lot-demo-4',
    farmerId: 'usr-farmer-1',
    cropId: 'crop-potato',
    quantity: 120,
    unit: 'QUINTAL',
    expectedPrice: 1400,
    qualityGrade: 'GRADE_B',
    location: 'Dindori Road, Nashik',
    geoPoint: { type: 'Point', coordinates: [73.8344, 20.2012] },
    harvestDate: new Date(Date.now() - 86400000 * 3),
    status: CropLotStatus.SOLD,
    createdAt: new Date(Date.now() - 86400000 * 3),
    updatedAt: new Date(Date.now() - 86400000 * 2),
    crop: { id: 'crop-potato', name: 'Potato', category: 'Vegetables' },
    farmer: {
      id: 'usr-farmer-1',
      name: 'Ramesh Patel',
      phone: '9876543210',
      district: 'Nashik',
      state: 'Maharashtra',
      isVerified: true,
      profilePhoto: { url: '/images/avatars/farmer-ramesh.svg' },
    },
    bids: [],
    _count: { bids: 1 },
    transaction: {
      id: 'txn-demo-1',
      agreedPrice: 1450,
      quantity: 120,
      totalAmount: 174000,
      status: 'COMPLETED',
      buyer: { name: 'FreshCart Agro Ltd.', district: 'Mumbai' },
      payment: { status: 'PAID', paymentReference: 'UPI-SBI-882199' },
    },
  },
];

@Injectable()
export class LotsService {
  private readonly logger = new Logger(LotsService.name);

  constructor(
    @InjectModel(CropLot.name) private readonly cropLotModel: Model<CropLotDocument>,
    @InjectModel(Crop.name) private readonly cropModel: Model<CropDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Bid.name) private readonly bidModel: Model<BidDocument>,
    @InjectModel(Transaction.name) private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    private readonly auditService: AuditService,
    private readonly usersService: UsersService,
  ) {}

  private enrichLot(lot: any) {
    const bids = lot.bids || [];
    const activeBids = bids.filter((b: any) => b.status === 'PENDING');
    const highestBid = bids.length > 0 ? Math.max(...bids.map((b: any) => b.price)) : null;
    const highestActiveBid = activeBids.length > 0 ? Math.max(...activeBids.map((b: any) => b.price)) : null;

    return {
      ...lot,
      id: lot._id || lot.id,
      highestBid: highestActiveBid || highestBid,
      bidCount: lot._count?.bids ?? bids.length,
    };
  }

  async create(farmerId: string, dto: CreateCropLotDto) {
    // Profile Completion Gate Check
    const profile = await this.usersService.getProfile(farmerId).catch(() => null);
    if (profile && profile.profileCompletionStatus === 'INCOMPLETE') {
      const missing = profile.missingFields?.join(', ') || 'required fields';
      throw new BadRequestException(
        `Please complete your profile details (${missing}) before publishing a crop lot.`,
      );
    }

    if (Number(dto.quantity) <= 0) {
      throw new BadRequestException('Quantity must be greater than 0.');
    }
    if (Number(dto.expectedPrice) <= 0) {
      throw new BadRequestException('Expected price must be greater than 0.');
    }

    const lotId = `lot-${Date.now()}`;
    const lotData: any = {
      _id: lotId,
      farmerId,
      cropId: dto.cropId,
      quantity: Number(dto.quantity),
      unit: dto.unit || 'QUINTAL',
      expectedPrice: Number(dto.expectedPrice),
      qualityGrade: dto.qualityGrade || 'GRADE_A',
      location: dto.location || profile?.location || 'Pimpalgaon Farm Gate, Niphad, Nashik',
      geoPoint: profile?.geoPoint || null,
      harvestDate: dto.harvestDate ? new Date(dto.harvestDate) : new Date(),
      status: CropLotStatus.OPEN,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const crop = await this.cropModel.findById(dto.cropId).lean();
      const created = await this.cropLotModel.create(lotData);

      await this.auditService.log({
        actorId: farmerId,
        action: AuditAction.LOT_CREATED,
        lotId: created._id,
        price: created.expectedPrice,
        newQuantity: created.quantity,
        metadata: { cropName: crop?.name || 'Produce', location: created.location },
      });

      return this.enrichLot({
        ...created.toObject(),
        crop: crop || { name: 'Crop', category: 'General' },
        farmer: profile || { name: 'Farmer' },
        bids: [],
        _count: { bids: 0 },
      });
    } catch (err: any) {
      this.logger.warn(`MongoDB lot creation fallback: ${err.message}`);
    }

    // In-memory fallback
    const crop =
      FALLBACK_CROPS.find(
        (c) =>
          c.id === dto.cropId ||
          c._id === dto.cropId ||
          c.name.toLowerCase() === (dto.cropId || '').toLowerCase(),
      ) || FALLBACK_CROPS[0];

    const fallbackLot = {
      ...lotData,
      id: lotId,
      crop,
      farmer: {
        id: farmerId,
        name: profile?.name || 'Ramesh Patel',
        phone: profile?.phone || '9876543210',
        district: profile?.district || 'Nashik',
        state: profile?.state || 'Maharashtra',
        isVerified: true,
        profilePhoto: profile?.profilePhoto || null,
      },
      bids: [],
      _count: { bids: 0 },
    };

    FALLBACK_LOTS.unshift(fallbackLot);

    await this.auditService.log({
      actorId: farmerId,
      action: AuditAction.LOT_CREATED,
      lotId: fallbackLot.id,
      price: fallbackLot.expectedPrice,
      newQuantity: fallbackLot.quantity,
      metadata: { cropName: crop.name, location: fallbackLot.location },
    });

    return this.enrichLot(fallbackLot);
  }

  async findAll(query: QueryLotsDto) {
    try {
      const filter: any = {};
      if (query.cropId) filter.cropId = query.cropId;
      if (query.farmerId) filter.farmerId = query.farmerId;
      if (query.status) filter.status = query.status;
      if (query.qualityGrade) filter.qualityGrade = query.qualityGrade;

      const lots = await this.cropLotModel.find(filter).sort({ createdAt: -1 }).lean();
      if (lots && lots.length > 0) {
        const crops = await this.cropModel.find().lean();
        const farmers = await this.userModel.find().lean();
        const bids = await this.bidModel.find().lean();
        const txns = await this.transactionModel.find().lean();
        const payments = await this.paymentModel.find().lean();

        const cropMap = new Map(crops.map((c) => [c._id, c]));
        const farmerMap = new Map(farmers.map((f) => [f._id, f]));
        const paymentMap = new Map(payments.map((p) => [p.transactionId, p]));

        const enriched = lots.map((lot) => {
          const lotBids = bids.filter((b) => b.lotId === lot._id);
          const txn = txns.find((t) => t.lotId === lot._id);
          const farmer = farmerMap.get(lot.farmerId);
          const buyer = txn ? farmerMap.get(txn.buyerId) : null;

          return this.enrichLot({
            ...lot,
            id: lot._id,
            crop: cropMap.get(lot.cropId) || { name: 'Crop', category: 'General' },
            farmer: farmer ? {
              id: farmer._id,
              name: farmer.name,
              phone: farmer.phone,
              district: farmer.district,
              state: farmer.state,
              isVerified: farmer.isVerified,
              profilePhoto: farmer.profilePhoto,
            } : { name: 'Farmer' },
            bids: lotBids.map((b) => ({ ...b, id: b._id })),
            transaction: txn ? {
              ...txn,
              id: txn._id,
              buyer: buyer ? { name: buyer.name, district: buyer.district } : { name: 'Buyer' },
              payment: paymentMap.get(txn._id) || { status: 'PENDING' },
            } : null,
            _count: { bids: lotBids.length },
          });
        });

        return enriched;
      }
    } catch (err: any) {
      this.logger.warn(`MongoDB findAll lots fallback: ${err.message}`);
    }

    let filtered = [...FALLBACK_LOTS];
    if (query.farmerId) filtered = filtered.filter((l) => l.farmerId === query.farmerId);
    if (query.cropId) filtered = filtered.filter((l) => l.cropId === query.cropId || l.crop?.name?.toLowerCase() === query.cropId.toLowerCase());
    if (query.status) filtered = filtered.filter((l) => l.status === query.status);
    if (query.qualityGrade) filtered = filtered.filter((l) => l.qualityGrade === query.qualityGrade);
    return filtered.map((l) => this.enrichLot(l));
  }

  async findOne(id: string) {
    try {
      const lot = await this.cropLotModel.findById(id).lean();
      if (lot) {
        const crop = await this.cropModel.findById(lot.cropId).lean();
        const farmer = await this.userModel.findById(lot.farmerId).lean();
        const bids = await this.bidModel.find({ lotId: lot._id }).sort({ price: -1 }).lean();
        const txn = await this.transactionModel.findOne({ lotId: lot._id }).lean();
        let payment: any = null;
        let buyer: any = null;
        if (txn) {
          payment = await this.paymentModel.findOne({ transactionId: txn._id }).lean();
          buyer = await this.userModel.findById(txn.buyerId).lean();
        }

        return this.enrichLot({
          ...lot,
          id: lot._id,
          crop: crop || { name: 'Crop', category: 'General' },
          farmer: farmer ? {
            id: farmer._id,
            name: farmer.name,
            phone: farmer.phone,
            district: farmer.district,
            state: farmer.state,
            isVerified: farmer.isVerified,
            profilePhoto: farmer.profilePhoto,
          } : { name: 'Farmer' },
          bids: bids.map((b) => ({ ...b, id: b._id })),
          transaction: txn ? {
            ...txn,
            id: txn._id,
            buyer: buyer ? { name: buyer.name, district: buyer.district } : { name: 'Buyer' },
            payment,
          } : null,
          _count: { bids: bids.length },
        });
      }
    } catch (err: any) {
      this.logger.warn(`MongoDB findOne lot fallback for ${id}: ${err.message}`);
    }

    const found = FALLBACK_LOTS.find((l) => l.id === id || l._id === id);
    if (found) return this.enrichLot(found);

    throw new NotFoundException(`Crop Lot with ID ${id} not found.`);
  }

  async update(lotId: string, userId: string, userRole: Role, dto: UpdateCropLotDto) {
    const lot = await this.findOne(lotId);
    if (lot.farmerId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You are not authorized to modify this lot.');
    }
    if (lot.status === CropLotStatus.SOLD) {
      throw new BadRequestException('Sold lots cannot be modified.');
    }

    try {
      const updated = await this.cropLotModel
        .findByIdAndUpdate(lotId, { $set: dto }, { new: true })
        .lean();
      if (updated) {
        return this.enrichLot({ ...lot, ...updated });
      }
    } catch (err: any) {
      this.logger.warn(`MongoDB update lot fallback: ${err.message}`);
    }

    const fallback = FALLBACK_LOTS.find((l) => l.id === lotId || l._id === lotId);
    if (fallback) {
      Object.assign(fallback, dto, { updatedAt: new Date() });
      return this.enrichLot(fallback);
    }

    throw new NotFoundException(`Crop Lot with ID ${lotId} not found.`);
  }

  async cancel(lotId: string, userId: string, userRole: Role) {
    const lot = await this.findOne(lotId);
    if (lot.farmerId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You are not authorized to cancel this lot.');
    }
    if (lot.status === CropLotStatus.SOLD) {
      throw new BadRequestException('A sold lot cannot be cancelled.');
    }

    try {
      await this.cropLotModel.findByIdAndUpdate(lotId, { $set: { status: CropLotStatus.CANCELLED } });
      return this.enrichLot({ ...lot, status: CropLotStatus.CANCELLED });
    } catch (err: any) {
      this.logger.warn(`MongoDB cancel lot fallback: ${err.message}`);
    }

    const fallback = FALLBACK_LOTS.find((l) => l.id === lotId || l._id === lotId);
    if (fallback) {
      fallback.status = CropLotStatus.CANCELLED;
      return this.enrichLot(fallback);
    }

    throw new NotFoundException(`Crop Lot with ID ${lotId} not found.`);
  }
}
