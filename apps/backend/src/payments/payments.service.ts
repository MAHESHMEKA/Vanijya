import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { PaymentStatus, Role, TransactionStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async getPaymentByTransaction(transactionId: string, userId: string, role: Role) {
    const payment = await this.prisma.payment.findUnique({
      where: { transactionId },
      include: {
        transaction: {
          include: {
            lot: { include: { crop: true } },
            buyer: {
              select: { id: true, name: true, phone: true, isVerified: true },
            },
            farmer: {
              select: { id: true, name: true, phone: true, isVerified: true },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment record for transaction ${transactionId} not found.`);
    }

    if (
      role !== Role.ADMIN &&
      payment.transaction.buyerId !== userId &&
      payment.transaction.farmerId !== userId
    ) {
      throw new ForbiddenException('You are not authorized to view this payment.');
    }

    return payment;
  }

  async updatePaymentStatus(
    transactionId: string,
    userId: string,
    role: Role,
    dto: UpdatePaymentStatusDto,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { transactionId },
      include: { transaction: true },
    });

    if (!payment) {
      throw new NotFoundException(`Payment record for transaction ${transactionId} not found.`);
    }

    if (
      role !== Role.ADMIN &&
      payment.transaction.buyerId !== userId &&
      payment.transaction.farmerId !== userId
    ) {
      throw new ForbiddenException('You are not authorized to update this payment.');
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { transactionId },
      data: {
        status: dto.status,
        paymentReference: dto.paymentReference || payment.paymentReference,
      },
    });

    // When payment is marked PAID, update transaction status to COMPLETED
    if (dto.status === PaymentStatus.PAID) {
      await this.prisma.transaction.update({
        where: { id: transactionId },
        data: { status: TransactionStatus.COMPLETED },
      });
    }

    return updatedPayment;
  }
}
