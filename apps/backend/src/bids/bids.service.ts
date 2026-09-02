import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import {
  Bid,
  BidDocument,
  CropLot,
  CropLotDocument,
  Crop,
  CropDocument,
  User,
  UserDocument,
  Transaction,
  TransactionDocument,
  Payment,
  PaymentDocument,
  BidStatus,
  CropLotStatus,
  PaymentStatus,
  Role,
  TransactionStatus,
  AuditAction,
  NotificationType,
} from '../database/schemas';
import { CreateBidDto } from './dto/create-bid.dto';
import { FALLBACK_LOTS } from '../lots/lots.service';
import { FALLBACK_USERS } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

export const FALLBACK_BIDS: any[] = [
  {
    _id: 'bid-demo-1',
    id: 'bid-demo-1',
    lotId: 'lot-demo-1',
    buyerId: 'usr-buyer-1',
    price: 2250,
    quantity: 100,
    message: 'Direct warehouse pickup, ready for instant bank settlement',
    status: BidStatus.PENDING,
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3600000),
    buyer: {
      id: 'usr-buyer-1',
      name: 'FreshCart Agro Ltd.',
      district: 'Mumbai',
      state: 'Maharashtra',
      isVerified: true,
      profilePhoto: { url: '/images/avatars/buyer-freshcart.svg' },
    },
    lot: {
      id: 'lot-demo-1',
      cropId: 'crop-tomato',
      quantity: 100,
      unit: 'QUINTAL',
      expectedPrice: 2200,
      crop: { id: 'crop-tomato', name: 'Tomato' },
      farmer: { id: 'usr-farmer-1', name: 'Ramesh Patel' },
    },
  },
  {
    _id: 'bid-demo-2',
    id: 'bid-demo-2',
    lotId: 'lot-demo-2',
    buyerId: 'usr-buyer-2',
    price: 1700,
    quantity: 50,
    message: 'Advance payment on pickup',
    status: BidStatus.WITHDRAWN,
    createdAt: new Date(Date.now() - 7200000),
    updatedAt: new Date(Date.now() - 3600000),
    buyer: {
      id: 'usr-buyer-2',
      name: 'GreenSpire Foods',
      district: 'Delhi',
      state: 'Delhi',
      isVerified: true,
      profilePhoto: { url: '/images/avatars/buyer-greenspire.svg' },
    },
    lot: {
      id: 'lot-demo-2',
      cropId: 'crop-onion',
      quantity: 80,
      unit: 'QUINTAL',
      expectedPrice: 1650,
      crop: { id: 'crop-onion', name: 'Onion' },
      farmer: { id: 'usr-farmer-1', name: 'Ramesh Patel' },
    },
  },
];

export const FALLBACK_TRANSACTIONS: any[] = [];
export const FALLBACK_PAYMENTS: any[] = [];

@Injectable()
export class BidsService {
  private readonly logger = new Logger(BidsService.name);

  constructor(
    @InjectModel(Bid.name) private readonly bidModel: Model<BidDocument>,
    @InjectModel(CropLot.name) private readonly cropLotModel: Model<CropLotDocument>,
    @InjectModel(Crop.name) private readonly cropModel: Model<CropDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Transaction.name) private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    @InjectConnection() private readonly connection: Connection,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  async createBid(lotId: string, buyerId: string, dto: CreateBidDto) {
    const profile = await this.usersService.getProfile(buyerId).catch(() => null);
    if (profile && profile.profileCompletionStatus === 'INCOMPLETE') {
      const missing = profile.missingFields?.join(', ') || 'required fields';
      throw new BadRequestException(
        `Please complete your buyer profile details (${missing}) before placing a bid.`,
      );
    }

    if (Number(dto.price) <= 0) {
      throw new BadRequestException('Bid price must be greater than 0.');
    }
    if (Number(dto.quantity) <= 0) {
      throw new BadRequestException('Bid quantity must be greater than 0.');
    }

    try {
      const lot = await this.cropLotModel.findById(lotId).lean();
      if (lot) {
        if (lot.farmerId === buyerId) throw new BadRequestException('You cannot place a bid on your own crop lot.');
        if (lot.status !== CropLotStatus.OPEN && lot.status !== CropLotStatus.BIDDING) {
          throw new BadRequestException(`Cannot place a bid on lot with status ${lot.status}.`);
        }
        if (dto.quantity > lot.quantity) {
          throw new BadRequestException(`Bid quantity cannot exceed available lot quantity (${lot.quantity} ${lot.unit}).`);
        }

        const bidId = `bid-${Date.now()}`;
        const createdBid = await this.bidModel.create({
          _id: bidId,
          lotId,
          buyerId,
          price: Number(dto.price),
          quantity: Number(dto.quantity),
          message: dto.message,
          status: BidStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await this.cropLotModel.findByIdAndUpdate(lotId, { $set: { status: CropLotStatus.BIDDING } });

        await this.auditService.log({
          actorId: buyerId,
          action: AuditAction.BID_PLACED,
          lotId,
          bidId: createdBid._id,
          price: Number(dto.price),
          newQuantity: Number(dto.quantity),
        });

        await this.notificationsService.create({
          recipientId: lot.farmerId,
          type: NotificationType.BID_RECEIVED,
          title: 'New Bid Received on Your Crop Lot',
          message: `${profile?.name || 'A verified buyer'} placed an offer of ₹${dto.price}/${lot.unit} for ${dto.quantity} ${lot.unit}.`,
          entityType: 'BID',
          entityId: createdBid._id,
        });

        const buyer = await this.userModel.findById(buyerId).lean();
        return {
          ...createdBid.toObject(),
          id: createdBid._id,
          buyer: buyer ? { name: buyer.name, district: buyer.district, isVerified: buyer.isVerified } : { name: 'Buyer' },
          lot,
        };
      }
    } catch (err: any) {
      if (err instanceof BadRequestException || err instanceof NotFoundException) throw err;
      this.logger.warn(`MongoDB createBid fallback: ${err.message}`);
    }

    return this.createBidInMemory(lotId, buyerId, dto, profile);
  }

  private async createBidInMemory(lotId: string, buyerId: string, dto: CreateBidDto, profile: any) {
    const lot = FALLBACK_LOTS.find((l) => l.id === lotId || l._id === lotId);
    if (!lot) throw new NotFoundException(`Crop lot with ID ${lotId} not found.`);
    if (lot.farmerId === buyerId) throw new BadRequestException('You cannot place a bid on your own crop lot.');
    if (lot.status !== CropLotStatus.OPEN && lot.status !== CropLotStatus.BIDDING) {
      throw new BadRequestException(`Cannot place a bid on lot with status ${lot.status}.`);
    }
    if (dto.quantity > lot.quantity) {
      throw new BadRequestException(`Bid quantity cannot exceed available lot quantity (${lot.quantity} ${lot.unit}).`);
    }

    lot.status = CropLotStatus.BIDDING;
    const bid = {
      _id: `bid-${Date.now()}`,
      id: `bid-${Date.now()}`,
      lotId,
      buyerId,
      price: Number(dto.price),
      quantity: Number(dto.quantity),
      message: dto.message || null,
      status: BidStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      buyer: {
        id: buyerId,
        name: profile?.name || 'FreshCart Agro Ltd.',
        district: profile?.district || 'Mumbai',
        state: profile?.state || 'Maharashtra',
        isVerified: true,
      },
      lot: {
        id: lot.id,
        cropId: lot.cropId,
        quantity: lot.quantity,
        unit: lot.unit,
        expectedPrice: lot.expectedPrice,
        crop: lot.crop,
        farmer: lot.farmer,
      },
    };

    FALLBACK_BIDS.unshift(bid);
    lot.bids = lot.bids || [];
    lot.bids.unshift(bid);
    lot._count = { bids: lot.bids.length };

    await this.auditService.log({
      actorId: buyerId,
      action: AuditAction.BID_PLACED,
      lotId,
      bidId: bid.id,
      price: Number(dto.price),
      newQuantity: Number(dto.quantity),
    });

    await this.notificationsService.create({
      recipientId: lot.farmerId,
      type: NotificationType.BID_RECEIVED,
      title: 'New Bid Received on Your Crop Lot',
      message: `${profile?.name || 'A buyer'} placed an offer of ₹${dto.price}/${lot.unit} for ${dto.quantity} ${lot.unit}.`,
      entityType: 'BID',
      entityId: bid.id,
    });

    return bid;
  }

  async findBidsForLot(lotId: string) {
    try {
      const bids = await this.bidModel.find({ lotId }).sort({ price: -1 }).lean();
      if (bids && bids.length > 0) {
        const users = await this.userModel.find().lean();
        const userMap = new Map(users.map((u) => [u._id, u]));
        return bids.map((b) => {
          const buyer = userMap.get(b.buyerId);
          return {
            ...b,
            id: b._id,
            buyer: buyer ? { name: buyer.name, district: buyer.district, isVerified: buyer.isVerified, profilePhoto: buyer.profilePhoto } : { name: 'Buyer' },
          };
        });
      }
    } catch (err: any) {
      this.logger.warn(`MongoDB findBidsForLot fallback: ${err.message}`);
    }

    return FALLBACK_BIDS.filter((b) => b.lotId === lotId).map((b) => ({ ...b, id: b._id || b.id }));
  }

  async findMyBids(buyerId: string) {
    try {
      const bids = await this.bidModel.find({ buyerId }).sort({ createdAt: -1 }).lean();
      if (bids && bids.length > 0) {
        const lots = await this.cropLotModel.find().lean();
        const crops = await this.cropModel.find().lean();
        const farmers = await this.userModel.find().lean();

        const lotMap = new Map(lots.map((l) => [l._id, l]));
        const cropMap = new Map(crops.map((c) => [c._id, c]));
        const farmerMap = new Map(farmers.map((f) => [f._id, f]));

        return bids.map((b) => {
          const lot = lotMap.get(b.lotId);
          const crop = lot ? cropMap.get(lot.cropId) : null;
          const farmer = lot ? farmerMap.get(lot.farmerId) : null;

          return {
            ...b,
            id: b._id,
            lot: lot ? {
              ...lot,
              id: lot._id,
              crop: crop || { name: 'Crop' },
              farmer: farmer ? { name: farmer.name, phone: farmer.phone } : { name: 'Farmer' },
            } : null,
          };
        });
      }
    } catch (err: any) {
      this.logger.warn(`MongoDB findMyBids fallback: ${err.message}`);
    }

    return FALLBACK_BIDS.filter((b) => b.buyerId === buyerId).map((b) => ({ ...b, id: b._id || b.id }));
  }

  async modifyBidQuantity(bidId: string, buyerId: string, userRole: Role, newQuantity: number) {
    if (newQuantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0.');
    }

    try {
      const bid = await this.bidModel.findById(bidId).lean();
      if (bid) {
        if (bid.buyerId !== buyerId && userRole !== Role.ADMIN) {
          throw new ForbiddenException('You are not authorized to modify this bid.');
        }
        if (bid.status !== BidStatus.PENDING) {
          throw new BadRequestException(`Cannot modify bid with status ${bid.status}.`);
        }

        const lot = await this.cropLotModel.findById(bid.lotId).lean();
        if (lot && newQuantity > lot.quantity) {
          throw new BadRequestException(`New quantity cannot exceed available lot quantity (${lot.quantity} ${lot.unit}).`);
        }

        const oldQuantity = bid.quantity;
        const updated = await this.bidModel
          .findByIdAndUpdate(bidId, { $set: { quantity: newQuantity, updatedAt: new Date() } }, { new: true })
          .lean();

        await this.auditService.log({
          actorId: buyerId,
          action: AuditAction.QUANTITY_MODIFIED,
          lotId: bid.lotId,
          bidId,
          oldQuantity,
          newQuantity,
          price: bid.price,
        });

        if (lot) {
          await this.notificationsService.create({
            recipientId: lot.farmerId,
            type: NotificationType.BID_MODIFIED,
            title: 'Bid Quantity Modified',
            message: `Buyer updated their procurement quantity from ${oldQuantity} to ${newQuantity} ${lot.unit}.`,
            entityType: 'BID',
            entityId: bidId,
          });
        }

        return { ...updated, id: updated?._id };
      }
    } catch (err: any) {
      if (err instanceof BadRequestException || err instanceof ForbiddenException) throw err;
      this.logger.warn(`MongoDB modifyBidQuantity fallback: ${err.message}`);
    }

    // In-memory fallback
    const bid = FALLBACK_BIDS.find((b) => b.id === bidId || b._id === bidId);
    if (!bid) throw new NotFoundException(`Bid with ID ${bidId} not found.`);
    if (bid.buyerId !== buyerId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You are not authorized to modify this bid.');
    }
    if (bid.status !== BidStatus.PENDING) {
      throw new BadRequestException(`Cannot modify bid with status ${bid.status}.`);
    }

    const oldQuantity = bid.quantity;
    bid.quantity = newQuantity;
    bid.updatedAt = new Date();

    await this.auditService.log({
      actorId: buyerId,
      action: AuditAction.QUANTITY_MODIFIED,
      lotId: bid.lotId,
      bidId,
      oldQuantity,
      newQuantity,
      price: bid.price,
    });

    return { ...bid, id: bid._id || bid.id };
  }

  async cancelBid(bidId: string, buyerId: string, userRole: Role) {
    try {
      const bid = await this.bidModel.findById(bidId).lean();
      if (bid) {
        if (bid.buyerId !== buyerId && userRole !== Role.ADMIN) {
          throw new ForbiddenException('You are not authorized to cancel this bid.');
        }
        if (bid.status !== BidStatus.PENDING) {
          throw new BadRequestException(`Cannot cancel bid with status ${bid.status}. Only PENDING bids can be withdrawn.`);
        }

        const updated = await this.bidModel
          .findByIdAndUpdate(bidId, { $set: { status: BidStatus.WITHDRAWN, updatedAt: new Date() } }, { new: true })
          .lean();

        const lot = await this.cropLotModel.findById(bid.lotId).lean();
        await this.auditService.log({
          actorId: buyerId,
          action: AuditAction.BID_CANCELLED,
          lotId: bid.lotId,
          bidId,
          oldStatus: 'PENDING',
          newStatus: 'WITHDRAWN',
        });

        if (lot) {
          await this.notificationsService.create({
            recipientId: lot.farmerId,
            type: NotificationType.BID_CANCELLED,
            title: 'Bid Withdrawn by Buyer',
            message: `A buyer has withdrawn their bid on your crop lot.`,
            entityType: 'BID',
            entityId: bidId,
          });
        }

        return { ...updated, id: updated?._id };
      }
    } catch (err: any) {
      if (err instanceof BadRequestException || err instanceof ForbiddenException) throw err;
      this.logger.warn(`MongoDB cancelBid fallback: ${err.message}`);
    }

    const bid = FALLBACK_BIDS.find((b) => b.id === bidId || b._id === bidId);
    if (!bid) throw new NotFoundException(`Bid with ID ${bidId} not found.`);
    if (bid.buyerId !== buyerId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You are not authorized to cancel this bid.');
    }
    if (bid.status !== BidStatus.PENDING) {
      throw new BadRequestException(`Cannot cancel bid with status ${bid.status}. Only PENDING bids can be withdrawn.`);
    }

    bid.status = BidStatus.WITHDRAWN;
    bid.updatedAt = new Date();

    await this.auditService.log({
      actorId: buyerId,
      action: AuditAction.BID_CANCELLED,
      lotId: bid.lotId,
      bidId,
      oldStatus: 'PENDING',
      newStatus: 'WITHDRAWN',
    });

    return { ...bid, id: bid._id || bid.id };
  }

  async acceptBid(bidId: string, farmerId: string, userRole: Role) {
    try {
      const bid = await this.bidModel.findById(bidId).lean();
      if (bid) {
        const lot = await this.cropLotModel.findById(bid.lotId).lean();
        if (!lot) throw new NotFoundException('Crop lot not found.');
        if (lot.farmerId !== farmerId && userRole !== Role.ADMIN) {
          throw new ForbiddenException('You are not authorized to accept bids on this lot.');
        }
        if (bid.status !== BidStatus.PENDING) {
          throw new BadRequestException(`Cannot accept bid with status ${bid.status}.`);
        }

        const totalAmount = bid.price * bid.quantity;
        const txnId = `txn-${Date.now()}`;
        const paymentId = `pay-${Date.now()}`;

        // Atomic update session
        const session = await this.connection.startSession().catch(() => null);
        if (session) {
          session.startTransaction();
          try {
            await this.bidModel.findByIdAndUpdate(bidId, { $set: { status: BidStatus.ACCEPTED } }, { session });
            await this.bidModel.updateMany(
              { lotId: bid.lotId, _id: { $ne: bidId }, status: BidStatus.PENDING },
              { $set: { status: BidStatus.REJECTED } },
              { session },
            );
            await this.cropLotModel.findByIdAndUpdate(bid.lotId, { $set: { status: CropLotStatus.SOLD } }, { session });
            await this.transactionModel.create(
              [
                {
                  _id: txnId,
                  lotId: bid.lotId,
                  buyerId: bid.buyerId,
                  farmerId: lot.farmerId,
                  acceptedBidId: bidId,
                  agreedPrice: bid.price,
                  quantity: bid.quantity,
                  totalAmount,
                  status: TransactionStatus.INITIATED,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ],
              { session },
            );
            await this.paymentModel.create(
              [
                {
                  _id: paymentId,
                  transactionId: txnId,
                  amount: totalAmount,
                  status: PaymentStatus.PENDING,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ],
              { session },
            );
            await session.commitTransaction();
          } catch (err: any) {
            await session.abortTransaction();
            throw err;
          } finally {
            session.endSession();
          }
        } else {
          // Direct execution without replica set transactions
          await this.bidModel.findByIdAndUpdate(bidId, { $set: { status: BidStatus.ACCEPTED } });
          await this.bidModel.updateMany(
            { lotId: bid.lotId, _id: { $ne: bidId }, status: BidStatus.PENDING },
            { $set: { status: BidStatus.REJECTED } },
          );
          await this.cropLotModel.findByIdAndUpdate(bid.lotId, { $set: { status: CropLotStatus.SOLD } });
          await this.transactionModel.create({
            _id: txnId,
            lotId: bid.lotId,
            buyerId: bid.buyerId,
            farmerId: lot.farmerId,
            acceptedBidId: bidId,
            agreedPrice: bid.price,
            quantity: bid.quantity,
            totalAmount,
            status: TransactionStatus.INITIATED,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          await this.paymentModel.create({
            _id: paymentId,
            transactionId: txnId,
            amount: totalAmount,
            status: PaymentStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        await this.auditService.log({
          actorId: farmerId,
          action: AuditAction.BID_ACCEPTED,
          lotId: bid.lotId,
          bidId,
          price: bid.price,
          newQuantity: bid.quantity,
        });

        await this.notificationsService.create({
          recipientId: bid.buyerId,
          type: NotificationType.BID_ACCEPTED,
          title: 'Your Bid Was Accepted!',
          message: `The farmer accepted your offer of ₹${bid.price} for ${bid.quantity} ${lot.unit}. Transaction initiated.`,
          entityType: 'TRANSACTION',
          entityId: txnId,
        });

        return {
          id: bidId,
          status: BidStatus.ACCEPTED,
          lot: { id: lot._id, status: CropLotStatus.SOLD },
          transaction: { id: txnId, totalAmount, status: TransactionStatus.INITIATED },
        };
      }
    } catch (err: any) {
      if (err instanceof BadRequestException || err instanceof ForbiddenException) throw err;
      this.logger.warn(`MongoDB acceptBid fallback: ${err.message}`);
    }

    return this.acceptBidInMemory(bidId, farmerId, userRole);
  }

  private async acceptBidInMemory(bidId: string, farmerId: string, userRole: Role) {
    const bid = FALLBACK_BIDS.find((b) => b.id === bidId || b._id === bidId);
    if (!bid) throw new NotFoundException(`Bid with ID ${bidId} not found.`);

    const lot = FALLBACK_LOTS.find((l) => l.id === bid.lotId || l._id === bid.lotId);
    if (!lot) throw new NotFoundException(`Lot with ID ${bid.lotId} not found.`);

    if (lot.farmerId !== farmerId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You are not authorized to accept bids on this lot.');
    }
    if (bid.status !== BidStatus.PENDING) {
      throw new BadRequestException(`Cannot accept bid with status ${bid.status}.`);
    }

    bid.status = BidStatus.ACCEPTED;
    lot.status = CropLotStatus.SOLD;

    FALLBACK_BIDS.forEach((b) => {
      if (b.lotId === lot.id && b.id !== bidId && b.status === BidStatus.PENDING) {
        b.status = BidStatus.REJECTED;
      }
    });

    const totalAmount = bid.price * bid.quantity;
    const txnId = `txn-${Date.now()}`;
    const paymentId = `pay-${Date.now()}`;

    const newPayment = {
      _id: paymentId,
      id: paymentId,
      transactionId: txnId,
      amount: totalAmount,
      status: PaymentStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    FALLBACK_PAYMENTS.unshift(newPayment);

    const newTxn = {
      _id: txnId,
      id: txnId,
      lotId: lot.id,
      buyerId: bid.buyerId,
      farmerId: lot.farmerId,
      acceptedBidId: bidId,
      agreedPrice: bid.price,
      quantity: bid.quantity,
      totalAmount,
      status: TransactionStatus.INITIATED,
      createdAt: new Date(),
      updatedAt: new Date(),
      payment: newPayment,
      buyer: bid.buyer || { name: 'FreshCart Agro Ltd.', district: 'Mumbai' },
      farmer: lot.farmer || { name: 'Ramesh Patel', district: 'Nashik' },
    };
    FALLBACK_TRANSACTIONS.unshift(newTxn);

    lot.transaction = {
      id: txnId,
      agreedPrice: bid.price,
      quantity: bid.quantity,
      totalAmount,
      status: TransactionStatus.INITIATED,
      buyer: bid.buyer || { name: 'FreshCart Agro Ltd.' },
      payment: { status: PaymentStatus.PENDING },
    };

    await this.auditService.log({
      actorId: farmerId,
      action: AuditAction.BID_ACCEPTED,
      lotId: lot.id,
      bidId,
      price: bid.price,
      newQuantity: bid.quantity,
    });

    await this.notificationsService.create({
      recipientId: bid.buyerId,
      type: NotificationType.BID_ACCEPTED,
      title: 'Your Bid Was Accepted!',
      message: `The farmer accepted your offer of ₹${bid.price} for ${bid.quantity} ${lot.unit}. Transaction initiated.`,
      entityType: 'TRANSACTION',
      entityId: txnId,
    });

    return {
      id: bidId,
      status: BidStatus.ACCEPTED,
      lot: { id: lot.id, status: CropLotStatus.SOLD },
      transaction: { id: txnId, totalAmount, status: TransactionStatus.INITIATED },
    };
  }

  async rejectBid(bidId: string, farmerId: string, userRole: Role) {
    try {
      const bid = await this.bidModel.findById(bidId).lean();
      if (bid) {
        const lot = await this.cropLotModel.findById(bid.lotId).lean();
        if (lot && lot.farmerId !== farmerId && userRole !== Role.ADMIN) {
          throw new ForbiddenException('You are not authorized to reject bids on this lot.');
        }

        const updated = await this.bidModel
          .findByIdAndUpdate(bidId, { $set: { status: BidStatus.REJECTED } }, { new: true })
          .lean();

        await this.auditService.log({
          actorId: farmerId,
          action: AuditAction.BID_REJECTED,
          lotId: bid.lotId,
          bidId,
        });

        await this.notificationsService.create({
          recipientId: bid.buyerId,
          type: NotificationType.BID_REJECTED,
          title: 'Bid Rejected',
          message: 'Your bid on the crop lot was rejected by the farmer.',
          entityType: 'BID',
          entityId: bidId,
        });

        return { ...updated, id: updated?._id };
      }
    } catch (err: any) {
      if (err instanceof ForbiddenException || err instanceof BadRequestException) throw err;
      this.logger.warn(`MongoDB rejectBid fallback: ${err.message}`);
    }

    const bid = FALLBACK_BIDS.find((b) => b.id === bidId || b._id === bidId);
    if (!bid) throw new NotFoundException(`Bid with ID ${bidId} not found.`);
    bid.status = BidStatus.REJECTED;

    await this.auditService.log({
      actorId: farmerId,
      action: AuditAction.BID_REJECTED,
      lotId: bid.lotId,
      bidId,
    });

    return { ...bid, id: bid._id || bid.id };
  }
}
