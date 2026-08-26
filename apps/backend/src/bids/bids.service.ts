import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { BidStatus, CropLotStatus, PaymentStatus, Role, TransactionStatus } from '@prisma/client';

@Injectable()
export class BidsService {
  constructor(private prisma: PrismaService) {}

  async createBid(lotId: string, buyerId: string, dto: CreateBidDto) {
    const lot = await this.prisma.cropLot.findUnique({
      where: { id: lotId },
    });

    if (!lot) {
      throw new NotFoundException(`Crop lot with ID ${lotId} not found.`);
    }

    // Business Rule: Buyer cannot bid on own lot
    if (lot.farmerId === buyerId) {
      throw new BadRequestException('You cannot place a bid on your own crop lot.');
    }

    // Business Rule: Lot must be OPEN or BIDDING
    if (lot.status !== CropLotStatus.OPEN && lot.status !== CropLotStatus.BIDDING) {
      throw new BadRequestException(`Cannot place a bid on lot with status ${lot.status}.`);
    }

    // Business Rule: Positive price & quantity within lot available limit
    if (dto.price <= 0) {
      throw new BadRequestException('Bid price must be greater than 0.');
    }

    if (dto.quantity <= 0 || dto.quantity > lot.quantity) {
      throw new BadRequestException(`Bid quantity must be between 1 and ${lot.quantity} ${lot.unit}.`);
    }

    // Create bid and update lot status to BIDDING if OPEN
    const [bid] = await this.prisma.$transaction([
      this.prisma.bid.create({
        data: {
          lotId,
          buyerId,
          price: dto.price,
          quantity: dto.quantity,
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

    return bid;
  }

  async getLotBids(lotId: string) {
    return this.prisma.bid.findMany({
      where: { lotId },
      orderBy: { price: 'desc' },
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
      },
    });
  }

  async getMyBids(userId: string, role: Role) {
    if (role === Role.BUYER) {
      return this.prisma.bid.findMany({
        where: { buyerId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          lot: {
            include: {
              crop: true,
              farmer: {
                select: {
                  id: true,
                  name: true,
                  district: true,
                  state: true,
                  isVerified: true,
                },
              },
            },
          },
        },
      });
    }

    // For farmers: bids received on their lots
    return this.prisma.bid.findMany({
      where: {
        lot: { farmerId: userId },
      },
      orderBy: { createdAt: 'desc' },
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
    });
  }

  async acceptBid(bidId: string, userId: string, userRole: Role) {
    const bid = await this.prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        lot: true,
      },
    });

    if (!bid) {
      throw new NotFoundException(`Bid with ID ${bidId} not found.`);
    }

    // Authorization: only the lot's farmer or admin can accept
    if (bid.lot.farmerId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You are not authorized to accept bids for this lot.');
    }

    if (bid.status !== BidStatus.PENDING) {
      throw new BadRequestException(`Cannot accept a bid with status ${bid.status}.`);
    }

    const totalAmount = Math.round(bid.price * bid.quantity * 100) / 100;

    // Atomic transaction execution:
    // 1. Set chosen bid to ACCEPTED
    // 2. Set competing active bids on the lot to REJECTED
    // 3. Mark lot as SOLD
    // 4. Create Transaction record
    // 5. Create Payment record with PENDING status
    const result = await this.prisma.$transaction(async (tx) => {
      const acceptedBid = await tx.bid.update({
        where: { id: bidId },
        data: { status: BidStatus.ACCEPTED },
      });

      // Reject all other pending bids on this lot
      await tx.bid.updateMany({
        where: {
          lotId: bid.lotId,
          id: { not: bidId },
          status: BidStatus.PENDING,
        },
        data: { status: BidStatus.REJECTED },
      });

      // Mark lot as SOLD
      await tx.cropLot.update({
        where: { id: bid.lotId },
        data: { status: CropLotStatus.SOLD },
      });

      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          lotId: bid.lotId,
          buyerId: bid.buyerId,
          farmerId: bid.lot.farmerId,
          acceptedBidId: bid.id,
          agreedPrice: bid.price,
          quantity: bid.quantity,
          totalAmount,
          status: TransactionStatus.INITIATED,
        },
      });

      // Initialize payment tracking record
      const payment = await tx.payment.create({
        data: {
          transactionId: transaction.id,
          amount: totalAmount,
          status: PaymentStatus.PENDING,
        },
      });

      return {
        acceptedBid,
        transaction,
        payment,
      };
    });

    return result;
  }

  async rejectBid(bidId: string, userId: string, userRole: Role) {
    const bid = await this.prisma.bid.findUnique({
      where: { id: bidId },
      include: { lot: true },
    });

    if (!bid) {
      throw new NotFoundException(`Bid with ID ${bidId} not found.`);
    }

    if (bid.lot.farmerId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You are not authorized to reject bids for this lot.');
    }

    return this.prisma.bid.update({
      where: { id: bidId },
      data: { status: BidStatus.REJECTED },
    });
  }
}
