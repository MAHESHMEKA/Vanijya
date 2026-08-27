import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { FALLBACK_TRANSACTIONS } from '../bids/bids.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, role: Role) {
    if (!this.prisma.isConnected) {
      if (role === Role.FARMER) {
        return FALLBACK_TRANSACTIONS.filter((t) => t.farmerId === userId);
      }
      if (role === Role.BUYER) {
        return FALLBACK_TRANSACTIONS.filter((t) => t.buyerId === userId);
      }
      return FALLBACK_TRANSACTIONS;
    }

    try {
      const where: any = {};
      if (role === Role.FARMER) {
        where.farmerId = userId;
      } else if (role === Role.BUYER) {
        where.buyerId = userId;
      }

      return await this.prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          lot: {
            include: { crop: true },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              district: true,
              state: true,
              isVerified: true,
            },
          },
          farmer: {
            select: {
              id: true,
              name: true,
              phone: true,
              district: true,
              state: true,
              isVerified: true,
            },
          },
          payment: true,
        },
      });
    } catch (err) {
      if (role === Role.FARMER) {
        return FALLBACK_TRANSACTIONS.filter((t) => t.farmerId === userId);
      }
      if (role === Role.BUYER) {
        return FALLBACK_TRANSACTIONS.filter((t) => t.buyerId === userId);
      }
      return FALLBACK_TRANSACTIONS;
    }
  }

  async findOne(id: string, userId: string, role: Role) {
    if (!this.prisma.isConnected) {
      const txn = FALLBACK_TRANSACTIONS.find((t) => t.id === id);
      if (!txn) throw new NotFoundException(`Transaction with ID ${id} not found.`);
      if (role !== Role.ADMIN && txn.farmerId !== userId && txn.buyerId !== userId) {
        throw new ForbiddenException('You are not authorized to view this transaction.');
      }
      return txn;
    }

    try {
      const transaction = await this.prisma.transaction.findUnique({
        where: { id },
        include: {
          lot: {
            include: { crop: true },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              district: true,
              state: true,
              isVerified: true,
            },
          },
          farmer: {
            select: {
              id: true,
              name: true,
              phone: true,
              district: true,
              state: true,
              isVerified: true,
            },
          },
          payment: true,
          acceptedBid: true,
        },
      });

      if (!transaction) {
        throw new NotFoundException(`Transaction with ID ${id} not found.`);
      }

      if (
        role !== Role.ADMIN &&
        transaction.farmerId !== userId &&
        transaction.buyerId !== userId
      ) {
        throw new ForbiddenException('You are not authorized to view this transaction.');
      }

      return transaction;
    } catch (err) {
      const txn = FALLBACK_TRANSACTIONS.find((t) => t.id === id);
      if (txn) return txn;
      throw new NotFoundException(`Transaction with ID ${id} not found.`);
    }
  }
}
