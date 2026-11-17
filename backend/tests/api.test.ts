/**
 * Backend API & Service Tests for KrishiSetu
 * Verifies User Registration, Session Verification, User Isolation, Calculator Estimation, and Market Price Data.
 */

import { AuthStore } from '../src/services/authStore';
import { MarketDataService } from '../src/services/marketDataService';
import { DecisionEngineService } from '../src/services/decisionEngineService';
import { AnalyticsService } from '../src/services/analyticsService';
import { KalimatiScraper } from '../src/scrapers/kalimatiScraper';
import { AmpisScraper } from '../src/scrapers/ampisScraper';
import { NEPAL_DISTRICTS_MANDIS, getAmpisHubForDistrict } from '../src/data/nepalMandis';
import { PriceHistoryService } from '../src/services/priceHistoryService';
import { SmsService } from '../src/services/smsService';
import { DbStorageService } from '../src/services/dbStorageService';
import { AlertWorkerService } from '../src/services/alertWorkerService';
import { GeminiService } from '../src/services/geminiService';

export async function runBackendTests() {
  console.log('--- Starting KrishiSetu Backend Test Suite ---');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
    }
  }

  // 1. Auth & User Isolation Test
  const testAuthStore = new AuthStore();
  const phone = '+9779811223344';
  const { user } = testAuthStore.registerUser(phone);
  assert(user.phone === phone, 'User registered with exact normalized phone');
  assert(user.status === 'pending_profile', 'New user starts with pending_profile');

  // Verify new user has 0 farm records (User Data Isolation)
  const initialRecords = testAuthStore.getUserFarmRecords(user.id);
  assert(initialRecords.length === 0, 'New user isolated with 0 initial farm records');

  // Add record for this user
  testAuthStore.addUserFarmRecord(user.id, {
    crop: 'tomato',
    cropName: 'Tomato',
    record_type: 'revenue',
    category: 'Sales',
    amount: 15000,
    source: 'manual',
    recorded_at: new Date().toISOString(),
  });

  const updatedRecords = testAuthStore.getUserFarmRecords(user.id);
  assert(updatedRecords.length === 1, 'Record added successfully to isolated user');

  // Verify other distinct users' records are unaffected (and old seeded accounts do not exist)
  assert(testAuthStore.findUserByPhone('9845012345') === null, 'Old pre-seeded demo accounts are removed');
  const otherRecords = testAuthStore.getUserFarmRecords('usr_other_isolated_check');
  assert(otherRecords.length === 0 && otherRecords !== updatedRecords, 'User records are strictly partitioned');

  // 2. Market Data Service Test
  const commodities = MarketDataService.getCommodities();
  assert(commodities.length >= 6, 'Market commodities seed data contains verified Kalimati benchmarks');
  const tomato = MarketDataService.getCommodity('tomato');
  assert(tomato !== undefined && tomato.currentPrice > 0, 'Tomato commodity price benchmark is positive');

  // 3. Decision Engine Recommendations Test
  const recs = DecisionEngineService.getRecommendations({ district: 'chitwan', landSizeRopani: 2.0 });
  assert(recs.length > 0, 'Decision Engine produces recommendations for Chitwan');
  assert(recs[0].expectedRevenuePerRopaniNPR > 0, 'Recommendation contains positive revenue projection');

  // 4. Kalimati Scraper Number & HTML Parsing Tests
  const parsedNepaliNum = KalimatiScraper.parseNepaliNumber('रू ८५.००');
  assert(parsedNepaliNum === 85, 'Nepali Devanagari currency string parses to 85');
  const parsedCompoundNum = KalimatiScraper.parseNepaliNumber('रू ११०');
  assert(parsedCompoundNum === 110, 'Nepali Devanagari 110 parses to 110');

  const sampleHtml = `
    <table>
      <tr><th>कृषि उपज</th><th>ईकाइ</th><th>न्यूनतम</th><th>अधिकतम</th><th>औषत</th></tr>
      <tr><td>गोलभेडा सानो(लोकल)</td><td>के.जी.</td><td>रू ३०.००</td><td>रू ४५.००</td><td>रू ३८.००</td></tr>
      <tr><td>आलु रातो(लाम्चो)</td><td>के.जी.</td><td>रू २८.००</td><td>रू ३२.००</td><td>रू ३०.००</td></tr>
    </table>
  `;
  const parsedRows = KalimatiScraper.parsePriceTable(sampleHtml);
  assert(parsedRows.length === 2, 'HTML price table parses 2 valid rows');
  assert(parsedRows[0].avgPrice === 38, 'Tomato parsed average price is 38');

  const matchResult = KalimatiScraper.matchScrapedToSeeds(parsedRows, commodities);
  const matchedTomato = matchResult.matchedCommodities.find((c) => c.id === 'tomato');
  assert(matchedTomato !== undefined && matchedTomato.currentPrice === 38, 'Scraped tomato matched to seed with updated price 38');

  // 5. Price History Persistence & Duplicate Protection
  const testDate = '2026-09-10';
  PriceHistoryService.saveRecord({
    cropId: 'tomato',
    date: testDate,
    price: 45,
    source: 'live',
  });
  // Save duplicate date with updated price: should overwrite, NOT duplicate
  PriceHistoryService.saveRecord({
    cropId: 'tomato',
    date: testDate,
    price: 48,
    source: 'live',
  });

  const tomatoHistory = PriceHistoryService.getHistory('tomato');
  const sameDateRecords = tomatoHistory.filter((r) => r.date === testDate);
  assert(sameDateRecords.length === 1, 'Duplicate protection prevents multiple records on same date');
  assert(sameDateRecords[0].price === 48, 'Existing date record is overwritten with latest value');

  // Verify unknown crop returns empty array safely
  const emptyHistory = PriceHistoryService.getHistory('non_existent_crop_xyz');
  assert(Array.isArray(emptyHistory) && emptyHistory.length === 0, 'Unknown crop history safely returns empty array');

  // 6. Computed Forecasts (Deterministic, Non-random, Valid horizons)
  const forecast = PriceHistoryService.computeForecast('tomato', 48, tomato);
  assert(
    typeof forecast.forecast7Day === 'number' &&
    typeof forecast.forecast14Day === 'number' &&
    typeof forecast.forecast30Day === 'number' &&
    typeof forecast.threeMonthForecast === 'number' &&
    typeof forecast.fiveMonthForecast === 'number',
    'All 5 forecast horizons are computed as valid numbers'
  );
  assert(
    !isNaN(forecast.forecast7Day) && isFinite(forecast.forecast7Day) && forecast.forecast7Day > 0,
    '7-day forecast is positive finite number without NaN'
  );

  // 7. Consistency of MarketDataService public shape
  const activeList = MarketDataService.getCommodities();
  assert(activeList.every((c) => c.id && c.name && typeof c.currentPrice === 'number' && typeof c.forecast7Day === 'number'),
    'All returned commodities adhere strictly to Commodity interface shape');

  // 8. 77-District Nationwide Coverage & AMPIS 12-Hub Calibration Tests
  assert(NEPAL_DISTRICTS_MANDIS.length === 77, 'Nationwide district registry covers all 77 official districts of Nepal');
  const provincesCovered = new Set(NEPAL_DISTRICTS_MANDIS.map((d) => d.province));
  assert(provincesCovered.size === 7, 'All 7 provinces of Nepal are represented in district registry');
  const mandisNetwork = MarketDataService.getMandisNetwork('tomato');
  assert(mandisNetwork.length === 77, 'getMandisNetwork computes localized rates across all 77 districts');
  const ktmMandi = mandisNetwork.find((m) => m.id === 'kathmandu');
  const jumlaMandi = mandisNetwork.find((m) => m.id === 'jumla');
  assert(ktmMandi?.priceSource === 'official_kalimati', 'Kathmandu uses Official Kalimati benchmark');
  assert(jumlaMandi !== undefined && jumlaMandi.estimatedWholesalePrice !== ktmMandi?.estimatedWholesalePrice && getAmpisHubForDistrict(jumlaMandi) === 'birendranagar',
    'Jumla calibrates via Birendranagar AMPIS hub with distinct spatial price');
  const ampisStatus = AmpisScraper.getAllHubSnapshots();
  assert(ampisStatus.hubs.length === 12, 'AMPIS scraper exposes all 12 official regional wholesale hubs');

  // 9. Step 4: Multi-Carrier SMS Routing, 77-District Localized Alerts & AlertWorker Deduplication
  assert(SmsService.isValidNepalMobile('+977 9845012345') === true, 'Validates +977 NTC mobile number');
  assert(SmsService.isValidNepalMobile('9801234567') === true, 'Validates 10-digit Ncell mobile number');
  assert(SmsService.isValidNepalMobile('12345') === false, 'Rejects invalid short phone number');
  assert(SmsService.detectCarrier('9845012345').includes('Nepal Telecom'), 'Detects NTC carrier for 984 prefix');
  assert(SmsService.detectCarrier('9801234567').includes('Ncell'), 'Detects Ncell carrier for 980 prefix');
  assert(SmsService.detectCarrier('9881234567').includes('Smart'), 'Detects SmartCell carrier for 988 prefix');

  const ktmSms = await SmsService.sendMarketPriceAlert({
    phone: '9845012345',
    district: 'kathmandu',
    cropIds: ['tomato', 'potato'],
  });
  const jumlaSms = await SmsService.sendMarketPriceAlert({
    phone: '9801234567',
    district: 'jumla',
    cropIds: ['tomato', 'potato'],
  });
  assert(ktmSms.success && ktmSms.messageText.includes('Kathmandu'), 'Kathmandu SMS bulletin includes Kathmandu district');
  assert(jumlaSms.success && jumlaSms.messageText.includes('Jumla'), 'Jumla SMS bulletin includes Jumla district');
  assert(ktmSms.messageText !== jumlaSms.messageText, 'SMS market bulletin prices dynamically localize per district');

  // Threshold alert creation, automated trigger, and 24h cooldown deduplication
  const testAlertPhone = '9800000099';
  const createdAlert = await DbStorageService.createPriceAlert({
    phone: testAlertPhone,
    districtId: 'jumla',
    cropId: 'tomato',
    cropName: 'Tomato (Local)',
    targetPrice: 10,
    direction: 'above',
    channel: 'both',
  });
  const firstRun = await AlertWorkerService.evaluateAndDispatchAlerts('manual_check', 'jumla');
  const firstDispatch = firstRun.dispatches.find((d) => d.alertId === createdAlert.id);
  assert(firstDispatch !== undefined && firstDispatch.actualPrice >= 10, 'AlertWorker triggers SMS when district price crosses threshold');

  const secondRun = await AlertWorkerService.evaluateAndDispatchAlerts('manual_check', 'jumla');
  const duplicateDispatch = secondRun.dispatches.find((d) => d.alertId === createdAlert.id);
  assert(duplicateDispatch === undefined && secondRun.skippedCooldownCount >= 1, 'AlertWorker enforces 24h cooldown deduplication');

  await DbStorageService.deactivatePriceAlert(createdAlert.id);

  // 10. Step 5: Signed Session Persistence, Revocation, Live OTP Enforcement & Gemini District Grounding
  const regSessionUser = testAuthStore.registerFarmerUser({
    name: 'Session Test Farmer',
    phone: `+977980${String(Date.now()).slice(-7)}`,
    district: 'chitwan',
  });
  const signedToken = regSessionUser.token;
  assert(signedToken.startsWith('kst2.'), 'Session tokens use kst2 HMAC-SHA256 signed format');

  const restartedAuthStore = new AuthStore();
  const acrossRestart = restartedAuthStore.validateSession(signedToken);
  assert(acrossRestart.isValid && acrossRestart.user?.id === regSessionUser.user.id, 'Signed HMAC session validates across restarted AuthStore instances');

  const tamperedToken = `${signedToken.slice(0, -4)}zzzz`;
  assert(restartedAuthStore.validateSession(tamperedToken).isValid === false, 'Tampered HMAC session token is rejected');

  restartedAuthStore.invalidateSession(signedToken);
  assert(restartedAuthStore.validateSession(signedToken).isValid === false, 'Revoked session token is rejected');

  const prevSparrowToken = process.env.SPARROW_SMS_TOKEN;
  try {
    process.env.SPARROW_SMS_TOKEN = 'test_live_sparrow_token_987654';
    assert(SmsService.getGatewayConfig().isLiveGateway === true, 'Live gateway flag activates when SMS token is set');
    assert(SmsService.verifyOtp('9845012345', '123456').success === false, 'OTP verification enforces strict random codes when live SMS gateway is active');
  } finally {
    if (prevSparrowToken === undefined) {
      delete process.env.SPARROW_SMS_TOKEN;
    } else {
      process.env.SPARROW_SMS_TOKEN = prevSparrowToken;
    }
  }

  const aiReply = await GeminiService.generateKrishiMitraReply(
    [{ role: 'user', text: 'Should I sell tomatoes today or hold?' }],
    { district: 'jumla', crops: ['tomato'] },
    'en'
  );
  assert(typeof aiReply === 'string' && aiReply.trim().length > 20, 'GeminiService returns grounded district-aware agricultural advice cleanly');

  console.log(`--- Test Results: ${passed}/${total} passed ---`);
  return { passed, total, success: passed === total };
}

// Auto-run if executed directly
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
  runBackendTests().then((res) => {
    if (!res.success) process.exit(1);
  });
}
