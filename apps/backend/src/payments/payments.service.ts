import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { PaymentStatus, Role, TransactionStatus } from '@prisma/client';
import { FALLBACK_PAYMENTS, FALLBACK_TRANSACTIONS } from '../bids/bids.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async getPaymentByTransaction(transactionId: string, userId: string, role: Role) {
    if (!this.prisma.isConnected) {
      const pay = FALLBACK_PAYMENTS.find((p) => p.transactionId === transactionId);
      if (!pay) throw new NotFoundException(`Payment record for transaction ${transactionId} not found.`);
      const txn = FALLBACK_TRANSACTIONS.find((t) => t.id === transactionId);
      return { ...pay, transaction: txn };
    }

    try {
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
    } catch (err) {
      const pay = FALLBACK_PAYMENTS.find((p) => p.transactionId === transactionId);
      if (pay) {
        const txn = FALLBACK_TRANSACTIONS.find((t) => t.id === transactionId);
        return { ...pay, transaction: txn };
      }
      throw new NotFoundException(`Payment record for transaction ${transactionId} not found.`);
    }
  }

  async updatePaymentStatus(
    transactionId: string,
    userId: string,
    role: Role,
    dto: UpdatePaymentStatusDto,
  ) {
    if (!this.prisma.isConnected) {
      const pay = FALLBACK_PAYMENTS.find((p) => p.transactionId === transactionId);
      if (!pay) throw new NotFoundException(`Payment record for transaction ${transactionId} not found.`);
      const txn = FALLBACK_TRANSACTIONS.find((t) => t.id === transactionId);
      if (role !== Role.ADMIN && txn?.buyerId !== userId && txn?.farmerId !== userId) {
        throw new ForbiddenException('You are not authorized to update this payment.');
      }

      pay.status = dto.status;
      if (dto.paymentReference) pay.paymentReference = dto.paymentReference;
      pay.paidAt = new Date();

      if (dto.status === PaymentStatus.PAID && txn) {
        txn.status = TransactionStatus.COMPLETED;
      }

      return pay;
    }

    try {
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

      if (dto.status === PaymentStatus.PAID) {
        await this.prisma.transaction.update({
          where: { id: transactionId },
          data: { status: TransactionStatus.COMPLETED },
        });
      }

      return updatedPayment;
    } catch (err) {
      const pay = FALLBACK_PAYMENTS.find((p) => p.transactionId === transactionId);
      if (pay) {
        const txn = FALLBACK_TRANSACTIONS.find((t) => t.id === transactionId);
        pay.status = dto.status;
        if (dto.paymentReference) pay.paymentReference = dto.paymentReference;
        pay.paidAt = new Date();
        if (dto.status === PaymentStatus.PAID && txn) {
          txn.status = TransactionStatus.COMPLETED;
        }
        return pay;
      }
      throw err;
    }
  }
}
