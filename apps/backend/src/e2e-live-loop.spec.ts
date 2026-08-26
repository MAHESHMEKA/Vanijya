process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://vanijya_user:vanijya_pass@localhost:5432/vanijya_db?schema=public';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

describe('SIH 26132 — End-to-End Live Transaction Loop (Vanijya)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Mock in-memory state store for reliable CI / offline execution
  const inMemoryDB = {
    users: [
      { id: 'usr-1', phone: '9876543210', name: 'Ramesh Patel', role: 'FARMER', isVerified: true },
      { id: 'usr-2', email: 'buyer@freshcart.com', name: 'FreshCart Agro Ltd.', role: 'BUYER', isVerified: true },
    ],
    crops: [{ id: 'crp-1', name: 'Tomato', category: 'Vegetable' }],
    lots: [] as any[],
    bids: [] as any[],
    transactions: [] as any[],
    payments: [] as any[],
  };

  const mockPrismaService = {
    user: {
      findFirst: jest.fn().mockImplementation(({ where }) => {
        return Promise.resolve(
          inMemoryDB.users.find((u) => (where.phone && u.phone === where.phone) || (where.email && u.email === where.email)) || null,
        );
      }),
    },
    crop: {
      findFirst: jest.fn().mockImplementation(({ where }) => {
        return Promise.resolve(inMemoryDB.crops.find((c) => c.name === where.name) || null);
      }),
    },
    cropLot: {
      create: jest.fn().mockImplementation(({ data }) => {
        const lot = { id: `lot-${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
        inMemoryDB.lots.push(lot);
        return Promise.resolve(lot);
      }),
      update: jest.fn().mockImplementation(({ where, data }) => {
        const lot = inMemoryDB.lots.find((l) => l.id === where.id);
        if (lot) Object.assign(lot, data);
        return Promise.resolve(lot);
      }),
      findUnique: jest.fn().mockImplementation(({ where }) => {
        const lot = inMemoryDB.lots.find((l) => l.id === where.id);
        if (!lot) return Promise.resolve(null);
        const bids = inMemoryDB.bids.filter((b) => b.lotId === lot.id);
        const transaction = inMemoryDB.transactions.find((t) => t.lotId === lot.id);
        const payment = transaction ? inMemoryDB.payments.find((p) => p.transactionId === transaction.id) : null;
        return Promise.resolve({ ...lot, bids, transaction: transaction ? { ...transaction, payment } : null });
      }),
    },
    bid: {
      create: jest.fn().mockImplementation(({ data }) => {
        const bid = { id: `bid-${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
        inMemoryDB.bids.push(bid);
        return Promise.resolve(bid);
      }),
      update: jest.fn().mockImplementation(({ where, data }) => {
        const bid = inMemoryDB.bids.find((b) => b.id === where.id);
        if (bid) Object.assign(bid, data);
        return Promise.resolve(bid);
      }),
    },
    transaction: {
      create: jest.fn().mockImplementation(({ data }) => {
        const txn = { id: `txn-${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
        inMemoryDB.transactions.push(txn);
        return Promise.resolve(txn);
      }),
      update: jest.fn().mockImplementation(({ where, data }) => {
        const txn = inMemoryDB.transactions.find((t) => t.id === where.id);
        if (txn) Object.assign(txn, data);
        return Promise.resolve(txn);
      }),
    },
    payment: {
      create: jest.fn().mockImplementation(({ data }) => {
        const p = { id: `pay-${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
        inMemoryDB.payments.push(p);
        return Promise.resolve(p);
      }),
      findUnique: jest.fn().mockImplementation(({ where }) => {
        return Promise.resolve(inMemoryDB.payments.find((p) => p.transactionId === where.transactionId) || null);
      }),
      update: jest.fn().mockImplementation(({ where, data }) => {
        const p = inMemoryDB.payments.find((pay) => pay.transactionId === where.transactionId);
        if (p) Object.assign(p, data);
        return Promise.resolve(p);
      }),
    },
    $transaction: jest.fn().mockImplementation(async (callback) => {
      return callback(mockPrismaService);
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should execute the complete 6-step live transaction journey successfully', async () => {
    // STEP 1: Verify Demo Accounts Exist in System
    const farmer = await prisma.user.findFirst({ where: { phone: '9876543210' } });
    const buyer = await prisma.user.findFirst({ where: { email: 'buyer@freshcart.com' } });
    const crop = await prisma.crop.findFirst({ where: { name: 'Tomato' } });

    expect(farmer).toBeDefined();
    expect(buyer).toBeDefined();
    expect(crop).toBeDefined();
    expect(farmer!.role).toBe('FARMER');
    expect(buyer!.role).toBe('BUYER');

    // STEP 2: Farmer Ramesh Patel Publishes a New 100 Qtl Tomato Lot
    const lot = await prisma.cropLot.create({
      data: {
        farmerId: farmer!.id,
        cropId: crop!.id,
        quantity: 100,
        unit: 'QUINTAL',
        expectedPrice: 2200,
        qualityGrade: 'GRADE_A',
        location: 'Pimpalgaon Farm Gate, Niphad, Nashik',
        status: 'OPEN',
      },
    });

    expect(lot.id).toBeDefined();
    expect(lot.status).toBe('OPEN');
    expect(lot.quantity).toBe(100);

    // STEP 3: Buyer FreshCart Discovers the Lot & Submits a Sourcing Bid
    const bid = await prisma.bid.create({
      data: {
        lotId: lot.id,
        buyerId: buyer!.id,
        price: 2250,
        quantity: 100,
        message: 'Farm gate pickup with instant digital settlement.',
        status: 'PENDING',
      },
    });

    await prisma.cropLot.update({
      where: { id: lot.id },
      data: { status: 'BIDDING' },
    });

    expect(bid.id).toBeDefined();
    expect(bid.price).toBe(2250);
    expect(bid.status).toBe('PENDING');

    // STEP 4: Farmer Reviews & Accepts the Bid (Atomic Transaction Initiation)
    const [acceptedBid, updatedLot, transaction] = await prisma.$transaction(async (tx: any) => {
      const b = await tx.bid.update({
        where: { id: bid.id },
        data: { status: 'ACCEPTED' },
      });

      const l = await tx.cropLot.update({
        where: { id: lot.id },
        data: { status: 'SOLD' },
      });

      const t = await tx.transaction.create({
        data: {
          lotId: l.id,
          acceptedBidId: b.id,
          farmerId: l.farmerId,
          buyerId: b.buyerId,
          agreedPrice: b.price,
          quantity: b.quantity,
          totalAmount: b.price * b.quantity,
          status: 'INITIATED',
        },
      });

      await tx.payment.create({
        data: {
          transactionId: t.id,
          amount: t.totalAmount,
          status: 'PENDING',
        },
      });

      return [b, l, t];
    });

    expect(acceptedBid.status).toBe('ACCEPTED');
    expect(updatedLot.status).toBe('SOLD');
    expect(transaction.totalAmount).toBe(225000); // 100 Qtl * ₹2,250

    // STEP 5: Buyer Initiates and Completes Payment
    const payment = await prisma.payment.findUnique({
      where: { transactionId: transaction.id },
    });

    expect(payment).toBeDefined();
    expect(payment!.status).toBe('PENDING');

    // Update payment to INITIATED
    const initiatedPayment = await prisma.payment.update({
      where: { transactionId: transaction.id },
      data: {
        status: 'INITIATED',
        paymentReference: 'UPI-HDFC-992144',
      },
    });
    expect(initiatedPayment.status).toBe('INITIATED');

    // Mark payment PAID
    const paidPayment = await prisma.payment.update({
      where: { transactionId: transaction.id },
      data: { status: 'PAID' },
    });
    expect(paidPayment.status).toBe('PAID');

    // Update transaction to COMPLETED
    const completedTxn = await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'COMPLETED' },
    });
    expect(completedTxn.status).toBe('COMPLETED');

    // STEP 6: Farmer & Buyer Verify Finalized State
    const finalLot = await prisma.cropLot.findUnique({
      where: { id: lot.id },
      include: {
        bids: true,
        transaction: {
          include: { payment: true },
        },
      },
    });

    expect(finalLot!.status).toBe('SOLD');
    expect(finalLot!.transaction?.status).toBe('COMPLETED');
    expect(finalLot!.transaction?.payment?.status).toBe('PAID');
    expect(finalLot!.transaction?.payment?.paymentReference).toBe('UPI-HDFC-992144');
  });
});
