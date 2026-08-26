import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, role: Role) {
    const where: any = {};
    if (role === Role.FARMER) {
      where.farmerId = userId;
    } else if (role === Role.BUYER) {
      where.buyerId = userId;
    }
    // Admin sees all transactions

    return this.prisma.transaction.findMany({
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
  }

  async findOne(id: string, userId: string, role: Role) {
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
  }
}
