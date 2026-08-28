export type Language = 'en' | 'hi' | 'te';

export interface UnifiedTranslations {
  // Brand & Navigation
  brandTitle: string;
  brandSubtitle: string;
  kccNotice: string;
  navHome: string;
  navPrices: string;
  navMarketplace: string;
  navSell: string;
  navMyLots: string;
  navMyBids: string;
  navPurchases: string;
  navDashboard: string;
  navAnalytics: string;
  navProfile: string;
  navLogin: string;
  navLogout: string;
  roleFarmer: string;
  roleBuyer: string;
  roleAdmin: string;

  // Landing Page
  heroPill: string;
  heroHeadline: string;
  heroSubheadline: string;
  btnExplorePrices: string;
  btnStartSelling: string;
  btnSourceProduce: string;
  liveMarketHighlights: string;
  todayPriceLabel: string;
  spatialArbitrageLabel: string;
  bestSellingWindowLabel: string;
  optimalBadge: string;
  netGainBadge: string;
  howItWorksTitle: string;
  howItWorksSubtitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  farmerBenefitsTitle: string;
  buyerBenefitsTitle: string;
  govtAlignmentTitle: string;
  govtAlignmentDesc: string;
  impactTitle: string;
  impactSubtitle: string;
  incomeBoost: string;
  arbitrageGain: string;
  commissionSaved: string;
  connectedMandis: string;
  zeroCommissionBadge: string;

  // Public Price Discovery (/prices)
  pricesTitle: string;
  pricesSubtitle: string;
  selectCropLabel: string;
  todayRate: string;
  todayBenchmark: string;
  minRate: string;
  maxRate: string;
  weeklyAvg: string;
  sma7Label: string;
  trend: string;
  priceMomentum: string;
  trendBullish: string;
  trendBearish: string;
  trendStable: string;
  lowVolatility: string;
  moderateVolatility: string;
  highVolatility: string;
  dailyArrivals: string;
  sellingWindow: string;
  sellingWindowCardTitle: string;
  recommendationLabel: string;
  confidenceLabel: string;
  reasoningLabel: string;
  sellNowAdvisory: string;
  holdAdvisory: string;
  normalAdvisory: string;
  nearbyArbitrage: string;
  spatialArbitrageCardTitle: string;
  nearbyBetterMarket: string;
  distanceKm: string;
  transportCost: string;
  netGain: string;
  netGainPerQtl: string;
  recommendedAction: string;
  priceChartTitle: string;
  latestPriceLabel: string;
  noHistoryData: string;
  listHarvestCTA: string;
  listHarvestDesc: string;
  btnListCropNow: string;

  // Common Login & Role Selection (/login)
  loginTitle: string;
  loginSubtitle: string;
  phoneOrEmailLabel: string;
  identifierPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  roleSelectLabel: string;
  btnSignIn: string;
  signingIn: string;
  securityVerification: string;
  securityCodeCaseNotice: string;
  generatingSecurityCode: string;
  failedToLoadImage: string;
  refreshSecurityCode: string;
  enterCharactersAbove: string;
  captchaInputPlaceholder: string;
  chooseAccountTypeLabel: string;
  tradeEnrolledNotice: string;

  // Farmer Flow
  farmerDashboardTitle: string;
  farmerWelcomeTitle: string;
  farmerTagline: string;
  btnPublishLot: string;
  btnViewAllLots: string;
  kpiActiveBidding: string;
  kpiActiveBiddingSub: string;
  kpiSoldLots: string;
  kpiSoldLotsSub: string;
  kpiPendingBids: string;
  kpiPendingBidsSub: string;
  kpiOpenLots: string;
  kpiOpenLotsSub: string;
  kpiTotalSales: string;
  kpiTotalSalesSub: string;
  kpiPendingPay: string;
  kpiPendingPaySub: string;
  tabAll: string;
  tabBidding: string;
  tabSold: string;
  tabOpen: string;
  tabCancelled: string;
  sectionActiveBidding: string;
  sectionSoldContracts: string;
  sectionOpenListings: string;
  askingRateLabel: string;
  topBuyerOfferLabel: string;
  offersCountLabel: string;
  btnViewOffers: string;
  buyerLabel: string;
  contractTotalLabel: string;
  paymentStatusLabel: string;
  btnViewContract: string;
  noLotsTitle: string;
  noLotsDesc: string;
  noBiddingTitle: string;
  noBiddingDesc: string;
  noSoldTitle: string;
  noSoldDesc: string;
  createLotTitle: string;
  createLotSubtitle: string;
  lotCropLabel: string;
  lotQtyLabel: string;
  lotPriceLabel: string;
  lotGradeLabel: string;
  lotGradeA: string;
  lotGradeB: string;
  lotGradeC: string;
  lotLocationLabel: string;
  lotLocationPlaceholder: string;
  btnConfirmPublish: string;
  publishingLot: string;
  lotPublishedSuccess: string;
  activeLotsTitle: string;
  myLotsSubtitle: string;
  lotDetailTitle: string;
  lotDetailSubtitle: string;
  incomingOffersTitle: string;
  noIncomingOffers: string;
  btnAcceptOffer: string;
  btnRejectOffer: string;
  acceptingBid: string;
  bidAcceptedSuccess: string;
  bidRejectedSuccess: string;

  // Buyer Flow
  buyerMarketplaceTitle: string;
  buyerMarketplaceSubtitle: string;
  buyerWelcomeTitle: string;
  buyerTagline: string;
  btnBrowseCatalog: string;
  btnViewMyBids: string;
  kpiActiveBids: string;
  kpiPurchases: string;
  kpiProcuredVolume: string;
  kpiTotalSpent: string;
  filterAllCrops: string;
  searchLotsPlaceholder: string;
  btnPlaceBid: string;
  btnConfirmBid: string;
  submittingBid: string;
  bidPlacedSuccess: string;
  farmerAskingRate: string;
  qualityGradeLabel: string;
  harvestLocation: string;
  expectedRate: string;
  bidRateLabel: string;
  bidQtyLabel: string;
  messageLabel: string;
  messagePlaceholder: string;
  myBidsTitle: string;
  myBidsSubtitle: string;
  btnModifyQty: string;
  btnCancelBid: string;
  modifyQtyModalTitle: string;
  newQtyLabel: string;
  btnSaveQty: string;
  cancelBidModalTitle: string;
  cancelBidConfirmDesc: string;
  btnConfirmCancel: string;
  bidWithdrawnBadge: string;
  bidModifiedSuccess: string;
  bidCancelledSuccess: string;
  purchasesTitle: string;
  purchasesSubtitle: string;
  purchaseContractId: string;
  agreedRate: string;
  totalAmount: string;
  paymentStatus: string;
  btnViewInvoice: string;
  btnConfirmPayment: string;
  paymentPaidBadge: string;

  // Admin Flow
  adminTitle: string;
  adminSubtitle: string;
  tabOverview: string;
  tabLots: string;
  tabBids: string;
  tabUsers: string;
  tabTxns: string;
  tabActivity: string;
  kpiTotalLots: string;
  kpiTotalBids: string;
  kpiTotalGMV: string;
  kpiTotalVolume: string;
  kpiAvgRealization: string;
  kpiActiveFarmers: string;
  kpiActiveBuyers: string;
  kpiSettledPayments: string;
  lotsMonitorTitle: string;
  bidsMonitorTitle: string;
  usersDirectoryTitle: string;
  txnsLedgerTitle: string;
  activityStreamTitle: string;
  searchLotsAdminPlaceholder: string;
  searchBidsAdminPlaceholder: string;
  allStatuses: string;
  exportCSV: string;
  tableColLotId: string;
  tableColCrop: string;
  tableColFarmer: string;
  tableColBuyer: string;
  tableColQty: string;
  tableColPrice: string;
  tableColStatus: string;
  tableColDate: string;
  tableColActions: string;
  tableColAmount: string;
  tableColEvent: string;

  // Profile Flow
  profileTitle: string;
  profileSubtitle: string;
  accountRole: string;
  verificationBadge: string;
  districtLabel: string;
  stateLabel: string;
  addressLabel: string;
  btnSaveProfile: string;
  profileSavedSuccess: string;

  // Common & Errors
  commonLoading: string;
  commonViewDetails: string;
  commonActions: string;
  commonCancel: string;
  commonSave: string;
  commonConfirm: string;
  commonClose: string;
  commonBack: string;
  commonSearch: string;
  commonFilter: string;
  commonTotal: string;
  commonDate: string;
  commonStatus: string;
  commonFarmer: string;
  commonBuyer: string;
  commonQuantity: string;
  commonPrice: string;
  commonLocation: string;
  commonGrade: string;
  commonLoginRequired: string;
  commonWelcomeBack: string;
  commonAll: string;
  commonNoData: string;
  errInvalidCredentials: string;
  errCaptchaRequired: string;
  errCaptchaInvalid: string;
  errCaptchaExpired: string;
  errTooManyAttempts: string;
  errServerError: string;
}

export const translations: Record<Language, UnifiedTranslations> = {
  en: {
    brandTitle: 'Vanijya',
    brandSubtitle: 'National Agricultural Price & Market Linkages Portal',
    kccNotice: 'Kisan Credit Card (KCC) & National APMC Trade Enrolled',
    navHome: 'Home',
    navPrices: 'Mandi Prices',
    navMarketplace: 'Marketplace',
    navSell: 'Sell Produce',
    navMyLots: 'My Lots',
    navMyBids: 'My Bids',
    navPurchases: 'Purchases',
    navDashboard: 'Dashboard',
    navAnalytics: 'Analytics',
    navProfile: 'Profile',
    navLogin: 'Sign In',
    navLogout: 'Sign Out',
    roleFarmer: 'Farmer (किसान)',
    roleBuyer: 'Buyer (व्यापारी / Procurer)',
    roleAdmin: 'Administrator (व्यवस्थापक)',

    heroPill: 'Strengthening Market Linkages & Price Discovery',
    heroHeadline: 'Know the Best Price Before You Sell.',
    heroSubheadline: 'Empowering Indian farmers and institutional buyers with real-time APMC mandi price intelligence, spatial market arbitrage, direct farm-gate bidding, and zero middleman commission.',
    btnExplorePrices: 'Check Live Mandi Prices',
    btnStartSelling: 'Sell as Farmer',
    btnSourceProduce: 'Source as Buyer',
    liveMarketHighlights: 'Live Market Intelligence & Benchmark Rates',
    todayPriceLabel: 'Today',
    spatialArbitrageLabel: 'Spatial Arbitrage',
    bestSellingWindowLabel: 'Best Selling Window',
    optimalBadge: 'OPTIMAL',
    netGainBadge: 'Net Gain',
    howItWorksTitle: 'How Vanijya Powers Agricultural Trade',
    howItWorksSubtitle: 'From real-time price discovery to verified digital bank settlement in four transparent steps',
    step1Title: '1. Live Price Discovery',
    step1Desc: 'Farmers check real-time Agmarknet modal rates, 7-day Simple Moving Average (SMA), and nearby market arbitrage.',
    step2Title: '2. Farm-Gate Listing',
    step2Desc: 'Publish harvest lots with quality grading, quantity, and expected rate directly to verified commercial buyers.',
    step3Title: '3. Transparent Bidding',
    step3Desc: 'Wholesale buyers and food processors evaluate lots against mandi benchmarks and place direct digital bids.',
    step4Title: '4. Instant Settlement',
    step4Desc: 'Farmer accepts the winning offer with 1 tap, locking the contract and receiving 100% direct payment with zero deduction.',
    farmerBenefitsTitle: 'Why Farmers Choose Vanijya',
    buyerBenefitsTitle: 'Why Commercial Buyers Source on Vanijya',
    govtAlignmentTitle: 'Aligned with National Agricultural Policy',
    govtAlignmentDesc: 'Supports national e-NAM corridors, Agmarknet benchmarks, APMC compliance, and direct farmer empowerment.',
    impactTitle: "Today's Vanijya Impact",
    impactSubtitle: 'National Market Linkages & Middleman-Free Direct Trade',
    incomeBoost: 'Farmer Income Boost',
    arbitrageGain: 'Avg Arbitrage Gain',
    commissionSaved: 'Commission Saved',
    connectedMandis: 'Active Mandis',
    zeroCommissionBadge: '0% Commission',

    pricesTitle: 'National Mandi Price Discovery & Intelligence',
    pricesSubtitle: 'Real-time APMC benchmark prices, spatial arbitrage opportunities, and 7-day trend analytics (No login required)',
    selectCropLabel: 'Select Agricultural Commodity',
    todayRate: "Today's Benchmark Price",
    todayBenchmark: 'Benchmark Rate',
    minRate: 'Min Rate',
    maxRate: 'Max Rate',
    weeklyAvg: '7-Day Moving Average',
    sma7Label: '7-Day SMA',
    trend: 'Price Momentum',
    priceMomentum: 'Price Momentum',
    trendBullish: 'Bullish (Rising)',
    trendBearish: 'Bearish (Falling)',
    trendStable: 'Stable (Neutral)',
    lowVolatility: 'Low Volatility',
    moderateVolatility: 'Moderate Volatility',
    highVolatility: 'High Volatility',
    dailyArrivals: 'Daily Market Arrivals',
    sellingWindow: 'Best Selling Window Advisory',
    sellingWindowCardTitle: 'Best Selling Window Advisory',
    recommendationLabel: 'Recommendation',
    confidenceLabel: 'Model Confidence',
    reasoningLabel: 'Market Reasoning',
    sellNowAdvisory: 'Sell within next 24-48 Hours',
    holdAdvisory: 'Hold harvest for 3-5 days',
    normalAdvisory: 'Normal trading window. List lot on Vanijya to receive competitive buyer bids.',
    nearbyArbitrage: 'Nearby Market Comparison & Spatial Arbitrage',
    spatialArbitrageCardTitle: 'Spatial Arbitrage & Nearby Mandi Optimizer',
    nearbyBetterMarket: 'Best Nearby Market',
    distanceKm: 'Distance',
    transportCost: 'Transport Offset',
    netGain: 'Net Gain',
    netGainPerQtl: 'Net Gain / Qtl',
    recommendedAction: 'Recommended Action',
    priceChartTitle: '7-Day Mandi Price Trend',
    latestPriceLabel: 'Latest Rate',
    noHistoryData: 'No price history points available for this crop',
    listHarvestCTA: 'Ready to sell your produce at benchmark rates?',
    listHarvestDesc: 'List your harvest on Vanijya to receive direct competitive offers from institutional buyers with zero commission deductions.',
    btnListCropNow: 'Publish Crop Lot Now',

    loginTitle: 'Secure Marketplace Login',
    loginSubtitle: 'Unified single-sign-on for Farmers, Wholesale Buyers, and System Administrators',
    phoneOrEmailLabel: 'Mobile Number or Email Address',
    identifierPlaceholder: 'e.g. 9876543210 or buyer@freshcart.com',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••',
    roleSelectLabel: 'Select Your Account Type',
    btnSignIn: 'Sign In to Vanijya',
    signingIn: 'Signing in...',
    securityVerification: 'Security Verification',
    securityCodeCaseNotice: 'Case-insensitive',
    generatingSecurityCode: 'Generating security code...',
    failedToLoadImage: 'Failed to load security image',
    refreshSecurityCode: 'Refresh Security Code',
    enterCharactersAbove: 'Enter the characters shown above',
    captchaInputPlaceholder: 'e.g. K7P4X',
    chooseAccountTypeLabel: 'Choose account type / 1-Click Demo Fill:',
    tradeEnrolledNotice: 'Kisan Credit Card (KCC) & National APMC Trade Enrolled | Visual Security Verification',

    farmerDashboardTitle: 'Farmer Command Center',
    farmerWelcomeTitle: 'Namaste',
    farmerTagline: 'Track active buyer bidding, accept highest bids, and review real-time sale settlements.',
    btnPublishLot: 'Publish New Crop Lot',
    btnViewAllLots: 'View All Lots',
    kpiActiveBidding: 'Active Bidding',
    kpiActiveBiddingSub: 'Lots receiving offers',
    kpiSoldLots: 'Sold Lots',
    kpiSoldLotsSub: 'Deals finalized',
    kpiPendingBids: 'Pending Bids',
    kpiPendingBidsSub: 'Awaiting review',
    kpiOpenLots: 'Open Lots',
    kpiOpenLotsSub: 'Listed on market',
    kpiTotalSales: 'Total Sales',
    kpiTotalSalesSub: 'Gross contract value',
    kpiPendingPay: 'Pending Pay',
    kpiPendingPaySub: 'Awaiting payment',
    tabAll: 'All Listings',
    tabBidding: 'Active Bidding',
    tabSold: 'Sold & Finalized',
    tabOpen: 'Open Listings',
    tabCancelled: 'Cancelled',
    sectionActiveBidding: 'Active Bidding Produce',
    sectionSoldContracts: 'Sold & Finalized Contracts',
    sectionOpenListings: 'Recent Open Listings',
    askingRateLabel: 'Asking Rate',
    topBuyerOfferLabel: 'Top Buyer Offer',
    offersCountLabel: 'Incoming Offers',
    btnViewOffers: 'View Offers & Details',
    buyerLabel: 'Buyer',
    contractTotalLabel: 'Contract Total',
    paymentStatusLabel: 'Payment Status',
    btnViewContract: 'View Contract',
    noLotsTitle: 'No crop lots listed yet',
    noLotsDesc: 'Publish your first crop lot to receive direct bids from verified buyers across India.',
    noBiddingTitle: 'No lots under active bidding right now',
    noBiddingDesc: 'When wholesale buyers place offers on your listings, they will appear here.',
    noSoldTitle: 'No finalized sales yet',
    noSoldDesc: 'Accepted buyer offers and completed contracts will be logged here.',
    createLotTitle: 'Publish Crop Lot to Marketplace',
    createLotSubtitle: 'Direct farm-gate listing visible to verified commercial buyers',
    lotCropLabel: 'Commodity / Crop',
    lotQtyLabel: 'Quantity (Quintals)',
    lotPriceLabel: 'Expected Asking Rate (₹/Qtl)',
    lotGradeLabel: 'Produce Quality Grade',
    lotGradeA: 'Grade A (Premium / Export Quality)',
    lotGradeB: 'Grade B (Standard Commercial Grade)',
    lotGradeC: 'Grade C (Processing / Industrial Grade)',
    lotLocationLabel: 'Farm-Gate / Loading Location',
    lotLocationPlaceholder: 'e.g. Village Pimpalgaon, Niphad Taluka, Nashik',
    btnConfirmPublish: 'Publish Crop Lot to Buyers',
    publishingLot: 'Publishing lot...',
    lotPublishedSuccess: 'Crop lot successfully published to the marketplace!',
    activeLotsTitle: 'My Published Crop Lots',
    myLotsSubtitle: 'Manage harvest listings, review incoming offers, and finalize deals',
    lotDetailTitle: 'Crop Lot Details & Bidding Desk',
    lotDetailSubtitle: 'Review incoming commercial bids and accept winning trade contracts',
    incomingOffersTitle: 'Incoming Buyer Sourcing Offers',
    noIncomingOffers: 'No offers received on this lot yet. Institutional buyers are reviewing the listing.',
    btnAcceptOffer: 'Accept Winning Bid',
    btnRejectOffer: 'Reject Offer',
    acceptingBid: 'Accepting deal...',
    bidAcceptedSuccess: 'Deal accepted! Purchase contract and invoice generated.',
    bidRejectedSuccess: 'Offer rejected.',

    buyerMarketplaceTitle: 'Commercial Agricultural Marketplace',
    buyerMarketplaceSubtitle: 'Direct farm-gate sourcing catalog with real-time APMC price comparison',
    buyerWelcomeTitle: 'Welcome',
    buyerTagline: 'Source high-grade farm produce directly from verified farmers with transparent price discovery.',
    btnBrowseCatalog: 'Browse Sourcing Catalog',
    btnViewMyBids: 'View My Active Bids',
    kpiActiveBids: 'Active Bids',
    kpiPurchases: 'Contracts',
    kpiProcuredVolume: 'Procured Volume',
    kpiTotalSpent: 'Total Procurement',
    filterAllCrops: 'All Commodities',
    searchLotsPlaceholder: 'Search by crop, location, or quality grade...',
    btnPlaceBid: 'Place Sourcing Bid',
    btnConfirmBid: 'Submit Offer',
    submittingBid: 'Submitting bid...',
    bidPlacedSuccess: 'Bid successfully placed on farmer lot!',
    farmerAskingRate: 'Farmer Asking Rate',
    qualityGradeLabel: 'Quality Grade',
    harvestLocation: 'Harvest Location',
    expectedRate: 'Asking Price',
    bidRateLabel: 'Your Bid Rate (₹/Qtl)',
    bidQtyLabel: 'Quantity to Procure (Quintals)',
    messageLabel: 'Procurement Terms / Message (Optional)',
    messagePlaceholder: 'e.g. Ready for immediate loading and direct digital bank settlement',
    myBidsTitle: 'My Active Sourcing Bids',
    myBidsSubtitle: 'Track submitted sourcing offers, modify quantities, or withdraw pending bids',
    btnModifyQty: 'Modify Quantity',
    btnCancelBid: 'Cancel Bid',
    modifyQtyModalTitle: 'Modify Bid Sourcing Quantity',
    newQtyLabel: 'New Sourcing Quantity (Quintals)',
    btnSaveQty: 'Save Modified Quantity',
    cancelBidModalTitle: 'Cancel Sourcing Offer',
    cancelBidConfirmDesc: 'Are you sure you want to withdraw this pending bid? This action will mark the offer as WITHDRAWN.',
    btnConfirmCancel: 'Confirm Withdrawal',
    bidWithdrawnBadge: 'Bid Cancelled by Buyer',
    bidModifiedSuccess: 'Bid quantity successfully updated!',
    bidCancelledSuccess: 'Bid successfully withdrawn.',
    purchasesTitle: 'Finalized Purchase Contracts',
    purchasesSubtitle: 'Review accepted contracts, verified invoices, and bank UTR settlements',
    purchaseContractId: 'Contract ID',
    agreedRate: 'Agreed Rate',
    totalAmount: 'Total Amount',
    paymentStatus: 'Payment Status',
    btnViewInvoice: 'View Invoice',
    btnConfirmPayment: 'Confirm Settlement (Paid)',
    paymentPaidBadge: 'Settled (Paid)',

    adminTitle: 'National Agriculture Market Oversight Cockpit',
    adminSubtitle: 'Ministry of Agriculture real-time marketplace monitoring, trade volumes, and auditable activities',
    tabOverview: 'National Overview',
    tabLots: 'Crop Lots Monitor',
    tabBids: 'Bidding Operations',
    tabUsers: 'Verified Directories',
    tabTxns: 'Trade Contracts',
    tabActivity: 'Live Audit Stream',
    kpiTotalLots: 'Total Crop Lots',
    kpiTotalBids: 'Total Offers Placed',
    kpiTotalGMV: 'Gross Trade GMV',
    kpiTotalVolume: 'Total Traded Volume',
    kpiAvgRealization: 'Farmer Realization',
    kpiActiveFarmers: 'Verified Farmers',
    kpiActiveBuyers: 'Institutional Buyers',
    kpiSettledPayments: 'Settled Contracts',
    lotsMonitorTitle: 'Crop Lots & Sourcing Directory',
    bidsMonitorTitle: 'Bidding Desk & Negotiation Activity',
    usersDirectoryTitle: 'Verified Market Participants',
    txnsLedgerTitle: 'Atomic Trade Contracts Ledger',
    activityStreamTitle: 'Chronological Audit Event Stream',
    searchLotsAdminPlaceholder: 'Filter lots by crop, farmer, or state...',
    searchBidsAdminPlaceholder: 'Filter bids by lot, buyer, or status...',
    allStatuses: 'All Statuses',
    exportCSV: 'Export Report',
    tableColLotId: 'Lot ID',
    tableColCrop: 'Crop / Commodity',
    tableColFarmer: 'Farmer',
    tableColBuyer: 'Buyer',
    tableColQty: 'Quantity',
    tableColPrice: 'Rate (₹/Qtl)',
    tableColStatus: 'Status',
    tableColDate: 'Date',
    tableColActions: 'Actions',
    tableColAmount: 'Amount',
    tableColEvent: 'Audit Event',

    profileTitle: 'User Profile & Market Credentials',
    profileSubtitle: 'Manage verified registration, contact details, and farm-gate dispatch coordinates',
    accountRole: 'Account Type',
    verificationBadge: 'Verified Producer / Procurer',
    districtLabel: 'District',
    stateLabel: 'State',
    addressLabel: 'Address / Trade Yard Location',
    btnSaveProfile: 'Save Profile Changes',
    profileSavedSuccess: 'Profile details updated successfully!',

    commonLoading: 'Loading...',
    commonViewDetails: 'View Details',
    commonActions: 'Actions',
    commonCancel: 'Cancel',
    commonSave: 'Save',
    commonConfirm: 'Confirm',
    commonClose: 'Close',
    commonBack: 'Back',
    commonSearch: 'Search',
    commonFilter: 'Filter',
    commonTotal: 'Total',
    commonDate: 'Date',
    commonStatus: 'Status',
    commonFarmer: 'Farmer',
    commonBuyer: 'Buyer',
    commonQuantity: 'Quantity',
    commonPrice: 'Price',
    commonLocation: 'Location',
    commonGrade: 'Quality Grade',
    commonLoginRequired: 'Login Required',
    commonWelcomeBack: 'Welcome back',
    commonAll: 'All',
    commonNoData: 'No data available',
    errInvalidCredentials: 'Invalid phone/email or password.',
    errCaptchaRequired: 'Please enter the CAPTCHA.',
    errCaptchaInvalid: 'Incorrect CAPTCHA. Please try again.',
    errCaptchaExpired: 'CAPTCHA expired. Please refresh and try again.',
    errTooManyAttempts: 'Too many incorrect attempts. Please generate a new CAPTCHA.',
    errServerError: 'An unexpected error occurred. Please try again.',
  },

  hi: {
    brandTitle: 'वाणिज्य',
    brandSubtitle: 'राष्ट्रीय कृषि मूल्य एवं विपणन मंच',
    kccNotice: 'किसान क्रेडिट कार्ड (KCC) एवं राष्ट्रीय कृषि मंडी (APMC) पंजीकृत',
    navHome: 'होम',
    navPrices: 'मंडी भाव',
    navMarketplace: 'मार्केटप्लेस',
    navSell: 'फसल बेचें',
    navMyLots: 'मेरी फसलें',
    navMyBids: 'मेरी बोलियां',
    navPurchases: 'खरीद अनुबंध',
    navDashboard: 'डैशबोर्ड',
    navAnalytics: 'विश्लेषण',
    navProfile: 'प्रोफ़ाइल',
    navLogin: 'साइन इन',
    navLogout: 'साइन आउट',
    roleFarmer: 'किसान',
    roleBuyer: 'थोक खरीदार / व्यापारी',
    roleAdmin: 'व्यवस्थापक',

    heroPill: 'मजबूत बाजार संपर्क एवं पारदर्शी मूल्य निर्धारण',
    heroHeadline: 'फसल बेचने से पहले जानें सही और सर्वोत्तम भाव।',
    heroSubheadline: 'भारतीय किसानों और थोक खरीदारों को वास्तविक ए.पी.एम.सी. मंडी भाव, क्षेत्रीय मुनाफ़ा, सीधी डिजिटल बोली और शून्य प्रतिशत दलाली से सशक्त बनाता मंच।',
    btnExplorePrices: 'ताजा मंडी भाव देखें',
    btnStartSelling: 'किसान के रूप में बेचें',
    btnSourceProduce: 'खरीदार के रूप में खरीदें',
    liveMarketHighlights: 'ताजा मंडी मूल्य विश्लेषण एवं बेंचमार्क दरें',
    todayPriceLabel: 'आज का भाव',
    spatialArbitrageLabel: 'क्षेत्रीय मुनाफ़ा',
    bestSellingWindowLabel: 'बिक्री का सर्वोत्तम समय',
    optimalBadge: 'उत्कृष्ट समय',
    netGainBadge: 'शुद्ध लाभ',
    howItWorksTitle: 'वाणिज्य कैसे काम करता है?',
    howItWorksSubtitle: 'सटीक मूल्य खोज से लेकर सुरक्षित बैंक भुगतान तक चार पारदर्शी चरणों में',
    step1Title: '१. ताजा भाव एवं विश्लेषण',
    step1Desc: 'किसान दैनिक मॉडल भाव, 7-दिवसीय औसत (SMA) और आस-पास की मंडियों में अतिरिक्त मुनाफ़ा देखते हैं।',
    step2Title: '२. खेत से सीधी लिस्टिंग',
    step2Desc: 'अपनी फसल की गुणवत्ता, मात्रा और अपेक्षित भाव दर्ज करें जो सीधे सत्यापित थोक खरीदारों को दिखाई देती है।',
    step3Title: '३. पारदर्शी डिजिटल बोली',
    step3Desc: 'संस्थागत खरीदार मंडी दरों की तुलना करके सीधे पारदर्शी और प्रतिस्पर्धी बोलियां लगाते हैं।',
    step4Title: '४. तुरंत सौदा एवं भुगतान',
    step4Desc: 'किसान 1 क्लिक में सर्वश्रेष्ठ बोली स्वीकार करते हैं और बिना किसी दलाली के शत-प्रतिशत सीधा भुगतान प्राप्त करते हैं।',
    farmerBenefitsTitle: 'किसान वाणिज्य को क्यों चुनते हैं?',
    buyerBenefitsTitle: 'थोक खरीदार वाणिज्य से खरीद क्यों करते हैं?',
    govtAlignmentTitle: 'राष्ट्रीय कृषि नीतियों के अनुरूप',
    govtAlignmentDesc: 'ई-नाम (e-NAM) गलियारे, एगमार्कनेट मानक, एपीएमसी अनुपालन एवं प्रत्यक्ष कृषक सशक्तिकरण।',
    impactTitle: 'आज का वाणिज्य प्रभाव',
    impactSubtitle: 'राष्ट्रीय बाजार संपर्क एवं बिचौलिया-मुक्त सीधा व्यापार',
    incomeBoost: 'किसान आय में वृद्धि',
    arbitrageGain: 'औसत अतिरिक्त लाभ',
    commissionSaved: 'दलाली की बचत',
    connectedMandis: 'सक्रिय मंडियां',
    zeroCommissionBadge: '०% दलाली',

    pricesTitle: 'राष्ट्रीय मंडी भाव खोज एवं बाजार विश्लेषण',
    pricesSubtitle: 'वास्तविक समय में एपीएमसी मंडी भाव, क्षेत्रीय मुनाफ़ा और 7-दिवसीय मूल्य रुझान (लॉगिन की आवश्यकता नहीं)',
    selectCropLabel: 'कृषि जिंस (फसल) चुनें',
    todayRate: 'आज का बेंचमार्क भाव',
    todayBenchmark: 'बेंचमार्क दर',
    minRate: 'न्यूनतम दर',
    maxRate: 'अधिकतम दर',
    weeklyAvg: '7-दिवसीय औसत भाव',
    sma7Label: '7-दिवसीय SMA',
    trend: 'मूल्य गति',
    priceMomentum: 'मूल्य गति',
    trendBullish: 'तेजी (बढ़ता हुआ)',
    trendBearish: 'मंदी (गिरता हुआ)',
    trendStable: 'स्थिर (सामान्य)',
    lowVolatility: 'कम उतार-चढ़ाव',
    moderateVolatility: 'मध्यम उतार-चढ़ाव',
    highVolatility: 'अधिक उतार-चढ़ाव',
    dailyArrivals: 'दैनिक मंडी आवक',
    sellingWindow: 'फसल बेचने का सर्वोत्तम समय',
    sellingWindowCardTitle: 'फसल बेचने का सर्वोत्तम समय एवं परामर्श',
    recommendationLabel: 'परामर्श',
    confidenceLabel: 'सटीकता का स्तर',
    reasoningLabel: 'बाजार का कारण',
    sellNowAdvisory: 'अगले 24-48 घंटों में फसल बेचें',
    holdAdvisory: '3-5 दिनों के लिए फसल रोकें',
    normalAdvisory: 'सामान्य व्यापारिक समय। खरीदारों से प्रतिस्पर्धी बोलियां प्राप्त करने के लिए अपनी फसल लिस्ट करें।',
    nearbyArbitrage: 'निकटवर्ती मंडी तुलना एवं क्षेत्रीय मुनाफ़ा',
    spatialArbitrageCardTitle: 'क्षेत्रीय मुनाफ़ा एवं निकटतम मंडी कैलकुलेटर',
    nearbyBetterMarket: 'सर्वोत्तम नजदीकी मंडी',
    distanceKm: 'दूरी',
    transportCost: 'परिवहन लागत',
    netGain: 'अतिरिक्त शुद्ध लाभ',
    netGainPerQtl: 'अतिरिक्त लाभ / क्विंटल',
    recommendedAction: 'सुझाई गई कार्रवाई',
    priceChartTitle: '7-दिवसीय मंडी मूल्य रुझान',
    latestPriceLabel: 'नवीनतम भाव',
    noHistoryData: 'इस फसल के लिए कोई पुराना मूल्य डेटा उपलब्ध नहीं है',
    listHarvestCTA: 'क्या आप अपनी फसल सही और लाभदायक भाव पर बेचना चाहते हैं?',
    listHarvestDesc: 'वाणिज्य पर अपनी फसल लिस्ट करें और देश भर के थोक खरीदारों से बिना किसी दलाली के सीधे प्रतिस्पर्धी बोलियां प्राप्त करें।',
    btnListCropNow: 'अभी फसल लिस्ट करें',

    loginTitle: 'सुरक्षित वाणिज्य लॉगिन',
    loginSubtitle: 'किसानों, थोक खरीदारों और व्यवस्थापकों के लिए एकीकृत एकल लॉगिन',
    phoneOrEmailLabel: 'मोबाइल नंबर या ईमेल पता',
    identifierPlaceholder: 'उदा. 9876543210 या buyer@freshcart.com',
    passwordLabel: 'पासवर्ड',
    passwordPlaceholder: '••••••••',
    roleSelectLabel: 'अपना खाता प्रकार चुनें',
    btnSignIn: 'वाणिज्य में साइन इन करें',
    signingIn: 'साइन इन हो रहा है...',
    securityVerification: 'सुरक्षा सत्यापन',
    securityCodeCaseNotice: 'अक्षर छोटे-बड़े मान्य',
    generatingSecurityCode: 'सुरक्षा कोड बनाया जा रहा है...',
    failedToLoadImage: 'सुरक्षा कोड लोड करने में असमर्थ',
    refreshSecurityCode: 'नया सुरक्षा कोड प्राप्त करें',
    enterCharactersAbove: 'ऊपर दिखाए गए अक्षरों को दर्ज करें',
    captchaInputPlaceholder: 'उदा. K7P4X',
    chooseAccountTypeLabel: 'खाता प्रकार चुनें / 1-क्लिक डेमो भरें:',
    tradeEnrolledNotice: 'किसान क्रेडिट कार्ड (KCC) एवं राष्ट्रीय कृषि व्यापार पंजीकृत | दृश्य सुरक्षा सत्यापन',

    farmerDashboardTitle: 'किसान नियंत्रण केंद्र',
    farmerWelcomeTitle: 'नमस्ते',
    farmerTagline: 'सक्रिय बोलियों की निगरानी करें, सर्वोत्तम भाव स्वीकार करें और सुरक्षित भुगतान प्राप्त करें।',
    btnPublishLot: 'नई फसल लिस्ट करें',
    btnViewAllLots: 'सभी फसलें देखें',
    kpiActiveBidding: 'सक्रिय बोलियां',
    kpiActiveBiddingSub: 'जिन फसलों पर बोलियां आ रही हैं',
    kpiSoldLots: 'बिक चुकी फसलें',
    kpiSoldLotsSub: 'सौदा तय हो चुका',
    kpiPendingBids: 'लंबित बोलियां',
    kpiPendingBidsSub: 'समीक्षा हेतु प्रतीक्षारत',
    kpiOpenLots: 'खुली फसलें',
    kpiOpenLotsSub: 'मार्केट में प्रदर्शित',
    kpiTotalSales: 'कुल बिक्री',
    kpiTotalSalesSub: 'कुल अनुबंधित मूल्य',
    kpiPendingPay: 'लंबित भुगतान',
    kpiPendingPaySub: 'भुगतान की प्रतीक्षा में',
    tabAll: 'सभी फसलें',
    tabBidding: 'सक्रिय बोलियां',
    tabSold: 'बिक चुकी एवं तय',
    tabOpen: 'खुली लिस्टिंग',
    tabCancelled: 'रद्द की गई',
    sectionActiveBidding: 'सक्रिय बोलियों वाली फसलें',
    sectionSoldContracts: 'बिक चुके सौदे एवं अनुबंध',
    sectionOpenListings: 'हाल ही में लिस्ट की गई फसलें',
    askingRateLabel: 'अपेक्षित भाव',
    topBuyerOfferLabel: 'सर्वोच्च खरीदार बोली',
    offersCountLabel: 'प्राप्त बोलियां',
    btnViewOffers: 'बोलियां एवं विवरण देखें',
    buyerLabel: 'खरीदार',
    contractTotalLabel: 'कुल सौदा राशि',
    paymentStatusLabel: 'भुगतान स्थिति',
    btnViewContract: 'अनुबंध देखें',
    noLotsTitle: 'अभी तक कोई फसल लिस्ट नहीं की गई है',
    noLotsDesc: 'सत्यापित खरीदारों से सीधी बोलियां प्राप्त करने के लिए अपनी पहली फसल लिस्ट करें।',
    noBiddingTitle: 'वर्तमान में किसी फसल पर सक्रिय बोली नहीं है',
    noBiddingDesc: 'जब थोक खरीदार आपकी फसल पर बोली लगाएंगे, तो वे यहाँ दिखाई देंगी।',
    noSoldTitle: 'अभी तक कोई पूर्ण बिक्री नहीं हुई है',
    noSoldDesc: 'स्वीकार की गई बोलियां और पूर्ण अनुबंध यहाँ प्रदर्शित होंगे।',
    createLotTitle: 'मार्केटप्लेस में नई फसल लिस्ट करें',
    createLotSubtitle: 'सीधे खेत से लिस्टिंग जो देश भर के सत्यापित थोक खरीदारों को दिखाई देती है',
    lotCropLabel: 'फसल / जिंस का नाम',
    lotQtyLabel: 'मात्रा (क्विंटल में)',
    lotPriceLabel: 'अपेक्षित भाव (₹/क्विंटल)',
    lotGradeLabel: 'फसल की गुणवत्ता श्रेणी',
    lotGradeA: 'ग्रेड A (प्रीमियम / निर्यात गुणवत्ता)',
    lotGradeB: 'ग्रेड B (मानक वाणिज्यिक गुणवत्ता)',
    lotGradeC: 'ग्रेड C (प्रसंस्करण / उद्योग गुणवत्ता)',
    lotLocationLabel: 'खेत / लोडिंग का स्थान',
    lotLocationPlaceholder: 'उदा. ग्राम पिंपलगांव, निफाड़ तहसील, नासिक',
    btnConfirmPublish: 'खरीदारों के लिए फसल लिस्ट करें',
    publishingLot: 'फसल लिस्ट हो रही है...',
    lotPublishedSuccess: 'फसल सफलतापूर्वक मार्केटप्लेस में लिस्ट हो गई!',
    activeLotsTitle: 'मेरी लिस्ट की गई फसलें',
    myLotsSubtitle: 'फसल लिस्टिंग प्रबंधित करें, खरीदारों की बोलियां देखें और सौदे तय करें',
    lotDetailTitle: 'फसल विवरण एवं बोली पटल',
    lotDetailSubtitle: 'प्राप्त बोलियों की समीक्षा करें और सर्वोत्तम बोली स्वीकार करें',
    incomingOffersTitle: 'खरीदारों से प्राप्त बोलियां',
    noIncomingOffers: 'इस फसल पर अभी कोई बोली प्राप्त नहीं हुई है। खरीदार लिस्टिंग की समीक्षा कर रहे हैं।',
    btnAcceptOffer: 'सर्वश्रेष्ठ बोली स्वीकार करें',
    btnRejectOffer: 'बोली अस्वीकार करें',
    acceptingBid: 'सौदा स्वीकार हो रहा है...',
    bidAcceptedSuccess: 'सौदा स्वीकृत! खरीद अनुबंध एवं इनवॉइस तैयार कर दिया गया है।',
    bidRejectedSuccess: 'बोली अस्वीकार कर दी गई।',

    buyerMarketplaceTitle: 'थोक कृषि मार्केटप्लेस',
    buyerMarketplaceSubtitle: 'खेत से सीधी खरीद सूची एवं वास्तविक समय में मंडी भाव तुलना',
    buyerWelcomeTitle: 'स्वागत है',
    buyerTagline: 'पारदर्शी भाव निर्धारण के साथ सीधे सत्यापित किसानों से उच्च गुणवत्ता वाली फसल खरीदें।',
    btnBrowseCatalog: 'खरीद सूची देखें',
    btnViewMyBids: 'मेरी सक्रिय बोलियां देखें',
    kpiActiveBids: 'सक्रिय बोलियां',
    kpiPurchases: 'खरीद अनुबंध',
    kpiProcuredVolume: 'खरीदी गई मात्रा',
    kpiTotalSpent: 'कुल खरीद मूल्य',
    filterAllCrops: 'सभी फसलें',
    searchLotsPlaceholder: 'फसल, स्थान या गुणवत्ता से खोजें...',
    btnPlaceBid: 'खरीद बोली लगाएं',
    btnConfirmBid: 'बोली सबमिट करें',
    submittingBid: 'बोली सबमिट हो रही है...',
    bidPlacedSuccess: 'किसान की फसल पर बोली सफलतापूर्वक दर्ज हो गई!',
    farmerAskingRate: 'किसान का अपेक्षित भाव',
    qualityGradeLabel: 'गुणवत्ता श्रेणी',
    harvestLocation: 'फसल का स्थान',
    expectedRate: 'अपेक्षित भाव',
    bidRateLabel: 'आपकी बोली दर (₹/क्विंटल)',
    bidQtyLabel: 'खरीद मात्रा (क्विंटल में)',
    messageLabel: 'खरीद शर्तें / संदेश (वैकल्पिक)',
    messagePlaceholder: 'उदा. तत्काल लोडिंग और सीधे डिजिटल बैंक भुगतान के लिए तैयार',
    myBidsTitle: 'मेरी सक्रिय बोलियां',
    myBidsSubtitle: 'सबमिट की गई बोलियां ट्रैक करें, मात्रा संशोधित करें या लंबित बोलियां वापस लें',
    btnModifyQty: 'मात्रा बदलें',
    btnCancelBid: 'बोली रद्द करें',
    modifyQtyModalTitle: 'बोली मात्रा संशोधित करें',
    newQtyLabel: 'नई खरीद मात्रा (क्विंटल)',
    btnSaveQty: 'संशोधित मात्रा सहेजें',
    cancelBidModalTitle: 'खरीद बोली वापस लें',
    cancelBidConfirmDesc: 'क्या आप वाकई इस लंबित बोली को वापस लेना चाहते हैं? इस बोली को वापस ले लिया जाएगा।',
    btnConfirmCancel: 'वापस लेने की पुष्टि करें',
    bidWithdrawnBadge: 'खरीदार द्वारा बोली वापस ली गई',
    bidModifiedSuccess: 'बोली मात्रा सफलतापूर्वक संशोधित हो गई!',
    bidCancelledSuccess: 'बोली सफलतापूर्वक वापस ले ली गई।',
    purchasesTitle: 'तयशुदा खरीद अनुबंध',
    purchasesSubtitle: 'स्वीकृत सौदे, सत्यापित इनवॉइस और बैंक यूटीआर भुगतान देखें',
    purchaseContractId: 'अनुबंध क्रमांक',
    agreedRate: 'तय भाव',
    totalAmount: 'कुल राशि',
    paymentStatus: 'भुगतान स्थिति',
    btnViewInvoice: 'इनवॉइस देखें',
    btnConfirmPayment: 'भुगतान की पुष्टि करें (Paid)',
    paymentPaidBadge: 'भुगतान संपन्न',

    adminTitle: 'राष्ट्रीय कृषि बाजार निगरानी नियंत्रण केंद्र',
    adminSubtitle: 'कृषि मंत्रालय वास्तविक समय बाजार निगरानी, व्यापार मात्रा एवं अंकेक्षण रिकॉर्ड',
    tabOverview: 'राष्ट्रीय अवलोकन',
    tabLots: 'फसल निगरानी',
    tabBids: 'बोली संचालन',
    tabUsers: 'सत्यापित उपयोगकर्ता',
    tabTxns: 'व्यापार अनुबंध',
    tabActivity: 'लाइव ऑडिट स्ट्रीम',
    kpiTotalLots: 'कुल फसल लॉट',
    kpiTotalBids: 'कुल दर्ज बोलियां',
    kpiTotalGMV: 'सकल व्यापार राशि',
    kpiTotalVolume: 'कुल व्यापार मात्रा',
    kpiAvgRealization: 'किसान आय वृद्धि',
    kpiActiveFarmers: 'सत्यापित किसान',
    kpiActiveBuyers: 'संस्थागत खरीदार',
    kpiSettledPayments: 'संपन्न अनुबंध',
    lotsMonitorTitle: 'फसल लॉट एवं सोर्सिंग सूची',
    bidsMonitorTitle: 'बोली पटल एवं बातचीत विवरण',
    usersDirectoryTitle: 'सत्यापित बाजार प्रतिभागी',
    txnsLedgerTitle: 'व्यापार अनुबंध बहीखाता',
    activityStreamTitle: 'कालानुक्रमिक ऑडिट इवेंट स्ट्रीम',
    searchLotsAdminPlaceholder: 'फसल, किसान या राज्य से खोजें...',
    searchBidsAdminPlaceholder: 'लॉट, खरीदार या स्थिति से खोजें...',
    allStatuses: 'सभी स्थितियां',
    exportCSV: 'रिपोर्ट डाउनलोड करें',
    tableColLotId: 'लॉट आईडी',
    tableColCrop: 'फसल / जिंस',
    tableColFarmer: 'किसान',
    tableColBuyer: 'खरीदार',
    tableColQty: 'मात्रा',
    tableColPrice: 'भाव (₹/क्विंटल)',
    tableColStatus: 'स्थिति',
    tableColDate: 'दिनांक',
    tableColActions: 'कार्रवाई',
    tableColAmount: 'राशि',
    tableColEvent: 'ऑडिट इवेंट',

    profileTitle: 'उपयोगकर्ता प्रोफ़ाइल एवं बाजार साख',
    profileSubtitle: 'सत्यापित पंजीकरण, संपर्क जानकारी और प्रेषण स्थान प्रबंधित करें',
    accountRole: 'खाता प्रकार',
    verificationBadge: 'सत्यापित उत्पादक / खरीदार',
    districtLabel: 'जिला',
    stateLabel: 'राज्य',
    addressLabel: 'पता / व्यापार यार्ड स्थान',
    btnSaveProfile: 'प्रोफ़ाइल विवरण सहेजें',
    profileSavedSuccess: 'प्रोफ़ाइल विवरण सफलतापूर्वक अपडेट हो गया!',

    commonLoading: 'लोड हो रहा है...',
    commonViewDetails: 'विवरण देखें',
    commonActions: 'कार्रवाई',
    commonCancel: 'रद्द करें',
    commonSave: 'सहेजें',
    commonConfirm: 'पुष्टि करें',
    commonClose: 'बंद करें',
    commonBack: 'वापस जाएं',
    commonSearch: 'खोजें',
    commonFilter: 'फ़िल्टर',
    commonTotal: 'कुल',
    commonDate: 'दिनांक',
    commonStatus: 'स्थिति',
    commonFarmer: 'किसान',
    commonBuyer: 'खरीदार',
    commonQuantity: 'मात्रा',
    commonPrice: 'भाव',
    commonLocation: 'स्थान',
    commonGrade: 'गुणवत्ता श्रेणी',
    commonLoginRequired: 'लॉगिन आवश्यक है',
    commonWelcomeBack: 'वापसी पर स्वागत है',
    commonAll: 'सभी',
    commonNoData: 'कोई डेटा उपलब्ध नहीं',
    errInvalidCredentials: 'अमान्य फ़ोन/ईमेल या पासवर्ड।',
    errCaptchaRequired: 'कृपया सुरक्षा कोड दर्ज करें।',
    errCaptchaInvalid: 'गलत सुरक्षा कोड। कृपया पुनः प्रयास करें।',
    errCaptchaExpired: 'सुरक्षा कोड समाप्त हो गया। कृपया रीफ़्रेश करें।',
    errTooManyAttempts: 'अत्यधिक गलत प्रयास। कृपया नया कोड बनाएं।',
    errServerError: 'एक अप्रत्याशित त्रुटि हुई। कृपया पुनः प्रयास करें।',
  },

  te: {
    brandTitle: 'వాణిజ్య',
    brandSubtitle: 'జాతీయ వ్యవసాయ ధరలు & మార్కెట్ అనుసంధాన పోర్టల్',
    kccNotice: 'కిసాన్ క్రెడిట్ కార్డ్ (KCC) & జాతీయ వ్యవసాయ మార్కెట్ (APMC) నమోదిత',
    navHome: 'హోమ్',
    navPrices: 'మార్కెట్ ధరలు',
    navMarketplace: 'మార్కెట్‌ప్లేస్',
    navSell: 'పంట అమ్మకం',
    navMyLots: 'నా పంటలు',
    navMyBids: 'నా బిడ్లు',
    navPurchases: 'కొనుగోలు ఒప్పందాలు',
    navDashboard: 'డాష్‌బోర్డ్',
    navAnalytics: 'విశ్లేషణ',
    navProfile: 'ప్రొఫైల్',
    navLogin: 'సైన్ ఇన్',
    navLogout: 'సైన్ అవుట్',
    roleFarmer: 'రైతు',
    roleBuyer: 'కొనుగోలుదారు / వ్యాపారి',
    roleAdmin: 'నిర్వాహకుడు',

    heroPill: 'బలమైన మార్కెట్ అనుసంధానం & పారదర్శక ధరల గుర్తింపు',
    heroHeadline: 'మీ పంటను అమ్మే ముందే సరైన & ఉత్తమ ధరను తెలుసుకోండి.',
    heroSubheadline: 'రియల్-టైమ్ APMC మార్కెట్ ధరల సమాచారం, ప్రాదేశిక ఆర్బిట్రేజ్, ప్రత్యక్ష ఫార్మ్-గేట్ బిడ్డింగ్ మరియు సున్నా దళారీ కమిషన్‌తో భారతీయ రైతులను మరియు వ్యాపారులను శక్తివంతం చేసే వేదిక.',
    btnExplorePrices: 'తాజా మార్కెట్ ధరలు చూడండి',
    btnStartSelling: 'రైతుగా అమ్మండి',
    btnSourceProduce: 'వ్యాపారిగా కొనండి',
    liveMarketHighlights: 'తాజా మార్కెట్ ధరల విశ్లేషణ & బెంచ్‌మార్క్ రేట్లు',
    todayPriceLabel: 'నేటి ధర',
    spatialArbitrageLabel: 'ప్రాదేశిక లాభం',
    bestSellingWindowLabel: 'అమ్మకానికి ఉత్తమ సమయం',
    optimalBadge: 'అనుకూల సమయం',
    netGainBadge: 'నికర లాభం',
    howItWorksTitle: 'వాణిజ్య ఎలా పనిచేస్తుంది?',
    howItWorksSubtitle: 'ఖచ్చితమైన ధరల గుర్తింపు నుండి సురక్షిత డిజిటల్ బ్యాంక్ చెల్లింపు వరకు నాలుగు పారదర్శక దశల్లో',
    step1Title: '1. తాజా ధరల గుర్తింపు',
    step1Desc: 'రైతులు రోజువారీ మార్కెట్ ధరలు, 7-రోజుల సగటు (SMA) మరియు సమీప మార్కెట్లలో అదనపు లాభాన్ని చూస్తారు.',
    step2Title: '2. ఫార్మ్-గేట్ లిస్టింగ్',
    step2Desc: 'మీ పంట నాణ్యత, పరిమాణం మరియు ఆశించే ధరను నమోదు చేయండి, ఇది నేరుగా ధృవీకరించబడిన వ్యాపారులకు కనిపిస్తుంది.',
    step3Title: '3. పారదర్శక డిజిటల్ బిడ్డింగ్',
    step3Desc: 'సంస్థాగత కొనుగోలుదారులు మార్కెట్ ధరలను పోల్చి చూసి నేరుగా పారదర్శకమైన బిడ్లను సమర్పిస్తారు.',
    step4Title: '4. తక్షణ ఒప్పందం & చెల్లింపు',
    step4Desc: 'రైతు 1 క్లిక్‌తో ఉత్తమ ఆఫర్‌ను అంగీకరిస్తారు మరియు ఎటువంటి కమిషన్ కోత లేకుండా 100% ప్రత్యక్ష చెల్లింపును పొందుతారు.',
    farmerBenefitsTitle: 'రైతులు వాణిజ్యను ఎందుకు ఎంచుకుంటారు?',
    buyerBenefitsTitle: 'వ్యాపారులు వాణిజ్య ద్వారా ఎందుకు కొనుగోలు చేస్తారు?',
    govtAlignmentTitle: 'జాతీయ వ్యవసాయ విధానాలకు అనుగుణంగా',
    govtAlignmentDesc: 'ఇ-నామ్ (e-NAM) మార్గాలు, అగ్‌మార్క్‌నెట్ ప్రమాణాలు, APMC నిబంధనల అమలు మరియు రైతు సాధికారత.',
    impactTitle: 'నేటి వాణిజ్య ప్రభావం',
    impactSubtitle: 'జాతీయ మార్కెట్ అనుసంధానం & దళారీ రహిత ప్రత్యక్ష వాణిజ్యం',
    incomeBoost: 'రైతు ఆదాయంలో పెరుగుదల',
    arbitrageGain: 'సగటు అదనపు లాభం',
    commissionSaved: 'ఆదా అయిన కమిషన్',
    connectedMandis: 'సక్రియ మార్కెట్లు',
    zeroCommissionBadge: '0% కమిషన్',

    pricesTitle: 'జాతీయ మార్కెట్ ధరల గుర్తింపు & సమాచారం',
    pricesSubtitle: 'రియల్-టైమ్ APMC మార్కెట్ ధరలు, ప్రాంతీయ లాభాల అవకాశాలు మరియు 7-రోజుల ట్రెండ్ విశ్లేషణ (లాగిన్ అవసరం లేదు)',
    selectCropLabel: 'వ్యవసాయ పంటను ఎంచుకోండి',
    todayRate: 'నేటి బెంచ్‌మార్క్ ధర',
    todayBenchmark: 'బెంచ్‌మార్క్ రేటు',
    minRate: 'కనిష్ట రేటు',
    maxRate: 'గరిష్ట రేటు',
    weeklyAvg: '7-రోజుల సగటు ధర',
    sma7Label: '7-రోజుల SMA',
    trend: 'ధరల వేగం',
    priceMomentum: 'ధరల వేగం',
    trendBullish: 'పెరుగుదల (బుల్లిష్)',
    trendBearish: 'తగ్గుదల (బేరిష్)',
    trendStable: 'స్థిరంగా ఉంది',
    lowVolatility: 'తక్కువ హెచ్చుతగ్గులు',
    moderateVolatility: 'మధ్యస్థ హెచ్చుతగ్గులు',
    highVolatility: 'ఎక్కువ హెచ్చుతగ్గులు',
    dailyArrivals: 'రోజువారీ మార్కెట్ రాక',
    sellingWindow: 'పంట అమ్మకానికి ఉత్తమ సమయం',
    sellingWindowCardTitle: 'పంట అమ్మకానికి ఉత్తమ సమయం & సలహా',
    recommendationLabel: 'సిఫార్సు',
    confidenceLabel: 'ఖచ్చితత్వ స్థాయి',
    reasoningLabel: 'మార్కెట్ విశ్లేషణ',
    sellNowAdvisory: 'రాబోయే 24-48 గంటల్లో పంటను అమ్మండి',
    holdAdvisory: '3-5 రోజుల పాటు పంటను నిల్వ చేయండి',
    normalAdvisory: 'సాధారణ వ్యాపార సమయం. కొనుగోలుదారుల నుండి పోటీ బిడ్లను పొందడానికి మీ పంటను లిస్ట్ చేయండి.',
    nearbyArbitrage: 'సమీప మార్కెట్ల పోలిక & ప్రాదేశిక లాభం',
    spatialArbitrageCardTitle: 'ప్రాదేశిక లాభం & సమీప మార్కెట్ ఆప్టిమైజర్',
    nearbyBetterMarket: 'ఉత్తమ సమీప మార్కెట్',
    distanceKm: 'దూరం',
    transportCost: 'రవాణా ఖర్చు',
    netGain: 'నికర అదనపు లాభం',
    netGainPerQtl: 'నికర లాభం / క్వింటాల్',
    recommendedAction: 'సిఫార్సు చేసిన చర్య',
    priceChartTitle: '7-రోజుల మార్కెట్ ధరల ట్రెండ్',
    latestPriceLabel: 'తాజా ధర',
    noHistoryData: 'ఈ పంటకు గత ధరల డేటా అందుబాటులో లేదు',
    listHarvestCTA: 'మీ పంటను సరైన మరియు లాభదాయకమైన ధరకు అమ్మాలనుకుంటున్నారా?',
    listHarvestDesc: 'వాణిజ్యలో మీ పంటను నమోదు చేయండి మరియు ఎటువంటి దళారీ కమిషన్ లేకుండా నేరుగా పోటీ బిడ్లను పొందండి.',
    btnListCropNow: 'ఇప్పుడే పంటను నమోదు చేయండి',

    loginTitle: 'సురక్షిత వాణిజ్య లాగిన్',
    loginSubtitle: 'రైతులు, వ్యాపారులు మరియు నిర్వాహకుల కోసం ఏకీకృత సింగిల్ లాగిన్',
    phoneOrEmailLabel: 'మొబైల్ నంబర్ లేదా ఈమెయిల్ చిరునామా',
    identifierPlaceholder: 'ఉదా. 9876543210 లేదా buyer@freshcart.com',
    passwordLabel: 'పాస్‌వర్డ్',
    passwordPlaceholder: '••••••••',
    roleSelectLabel: 'మీ ఖాతా రకాన్ని ఎంచుకోండి',
    btnSignIn: 'వాణిజ్యలోకి సైన్ ఇన్ చేయండి',
    signingIn: 'సైన్ ఇన్ అవుతోంది...',
    securityVerification: 'భద్రతా ధృవీకరణ (CAPTCHA)',
    securityCodeCaseNotice: 'చిన్న/పెద్ద అక్షరాలు రెండూ చెల్లుబాటు',
    generatingSecurityCode: 'భద్రతా కోడ్ రూపొందించబడుతోంది...',
    failedToLoadImage: 'భద్రతా చిత్రాన్ని లోడ్ చేయడం విఫలమైంది',
    refreshSecurityCode: 'కొత్త కోడ్ కోసం రీఫ్రెష్ చేయండి',
    enterCharactersAbove: 'పైన చూపిన అక్షరాలను నమోదు చేయండి',
    captchaInputPlaceholder: 'ఉదా. K7P4X',
    chooseAccountTypeLabel: 'ఖాతా రకాన్ని ఎంచుకోండి / 1-క్లిక్ డెమో:',
    tradeEnrolledNotice: 'కిసాన్ క్రెడిట్ కార్డ్ (KCC) & జాతీయ వ్యవసాయ వాణిజ్య నమోదిత | భద్రతా ధృవీకరణ',

    farmerDashboardTitle: 'రైతు నియంత్రణ కేంద్రం',
    farmerWelcomeTitle: 'నమస్కారం',
    farmerTagline: 'సక్రియ బిడ్లను పర్యవేక్షించండి, ఉత్తమ ధరలను ఆమోదించండి మరియు సురక్షిత చెల్లింపులను పొందండి.',
    btnPublishLot: 'కొత్త పంటను నమోదు చేయండి',
    btnViewAllLots: 'అన్ని పంటలను చూడండి',
    kpiActiveBidding: 'సక్రియ బిడ్డింగ్',
    kpiActiveBiddingSub: 'ఆఫర్లు వస్తున్న పంటలు',
    kpiSoldLots: 'విక్రయించిన పంటలు',
    kpiSoldLotsSub: 'పూర్తయిన ఒప్పందాలు',
    kpiPendingBids: 'పెండింగ్ బిడ్లు',
    kpiPendingBidsSub: 'పరిశీలనలో ఉన్నవి',
    kpiOpenLots: 'ఓపెన్ పంటలు',
    kpiOpenLotsSub: 'మార్కెట్లో ఉన్నవి',
    kpiTotalSales: 'మొత్తం అమ్మకాలు',
    kpiTotalSalesSub: 'మొత్తం ఒప్పంద విలువ',
    kpiPendingPay: 'పెండింగ్ చెల్లింపులు',
    kpiPendingPaySub: 'రావలసిన చెల్లింపులు',
    tabAll: 'అన్ని పంటలు',
    tabBidding: 'సక్రియ బిడ్డింగ్',
    tabSold: 'విక్రయించబడినవి & ఖరారు',
    tabOpen: 'ఓపెన్ లిస్టింగ్‌లు',
    tabCancelled: 'రద్దు చేయబడినవి',
    sectionActiveBidding: 'సక్రియ బిడ్డింగ్ జరుగుతున్న పంటలు',
    sectionSoldContracts: 'విక్రయించబడిన పంటలు & ఒప్పందాలు',
    sectionOpenListings: 'ఇటీవల లిస్ట్ చేసిన పంటలు',
    askingRateLabel: 'ఆశించే ధర',
    topBuyerOfferLabel: 'అత్యధిక కొనుగోలుదారు బిడ్',
    offersCountLabel: 'వచ్చిన ఆఫర్లు',
    btnViewOffers: 'ఆఫర్లు & వివరాలు చూడండి',
    buyerLabel: 'కొనుగోలుదారు',
    contractTotalLabel: 'మొత్తం ఒప్పంద విలువ',
    paymentStatusLabel: 'చెల్లింపు స్థితి',
    btnViewContract: 'ఒప్పందం చూడండి',
    noLotsTitle: 'ఇంకా ఎటువంటి పంటలు లిస్ట్ చేయలేదు',
    noLotsDesc: 'ధృవీకరించబడిన వ్యాపారుల నుండి ప్రత్యక్ష బిడ్లను పొందడానికి మీ మొదటి పంటను నమోదు చేయండి.',
    noBiddingTitle: 'ప్రస్తుతం ఎటువంటి సక్రియ బిడ్డింగ్ లేదు',
    noBiddingDesc: 'కొనుగోలుదారులు మీ పంటలపై ఆఫర్లు పెట్టినప్పుడు అవి ఇక్కడ కనిపిస్తాయి.',
    noSoldTitle: 'ఇంకా ఎటువంటి అమ్మకాలు పూర్తి కాలేదు',
    noSoldDesc: 'ఆమోదించబడిన ఆఫర్లు మరియు పూర్తయిన ఒప్పందాలు ఇక్కడ కనిపిస్తాయి.',
    createLotTitle: 'మార్కెట్‌ప్లేస్‌లో కొత్త పంటను నమోదు చేయండి',
    createLotSubtitle: 'దేశవ్యాప్తంగా ధృవీకరించబడిన వ్యాపారులకు నేరుగా కనిపించే ఫార్మ్-గేట్ లిస్టింగ్',
    lotCropLabel: 'పంట / సరుకు పేరు',
    lotQtyLabel: 'పరిమాణం (క్వింటాళ్లలో)',
    lotPriceLabel: 'ఆశించే ధర (₹/క్వింటాల్)',
    lotGradeLabel: 'పంట నాణ్యత గ్రేడ్',
    lotGradeA: 'గ్రేడ్ A (ప్రీమియం / ఎగుమతి నాణ్యత)',
    lotGradeB: 'గ్రేడ్ B (ప్రామాణిక వాణిజ్య నాణ్యత)',
    lotGradeC: 'గ్రేడ్ C (ప్రాసెసింగ్ / పరిశ్రమ నాణ్యత)',
    lotLocationLabel: 'పొలం / లోడింగ్ ప్రాంతం',
    lotLocationPlaceholder: 'ఉదా. పింపల్‌గావ్ గ్రామం, నాసిక్',
    btnConfirmPublish: 'వ్యాపారుల కోసం పంటను నమోదు చేయండి',
    publishingLot: 'పంట నమోదు అవుతోంది...',
    lotPublishedSuccess: 'పంట మార్కెట్‌ప్లేస్‌లో విజయవంతంగా నమోదయింది!',
    activeLotsTitle: 'నా నమోదు చేసిన పంటలు',
    myLotsSubtitle: 'పంటల జాబితాను నిర్వహించండి, వచ్చిన ఆఫర్లను పరిశీలించండి మరియు ఒప్పందాలు చేసుకోండి',
    lotDetailTitle: 'పంట వివరాలు & బిడ్డింగ్ డెస్క్',
    lotDetailSubtitle: 'వచ్చిన బిడ్లను పరిశీలించండి మరియు ఉత్తమ ఆఫర్‌ను ఆమోదించండి',
    incomingOffersTitle: 'కొనుగోలుదారుల నుండి వచ్చిన ఆఫర్లు',
    noIncomingOffers: 'ఈ పంటపై ఇంకా ఎటువంటి ఆఫర్లు రాలేదు. వ్యాపారులు పరిశీలిస్తున్నారు.',
    btnAcceptOffer: 'ఉత్తమ బిడ్‌ను ఆమోదించండి',
    btnRejectOffer: 'ఆఫర్‌ను తిరస్కరించండి',
    acceptingBid: 'ఒప్పందం ఆమోదించబడుతోంది...',
    bidAcceptedSuccess: 'ఒప్పందం ఆమోదించబడింది! కొనుగోలు రసీదు సిద్ధమైంది.',
    bidRejectedSuccess: 'ఆఫర్ తిరస్కరించబడింది.',

    buyerMarketplaceTitle: 'వాణిజ్య వ్యవసాయ మార్కెట్‌ప్లేస్',
    buyerMarketplaceSubtitle: 'నేరుగా పొలం నుండి కొనుగోలు జాబితా & రియల్-టైమ్ మార్కెట్ ధరల పోలిక',
    buyerWelcomeTitle: 'స్వాగతం',
    buyerTagline: 'పారదర్శక ధరలతో ధృవీకరించబడిన రైతుల నుండి నేరుగా నాణ్యమైన పంటను సేకరించండి.',
    btnBrowseCatalog: 'కొనుగోలు జాబితాను చూడండి',
    btnViewMyBids: 'నా సక్రియ బిడ్లను చూడండి',
    kpiActiveBids: 'సక్రియ బిడ్లు',
    kpiPurchases: 'కొనుగోలు ఒప్పందాలు',
    kpiProcuredVolume: 'సేకరించిన పరిమాణం',
    kpiTotalSpent: 'మొత్తం సేకరణ ఖర్చు',
    filterAllCrops: 'అన్ని పంటలు',
    searchLotsPlaceholder: 'పంట, ప్రాంతం లేదా గ్రేడ్ ద్వారా శోధించండి...',
    btnPlaceBid: 'కొనుగోలు బిడ్ నమోదు చేయండి',
    btnConfirmBid: 'బిడ్ సమర్పించండి',
    submittingBid: 'బిడ్ సమర్పించబడుతోంది...',
    bidPlacedSuccess: 'రైతు పంటపై బిడ్ విజయవంతంగా సమర్పించబడింది!',
    farmerAskingRate: 'రైతు ఆశించే ధర',
    qualityGradeLabel: 'నాణ్యత గ్రేడ్',
    harvestLocation: 'పంట ఉన్న ప్రాంతం',
    expectedRate: 'ఆశించే ధర',
    bidRateLabel: 'మీ బిడ్ ధర (₹/క్వింటాల్)',
    bidQtyLabel: 'కొనుగోలు పరిమాణం (క్వింటాళ్లలో)',
    messageLabel: 'కొనుగోలు నిబంధనలు / సందేశం (ఐచ్ఛికం)',
    messagePlaceholder: 'ఉదా. తక్షణ లోడింగ్ మరియు ప్రత్యక్ష డిజిటల్ బ్యాంక్ చెల్లింపుకు సిద్ధం',
    myBidsTitle: 'నా సక్రియ బిడ్లు',
    myBidsSubtitle: 'సమర్పించిన ఆఫర్లను ట్రాక్ చేయండి, పరిమాణాన్ని మార్చండి లేదా పెండింగ్ బిడ్లను ఉపసంహరించుకోండి',
    btnModifyQty: 'పరిమాణం మార్చండి',
    btnCancelBid: 'బిడ్ రద్దు చేయండి',
    modifyQtyModalTitle: 'బిడ్ పరిమాణాన్ని సవరించండి',
    newQtyLabel: 'కొత్త కొనుగోలు పరిమాణం (క్వింటాళ్లు)',
    btnSaveQty: 'సవరించిన పరిమాణాన్ని భద్రపరచండి',
    cancelBidModalTitle: 'కొనుగోలు బిడ్‌ను ఉపసంహరించుకోండి',
    cancelBidConfirmDesc: 'మీరు ఖచ్చితంగా ఈ పెండింగ్ బిడ్‌ను రద్దు చేయాలనుకుంటున్నారా? ఈ ఆఫర్ రద్దు చేయబడుతుంది.',
    btnConfirmCancel: 'ఉపసంహరణను ధృవీకరించండి',
    bidWithdrawnBadge: 'కొనుగోలుదారు బిడ్ రద్దు చేశారు',
    bidModifiedSuccess: 'బిడ్ పరిమాణం విజయవంతంగా నవీకరించబడింది!',
    bidCancelledSuccess: 'బిడ్ విజయవంతంగా రద్దు చేయబడింది.',
    purchasesTitle: 'పూర్తయిన కొనుగోలు ఒప్పందాలు',
    purchasesSubtitle: 'ఆమోదించబడిన ఒప్పందాలు, ధృవీకరించబడిన ఇన్వాయిస్‌లు మరియు బ్యాంక్ UTR చెల్లింపులను చూడండి',
    purchaseContractId: 'ఒప్పంద సంఖ్య',
    agreedRate: 'ఖరారైన ధర',
    totalAmount: 'మొత్తం సొమ్ము',
    paymentStatus: 'చెల్లింపు స్థితి',
    btnViewInvoice: 'ఇన్వాయిస్ చూడండి',
    btnConfirmPayment: 'చెల్లింపును ధృవీకరించండి (Paid)',
    paymentPaidBadge: 'చెల్లింపు పూర్తయింది',

    adminTitle: 'జాతీయ వ్యవసాయ మార్కెట్ పర్యవేక్షణ కేంద్రం',
    adminSubtitle: 'వ్యవసాయ మంత్రిత్వ శాఖ రియల్-టైమ్ మార్కెట్ పర్యవేక్షణ, వాణిజ్య పరిమాణాలు మరియు ఆడిట్ రికార్డులు',
    tabOverview: 'జాతీయ అవలోకనం',
    tabLots: 'పంటల పర్యవేక్షణ',
    tabBids: 'బిడ్డింగ్ కార్యకలాపాలు',
    tabUsers: 'ధృవీకరించబడిన వినియోగదారులు',
    tabTxns: 'వాణిజ్య ఒప్పందాలు',
    tabActivity: 'లైవ్ ఆడిట్ స్ట్రీమ్',
    kpiTotalLots: 'మొత్తం పంట లాట్లు',
    kpiTotalBids: 'మొత్తం నమోదు చేసిన బిడ్లు',
    kpiTotalGMV: 'మొత్తం వాణిజ్య విలువ',
    kpiTotalVolume: 'మొత్తం వ్యాపార పరిమాణం',
    kpiAvgRealization: 'రైతు ఆదాయ పెరుగుదల',
    kpiActiveFarmers: 'ధృవీకరించబడిన రైతులు',
    kpiActiveBuyers: 'సంస్థాగత కొనుగోలుదారులు',
    kpiSettledPayments: 'పూర్తయిన ఒప్పందాలు',
    lotsMonitorTitle: 'పంట లాట్లు & సోర్సింగ్ డైరెక్టరీ',
    bidsMonitorTitle: 'బిడ్డింగ్ డెస్క్ & చర్చల వివరాలు',
    usersDirectoryTitle: 'ధృవీకరించబడిన మార్కెట్ భాగస్వాములు',
    txnsLedgerTitle: 'వాణిజ్య ఒప్పందాల లెడ్జర్',
    activityStreamTitle: 'కాలక్రమ ఆడిట్ ఈవెంట్ స్ట్రీమ్',
    searchLotsAdminPlaceholder: 'పంట, రైతు లేదా రాష్ట్రం ద్వారా శోధించండి...',
    searchBidsAdminPlaceholder: 'లాట్, కొనుగోలుదారు లేదా స్థితి ద్వారా శోధించండి...',
    allStatuses: 'అన్ని స్థితులు',
    exportCSV: 'నివేదిక డౌన్‌లోడ్ చేయండి',
    tableColLotId: 'లాట్ ID',
    tableColCrop: 'పంట / సరుకు',
    tableColFarmer: 'రైతు',
    tableColBuyer: 'కొనుగోలుదారు',
    tableColQty: 'పరిమాణం',
    tableColPrice: 'ధర (₹/క్వింటాల్)',
    tableColStatus: 'స్థితి',
    tableColDate: 'తేదీ',
    tableColActions: 'చర్యలు',
    tableColAmount: 'మొత్తం సొమ్ము',
    tableColEvent: 'ఆడిట్ ఈవెంట్',

    profileTitle: 'వినియోగదారు ప్రొఫైల్ & మార్కెట్ వివరాలు',
    profileSubtitle: 'ధృవీకరించబడిన నమోదు, సంప్రదింపు సమాచారం మరియు ఫార్మ్-గేట్ లోడింగ్ చిరునామాను నిర్వహించండి',
    accountRole: 'ఖాతా రకం',
    verificationBadge: 'ధృవీకరించబడిన రైతు / కొనుగోలుదారు',
    districtLabel: 'జిల్లా',
    stateLabel: 'రాష్ట్రం',
    addressLabel: 'చిరునామా / యార్డ్ ప్రాంతం',
    btnSaveProfile: 'ప్రొఫైల్ మార్పులను భద్రపరచండి',
    profileSavedSuccess: 'ప్రొఫైల్ వివరాలు విజయవంతంగా నవీకరించబడ్డాయి!',

    commonLoading: 'లోడ్ అవుతోంది...',
    commonViewDetails: 'వివరాలు చూడండి',
    commonActions: 'చర్యలు',
    commonCancel: 'రద్దు చేయి',
    commonSave: 'భద్రపరచు',
    commonConfirm: 'ధృవీకరించండి',
    commonClose: 'మూసివేయి',
    commonBack: 'వెనుకకు',
    commonSearch: 'శోధించండి',
    commonFilter: 'ఫిల్టర్',
    commonTotal: 'మొత్తం',
    commonDate: 'తేదీ',
    commonStatus: 'స్థితి',
    commonFarmer: 'రైతు',
    commonBuyer: 'కొనుగోలుదారు',
    commonQuantity: 'పరిమాణం',
    commonPrice: 'ధర',
    commonLocation: 'ప్రాంతం',
    commonGrade: 'నాణ్యత గ్రేడ్',
    commonLoginRequired: 'లాగిన్ అవసరం',
    commonWelcomeBack: 'తిరిగి స్వాగతం',
    commonAll: 'అన్నీ',
    commonNoData: 'డేటా అందుబాటులో లేదు',
    errInvalidCredentials: 'చెల్లని ఫోన్/ఈమెయిల్ లేదా పాస్‌వర్డ్.',
    errCaptchaRequired: 'దయచేసి సెక్యూరిటీ కోడ్ నమోదు చేయండి.',
    errCaptchaInvalid: 'తప్పు సెక్యూరిటీ కోడ్. దయచేసి మళ్లీ ప్రయత్నించండి.',
    errCaptchaExpired: 'సెక్యూరిటీ కోడ్ గడువు ముగిసింది. దయచేసి రీఫ్రెష్ చేయండి.',
    errTooManyAttempts: 'చాలా తప్పు ప్రయత్నాలు. దయచేసి కొత్త కోడ్ రూపొందించండి.',
    errServerError: 'ఊహించని లోపం జరిగింది. దయచేసి మళ్లీ ప్రయత్నించండి.',
  },
};

// Crop Name Localization Dictionary
export const cropTranslations: Record<string, Record<Language, string>> = {
  Tomato: { en: 'Tomato', hi: 'टमाटर', te: 'టమాటా' },
  Onion: { en: 'Onion', hi: 'प्याज़', te: 'ఉల్లిపాయ' },
  Potato: { en: 'Potato', hi: 'आलू', te: 'బంగాళాదుంప' },
  Wheat: { en: 'Wheat', hi: 'गेहूं', te: 'గోధుమలు' },
  Paddy: { en: 'Paddy / Rice', hi: 'धान / चावल', te: 'వరి / బియ్యం' },
  Maize: { en: 'Maize / Corn', hi: 'मक्का', te: 'మొక్కజొన్న' },
  Soybean: { en: 'Soybean', hi: 'सोयाबीन', te: 'సోయాబీన్' },
  Cotton: { en: 'Cotton', hi: 'कपास', te: 'పత్తి' },
  Mustard: { en: 'Mustard', hi: 'सरसों', te: 'ఆవాలు' },
  Gram: { en: 'Gram / Chana', hi: 'चना', te: 'శనగలు' },
  Turmeric: { en: 'Turmeric', hi: 'हल्दी', te: 'పసుపు' },
  Chilli: { en: 'Red Chilli', hi: 'लाल मिर्च', te: 'ఎర్ర మిరపకాయ' },
};

// Status Badge Localization Dictionary
export const statusTranslations: Record<string, Record<Language, string>> = {
  OPEN: { en: 'OPEN FOR BIDS', hi: 'बोलियों के लिए खुला', te: 'బిడ్ల కోసం తెరిచి ఉంది' },
  BIDDING: { en: 'ACTIVE BIDDING', hi: 'सक्रिय बोली जारी', te: 'సక్రియ బిడ్డింగ్' },
  SOLD: { en: 'SOLD & LOCKED', hi: 'बिक गया (अनुबंधित)', te: 'విక్రయించబడింది & లాక్' },
  CANCELLED: { en: 'CANCELLED', hi: 'रद्द किया गया', te: 'రద్దు చేయబడింది' },
  PENDING: { en: 'PENDING REVIEW', hi: 'समीक्षाधीन', te: 'సమీక్ష పెండింగ్‌లో ఉంది' },
  ACCEPTED: { en: 'ACCEPTED', hi: 'स्वीकृत', te: 'ఆమోదించబడింది' },
  REJECTED: { en: 'REJECTED', hi: 'अस्वीकृत', te: 'తిరస్కరించబడింది' },
  WITHDRAWN: { en: 'WITHDRAWN', hi: 'वापस लिया गया', te: 'ఉపసంహరించబడింది' },
  INITIATED: { en: 'PAYMENT DISPATCHED', hi: 'भुगतान भेजा गया', te: 'చెల్లింపు పంపబడింది' },
  PAID: { en: 'SETTLED (PAID)', hi: 'भुगतान संपन्न (सफल)', te: 'చెల్లించబడింది' },
  COMPLETED: { en: 'CONTRACT COMPLETED', hi: 'अनुबंध पूर्ण', te: 'ఒప్పందం పూర్తయింది' },
};
