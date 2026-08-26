export type Language = 'en' | 'hi' | 'te';

export interface UnifiedTranslations {
  // Brand & Navigation
  brandTitle: string;
  brandSubtitle: string;
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

  // Landing Page
  heroPill: string;
  heroHeadline: string;
  heroSubheadline: string;
  btnExplorePrices: string;
  btnStartSelling: string;
  btnSourceProduce: string;
  liveMarketHighlights: string;
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

  // Public Price Discovery (/prices)
  pricesTitle: string;
  pricesSubtitle: string;
  selectCrop: string;
  todayRate: string;
  weeklyAvg: string;
  trend: string;
  trendBullish: string;
  trendBearish: string;
  trendStable: string;
  sellingWindow: string;
  nearbyArbitrage: string;
  netGain: string;
  dailyArrivals: string;

  // Common Login & Role Selection (/login)
  loginTitle: string;
  loginSubtitle: string;
  phoneOrEmailLabel: string;
  passwordLabel: string;
  roleSelectLabel: string;
  roleFarmer: string;
  roleBuyer: string;
  roleAdmin: string;
  btnSignIn: string;
  signingIn: string;

  // Farmer Flow
  farmerDashboardTitle: string;
  createLotTitle: string;
  createLotSubtitle: string;
  btnPublishLot: string;
  lotCropLabel: string;
  lotQtyLabel: string;
  lotPriceLabel: string;
  lotGradeLabel: string;
  lotLocationLabel: string;
  btnConfirmPublish: string;
  activeLotsTitle: string;
  incomingOffersTitle: string;
  btnAcceptOffer: string;
  btnRejectOffer: string;

  // Buyer Flow
  buyerMarketplaceTitle: string;
  buyerMarketplaceSubtitle: string;
  filterAllCrops: string;
  searchLotsPlaceholder: string;
  btnPlaceBid: string;
  btnConfirmBid: string;
  myBidsTitle: string;
  purchasesTitle: string;
  btnConfirmPayment: string;

  // Admin Flow
  adminTitle: string;
  adminSubtitle: string;
  activeUsers: string;
  totalGMV: string;
  commoditiesCovered: string;

  // Impact
  impactTitle: string;
  incomeBoost: string;
  arbitrageGain: string;
  commissionSaved: string;
  connectedMandis: string;
}

export const translations: Record<Language, UnifiedTranslations> = {
  en: {
    brandTitle: 'Vanijya',
    brandSubtitle: 'National Agricultural Price & Market Linkages Portal',
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

    heroPill: 'Strengthening Market Linkages & Price Discovery',
    heroHeadline: 'Know the Best Price Before You Sell.',
    heroSubheadline: 'Empowering Indian farmers and institutional buyers with real-time APMC mandi price intelligence, spatial market arbitrage, direct farm-gate bidding, and zero middleman commission.',
    btnExplorePrices: 'Check Live Mandi Prices',
    btnStartSelling: 'Sell as Farmer',
    btnSourceProduce: 'Source as Buyer',
    liveMarketHighlights: 'Live Market Intelligence & Benchmark Rates',
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

    pricesTitle: 'National Mandi Price Discovery & Intelligence',
    pricesSubtitle: 'Real-time APMC benchmark prices, spatial arbitrage opportunities, and 7-day trend analytics (No login required)',
    selectCrop: 'Select Agricultural Commodity',
    todayRate: "Today's Benchmark Price",
    weeklyAvg: '7-Day Moving Average',
    trend: 'Price Momentum',
    trendBullish: 'Bullish (Rising)',
    trendBearish: 'Bearish (Falling)',
    trendStable: 'Stable',
    sellingWindow: 'Best Selling Window Advisory',
    nearbyArbitrage: 'Nearby Market Comparison & Spatial Arbitrage',
    netGain: 'Net Arbitrage Gain',
    dailyArrivals: 'Daily Market Arrivals',

    loginTitle: 'Sign In to Vanijya Portal',
    loginSubtitle: 'Unified single-sign-on for Farmers, Wholesale Buyers, and System Administrators',
    phoneOrEmailLabel: 'Mobile Number or Email Address',
    passwordLabel: 'Password',
    roleSelectLabel: 'Select Your Account Type',
    roleFarmer: 'Farmer (किसान)',
    roleBuyer: 'Buyer (व्यापारी / Procurer)',
    roleAdmin: 'Administrator (व्यवस्थापक)',
    btnSignIn: 'Sign In to Portal',
    signingIn: 'Authenticating...',

    farmerDashboardTitle: 'Farmer Command Center',
    createLotTitle: 'Publish Crop Lot to Marketplace',
    createLotSubtitle: 'Direct farm-gate listing visible to verified commercial buyers',
    btnPublishLot: 'Publish New Crop Lot',
    lotCropLabel: 'Commodity / Crop',
    lotQtyLabel: 'Quantity (Quintals)',
    lotPriceLabel: 'Expected Rate (₹/Qtl)',
    lotGradeLabel: 'Produce Quality Grade',
    lotLocationLabel: 'Farm-Gate / Loading Location',
    btnConfirmPublish: 'Publish Crop Lot to Buyers',
    activeLotsTitle: 'My Published Crop Lots',
    incomingOffersTitle: 'Incoming Buyer Offers',
    btnAcceptOffer: 'Accept Offer',
    btnRejectOffer: 'Reject',

    buyerMarketplaceTitle: 'Commercial Agricultural Marketplace',
    buyerMarketplaceSubtitle: 'Direct farm-gate sourcing catalog with real-time APMC price comparison',
    filterAllCrops: 'All Commodities',
    searchLotsPlaceholder: 'Search by crop, location, or quality grade...',
    btnPlaceBid: 'Place Sourcing Bid',
    btnConfirmBid: 'Submit Offer',
    myBidsTitle: 'My Active Sourcing Bids',
    purchasesTitle: 'Finalized Purchase Contracts',
    btnConfirmPayment: 'Confirm Settlement (Paid)',

    adminTitle: 'Platform Administration & Impact Overview',
    adminSubtitle: 'National trade flow, active participants, and market linkage metrics',
    activeUsers: 'Active Farmers & Buyers',
    totalGMV: 'Gross Sourcing Value (GMV)',
    commoditiesCovered: 'Monitored Commodities',

    impactTitle: "Today's Vanijya Impact",
    incomeBoost: 'Farmer Income Boost',
    arbitrageGain: 'Avg Arbitrage Gain',
    commissionSaved: 'Commission Saved',
    connectedMandis: 'Active Mandis',
  },

  hi: {
    brandTitle: 'वाणिज्य',
    brandSubtitle: 'राष्ट्रीय कृषि मूल्य एवं विपणन मंच',
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

    heroPill: 'मजबूत बाजार संपर्क एवं पारदर्शी मूल्य निर्धारण',
    heroHeadline: 'फसल बेचने से पहले जानें सही और सर्वोत्तम भाव।',
    heroSubheadline: 'भारतीय किसानों और थोक खरीदारों को वास्तविक ए.पी.एम.सी. मंडी भाव, क्षेत्रीय मुनाफ़ा, सीधी डिजिटल बोली और शून्य प्रतिशत दलाली से सशक्त बनाता मंच।',
    btnExplorePrices: 'ताजा मंडी भाव देखें',
    btnStartSelling: 'किसान के रूप में बेचें',
    btnSourceProduce: 'खरीदार के रूप में खरीदें',
    liveMarketHighlights: 'ताजा मंडी मूल्य विश्लेषण एवं बेंचमार्क दरें',
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

    pricesTitle: 'राष्ट्रीय मंडी भाव खोज एवं मूल्य विश्लेषण',
    pricesSubtitle: 'वास्तविक एगमार्कनेट भाव, आस-पास की मंडियों में मुनाफ़ा और 7-दिवसीय रुझान (लॉग इन की आवश्यकता नहीं)',
    selectCrop: 'कृषि उपज / फसल चुनें',
    todayRate: 'आज का मॉडल भाव',
    weeklyAvg: '7-दिवसीय औसत भाव',
    trend: 'मूल्य रुझान',
    trendBullish: 'तेजी (बढ़ता हुआ)',
    trendBearish: 'मंदी (घटता हुआ)',
    trendStable: 'स्थिर',
    sellingWindow: 'बिक्री का सर्वोत्तम समय',
    nearbyArbitrage: 'आस-पास की मंडियों से तुलना एवं शुद्ध लाभ',
    netGain: 'अतिरिक्त शुद्ध लाभ',
    dailyArrivals: 'दैनिक मंडी आवक',

    loginTitle: 'वाणिज्य पोर्टल में प्रवेश (साइन इन)',
    loginSubtitle: 'किसानों, थोक खरीदारों और व्यवस्थापकों के लिए एकल सुरक्षित प्रवेश द्वार',
    phoneOrEmailLabel: 'मोबाइल नंबर या ईमेल पता',
    passwordLabel: 'पासवर्ड',
    roleSelectLabel: 'खाता प्रकार चुनें',
    roleFarmer: 'किसान (Farmer)',
    roleBuyer: 'थोक खरीदार (Buyer)',
    roleAdmin: 'व्यवस्थापक (Admin)',
    btnSignIn: 'पोर्टल में साइन इन करें',
    signingIn: 'सत्यापन हो रहा है...',

    farmerDashboardTitle: 'किसान नियंत्रण केंद्र (Farmer Hub)',
    createLotTitle: 'फसल लॉट बिक्री हेतु दर्ज करें',
    createLotSubtitle: 'सीधे सत्यापित थोक एवं संस्थागत खरीदारों को दृश्यमान',
    btnPublishLot: 'नई फसल बिक्री हेतु दर्ज करें',
    lotCropLabel: 'फसल का नाम',
    lotQtyLabel: 'मात्रा (क्विंटल)',
    lotPriceLabel: 'अपेक्षित भाव (₹/क्विंटल)',
    lotGradeLabel: 'गुणवत्ता ग्रेड',
    lotLocationLabel: 'खेत / उठान का स्थान',
    btnConfirmPublish: 'खरीदारों के लिए प्रकाशित करें',
    activeLotsTitle: 'मेरी दर्ज फसलें',
    incomingOffersTitle: 'प्राप्त खरीदार बोलियां',
    btnAcceptOffer: 'प्रस्ताव स्वीकारें',
    btnRejectOffer: 'अस्वीकार करें',

    buyerMarketplaceTitle: 'थोक कृषि मार्केटप्लेस',
    buyerMarketplaceSubtitle: 'खेत से सीधी खरीद सूची एवं मंडी भाव तुलना',
    filterAllCrops: 'सभी फसलें',
    searchLotsPlaceholder: 'फसल, स्थान या ग्रेड से खोजें...',
    btnPlaceBid: 'बोली लगाएं',
    btnConfirmBid: 'प्रस्ताव दर्ज करें',
    myBidsTitle: 'मेरी सक्रिय बोलियां',
    purchasesTitle: 'पक्के खरीद अनुबंध',
    btnConfirmPayment: 'भुगतान पुष्टि (Paid करें)',

    adminTitle: 'प्लेटफॉर्म प्रशासन एवं प्रभाव डैशबोर्ड',
    adminSubtitle: 'राष्ट्रीय व्यापार प्रवाह, सक्रिय प्रतिभागी और बाजार संपर्क मेट्रिक्स',
    activeUsers: 'सक्रिय किसान एवं खरीदार',
    totalGMV: 'कुल खरीद व्यापार मूल्य (GMV)',
    commoditiesCovered: 'निगरानी की जा रही फसलें',

    impactTitle: 'आज का वाणिज्य कृषक प्रभाव',
    incomeBoost: 'आय में वृद्धि',
    arbitrageGain: 'औसत आर्बिट्रेज लाभ',
    commissionSaved: 'बचत दलाली',
    connectedMandis: 'सक्रिय मंडियां',
  },

  te: {
    brandTitle: 'వాణిజ్య',
    brandSubtitle: 'జాతీయ వ్యవసాయ ధరల & మార్కెట్ అనుసంధాన పోర్టల్',
    navHome: 'హోమ్',
    navPrices: 'మండీ ధరలు',
    navMarketplace: 'మార్కెట్‌ప్లేస్',
    navSell: 'పంట అమ్మకం',
    navMyLots: 'నా పంటలు',
    navMyBids: 'నా బిడ్లు',
    navPurchases: 'కొనుగోలు కాంట్రాక్టులు',
    navDashboard: 'డ్యాష్‌బోర్డ్',
    navAnalytics: 'విశ్లేషణ',
    navProfile: 'ప్రొఫైల్',
    navLogin: 'సైన్ ఇన్',
    navLogout: 'లాగ్ అవుట్',

    heroPill: 'మార్కెట్ అనుసంధానం & పారదర్శక ధరల నిర్ణయం',
    heroHeadline: 'పంట అమ్మేముందే సరైన మరియు ఉత్తమ ధరను తెలుసుకోండి.',
    heroSubheadline: 'భారతీయ రైతులకు మరియు హోల్‌సేల్ వ్యాపారులకు వాస్తవ మార్కెట్ ధరలు, ప్రాంతీయ లాభాల పోలిక, నేరుగా డిజిటల్ బిడ్డింగ్ మరియు 0% దళారీ కమిషన్‌తో సాధికారత కల్పించే వేదిక.',
    btnExplorePrices: 'తాజా మార్కెట్ ధరలు చూడండి',
    btnStartSelling: 'రైతుగా పంట అమ్మండి',
    btnSourceProduce: 'వ్యాపారిగా సేకరించండి',
    liveMarketHighlights: 'తాజా మార్కెట్ ధరల విశ్లేషణ & బెంచ్‌మార్క్ రేట్లు',
    howItWorksTitle: 'వాణిజ్య ఎలా పనిచేస్తుంది?',
    howItWorksSubtitle: 'ధరల సమాచారం నుండి సురక్షిత బ్యాంక్ చెల్లింపుల వరకు 4 పారదర్శక దశల్లో',
    step1Title: '1. తాజా ధరల విశ్లేషణ',
    step1Desc: 'రైతులు రోజువారీ మార్కెట్ ధరలు, 7-రోజుల సగటు (SMA) మరియు సమీప మార్కెట్లలో లాభాలను పరిశీలిస్తారు.',
    step2Title: '2. పొలం నుండి నేరుగా నమోదు',
    step2Desc: 'నాణ్యత గ్రేడ్, పరిమాణం మరియు ఆశించిన ధరతో పంటను నమోదు చేయండి. ధృవీకరించబడిన వ్యాపారులకు నేరుగా కనిపిస్తుంది.',
    step3Title: '3. పారదర్శక డిజిటల్ బిడ్డింగ్',
    step3Desc: 'సంస్థాగత వ్యాపారులు మార్కెట్ ధరలను పోల్చి నేరుగా పోటీతత్వ డిజిటల్ బిడ్లను సమర్పిస్తారు.',
    step4Title: '4. తక్షణ ఒప్పందం & చెల్లింపు',
    step4Desc: 'రైతులు 1 క్లిక్‌తో ఉత్తమ ఆఫర్‌ను అంగీకరిస్తారు మరియు ఎటువంటి దళారీ లేకుండా 100% నేరుగా చెల్లింపు పొందుతారు.',
    farmerBenefitsTitle: 'రైతులు వాణిజ్యను ఎందుకు ఎంచుకుంటారు?',
    buyerBenefitsTitle: 'వ్యాపారులు వాణిజ్య ద్వారా ఎందుకు కొనుగోలు చేస్తారు?',
    govtAlignmentTitle: 'జాతీయ వ్యవసాయ విధానాలకు అనుగుణంగా',
    govtAlignmentDesc: 'ఇ-నామ్ (e-NAM) కారిడార్లు, అగ్‌మార్క్‌నెట్ ప్రమాణాలు, APMC నిబంధనలు మరియు ప్రత్యక్ష రైతు సాధికారత.',

    pricesTitle: 'జాతీయ మార్కెట్ ధరల విశ్లేషణ',
    pricesSubtitle: 'వాస్తవ APMC ధరలు, సమీప మార్కెట్ల లాభాల పోలిక మరియు 7-రోజుల ట్రెండ్స్ (లాగిన్ అవసరం లేదు)',
    selectCrop: 'పంట రకాన్ని ఎంచుకోండి',
    todayRate: 'నేటి మోడల్ ధర',
    weeklyAvg: '7-రోజుల సగటు ధర',
    trend: 'ధరల సరళి',
    trendBullish: 'పెరుగుదల (Bullish)',
    trendBearish: 'తగ్గుదల (Bearish)',
    trendStable: 'స్థిరంగా ఉంది',
    sellingWindow: 'అమ్మకానికి ఉత్తమ సమయం',
    nearbyArbitrage: 'సమీప మార్కెట్ల పోలిక & నికర లాభం',
    netGain: 'అదనపు నికర లాభం',
    dailyArrivals: 'రోజువారీ మార్కెట్ రాకలు',

    loginTitle: 'వాణిజ్య పోర్టల్‌లోకి ప్రవేశించండి (Sign In)',
    loginSubtitle: 'రైతులు, హోల్‌సేల్ వ్యాపారులు మరియు నిర్వాహకుల కోసం ఏకీకృత లాగిన్',
    phoneOrEmailLabel: 'మొబైల్ నంబర్ లేదా ఈమెయిల్',
    passwordLabel: 'పాస్‌వర్డ్',
    roleSelectLabel: 'ఖాతా రకాన్ని ఎంచుకోండి',
    roleFarmer: 'రైతు (Farmer)',
    roleBuyer: 'వ్యాపారి (Buyer)',
    roleAdmin: 'నిర్వాహకుడు (Admin)',
    btnSignIn: 'పోర్టల్‌లో సైన్ ఇన్ అవ్వండి',
    signingIn: 'ప్రవేశిస్తోంది...',

    farmerDashboardTitle: 'రైతు నియంత్రణ కేంద్రం (Farmer Hub)',
    createLotTitle: 'పంట లాట్‌ను అమ్మకానికి నమోదు చేయండి',
    createLotSubtitle: 'ధృవీకరించబడిన హోల్‌సేల్ వ్యాపారులకు నేరుగా కనిపిస్తుంది',
    btnPublishLot: 'కొత్త పంట లాట్ నమోదు చేయండి',
    lotCropLabel: 'పంట పేరు',
    lotQtyLabel: 'పరిమాణం (క్వింటాళ్ళు)',
    lotPriceLabel: 'ఆశించిన ధర (₹/Qtl)',
    lotGradeLabel: 'నాణ్యత గ్రేడ్',
    lotLocationLabel: 'పొలం / లోడింగ్ ప్రాంతం',
    btnConfirmPublish: 'వ్యాపారుల కోసం ప్రకటించండి',
    activeLotsTitle: 'నా నమోదిత పంట లాట్లు',
    incomingOffersTitle: 'వచ్చిన కొనుగోలు ఆఫర్లు',
    btnAcceptOffer: 'ఆఫర్ అంగీకరించు',
    btnRejectOffer: 'తిరస్కరించు',

    buyerMarketplaceTitle: 'హోల్‌సేల్ వ్యవసాయ మార్కెట్‌ప్లేస్',
    buyerMarketplaceSubtitle: 'పొలం నుండి నేరుగా కొనుగోలు కేటలాగ్ మరియు ధరల పోలిక',
    filterAllCrops: 'అన్ని పంటలు',
    searchLotsPlaceholder: 'పంట, ప్రాంతం లేదా గ్రేడ్ ద్వారా వెతకండి...',
    btnPlaceBid: 'బిడ్ వేయండి',
    btnConfirmBid: 'ఆఫర్ సమర్పించు',
    myBidsTitle: 'నా క్రియాశీల బిడ్లు',
    purchasesTitle: 'ఖరారైన కొనుగోలు కాంట్రాక్టులు',
    btnConfirmPayment: 'చెల్లింపు నిర్ధారించు (PAID)',

    adminTitle: 'ప్లాట్‌ఫామ్ అడ్మినిస్ట్రేషన్ & ఇంపాక్ట్ డ్యాష్‌బోర్డ్',
    adminSubtitle: 'జాతీయ వాణిజ్య ప్రవాహం, క్రియాశీల వినియోగదారులు మరియు మార్కెట్ అనుసంధాన సూచికలు',
    activeUsers: 'క్రియాశీల రైతులు & వ్యాపారులు',
    totalGMV: 'మొత్తం సేకరణ విలువ (GMV)',
    commoditiesCovered: 'పర్యవేక్షించబడుతున్న పంటలు',

    impactTitle: 'నేటి వాణిజ్య రైతు లాభ ప్రభావం',
    incomeBoost: 'ఆదాయంలో పెరుగుదల',
    arbitrageGain: 'సగటు లాభం',
    commissionSaved: 'ఆదా అయిన కమిషన్',
    connectedMandis: 'క్రియాశీల మార్కెట్లు',
  },
};
