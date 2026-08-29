import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { BidStatus, CropLotStatus, PaymentStatus, Role, TransactionStatus, AuditAction, NotificationType } from '@prisma/client';
import { FALLBACK_LOTS } from '../lots/lots.service';
import { FALLBACK_USERS } from '../auth/auth.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

export const FALLBACK_BIDS: any[] = [
  {
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
    },
    lot: {
      id: 'lot-demo-1',
      cropId: 'crop-1',
      quantity: 100,
      unit: 'QUINTAL',
      expectedPrice: 2200,
      crop: { id: 'crop-1', name: 'Tomato' },
      farmer: { id: 'usr-farmer-1', name: 'Ramesh Patel' },
    },
  },
  {
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
    },
    lot: {
      id: 'lot-demo-2',
      cropId: 'crop-2',
      quantity: 80,
      unit: 'QUINTAL',
      expectedPrice: 1650,
      crop: { id: 'crop-2', name: 'Onion' },
      farmer: { id: 'usr-farmer-1', name: 'Ramesh Patel' },
    },
  },
];

export const FALLBACK_TRANSACTIONS: any[] = [];
export const FALLBACK_PAYMENTS: any[] = [];

@Injectable()
export class BidsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private notificationsService: NotificationsService,
    private usersService: UsersService,
  ) {}

  async createBid(lotId: string, buyerId: string, dto: CreateBidDto) {
    // 1. Profile Completion Gate Check
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

    if (!this.prisma.isConnected) {
      return this.createBidInMemory(lotId, buyerId, dto);
    }

    try {
      const lot = await this.prisma.cropLot.findUnique({
        where: { id: lotId },
        include: { crop: true, farmer: true },
      });
      if (!lot) throw new NotFoundException(`Crop lot with ID ${lotId} not found.`);
      if (lot.farmerId === buyerId) throw new BadRequestException('You cannot place a bid on your own crop lot.');
      if (lot.status !== CropLotStatus.OPEN && lot.status !== CropLotStatus.BIDDING) {
        throw new BadRequestException(`Cannot place a bid on lot with status ${lot.status}.`);
      }
      if (dto.quantity > lot.quantity) {
        throw new BadRequestException(`Bid quantity cannot exceed available lot quantity (${lot.quantity} ${lot.unit}).`);
      }

      const [bid] = await this.prisma.$transaction([
        this.prisma.bid.create({
          data: {
            lotId,
            buyerId,
            price: Number(dto.price),
            quantity: Number(dto.quantity),
            message: dto.message,
            status: BidStatus.PENDING,
          },
          include: {
            buyer: {
              select: {
                id: true,
                name: true,
                district: true,
                state: true,
                isVerified: true,
              },
            },
            lot: {
              include: { crop: true },
            },
          },
        }),
        this.prisma.cropLot.update({
          where: { id: lotId },
          data: { status: CropLotStatus.BIDDING },
        }),
      ]);

      await this.auditService.log({
        actorId: buyerId,
        action: AuditAction.BID_PLACED,
        lotId,
        bidId: bid.id,
        price: dto.price,
        newQuantity: dto.quantity,
        metadata: { cropName: bid.lot?.crop?.name, message: dto.message },
      });

      // Send persistent notification to the farmer
      await this.notificationsService.create({
        recipientId: lot.farmerId,
        type: NotificationType.BID_RECEIVED,
        title: 'New Sourcing Bid Received',
        message: `${bid.buyer?.name || 'A buyer'} placed an offer of ₹${dto.price.toLocaleString('en-IN')}/Qtl for ${dto.quantity} ${lot.unit} of ${lot.crop?.name || 'your crop'}.`,
        entityType: 'LOT',
        entityId: lotId,
      });

      return bid;
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof BadRequestException) throw err;
      return this.createBidInMemory(lotId, buyerId, dto);
    }
  }

  private async createBidInMemory(lotId: string, buyerId: string, dto: CreateBidDto) {
    const lot = FALLBACK_LOTS.find((l) => l.id === lotId);
    if (!lot) throw new NotFoundException(`Crop lot with ID ${lotId} not found.`);
    if (lot.farmerId === buyerId) {
      throw new BadRequestException('You cannot place a bid on your own crop lot.');
    }
    if (lot.status !== CropLotStatus.OPEN && lot.status !== CropLotStatus.BIDDING) {
      throw new BadRequestException(`Cannot place a bid on lot with status ${lot.status}.`);
    }
    if (Number(dto.price) <= 0) {
      throw new BadRequestException('Bid price must be greater than 0.');
    }
    if (Number(dto.quantity) <= 0 || Number(dto.quantity) > lot.quantity) {
      throw new BadRequestException(`Bid quantity must be between 1 and ${lot.quantity} ${lot.unit || 'QUINTAL'}.`);
    }

    lot.status = CropLotStatus.BIDDING;
    if (!lot._count) lot._count = { bids: 0 };
    lot._count.bids = (lot._count.bids || 0) + 1;

    const buyerUser = FALLBACK_USERS.find((u) => u.id === buyerId) || {
      id: buyerId,
      name: 'FreshCart Agro Ltd.',
      district: 'Mumbai',
      state: 'Maharashtra',
      isVerified: true,
    };

    const lotSummary = {
      id: lot.id,
      cropId: lot.cropId,
      quantity: lot.quantity,
      unit: lot.unit,
      expectedPrice: lot.expectedPrice,
      qualityGrade: lot.qualityGrade,
      location: lot.location,
      status: lot.status,
      crop: lot.crop,
      farmer: lot.farmer,
    };

    const newBid = {
      id: `bid-${Date.now()}`,
      lotId,
      buyerId,
      price: Number(dto.price),
      quantity: Number(dto.quantity),
      message: dto.message || 'Direct commercial offer',
      status: BidStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      buyer: {
        id: buyerId,
        name: buyerUser.name,
        district: buyerUser.district,
        state: buyerUser.state,
        isVerified: true,
      },
      lot: lotSummary,
    };

    FALLBACK_BIDS.unshift(newBid);
    if (!lot.bids) lot.bids = [];
    lot.bids.unshift({
      id: newBid.id,
      lotId: newBid.lotId,
      buyerId: newBid.buyerId,
      price: newBid.price,
      quantity: newBid.quantity,
      message: newBid.message,
      status: newBid.status,
      createdAt: newBid.createdAt,
      updatedAt: newBid.updatedAt,
      buyer: newBid.buyer,
    });

    await this.auditService.log({
      actorId: buyerId,
      action: AuditAction.BID_PLACED,
      lotId,
      bidId: newBid.id,
      price: Number(dto.price),
      newQuantity: Number(dto.quantity),
      metadata: { cropName: lot.crop?.name, message: dto.message },
    });

    await this.notificationsService.create({
      recipientId: lot.farmerId,
      type: NotificationType.BID_RECEIVED,
      title: 'New Sourcing Bid Received',
      message: `${buyerUser.name} placed an offer of ₹${dto.price.toLocaleString('en-IN')}/Qtl for ${dto.quantity} ${lot.unit} of ${lot.crop?.name || 'crop'}.`,
      entityType: 'LOT',
      entityId: lotId,
    });

    return newBid;
  }

  async updateBidQuantity(bidId: string, buyerId: string, userRole: Role, newQuantity: number) {
    if (!newQuantity || Number(newQuantity) <= 0) {
      throw new BadRequestException('Quantity must be greater than 0.');
    }

    if (!this.prisma.isConnected) {
      return this.updateBidQuantityInMemory(bidId, buyerId, userRole, newQuantity);
    }

    try {
      const bid = await this.prisma.bid.findUnique({
        where: { id: bidId },
        include: { lot: { include: { crop: true, farmer: true } }, buyer: true },
      });

      if (!bid) throw new NotFoundException(`Bid with ID ${bidId} not found.`);

      if (bid.buyerId !== buyerId && userRole !== Role.ADMIN) {
        throw new ForbiddenException('You are not authorized to modify this bid.');
      }

      if (bid.status !== BidStatus.PENDING) {
        throw new BadRequestException(`Only pending bids can be modified. Current status: ${bid.status}.`);
      }

      if (bid.lot.status === CropLotStatus.SOLD || bid.lot.status === CropLotStatus.CANCELLED) {
        throw new BadRequestException(`Cannot modify bid because the lot is ${bid.lot.status}.`);
      }

      if (Number(newQuantity) > bid.lot.quantity) {
        throw new BadRequestException(
          `Modified quantity cannot exceed available lot quantity (${bid.lot.quantity} ${bid.lot.unit}).`,
        );
      }

      const oldQuantity = bid.quantity;
      const updated = await this.prisma.bid.update({
        where: { id: bidId },
        data: { quantity: Number(newQuantity) },
        include: {
          buyer: {
            select: { id: true, name: true, district: true, state: true, isVerified: true },
          },
          lot: {
            include: { crop: true },
          },
        },
      });

      await this.auditService.log({
        actorId: buyerId,
        action: AuditAction.QUANTITY_MODIFIED,
        lotId: bid.lotId,
        bidId: bid.id,
        price: bid.price,
        oldQuantity,
        newQuantity: Number(newQuantity),
        metadata: {
          cropName: bid.lot.crop?.name,
          buyerName: bid.buyer?.name,
        },
      });

      // Send persistent notification to the farmer
      await this.notificationsService.create({
        recipientId: bid.lot.farmerId,
        type: NotificationType.BID_MODIFIED,
        title: 'Bid Quantity Modified',
        message: `${bid.buyer?.name || 'Buyer'} modified bid quantity from ${oldQuantity} to ${newQuantity} ${bid.lot.unit} on ${bid.lot.crop?.name || 'your crop'}.`,
        entityType: 'LOT',
        entityId: bid.lotId,
      });

      return updated;
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof ForbiddenException || err instanceof BadRequestException) throw err;
      return this.updateBidQuantityInMemory(bidId, buyerId, userRole, newQuantity);
    }
  }

  private async updateBidQuantityInMemory(bidId: string, buyerId: string, userRole: Role, newQuantity: number) {
    const bid = FALLBACK_BIDS.find((b) => b.id === bidId);
    if (!bid) throw new NotFoundException(`Bid with ID ${bidId} not found.`);

    if (bid.buyerId !== buyerId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You are not authorized to modify this bid.');
    }

    if (bid.status !== BidStatus.PENDING) {
      throw new BadRequestException(`Only pending bids can be modified. Current status: ${bid.status}.`);
    }

    const lot = FALLBACK_LOTS.find((l) => l.id === bid.lotId);
    if (lot && (lot.status === CropLotStatus.SOLD || lot.status === CropLotStatus.CANCELLED)) {
      throw new BadRequestException(`Cannot modify bid because the lot is ${lot.status}.`);
    }

    if (lot && Number(newQuantity) > lot.quantity) {
      throw new BadRequestException(
        `Modified quantity cannot exceed available lot quantity (${lot.quantity} ${lot.unit || 'QUINTAL'}).`,
      );
    }

    const oldQuantity = bid.quantity;
    bid.quantity = Number(newQuantity);
    bid.updatedAt = new Date();

    if (lot && lot.bids) {
      const lotBid = lot.bids.find((b: any) => b.id === bidId);
      if (lotBid) lotBid.quantity = Number(newQuantity);
    }

    await this.auditService.log({
      actorId: buyerId,
      action: AuditAction.QUANTITY_MODIFIED,
      lotId: bid.lotId,
      bidId: bid.id,
      price: bid.price,
      oldQuantity,
      newQuantity: Number(newQuantity),
      metadata: {
        cropName: bid.lot?.crop?.name,
        buyerName: bid.buyer?.name,
      },
    });

    if (bid.lot?.farmer?.id || lot?.farmerId) {
      await this.notificationsService.create({
        recipientId: bid.lot?.farmer?.id || lot?.farmerId,
        type: NotificationType.BID_MODIFIED,
        title: 'Bid Quantity Modified',
        message: `${bid.buyer?.name || 'Buyer'} modified bid quantity from ${oldQuantity} to ${newQuantity} Qtl on ${bid.lot?.crop?.name || 'your lot'}.`,
        entityType: 'LOT',
        entityId: bid.lotId,
      });
    }

    return bid;
  }

  async cancelBid(bidId: string, buyerId: string, userRole: Role) {
    if (!this.prisma.isConnected) {
      return this.cancelBidInMemory(bidId, buyerId, userRole);
    }

    try {
      const bid = await this.prisma.bid.findUnique({
        where: { id: bidId },
        include: { lot: { include: { crop: true, farmer: true } }, buyer: true },
      });

      if (!bid) throw new NotFoundException(`Bid with ID ${bidId} not found.`);

      if (bid.buyerId !== buyerId && userRole !== Role.ADMIN) {
        throw new ForbiddenException('You are not authorized to cancel this bid.');
      }

      if (bid.status !== BidStatus.PENDING) {
        throw new BadRequestException(`Only pending bids can be cancelled. Current status: ${bid.status}.`);
      }

      const updated = await this.prisma.bid.update({
        where: { id: bidId },
        data: { status: BidStatus.WITHDRAWN },
        include: {
          buyer: { select: { id: true, name: true, district: true } },
          lot: { include: { crop: true } },
        },
      });

      await this.auditService.log({
        actorId: buyerId,
        action: AuditAction.BID_CANCELLED,
        lotId: bid.lotId,
        bidId: bid.id,
        price: bid.price,
        metadata: {
          cropName: bid.lot.crop?.name,
          buyerName: bid.buyer?.name,
        },
      });

      // Send persistent notification to the farmer
      await this.notificationsService.create({
        recipientId: bid.lot.farmerId,
        type: NotificationType.BID_CANCELLED,
        title: 'Bid Withdrawn by Buyer',
        message: `${bid.buyer?.name || 'Buyer'} has withdrawn their pending offer on ${bid.lot.crop?.name || 'your crop'}.`,
        entityType: 'LOT',
        entityId: bid.lotId,
      });

      return updated;
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof ForbiddenException || err instanceof BadRequestException) throw err;
      return this.cancelBidInMemory(bidId, buyerId, userRole);
    }
  }

  private async cancelBidInMemory(bidId: string, buyerId: string, userRole: Role) {
    const bid = FALLBACK_BIDS.find((b) => b.id === bidId);
    if (!bid) throw new NotFoundException(`Bid with ID ${bidId} not found.`);

    if (bid.buyerId !== buyerId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You are not authorized to cancel this bid.');
    }

    if (bid.status !== BidStatus.PENDING) {
      throw new BadRequestException(`Only pending bids can be cancelled. Current status: ${bid.status}.`);
    }

    bid.status = BidStatus.WITHDRAWN;
    bid.updatedAt = new Date();

    const lot = FALLBACK_LOTS.find((l) => l.id === bid.lotId);
    if (lot && lot.bids) {
      const lotBid = lot.bids.find((b: any) => b.id === bidId);
      if (lotBid) lotBid.status = BidStatus.WITHDRAWN;
    }

    await this.auditService.log({
      actorId: buyerId,
      action: AuditAction.BID_CANCELLED,
      lotId: bid.lotId,
      bidId: bid.id,
      price: bid.price,
      metadata: {
        cropName: bid.lot?.crop?.name,
        buyerName: bid.buyer?.name,
      },
    });

    if (bid.lot?.farmer?.id || lot?.farmerId) {
      await this.notificationsService.create({
        recipientId: bid.lot?.farmer?.id || lot?.farmerId,
        type: NotificationType.BID_CANCELLED,
        title: 'Bid Withdrawn by Buyer',
        message: `${bid.buyer?.name || 'Buyer'} has withdrawn their pending offer on ${bid.lot?.crop?.name || 'your crop'}.`,
        entityType: 'LOT',
        entityId: bid.lotId,
      });
    }

    return bid;
  }

  async acceptBid(bidId: string, farmerId: string, userRole: Role) {
    if (!this.prisma.isConnected) {
      return this.acceptBidInMemory(bidId, farmerId, userRole);
    }

    try {
      const bid = await this.prisma.bid.findUnique({
        where: { id: bidId },
        include: {
          lot: {
            include: { crop: true, bids: true },
          },
          buyer: true,
        },
      });

      if (!bid) throw new NotFoundException(`Bid with ID ${bidId} not found.`);

      if (bid.lot.farmerId !== farmerId && userRole !== Role.ADMIN) {
        throw new ForbiddenException('Only the lot owner or admin can accept bids.');
      }

      if (bid.status !== BidStatus.PENDING) {
        throw new BadRequestException(`Only pending bids can be accepted. Current status: ${bid.status}.`);
      }

      if (bid.lot.status === CropLotStatus.SOLD) {
        throw new BadRequestException('This crop lot is already sold and finalized.');
      }

      const totalAmount = bid.price * bid.quantity;

      const [acceptedBid, updatedLot, transaction, payment] = await this.prisma.$transaction(async (tx) => {
        // 1. Accept selected bid
        const accepted = await tx.bid.update({
          where: { id: bidId },
          data: { status: BidStatus.ACCEPTED },
        });

        // 2. Reject other pending bids on this lot
        await tx.bid.updateMany({
          where: {
            lotId: bid.lotId,
            id: { not: bidId },
            status: BidStatus.PENDING,
          },
          data: { status: BidStatus.REJECTED },
        });

        // 3. Mark lot as SOLD
        const lot = await tx.cropLot.update({
          where: { id: bid.lotId },
          data: { status: CropLotStatus.SOLD },
        });

        // 4. Create Transaction
        const txn = await tx.transaction.create({
          data: {
            lotId: bid.lotId,
            acceptedBidId: bid.id,
            farmerId: bid.lot.farmerId,
            buyerId: bid.buyerId,
            agreedPrice: bid.price,
            quantity: bid.quantity,
            totalAmount,
            status: TransactionStatus.INITIATED,
          },
        });

        // 5. Create Payment record in PENDING state
        const pay = await tx.payment.create({
          data: {
            transactionId: txn.id,
            amount: totalAmount,
            status: PaymentStatus.PENDING,
          },
        });

        return [accepted, lot, txn, pay];
      });

      await this.auditService.log({
        actorId: farmerId,
        action: AuditAction.BID_ACCEPTED,
        lotId: bid.lotId,
        bidId: bid.id,
        price: bid.price,
        newQuantity: bid.quantity,
        metadata: {
          transactionId: transaction.id,
          totalAmount,
          cropName: bid.lot.crop?.name,
        },
      });

      // Send persistent notification to the winning buyer
      await this.notificationsService.create({
        recipientId: bid.buyerId,
        type: NotificationType.BID_ACCEPTED,
        title: 'Offer Accepted! Purchase Contract Created',
        message: `Your bid of ₹${bid.price.toLocaleString('en-IN')}/Qtl for ${bid.quantity} ${bid.lot.unit} of ${bid.lot.crop?.name || 'crop'} was accepted! Total: ₹${totalAmount.toLocaleString('en-IN')}.`,
        entityType: 'TRANSACTION',
        entityId: transaction.id,
      });

      // Notify competing bidders
      const otherBids = bid.lot.bids.filter((b) => b.id !== bidId && b.status === BidStatus.PENDING);
      for (const other of otherBids) {
        await this.notificationsService.create({
          recipientId: other.buyerId,
          type: NotificationType.BID_REJECTED,
          title: 'Bid Update: Deal Finalized with Competing Offer',
          message: `The farmer accepted another offer for the ${bid.lot.crop?.name || 'crop'} lot. Your bid has been closed.`,
          entityType: 'LOT',
          entityId: bid.lotId,
        });
      }

      return {
        bid: acceptedBid,
        lot: updatedLot,
        transaction,
        payment,
      };
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof ForbiddenException || err instanceof BadRequestException) throw err;
      return this.acceptBidInMemory(bidId, farmerId, userRole);
    }
  }

  private async acceptBidInMemory(bidId: string, farmerId: string, userRole: Role) {
    const bid = FALLBACK_BIDS.find((b) => b.id === bidId);
    if (!bid) throw new NotFoundException(`Bid with ID ${bidId} not found.`);

    const lot = FALLBACK_LOTS.find((l) => l.id === bid.lotId);
    if (!lot) throw new NotFoundException(`Associated crop lot not found.`);

    if (lot.farmerId !== farmerId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only the lot owner or admin can accept bids.');
    }

    if (bid.status !== BidStatus.PENDING) {
      throw new BadRequestException(`Only pending bids can be accepted. Current status: ${bid.status}.`);
    }

    if (lot.status === CropLotStatus.SOLD) {
      throw new BadRequestException('This crop lot is already sold.');
    }

    bid.status = BidStatus.ACCEPTED;
    bid.updatedAt = new Date();

    FALLBACK_BIDS.forEach((b) => {
      if (b.lotId === bid.lotId && b.id !== bidId && b.status === BidStatus.PENDING) {
        b.status = BidStatus.REJECTED;
        b.updatedAt = new Date();
      }
    });

    lot.status = CropLotStatus.SOLD;
    lot.updatedAt = new Date();

    const totalAmount = bid.price * bid.quantity;
    const newTxn = {
      id: `txn-${Date.now()}`,
      lotId: lot.id,
      acceptedBidId: bid.id,
      farmerId: lot.farmerId,
      buyerId: bid.buyerId,
      agreedPrice: bid.price,
      quantity: bid.quantity,
      totalAmount,
      status: TransactionStatus.INITIATED,
      createdAt: new Date(),
      updatedAt: new Date(),
      farmer: lot.farmer,
      buyer: bid.buyer,
      lot,
      payment: {
        id: `pay-${Date.now()}`,
        amount: totalAmount,
        status: PaymentStatus.PENDING,
        paymentReference: null,
      },
    };

    FALLBACK_TRANSACTIONS.unshift(newTxn);
    lot.transaction = newTxn;

    await this.auditService.log({
      actorId: farmerId,
      action: AuditAction.BID_ACCEPTED,
      lotId: bid.lotId,
      bidId: bid.id,
      price: bid.price,
      newQuantity: bid.quantity,
      metadata: {
        transactionId: newTxn.id,
        totalAmount,
        cropName: lot.crop?.name,
      },
    });

    await this.notificationsService.create({
      recipientId: bid.buyerId,
      type: NotificationType.BID_ACCEPTED,
      title: 'Offer Accepted! Purchase Contract Created',
      message: `Your bid of ₹${bid.price.toLocaleString('en-IN')}/Qtl for ${bid.quantity} Qtl of ${lot.crop?.name || 'crop'} was accepted! Total: ₹${totalAmount.toLocaleString('en-IN')}.`,
      entityType: 'TRANSACTION',
      entityId: newTxn.id,
    });

    return {
      bid,
      lot,
      transaction: newTxn,
      payment: newTxn.payment,
    };
  }

  async rejectBid(bidId: string, farmerId: string, userRole: Role) {
    if (!this.prisma.isConnected) {
      const bid = FALLBACK_BIDS.find((b) => b.id === bidId);
      if (!bid) throw new NotFoundException(`Bid with ID ${bidId} not found.`);
      bid.status = BidStatus.REJECTED;
      bid.updatedAt = new Date();
      return bid;
    }

    try {
      const bid = await this.prisma.bid.findUnique({
        where: { id: bidId },
        include: { lot: true },
      });
      if (!bid) throw new NotFoundException(`Bid with ID ${bidId} not found.`);
      if (bid.lot.farmerId !== farmerId && userRole !== Role.ADMIN) {
        throw new ForbiddenException('Only the lot owner or admin can reject bids.');
      }
      return await this.prisma.bid.update({
        where: { id: bidId },
        data: { status: BidStatus.REJECTED },
      });
    } catch (err) {
      const bid = FALLBACK_BIDS.find((b) => b.id === bidId);
      if (bid) {
        bid.status = BidStatus.REJECTED;
        return bid;
      }
      throw err;
    }
  }

  async findByLot(lotId: string) {
    if (!this.prisma.isConnected) {
      return FALLBACK_BIDS.filter((b) => b.lotId === lotId);
    }
    try {
      return await this.prisma.bid.findMany({
        where: { lotId },
        orderBy: { price: 'desc' },
        include: {
          buyer: {
            select: { id: true, name: true, district: true, state: true, isVerified: true },
          },
        },
      });
    } catch (err) {
      return FALLBACK_BIDS.filter((b) => b.lotId === lotId);
    }
  }

  async getLotBids(lotId: string) {
    return this.findByLot(lotId);
  }

  async findMyBids(buyerId: string) {
    if (!this.prisma.isConnected) {
      return FALLBACK_BIDS.filter((b) => b.buyerId === buyerId);
    }
    try {
      return await this.prisma.bid.findMany({
        where: { buyerId },
        orderBy: { createdAt: 'desc' },
        include: {
          lot: {
            include: {
              crop: true,
              farmer: {
                select: { id: true, name: true, phone: true, district: true, state: true },
              },
            },
          },
        },
      });
    } catch (err) {
      return FALLBACK_BIDS.filter((b) => b.buyerId === buyerId);
    }
  }

  async getMyBids(userId: string, role?: Role) {
    if (role === Role.FARMER) {
      if (!this.prisma.isConnected) {
        return FALLBACK_BIDS.filter((b) => {
          const lot = FALLBACK_LOTS.find((l) => l.id === b.lotId);
          return lot?.farmerId === userId;
        });
      }
      try {
        return await this.prisma.bid.findMany({
          where: { lot: { farmerId: userId } },
          orderBy: { createdAt: 'desc' },
          include: {
            buyer: { select: { id: true, name: true, district: true, state: true } },
            lot: { include: { crop: true } },
          },
        });
      } catch {
        return FALLBACK_BIDS.filter((b) => {
          const lot = FALLBACK_LOTS.find((l) => l.id === b.lotId);
          return lot?.farmerId === userId;
        });
      }
    }
    return this.findMyBids(userId);
  }
}
