import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { PaymentStatus, Role, TransactionStatus, NotificationType } from '@prisma/client';
import { FALLBACK_PAYMENTS, FALLBACK_TRANSACTIONS } from '../bids/bids.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

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

      if (pay.status === PaymentStatus.PAID && dto.status !== PaymentStatus.PAID) {
        throw new BadRequestException('Settled payments cannot be reverted to pending or initiated.');
      }

      pay.status = dto.status;
      if (dto.paymentReference) pay.paymentReference = dto.paymentReference;
      pay.paidAt = new Date();

      if (dto.status === PaymentStatus.PAID && txn) {
        txn.status = TransactionStatus.COMPLETED;
        if (txn.farmerId) {
          await this.notificationsService.create({
            recipientId: txn.farmerId,
            type: NotificationType.PAYMENT_PAID,
            title: 'Payment Received & Settled',
            message: `Payment of ₹${(txn.totalAmount || pay.amount).toLocaleString('en-IN')} has been settled by the buyer (Ref: ${dto.paymentReference || 'UTR-891244'}).`,
            entityType: 'TRANSACTION',
            entityId: transactionId,
          });
        }
      }

      return pay;
    }

    try {
      const payment = await this.prisma.payment.findUnique({
        where: { transactionId },
        include: { transaction: { include: { lot: { include: { crop: true } } } } },
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

      // Validate state transition
      if (payment.status === PaymentStatus.PAID && dto.status !== PaymentStatus.PAID) {
        throw new BadRequestException('Settled payments cannot be reverted.');
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

        // Notify farmer
        await this.notificationsService.create({
          recipientId: payment.transaction.farmerId,
          type: NotificationType.PAYMENT_PAID,
          title: 'Payment Received & Settled',
          message: `Payment of ₹${payment.amount.toLocaleString('en-IN')} for ${payment.transaction.lot?.crop?.name || 'crop'} has been marked as PAID (Ref: ${dto.paymentReference || updatedPayment.paymentReference || 'Bank UTR'}).`,
          entityType: 'TRANSACTION',
          entityId: transactionId,
        });
      }

      return updatedPayment;
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof ForbiddenException || err instanceof BadRequestException) throw err;
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
