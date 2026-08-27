import { PrismaClient, Role, CropLotStatus, BidStatus, TransactionStatus, PaymentStatus, PriceSource, QualityGrade, CropUnit } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Vanijya Agricultural Database...');

  // 1. Clean existing records in reverse dependency order
  await prisma.payment.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.cropLot.deleteMany();
  await prisma.mandiPrice.deleteMany();
  await prisma.market.deleteMany();
  await prisma.crop.deleteMany();
  await prisma.user.deleteMany();

  const saltRounds = 10;
  const farmerPassword = await bcrypt.hash('Farmer@123', saltRounds);
  const buyerPassword = await bcrypt.hash('asdfcv321', saltRounds);
  const adminPassword = await bcrypt.hash('Admin@123', saltRounds);

  // 2. Seed Users
  const ramesh = await prisma.user.create({
    data: {
      name: 'Ramesh Patel',
      phone: '9876543210',
      email: 'ramesh@farmer.in',
      passwordHash: farmerPassword,
      role: Role.FARMER,
      district: 'Nashik',
      state: 'Maharashtra',
      location: 'Village Pimpalgaon, Niphad, Nashik',
      isVerified: true,
    },
  });

  const gurpreet = await prisma.user.create({
    data: {
      name: 'Gurpreet Singh',
      phone: '9876543211',
      email: 'gurpreet@farmer.in',
      passwordHash: farmerPassword,
      role: Role.FARMER,
      district: 'Ludhiana',
      state: 'Punjab',
      location: 'Samrala Road, Khanna, Ludhiana',
      isVerified: true,
    },
  });

  const freshCart = await prisma.user.create({
    data: {
      name: 'FreshCart Agro Ltd.',
      phone: '9876543220',
      email: 'buyer@freshcart.com',
      passwordHash: buyerPassword,
      role: Role.BUYER,
      district: 'Mumbai Suburban',
      state: 'Maharashtra',
      location: 'Vashi APMC Commercial Yard, Navi Mumbai',
      isVerified: true,
    },
  });

  const greenSpire = await prisma.user.create({
    data: {
      name: 'GreenSpire Foods',
      phone: '9876543221',
      email: 'procurement@greenspire.in',
      passwordHash: buyerPassword,
      role: Role.BUYER,
      district: 'North Delhi',
      state: 'Delhi',
      location: 'Azadpur Terminal, New Delhi',
      isVerified: true,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      name: 'Vanijya Admin',
      phone: '9876543230',
      email: 'admin@vanijya.gov.in',
      passwordHash: adminPassword,
      role: Role.ADMIN,
      district: 'Central Delhi',
      state: 'Delhi',
      location: 'Krishi Bhawan, New Delhi',
      isVerified: true,
    },
  });

  console.log(`✅ Seeded Users: 2 Farmers, 2 Buyers, 1 Admin`);

  // 3. Seed Crops
  const cropsData = [
    { name: 'Tomato', category: 'Vegetable', defaultUnit: CropUnit.QUINTAL },
    { name: 'Onion', category: 'Vegetable', defaultUnit: CropUnit.QUINTAL },
    { name: 'Paddy', category: 'Grain', defaultUnit: CropUnit.QUINTAL },
    { name: 'Cotton', category: 'Cash Crop', defaultUnit: CropUnit.QUINTAL },
    { name: 'Chilli', category: 'Spice', defaultUnit: CropUnit.QUINTAL },
    { name: 'Maize', category: 'Grain', defaultUnit: CropUnit.QUINTAL },
  ];

  const crops: Record<string, any> = {};
  for (const c of cropsData) {
    crops[c.name] = await prisma.crop.create({ data: c });
  }
  console.log(`✅ Seeded ${Object.keys(crops).length} Commodities`);

  // 4. Seed Markets
  const marketsData = [
    { name: 'Nashik APMC', district: 'Nashik', state: 'Maharashtra', latitude: 19.9975, longitude: 73.7898 },
    { name: 'Lasalgaon Mandi', district: 'Nashik', state: 'Maharashtra', latitude: 20.1477, longitude: 74.2259 },
    { name: 'Azadpur Mandi', district: 'North Delhi', state: 'Delhi', latitude: 28.7159, longitude: 77.1788 },
    { name: 'Karnal Mandi', district: 'Karnal', state: 'Haryana', latitude: 29.6857, longitude: 76.9905 },
    { name: 'Guntur Market', district: 'Guntur', state: 'Andhra Pradesh', latitude: 16.3067, longitude: 80.4365 },
    { name: 'Warangal Market', district: 'Warangal', state: 'Telangana', latitude: 17.9689, longitude: 79.5941 },
  ];

  const markets: Record<string, any> = {};
  for (const m of marketsData) {
    markets[m.name] = await prisma.market.create({ data: m });
  }
  console.log(`✅ Seeded ${Object.keys(markets).length} APMC Mandis`);

  // 5. Seed 7-Day Historical Mandi Prices
  const basePrices: Record<string, number> = {
    Tomato: 2200,
    Onion: 1950,
    Paddy: 2183,
    Cotton: 6800,
    Chilli: 18500,
    Maize: 2090,
  };

  const today = new Date();
  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const priceDate = new Date(today);
    priceDate.setDate(today.getDate() - dayOffset);

    for (const cropName of Object.keys(crops)) {
      for (const marketName of Object.keys(markets)) {
        const base = basePrices[cropName] || 2000;
        // Introduce small realistic daily and regional variance
        const variance = Math.sin(dayOffset + cropName.length) * 0.05 + ((dayOffset % 2 === 0 ? 1 : -1) * 0.02);
        const modal = Math.round(base * (1 + variance));
        const min = Math.round(modal * 0.88);
        const max = Math.round(modal * 1.12);
        const arrival = Math.round(150 + (Math.cos(dayOffset) * 40));

        await prisma.mandiPrice.create({
          data: {
            cropId: crops[cropName].id,
            marketId: markets[marketName].id,
            modalPrice: modal,
            minPrice: min,
            maxPrice: max,
            arrivalQuantity: arrival,
            date: priceDate,
            source: PriceSource.AGMARKNET,
          },
        });
      }
    }
  }
  console.log(`✅ Seeded 7-Day Historical Mandi Benchmark Prices across all mandis`);

  // 6. Seed Crop Lots
  const tomatoLot = await prisma.cropLot.create({
    data: {
      farmerId: ramesh.id,
      cropId: crops['Tomato'].id,
      quantity: 50,
      unit: 'QUINTAL',
      expectedPrice: 2200,
      qualityGrade: QualityGrade.GRADE_A,
      location: 'Village Pimpalgaon, Nashik, Maharashtra',
      harvestDate: new Date(),
      status: CropLotStatus.BIDDING,
    },
  });

  const onionLot = await prisma.cropLot.create({
    data: {
      farmerId: ramesh.id,
      cropId: crops['Onion'].id,
      quantity: 80,
      unit: 'QUINTAL',
      expectedPrice: 1900,
      qualityGrade: QualityGrade.GRADE_B,
      location: 'Village Niphad, Nashik, Maharashtra',
      harvestDate: new Date(),
      status: CropLotStatus.OPEN,
    },
  });

  const paddyLot = await prisma.cropLot.create({
    data: {
      farmerId: gurpreet.id,
      cropId: crops['Paddy'].id,
      quantity: 150,
      unit: 'QUINTAL',
      expectedPrice: 2200,
      qualityGrade: QualityGrade.GRADE_A,
      location: 'Khanna Grain Market Yard, Ludhiana, Punjab',
      harvestDate: new Date(),
      status: CropLotStatus.OPEN,
    },
  });

  const soldMaizeLot = await prisma.cropLot.create({
    data: {
      farmerId: gurpreet.id,
      cropId: crops['Maize'].id,
      quantity: 100,
      unit: 'QUINTAL',
      expectedPrice: 2100,
      qualityGrade: QualityGrade.GRADE_B,
      location: 'Samrala, Ludhiana, Punjab',
      harvestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: CropLotStatus.SOLD,
    },
  });

  console.log(`✅ Seeded 4 Crop Lots`);

  // 7. Seed Bids
  const bid1 = await prisma.bid.create({
    data: {
      lotId: tomatoLot.id,
      buyerId: freshCart.id,
      price: 2350,
      quantity: 50,
      message: 'Direct farm gate pickup with payment upon loading.',
      status: BidStatus.PENDING,
    },
  });

  const bid2 = await prisma.bid.create({
    data: {
      lotId: tomatoLot.id,
      buyerId: greenSpire.id,
      price: 2250,
      quantity: 50,
      message: 'Immediate procurement for Delhi NCR retail network.',
      status: BidStatus.PENDING,
    },
  });

  const winningMaizeBid = await prisma.bid.create({
    data: {
      lotId: soldMaizeLot.id,
      buyerId: freshCart.id,
      price: 2100,
      quantity: 100,
      message: 'Full consignment purchase agreed.',
      status: BidStatus.ACCEPTED,
    },
  });

  console.log(`✅ Seeded 3 Bids`);

  // 8. Seed Completed Transaction & Payment
  const transaction = await prisma.transaction.create({
    data: {
      lotId: soldMaizeLot.id,
      buyerId: freshCart.id,
      farmerId: gurpreet.id,
      acceptedBidId: winningMaizeBid.id,
      agreedPrice: 2100,
      quantity: 100,
      totalAmount: 210000,
      status: TransactionStatus.COMPLETED,
    },
  });

  await prisma.payment.create({
    data: {
      transactionId: transaction.id,
      amount: 210000,
      status: PaymentStatus.PAID,
      paymentReference: 'PAY-MAIZE-2024-99182',
    },
  });

  console.log(`✅ Seeded Completed Transaction & Payment record`);
  console.log('🌾 Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
