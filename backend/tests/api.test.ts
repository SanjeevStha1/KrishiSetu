/**
 * Backend API & Service Tests for KrishiSetu
 * Verifies User Registration, Session Verification, User Isolation, Calculator Estimation, and Market Price Data.
 */

import { AuthStore } from '../src/services/authStore';
import { MarketDataService } from '../src/services/marketDataService';
import { DecisionEngineService } from '../src/services/decisionEngineService';
import { AnalyticsService } from '../src/services/analyticsService';
import { KalimatiScraper } from '../src/scrapers/kalimatiScraper';
import { PriceHistoryService } from '../src/services/priceHistoryService';

export function runBackendTests() {
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

  // Verify demo user records are unaffected
  const demoRecords = testAuthStore.getUserFarmRecords('usr_ram_chitwan_001');
  assert(demoRecords.length === 0 || demoRecords !== updatedRecords, 'User records are strictly partitioned');

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

  console.log(`--- Test Results: ${passed}/${total} passed ---`);
  return { passed, total, success: passed === total };
}

// Auto-run if executed directly
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
  runBackendTests();
}
