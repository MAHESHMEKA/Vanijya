import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Demo & Simulation')
@Controller('demo')
export class DemoController {
  constructor(private prisma: PrismaService) {}

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset Demo State (SIH 1-Click Reset)',
    description: 'Resets lots, bids, transactions, and payments back to initial demo baseline.',
  })
  @ApiResponse({ status: 200, description: 'Demo database state reset successfully.' })
  async resetDemoState() {
    // Clean up dependent tables in reverse relational order
    await this.prisma.payment.deleteMany({});
    await this.prisma.transaction.deleteMany({});
    await this.prisma.bid.deleteMany({});
    await this.prisma.cropLot.deleteMany({});

    // Find demo users & crops
    const ramesh = await this.prisma.user.findFirst({ where: { phone: '9876543210' } });
    const freshCart = await this.prisma.user.findFirst({ where: { email: 'buyer@freshcart.com' } });
    const greenSpire = await this.prisma.user.findFirst({ where: { email: 'procurement@greenspire.in' } });
    const tomato = await this.prisma.crop.findFirst({ where: { name: 'Tomato' } });
    const onion = await this.prisma.crop.findFirst({ where: { name: 'Onion' } });
    const paddy = await this.prisma.crop.findFirst({ where: { name: 'Paddy' } });

    if (ramesh && freshCart && tomato && onion) {
      // Create initial demo lot 1 (Tomato)
      const lot1 = await this.prisma.cropLot.create({
        data: {
          farmerId: ramesh.id,
          cropId: tomato.id,
          quantity: 60,
          unit: 'QUINTAL',
          expectedPrice: 2200,
          qualityGrade: 'GRADE_A',
          location: 'Village Pimpalgaon, Niphad Taluka, Nashik',
          status: 'BIDDING',
        },
      });

      // Create initial bid from FreshCart on Lot 1
      await this.prisma.bid.create({
        data: {
          lotId: lot1.id,
          buyerId: freshCart.id,
          price: 2250,
          quantity: 60,
          message: 'Premium grade procurement for Mumbai wholesale distribution. Immediate payment upon dispatch.',
          status: 'PENDING',
        },
      });

      // Create initial demo lot 2 (Onion)
      await this.prisma.cropLot.create({
        data: {
          farmerId: ramesh.id,
          cropId: onion.id,
          quantity: 120,
          unit: 'QUINTAL',
          expectedPrice: 1950,
          qualityGrade: 'GRADE_B',
          location: 'Lasalgaon Road, Niphad, Nashik',
          status: 'OPEN',
        },
      });

      // Create completed demo lot 3 (Paddy) if paddy crop exists
      if (paddy && greenSpire) {
        const lot3 = await this.prisma.cropLot.create({
          data: {
            farmerId: ramesh.id,
            cropId: paddy.id,
            quantity: 80,
            unit: 'QUINTAL',
            expectedPrice: 2180,
            qualityGrade: 'GRADE_A',
            location: 'Karnal Mandi Hub, Haryana',
            status: 'SOLD',
          },
        });

        const bid3 = await this.prisma.bid.create({
          data: {
            lotId: lot3.id,
            buyerId: greenSpire.id,
            price: 2200,
            quantity: 80,
            message: 'Institutional supply fulfillment.',
            status: 'ACCEPTED',
          },
        });

        const txn = await this.prisma.transaction.create({
          data: {
            lotId: lot3.id,
            acceptedBidId: bid3.id,
            farmerId: ramesh.id,
            buyerId: greenSpire.id,
            agreedPrice: 2200,
            quantity: 80,
            totalAmount: 176000,
            status: 'COMPLETED',
          },
        });

        await this.prisma.payment.create({
          data: {
            transactionId: txn.id,
            amount: 176000,
            status: 'PAID',
            paymentReference: 'UPI-HDFC-882194',
          },
        });
      }
    }

    return {
      success: true,
      message: 'Demo dataset reset successfully to baseline state.',
      timestamp: new Date().toISOString(),
    };
  }
}
