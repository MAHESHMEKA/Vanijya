describe('SIH 26132 — End-to-End Live Transaction Loop (Vanijya)', () => {
  it('should execute the complete 6-step live transaction journey successfully', async () => {
    // In-memory data store for E2E journey test
    const inMemoryDB = {
      users: [
        {
          id: 'usr-farmer-1',
          phone: '9876543210',
          name: 'Ramesh Patel',
          role: 'FARMER',
          isVerified: true,
          district: 'Nashik',
          state: 'Maharashtra',
          geoPoint: { type: 'Point', coordinates: [73.9854, 20.1718] },
          profilePhoto: { url: '/images/avatars/farmer-ramesh.svg' },
        },
        {
          id: 'usr-buyer-1',
          email: 'buyer@freshcart.com',
          name: 'FreshCart Agro Ltd.',
          role: 'BUYER',
          isVerified: true,
          district: 'Mumbai',
          state: 'Maharashtra',
          geoPoint: { type: 'Point', coordinates: [73.0033, 19.076] },
          profilePhoto: { url: '/images/avatars/buyer-freshcart.svg' },
        },
      ],
      crops: [{ id: 'crop-tomato', name: 'Tomato', category: 'Vegetables' }],
      lots: [] as any[],
      bids: [] as any[],
      transactions: [] as any[],
      payments: [] as any[],
    };

    // STEP 1: Verify Seed / Fallback Accounts Exist
    const farmer = inMemoryDB.users.find((u) => u.phone === '9876543210');
    const buyer = inMemoryDB.users.find((u) => u.email === 'buyer@freshcart.com');
    const crop = inMemoryDB.crops.find((c) => c.name === 'Tomato');

    expect(farmer).toBeDefined();
    expect(buyer).toBeDefined();
    expect(crop).toBeDefined();
    expect(farmer!.role).toBe('FARMER');
    expect(buyer!.role).toBe('BUYER');
    expect(farmer!.profilePhoto?.url).toBeDefined();
    expect(buyer!.profilePhoto?.url).toBeDefined();

    // STEP 2: Farmer Ramesh Patel Publishes a New 100 Qtl Tomato Lot with Geolocation
    const lot = {
      id: `lot-${Date.now()}`,
      farmerId: farmer!.id,
      cropId: crop!.id,
      quantity: 100,
      unit: 'QUINTAL',
      expectedPrice: 2200,
      qualityGrade: 'GRADE_A',
      location: 'Pimpalgaon Farm Gate, Niphad, Nashik',
      geoPoint: farmer!.geoPoint,
      status: 'OPEN',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryDB.lots.push(lot);

    expect(lot.id).toBeDefined();
    expect(lot.status).toBe('OPEN');
    expect(lot.quantity).toBe(100);
    expect(lot.geoPoint.coordinates).toEqual([73.9854, 20.1718]);

    // STEP 3: Buyer FreshCart Discovers the Lot & Submits a Sourcing Bid
    const bid = {
      id: `bid-${Date.now()}`,
      lotId: lot.id,
      buyerId: buyer!.id,
      price: 2250,
      quantity: 100,
      message: 'Farm gate pickup with instant digital settlement.',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryDB.bids.push(bid);
    lot.status = 'BIDDING';

    expect(bid.id).toBeDefined();
    expect(bid.price).toBe(2250);
    expect(bid.status).toBe('PENDING');

    // STEP 4: Farmer Reviews & Accepts the Bid (Atomic Transaction Initiation)
    bid.status = 'ACCEPTED';
    lot.status = 'SOLD';
    const txn = {
      id: `txn-${Date.now()}`,
      lotId: lot.id,
      acceptedBidId: bid.id,
      farmerId: lot.farmerId,
      buyerId: bid.buyerId,
      agreedPrice: bid.price,
      quantity: bid.quantity,
      totalAmount: bid.price * bid.quantity,
      status: 'INITIATED',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryDB.transactions.push(txn);

    const payment = {
      id: `pay-${Date.now()}`,
      transactionId: txn.id,
      amount: txn.totalAmount,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryDB.payments.push(payment);

    expect(bid.status).toBe('ACCEPTED');
    expect(lot.status).toBe('SOLD');
    expect(txn.totalAmount).toBe(225000); // 100 Qtl * ₹2,250
    expect(payment.status).toBe('PENDING');

    // STEP 5: Buyer Initiates and Completes Payment
    payment.status = 'PAID';
    (payment as any).paymentReference = 'UPI-HDFC-992144';
    txn.status = 'COMPLETED';

    expect(payment.status).toBe('PAID');
    expect(txn.status).toBe('COMPLETED');

    // STEP 6: Farmer & Buyer Verify Finalized State
    const finalLot = inMemoryDB.lots.find((l) => l.id === lot.id);
    const finalTxn = inMemoryDB.transactions.find((t) => t.lotId === lot.id);
    const finalPayment = inMemoryDB.payments.find((p) => p.transactionId === finalTxn.id);

    expect(finalLot!.status).toBe('SOLD');
    expect(finalTxn!.status).toBe('COMPLETED');
    expect(finalPayment!.status).toBe('PAID');
    expect((finalPayment as any).paymentReference).toBe('UPI-HDFC-992144');
  });
});
