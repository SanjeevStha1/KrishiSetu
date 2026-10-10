export interface AgriNewsArticle {
  id: string;
  title: string;
  titleNe: string;
  source: string;
  sourceNe: string;
  sourceUrl?: string;
  sourceType: 'gov' | 'research' | 'mandi' | 'weather' | 'media';
  publishedAt: string;
  publishedAtNe: string;
  readTimeMin: number;
  category: 'market' | 'policy' | 'research' | 'weather' | 'subsidies';
  categoryLabelEn: string;
  categoryLabelNe: string;
  district?: string;
  province?: string;
  imageUrl: string;
  summaryEn: string;
  summaryNe: string;
  contentEn: string[];
  contentNe: string[];
  keyTakeawaysEn: string[];
  keyTakeawaysNe: string[];
  impactedCrops: string[];
  farmerActionEn: string;
  farmerActionNe: string;
  verifiedOfficial: boolean;
  featured?: boolean;
}

export const AGRI_NEWS_ARTICLES: AgriNewsArticle[] = [
  {
    id: 'news-moald-fertilizer-quota-2026',
    title: 'MoALD Announces Revised Chemical & Organic Fertilizer Subsidy Quotas for Smallholders',
    titleNe: 'रासायनिक तथा प्राङ्गारिक मलमा संघीय अनुदान कोटा सार्वजनिक — स्थानीय सहकारीमार्फत वितरण हुने',
    source: 'Ministry of Agriculture and Livestock Development (MoALD)',
    sourceNe: 'कृषि तथा पशुपन्छी विकास मन्त्रालय',
    sourceUrl: 'https://moald.gov.np',
    sourceType: 'gov',
    publishedAt: 'Today, 8:30 AM',
    publishedAtNe: 'आज, बिहान ८:३०',
    readTimeMin: 3,
    category: 'subsidies',
    categoryLabelEn: 'Subsidies & Policy',
    categoryLabelNe: 'अनुदान र नीति',
    district: 'chitwan',
    province: 'Bagmati',
    imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80',
    summaryEn: 'The Ministry of Agriculture has allocated 45,000 MT of subsidized Urea and DAP for central commercial vegetable corridors, prioritized via registered cooperatives.',
    summaryNe: 'बागमती र तराईका व्यावसायिक तरकारी पकेट क्षेत्रका लागि ४५ हजार मेट्रिक टन अनुदानको युरिया र डीएपी मल स्वीकृत, दर्ता भएका स्थानीय सहकारीबाट वितरण गरिने।',
    contentEn: [
      'The Ministry of Agriculture and Livestock Development (MoALD) confirmed the immediate release of 45,000 MT of chemical fertilizers (Urea, DAP, and Potash) subsidized up to 65% for smallholder vegetable and staple crops.',
      'Under the newly digitized Krishi Sahakari allotment guidelines, farmers registered with KrishiSetu or ward-level agriculture branches can present their national ID or citizen card to procure authorized quotas at government-mandated ceiling prices.',
      'Special priority is assigned to the Narayani vegetable corridor, Panchkhal valley, and Dhading Trishuli basin to support upcoming nursery transplants and prevent unauthorized black-market surcharges.'
    ],
    contentNe: [
      'कृषि तथा पशुपन्छी विकास मन्त्रालयले व्यावसायिक तरकारी तथा खाद्यान्न बालीका लागि ६५ प्रतिशतसम्म अनुदान प्राप्त ४५ हजार मेट्रिक टन रासायनिक मल (युरिया, डीएपी र पोटास) तुरुन्तै निकासी गर्ने निर्णय गरेको छ।',
      'स्थानीय तहका कृषि शाखा र सहकारी संस्थाहरूमार्फत किसान परिचयपत्र वा नागरिकताको आधारमा सरकारले तोकेको दरमा मल उपलब्ध गराइनेछ।',
      'विशेषगरी चितवन, धादिङ र काभ्रेका तरकारी पकेट क्षेत्रलाई पहिलो प्राथमिकतामा राखी कालोबजारी रोक्न अनुगमन टोली समेत खटाइएको छ।'
    ],
    keyTakeawaysEn: [
      'Subsidized Urea capped at Rs 1,150 / 50kg bag; DAP capped at Rs 2,450 / 50kg bag.',
      'Mandatory registration via Ward Krishi Shakha or Agricultural Cooperative.',
      'Dedicated fast-track quota for commercial greenhouse and tunnel tomato growers.'
    ],
    keyTakeawaysNe: [
      'अनुदानित युरिया प्रति ५० केजी बोरा रु १,१५० र डीएपी रु २,४५० मा उपलब्ध हुने।',
      'वडा कृषि शाखा वा स्थानीय कृषि सहकारीमा दर्ता भएको हुनुपर्ने।',
      'टनेल गोलभेडा र काउली उत्पादक कृषकलाई प्राथमिकता।'
    ],
    impactedCrops: ['tomato', 'potato', 'cauliflower', 'cabbage'],
    farmerActionEn: 'Visit your local ward agricultural cooperative with your KrishiSetu farm records to reserve your allotted allocation before weekend delivery.',
    farmerActionNe: 'आफ्नो वडा कृषि शाखा वा नजिकको कृषि सहकारीमा गई तुरुन्तै आफ्नो नाम र जग्गा विवरण अनुसारको मल कोटा सुरक्षित गर्नुहोस्।',
    verifiedOfficial: true,
    featured: true,
  },
  {
    id: 'news-kfvmdb-kalimati-market-trend',
    title: 'Daily Kalimati Tomato & Cauliflower Arrivals Cross 52 Tons as Highway Freight Rebounds',
    titleNe: 'कालीमाटी मन्डीमा गोलभेडा र काउलीको आगमन ५२ टन नाघ्यो — थोक मूल्य स्थिर रहने',
    source: 'Kalimati Fruits & Vegetable Market Development Board (KFVMDB)',
    sourceNe: 'कालीमाटी फलफूल तथा तरकारी बजार विकास समिति',
    sourceUrl: 'https://kalimatimarket.gov.np',
    sourceType: 'mandi',
    publishedAt: 'Yesterday, 4:15 PM',
    publishedAtNe: 'हिजो, दिउँसो ४:१५',
    readTimeMin: 2,
    category: 'market',
    categoryLabelEn: 'Mandi Rates & Trends',
    categoryLabelNe: 'बजार तथा मूल्य',
    district: 'kathmandu',
    province: 'Bagmati',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    summaryEn: 'Heavy night truck convoys from Dhading, Kavre, and Chitwan restored steady vegetable supply into Kathmandu, keeping wholesale tomato prices stable at Rs 52–55/kg.',
    summaryNe: 'धादिङ, काभ्रे र चितवनबाट रात्रिकालीन ट्रकहरू आइपुगेपछि काठमाडौं उपत्यकामा गोलभेडा र काउलीको आपूर्ति सहज बनेको छ। थोक मूल्य रु ५२-५५ मा स्थिर।',
    contentEn: [
      'The Kalimati Fruits and Vegetable Market Development Board recorded 52.5 metric tons of fresh tomato arrivals and 38.0 metric tons of local cauliflower during morning trading.',
      'With road maintenance on the Narayanghat-Mugling corridor easing nighttime transit bottlenecks, freight delays were reduced from 4.5 hours to under 90 minutes.',
      'Traders report robust hotel and restaurant catering demand, providing steady farmgate returns for farmers utilizing pooled mini-truck transport.'
    ],
    contentNe: [
      'कालीमाटी फलफूल तथा तरकारी बजार विकास समितिका अनुसार आज बिहान ५२.५ मेट्रिक टन ताजा गोलभेडा र ३८ टन स्थानीय काउली भित्रिएको छ।',
      'नारायणगढ-मुग्लिन सडक खण्डमा रात्रिकालीन जाम घटेसँगै ढुवानी समय सामान्य अवस्थामा फर्किएको छ।',
      'काठमाडौंमा बिहेको सिजन र पार्टी प्यालेसहरूको माग उच्च रहेकाले थोक बजारमा तरकारीको माग सन्तोषजनक रहेको व्यापारीहरूको भनाइ छ।'
    ],
    keyTakeawaysEn: [
      'Wholesale local tomato: Rs 50 - 55 per kg.',
      'Local cauliflower: Rs 62 - 68 per kg with strong upward pressure.',
      'Pooled refrigerated transport saving farmers Rs 5.10/kg over solo freight.'
    ],
    keyTakeawaysNe: [
      'स्थानीय गोलभेडा थोक दर: रु ५० देखि ५५ प्रति केजी।',
      'स्थानीय काउली थोक दर: रु ६२ देखि ६८ प्रति केजी।',
      'साझा ढुवानी प्रयोग गर्ने किसानको ढुवानी खर्चमा प्रति केजी रु ५ बचत।'
    ],
    impactedCrops: ['tomato', 'cauliflower', 'cabbage'],
    farmerActionEn: 'Coordinate with neighboring farmers on KrishiSetu Transport Pool to dispatch harvests before 3:00 PM to capture morning spot auctions.',
    farmerActionNe: 'बिहानी थोक अक्सनमा राम्रो मूल्य पाउन दिउँसो ३ बजेभित्र कृषिसेतु साझा गाडीमार्फत तरकारी पठाउनुहोस्।',
    verifiedOfficial: true,
    featured: false,
  },
  {
    id: 'news-narc-late-blight-advisory',
    title: 'NARC Releases Scientific Advisory on Biological Late Blight Management for Tunnel Tomatoes',
    titleNe: 'टनेल गोलभेडामा डडुवा रोग (Late Blight) नियन्त्रणका लागि नार्कद्वारा जैविक प्रविधि सिफारिस',
    source: 'Nepal Agricultural Research Council (NARC)',
    sourceNe: 'नेपाल कृषि अनुसन्धान परिषद (नार्क)',
    sourceUrl: 'https://narc.gov.np',
    sourceType: 'research',
    publishedAt: '2 days ago',
    publishedAtNe: '२ दिन अगाडि',
    readTimeMin: 4,
    category: 'research',
    categoryLabelEn: 'Agronomy & Tech',
    categoryLabelNe: 'कृषि प्रविधि र अनुसन्धान',
    district: 'kavre',
    province: 'Bagmati',
    imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&auto=format&fit=crop&q=80',
    summaryEn: 'Pathologists at Khumaltar Horticulture Research Station have evaluated Trichoderma and copper-based foliar sprays for cost-effective suppression of fungal blight.',
    summaryNe: 'खुमलटारस्थित नार्कका बाली रोग विशेषज्ञहरूले टनेल गोलभेडामा डडुवा रोकथामका लागि ट्राइकोडर्मा र तामायुक्त जैविक ढुसीनाशक औषधिको प्रभावकारी विधि सार्वजनिक गरेका छन्।',
    contentEn: [
      'With fluctuations between day heat and night condensation inside plastic tunnels, early signs of Phytophthora infestans (Late Blight) have been detected across mid-hill farms.',
      'NARC scientists urge farmers to avoid excessive nitrogen application, which makes leaf tissues succulent and vulnerable to fungal spores.',
      'Recommended control: Foliar application of Copper Oxychloride (2.5g per litre of water) combined with biological biocontrol agent Trichoderma harzianum soil drenching.'
    ],
    contentNe: [
      'टनेलभित्रको तापक्रम र रात्रिकालीन ओसका कारण मध्यपहाडी क्षेत्रका गोलभेडामा डडुवा रोगको जोखिम बढेको नार्कले जनाएको छ।',
      'पातमा खैरो-कालो दाग देखिनासाथ नाइट्रोजनयुक्त रासायनिक मलको प्रयोग तुरुन्त रोक्न र पर्याप्त हावा आवतजावत हुने व्यवस्था मिलाउन सुझाइएको छ।',
      'कपर अक्सिक्लोराइड (Copper Oxychloride) २.५ ग्राम प्रति लिटर पानीमा घोलेर छर्कने र फेदमा ट्राइकोडर्मा प्रयोग गर्दा ९०% सम्म रोग नियन्त्रण हुन्छ।'
    ],
    keyTakeawaysEn: [
      'Maintain tunnel ventilation during 11:00 AM to 3:00 PM.',
      'Apply bio-fungicides proactively before heavy precipitation.',
      'Remove and bury infected lower canopy leaves immediately.'
    ],
    keyTakeawaysNe: [
      'दिउँसो ११ देखि ३ बजेसम्म टनेलको दुवै छेउ खुला राखी हावा खेल्न दिने।',
      'रोग लागेका तल्लो पातहरू तुरुन्तै टिपेर खाल्टोमा पुर्ने वा नष्ट गर्ने।',
      'तामायुक्त ढुसीनाशक औषधि प्रति लिटर पानीमा २.५ ग्रामका दरले छर्कने।'
    ],
    impactedCrops: ['tomato', 'potato', 'capsicum'],
    farmerActionEn: 'Inspect leaf undersides for white fungal fuzz each morning; inspect your drip irrigation lines to avoid wet foliage overnight.',
    farmerActionNe: 'हरेक बिहान गोलभेडाको पात पछाडि सेतो ढुसी छ कि छैन जाँच्नुहोस् र बोटको पात नभिज्ने गरी फेदमा मात्र पानी दिनुहोस्।',
    verifiedOfficial: true,
    featured: false,
  },
  {
    id: 'news-dhm-agro-weather-bulletin',
    title: 'DHM Agro-Meteorological Bulletin: Moderate Pre-Monsoon Rains Expected in Bagmati & Gandaki',
    titleNe: 'कृषि मौसम विशेष बुलेटिन: बागमती र गण्डकीमा हल्का वर्षाको सम्भावना, जल निकास मिलाउन आग्रह',
    source: 'Department of Hydrology & Meteorology (DHM)',
    sourceNe: 'जल तथा मौसम विज्ञान विभाग',
    sourceUrl: 'https://dhm.gov.np',
    sourceType: 'weather',
    publishedAt: 'Today, 6:00 AM',
    publishedAtNe: 'आज, बिहान ६:००',
    readTimeMin: 2,
    category: 'weather',
    categoryLabelEn: 'Weather & Climate',
    categoryLabelNe: 'मौसम र जलस्रोत',
    district: 'dhading',
    province: 'Bagmati',
    imageUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&auto=format&fit=crop&q=80',
    summaryEn: 'Western disturbance and local convective clouds will bring light to moderate afternoon rain across hill vegetable basins for the next 72 hours.',
    summaryNe: 'पश्चिमी वायु र स्थानीय वायुको प्रभावले आगामी ३ दिन बागमती र गण्डकीका पहाडी उपत्यकामा मेघगर्जनसहित हल्का वर्षा हुने सम्भावना, कुलेसो बनाई पानी निकास गर्न आग्रह।',
    contentEn: [
      'The DHM Agro-Meteorological Advisory Unit advises farmers in Dhading, Makwanpur, and Chitwan to inspect field drainage channels.',
      'While the precipitation benefits pre-planting soil conditioning for maize and early autumn vegetables, waterlogging in lowland potato and cole crops must be prevented.',
      'Hailstone protection netting is strongly recommended for fruit orchards and early sweet bell peppers in exposed mid-hill ridges.'
    ],
    contentNe: [
      'मौसम पूर्वानुमान महाशाखाले आगामी ७२ घण्टामा धादिङ, मकवानपुर, काभ्रे र चितवनका केही स्थानमा मध्यम वर्षाको सम्भावना देखाएको छ।',
      'यो वर्षाले मकै र वर्षे तरकारीको ब्याड राख्न सहयोग पुर्‍याउने भए पनि तयार हुन लागेको आलु र काउलीको खेतमा पानी जम्न नदिन सचेत गराइएको छ।',
      'असिनाको जोखिम रहेकाले महँगा तरकारी बालीमा असिना छेक्ने जाली (Hail Net) प्रयोग गर्न अनुरोध गरिएको छ।'
    ],
    keyTakeawaysEn: [
      'Clear drainage furrows between vegetable beds.',
      'Postpone chemical pesticide spraying until clear sunny breaks.',
      'Optimal window for plowing fallow plots to conserve soil moisture.'
    ],
    keyTakeawaysNe: [
      'बारीका कुलेसा सफा गरी पानी जम्न नदिने व्यवस्था मिलाउने।',
      'पानी पर्ने सम्भावना भएको समयमा विषादी वा मल नछर्कने।',
      'वर्षा लगत्तै बाँझो जग्गा जोतेर माटोको चिस्यान सुरक्षित राख्ने।'
    ],
    impactedCrops: ['potato', 'cauliflower', 'tomato', 'cabbage'],
    farmerActionEn: 'Check your field drainage canals before noon today; postpone foliar pesticide application until weather clears.',
    farmerActionNe: 'आजै दिउँसोभित्र खेतबारीका निकास कुलेसा सफा गर्नुहोस् र पानी रोकिएपछि मात्र विषादी छर्कनुहोस्।',
    verifiedOfficial: true,
    featured: false,
  },
  {
    id: 'news-krishi-gyan-kendra-subsidies',
    title: 'Krishi Gyan Kendra Announces 70% Subsidies for Solar Pumps & Micro-Drip Irrigation',
    titleNe: 'कृषि ज्ञान केन्द्रद्वारा सौर्य सिँचाइ र थोपा सिँचाइ प्रणालीमा ७०% अनुदान आह्वान',
    source: 'Krishi Gyan Kendra (Agriculture Knowledge Center)',
    sourceNe: 'कृषि ज्ञान केन्द्र, बागमती प्रदेश',
    sourceUrl: 'https://bagmati.gov.np',
    sourceType: 'gov',
    publishedAt: '3 days ago',
    publishedAtNe: '३ दिन अगाडि',
    readTimeMin: 3,
    category: 'subsidies',
    categoryLabelEn: 'Subsidies & Policy',
    categoryLabelNe: 'अनुदान र नीति',
    district: 'chitwan',
    province: 'Bagmati',
    imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
    summaryEn: 'Commercial farming groups and individual smallholders cultivating at least 2 Ropani can apply for solar pumping and smart drip kits until the end of the month.',
    summaryNe: 'कम्तीमा २ रोपनीमा व्यावसायिक तरकारी खेती गर्ने किसान समूह र व्यक्तिहरूले ७० प्रतिशत अनुदानमा सोलार पम्प र थोपा सिँचाइ प्राप्त गर्न आवेदन दिन सक्ने।',
    contentEn: [
      'The Provincial Agriculture Development Directorate has issued an open grant notice for smallholder mechanization and climate-resilient water pumping.',
      'Eligible farmers can receive up to Rs 250,000 subsidy towards certified solar water pumping systems and precision drip irrigation setups with fertigation venturi injectors.',
      'Applications must include land ownership papers (or minimum 3-year lease contract), tax clearance recommendation from the ward, and KrishiSetu farm record estimates.'
    ],
    contentNe: [
      'बागमती प्रदेश कृषि विकास निर्देशनालयले साना किसानहरूका लागि जलवायु अनुकूलन सिँचाइ कार्यक्रम अन्तर्गत अनुदान सूचना जारी गरेको छ।',
      'यस कार्यक्रम अन्तर्गत सौर्य सिँचाइ पम्पिङ र थोपा सिँचाइ सेट खरिदमा अधिकतम रु २ लाख ५० हजारसम्म अनुदान उपलब्ध गराइनेछ।',
      'आवेदनका साथ लालपुर्जा (वा कम्तीमा ३ वर्षको भाडा सम्झौता), वडाको सिफारिस र कृषिसेतु बाली विवरण संलग्न गर्नुपर्नेछ।'
    ],
    keyTakeawaysEn: [
      '70% government funding; 30% farmer cost-share.',
      'Covers solar PV array, submersible/surface pump, drip lines, and filter unit.',
      'Application deadline: 25 days remaining.'
    ],
    keyTakeawaysNe: [
      '७० प्रतिशत सरकारी अनुदान; ३० प्रतिशत मात्र किसानको लगानी।',
      'सोलार प्यानल, पम्प, पाइप र थोपा सिँचाइ सेट पूर्ण रूपमा समावेश।',
      'आवेदन दिने म्याद २५ दिन बाँकी।'
    ],
    impactedCrops: ['tomato', 'cauliflower', 'capsicum', 'green_chilli'],
    farmerActionEn: 'Download your digitized farm summary report from your KrishiSetu Farm Records dashboard to attach as official proof of commercial production.',
    farmerActionNe: 'आफ्नो कृषिसेतु फार्म रेकर्डबाट खेती विवरण डाउनलोड गरी आवेदन फारमसँगै ज्ञान केन्द्रमा पेश गर्नुहोस्।',
    verifiedOfficial: true,
    featured: false,
  },
  {
    id: 'news-export-ginger-cardamom-surge',
    title: 'Nepal Ginger and Large Cardamom Exports Jump 22% as Global Demand Soars',
    titleNe: 'नेपाली अदुवा र अलैंची निर्यातमा २२ प्रतिशत वृद्धि — अन्तर्राष्ट्रिय बजारमा माग बढ्यो',
    source: 'Trade and Export Promotion Centre (TEPC Nepal)',
    sourceNe: 'व्यापार तथा निकासी प्रवर्द्धन केन्द्र',
    sourceUrl: 'https://tepc.gov.np',
    sourceType: 'media',
    publishedAt: '4 days ago',
    publishedAtNe: '४ दिन अगाडि',
    readTimeMin: 3,
    category: 'market',
    categoryLabelEn: 'Mandi Rates & Trends',
    categoryLabelNe: 'बजार तथा मूल्य',
    district: 'kavre',
    province: 'Koshi',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80',
    summaryEn: 'High-value spices from Nepal are commanding premium prices in international wholesale terminals following modern washing and moisture testing certifications.',
    summaryNe: 'सफा गरिएको र गुणस्तर परीक्षण भएको नेपाली अदुवा र अलैंचीले अन्तर्राष्ट्रिय बजारमा ऐतिहासिक मूल्य पाएको छ, किसानको फार्मगेट मूल्य प्रति केजी रु ११० पुग्यो।',
    contentEn: [
      'Nepal Trade and Export Promotion Centre statistics show ginger and cardamom export earnings topped Rs 8.4 billion in the recent nine-month reporting cycle.',
      'With organic certification and localized washing plants operating in Eastern and Central hills, raw ginger wastage was cut by 34%.',
      'Export traders in Kakarbhitta and Birgunj dry ports report sustained forward contract bookings through next season.'
    ],
    contentNe: [
      'व्यापार तथा निकासी प्रवर्द्धन केन्द्रको पछिल्लो प्रतिवेदन अनुसार अदुवा र अलैंचीको निर्यातबाट ९ महिनामा रु ८ अर्ब ४० करोड भन्दा बढी विदेशी मुद्रा भित्रिएको छ।',
      'आधुनिक प्रशोधन, धुलाइ र ग्रेडिङ गरिएका कारण नेपाली अदुवाको गुणस्तर सुध्रिएर निर्यातकर्ताहरूले किसानलाई सिधै उच्च मूल्य दिन थालेका छन्।',
      'पहाडी क्षेत्रका अदुवा उत्पादक किसानहरूले स्थानीय संकलन केन्द्रमार्फत समूहमा बिक्री गर्दा थप नाफा कमाइरहेका छन्।'
    ],
    keyTakeawaysEn: [
      'Washed fresh ginger farmgate price: Rs 95 - 110 per kg.',
      'Jumbo dried large cardamom: Rs 1,450 per kg.',
      'Quality grading adds up to 28% premium at harvest.'
    ],
    keyTakeawaysNe: [
      'सफा गरिएको ताजा अदुवाको फार्मगेट मूल्य: रु ९५ देखि ११० प्रति केजी।',
      'अलैंचीको मूल्य प्रति केजी रु १,४५० सम्म पुगेको।',
      'ग्रेडिङ र सुकाउने प्रविधि अपनाउँदा २८% बढी मूल्य पाइने।'
    ],
    impactedCrops: ['ginger', 'cardamom'],
    farmerActionEn: 'Clean, grade, and sun-dry your spice harvests thoroughly before sale; avoid mixing undersized or diseased rhizomes.',
    farmerActionNe: 'अदुवा बेच्नुअघि राम्ररी माटो पखालेर ग्रेडिङ गर्नुहोस्, साना र चोट लागेका गानो छुट्याएर बेच्दा उच्च मूल्य पाइन्छ।',
    verifiedOfficial: true,
    featured: false,
  },
  {
    id: 'news-sqcc-certified-seed-directory',
    title: 'Seed Quality Control Centre Issues 2026 Directory of Certified Hybrid Vegetable Seeds',
    titleNe: 'बीउ विजन गुणस्तर नियन्त्रण केन्द्रद्वारा प्रमाणित हाइब्रिड बीउको आधिकारिक सूची सार्वजनिक',
    source: 'Seed Quality Control Centre (SQCC)',
    sourceNe: 'बीउ विजन गुणस्तर नियन्त्रण केन्द्र',
    sourceUrl: 'https://sqcc.gov.np',
    sourceType: 'research',
    publishedAt: '5 days ago',
    publishedAtNe: '५ दिन अगाडि',
    readTimeMin: 3,
    category: 'research',
    categoryLabelEn: 'Agronomy & Tech',
    categoryLabelNe: 'कृषि प्रविधि र अनुसन्धान',
    district: 'chitwan',
    province: 'Bagmati',
    imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&auto=format&fit=crop&q=80',
    summaryEn: 'To protect smallholders from spurious imports, SQCC released hologram verification standards for popular commercial seeds including Srijana Tomato and Snow Myst Cauliflower.',
    summaryNe: 'नक्कली र कम गुणस्तरको बीउबाट किसानलाई जोगाउन बीउ विजन केन्द्रले होलोग्राम ट्यागसहितको आधिकारिक सूची र दर्तावाल एग्रोभेटको विवरण सार्वजनिक गरेको छ।',
    contentEn: [
      'Smallholder farmers frequently suffer total crop failure when uncertified seed varieties with low germination rates are sold by informal vendors.',
      'SQCC has mandated that all commercial vegetable seed packets must display an authentic security seal and valid germination test date within 9 months of purchase.',
      'Farmers can verify seed packets via SMS or by scanning the holographic serial tag with the KrishiSetu camera assistant.'
    ],
    contentNe: [
      'विगतमा नक्कली बीउका कारण किसानहरूले व्यहोर्नुपरेको ठूलो क्षतिलाई मध्यनजर गर्दै बीउ विजन गुणस्तर नियन्त्रण केन्द्रले कडा निर्देशिका जारी गरेको छ।',
      'सृजना गोलभेडा, स्नो मिस्ट काउली लगायतका प्रमुख तरकारी बीउको प्याकेटमा अब आधिकारिक होलोग्राम ट्याग र अंकुरण प्रतिशत अनिवार्य गरिएको छ।',
      'किसानहरूले बीउ किन्दा अनिवार्य रूपमा भ्याट बिल लिन र अधिकृत एग्रोभेटबाट मात्र बीउ खरिद गर्न आग्रह गरिएको छ।'
    ],
    keyTakeawaysEn: [
      'Demand authorized VAT/PAN receipt when purchasing seeds from Agrovets.',
      'Check standard germination rate (>85% required by national law).',
      'Do not purchase opened or re-packed loose seed packets.'
    ],
    keyTakeawaysNe: [
      'एग्रोभेटबाट बीउ किन्दा अनिवार्य रूपमा आधिकारिक बिल माग्ने।',
      'प्याकेटमा उल्लेख भएको अंकुरण क्षमता (८५% भन्दा माथि) जाँच गर्ने।',
      'खुल्ला वा सिल तोडिएको बीउको प्याकेट कहिल्यै खरिद नगर्ने।'
    ],
    impactedCrops: ['tomato', 'cauliflower', 'cabbage', 'onion'],
    farmerActionEn: 'Always retain seed batch packets and payment receipts until first harvest in case compensation claims are needed.',
    farmerActionNe: 'बाली नसकिउञ्जेल बीउको खाली प्याकेट र बिल सुरक्षित राख्नुहोस्, ताकि समस्या आएमा क्षतिपूर्ति दाबी गर्न सकियोस्।',
    verifiedOfficial: true,
    featured: false,
  }
];
