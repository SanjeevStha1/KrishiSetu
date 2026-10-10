// Kalimati Fruits and Vegetable Market Development Board (2020-2026 Dataset Summary)
// Total Files Processed: 2425 | Total Records Extracted: 107,599

export interface MonthlySeasonality {
  monthIndex: number;
  monthName: string;
  nepaliMonth: string;
  avgPriceNPR: number;
  p25NPR: number;
  p75NPR: number;
  minPriceNPR: number;
  maxPriceNPR: number;
  dataPoints: number;
}

export interface PeakGlutWindow {
  month: string;
  nepaliMonth: string;
  historicalAvgPrice: number;
  expectedRange: string;
}

export interface KalimatiCropSummary {
  cropId: string;
  totalDataPoints: number;
  monthlySeasonality: MonthlySeasonality[];
  peakWindow: PeakGlutWindow;
  glutRiskWindow: PeakGlutWindow;
  yearlyTrend: Record<string, number>;
}

export interface KalimatiDatasetStructure {
  metadata: {
    generatedAt: string;
    totalFilesProcessed: number;
    totalRecordsExtracted: number;
    source: string;
  };
  crops: Record<string, KalimatiCropSummary>;
}

export const KALIMATI_DATASET: KalimatiDatasetStructure = {
  metadata: {
    generatedAt: "2026-09-08T19:46:33.672165",
    totalFilesProcessed: 2425,
    totalRecordsExtracted: 107599,
    source: "Kalimati Fruits and Vegetable Market Development Board (2020-Present)"
  },
  crops: {
    tomato: {
      cropId: "tomato",
      totalDataPoints: 10193,
      monthlySeasonality: [
        { monthIndex: 0, monthName: "January", nepaliMonth: "माघ-फागुन (Jan)", avgPriceNPR: 44.5, p25NPR: 25.0, p75NPR: 55.0, minPriceNPR: 12.0, maxPriceNPR: 122.5, dataPoints: 1160 },
        { monthIndex: 1, monthName: "February", nepaliMonth: "फागुन-चैत (Feb)", avgPriceNPR: 37.6, p25NPR: 22.5, p75NPR: 48.0, minPriceNPR: 11.25, maxPriceNPR: 95.0, dataPoints: 983 },
        { monthIndex: 2, monthName: "March", nepaliMonth: "चैत-वैशाख (Mar)", avgPriceNPR: 45.1, p25NPR: 33.0, p75NPR: 55.0, minPriceNPR: 9.5, maxPriceNPR: 88.0, dataPoints: 1023 },
        { monthIndex: 3, monthName: "April", nepaliMonth: "वैशाख-जेठ (Apr)", avgPriceNPR: 43.1, p25NPR: 30.0, p75NPR: 55.0, minPriceNPR: 12.4, maxPriceNPR: 105.0, dataPoints: 952 },
        { monthIndex: 4, monthName: "May", nepaliMonth: "जेठ-असार (May)", avgPriceNPR: 49.4, p25NPR: 34.0, p75NPR: 62.5, minPriceNPR: 12.0, maxPriceNPR: 140.0, dataPoints: 990 },
        { monthIndex: 5, monthName: "June", nepaliMonth: "असार-साउन (Jun)", avgPriceNPR: 43.5, p25NPR: 26.8, p75NPR: 57.5, minPriceNPR: 5.8, maxPriceNPR: 150.0, dataPoints: 705 },
        { monthIndex: 6, monthName: "July", nepaliMonth: "साउन-भदौ (Jul)", avgPriceNPR: 46.0, p25NPR: 27.5, p75NPR: 65.0, minPriceNPR: 6.67, maxPriceNPR: 130.0, dataPoints: 641 },
        { monthIndex: 7, monthName: "August", nepaliMonth: "भदौ-असोज (Aug)", avgPriceNPR: 55.9, p25NPR: 33.0, p75NPR: 68.0, minPriceNPR: 11.8, maxPriceNPR: 170.0, dataPoints: 699 },
        { monthIndex: 8, monthName: "September", nepaliMonth: "असोज-कात्तिक (Sep)", avgPriceNPR: 52.6, p25NPR: 35.33, p75NPR: 65.0, minPriceNPR: 7.5, maxPriceNPR: 115.0, dataPoints: 658 },
        { monthIndex: 9, monthName: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", avgPriceNPR: 65.2, p25NPR: 42.8, p75NPR: 82.0, minPriceNPR: 17.67, maxPriceNPR: 150.0, dataPoints: 697 },
        { monthIndex: 10, monthName: "November", nepaliMonth: "मंसिर-पुस (Nov)", avgPriceNPR: 70.2, p25NPR: 49.25, p75NPR: 89.0, minPriceNPR: 17.5, maxPriceNPR: 135.0, dataPoints: 730 },
        { monthIndex: 11, monthName: "December", nepaliMonth: "पुस-माघ (Dec)", avgPriceNPR: 61.4, p25NPR: 40.0, p75NPR: 83.75, minPriceNPR: 12.33, maxPriceNPR: 125.0, dataPoints: 955 }
      ],
      peakWindow: { month: "November", nepaliMonth: "मंसिर-पुस (Nov)", historicalAvgPrice: 70.2, expectedRange: "Rs 49.25 – 89.0/kg" },
      glutRiskWindow: { month: "February", nepaliMonth: "फागुन-चैत (Feb)", historicalAvgPrice: 37.6, expectedRange: "Rs 11.25 – 22.5/kg" },
      yearlyTrend: { "2020": 46.8, "2021": 45.2, "2022": 51.9, "2023": 45.6, "2024": 57.7, "2025": 54.3, "2026": 52.6 }
    },
    potato: {
      cropId: "potato",
      totalDataPoints: 7131,
      monthlySeasonality: [
        { monthIndex: 0, monthName: "January", nepaliMonth: "माघ-फागुन (Jan)", avgPriceNPR: 32.9, p25NPR: 27.5, p75NPR: 38.0, minPriceNPR: 16.6, maxPriceNPR: 53.0, dataPoints: 501 },
        { monthIndex: 1, monthName: "February", nepaliMonth: "फागुन-चैत (Feb)", avgPriceNPR: 27.0, p25NPR: 24.0, p75NPR: 31.0, minPriceNPR: 17.0, maxPriceNPR: 39.0, dataPoints: 474 },
        { monthIndex: 2, monthName: "March", nepaliMonth: "चैत-वैशाख (Mar)", avgPriceNPR: 27.2, p25NPR: 22.5, p75NPR: 32.0, minPriceNPR: 17.0, maxPriceNPR: 55.0, dataPoints: 481 },
        { monthIndex: 3, monthName: "April", nepaliMonth: "वैशाख-जेठ (Apr)", avgPriceNPR: 30.5, p25NPR: 24.0, p75NPR: 34.0, minPriceNPR: 17.5, maxPriceNPR: 52.5, dataPoints: 456 },
        { monthIndex: 4, monthName: "May", nepaliMonth: "जेठ-असार (May)", avgPriceNPR: 34.1, p25NPR: 27.67, p75NPR: 37.67, minPriceNPR: 20.75, maxPriceNPR: 55.2, dataPoints: 561 },
        { monthIndex: 5, monthName: "June", nepaliMonth: "असार-साउन (Jun)", avgPriceNPR: 37.8, p25NPR: 33.0, p75NPR: 42.5, minPriceNPR: 24.67, maxPriceNPR: 61.2, dataPoints: 740 },
        { monthIndex: 6, monthName: "July", nepaliMonth: "साउन-भदौ (Jul)", avgPriceNPR: 43.7, p25NPR: 37.0, p75NPR: 49.67, minPriceNPR: 27.0, maxPriceNPR: 70.4, dataPoints: 820 },
        { monthIndex: 7, monthName: "August", nepaliMonth: "भदौ-असोज (Aug)", avgPriceNPR: 48.2, p25NPR: 38.33, p75NPR: 55.0, minPriceNPR: 26.8, maxPriceNPR: 73.0, dataPoints: 767 },
        { monthIndex: 8, monthName: "September", nepaliMonth: "असोज-कात्तिक (Sep)", avgPriceNPR: 53.5, p25NPR: 43.0, p75NPR: 61.0, minPriceNPR: 26.0, maxPriceNPR: 96.0, dataPoints: 636 },
        { monthIndex: 9, monthName: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", avgPriceNPR: 59.5, p25NPR: 44.33, p75NPR: 75.5, minPriceNPR: 27.0, maxPriceNPR: 114.0, dataPoints: 615 },
        { monthIndex: 10, monthName: "November", nepaliMonth: "मंसिर-पुस (Nov)", avgPriceNPR: 54.8, p25NPR: 43.33, p75NPR: 65.0, minPriceNPR: 27.0, maxPriceNPR: 91.0, dataPoints: 560 },
        { monthIndex: 11, monthName: "December", nepaliMonth: "पुस-माघ (Dec)", avgPriceNPR: 42.8, p25NPR: 32.5, p75NPR: 52.33, minPriceNPR: 18.0, maxPriceNPR: 88.0, dataPoints: 520 }
      ],
      peakWindow: { month: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", historicalAvgPrice: 59.5, expectedRange: "Rs 44.33 – 75.5/kg" },
      glutRiskWindow: { month: "February", nepaliMonth: "फागुन-चैत (Feb)", historicalAvgPrice: 27.0, expectedRange: "Rs 17.0 – 24.0/kg" },
      yearlyTrend: { "2020": 52.6, "2021": 37.3, "2022": 41.8, "2023": 36.8, "2024": 53.6, "2025": 40.0, "2026": 32.1 }
    },
    onion: {
      cropId: "onion",
      totalDataPoints: 2491,
      monthlySeasonality: [
        { monthIndex: 0, monthName: "January", nepaliMonth: "माघ-फागुन (Jan)", avgPriceNPR: 69.3, p25NPR: 53.6, p75NPR: 77.0, minPriceNPR: 40.33, maxPriceNPR: 162.0, dataPoints: 267 },
        { monthIndex: 1, monthName: "February", nepaliMonth: "फागुन-चैत (Feb)", avgPriceNPR: 61.4, p25NPR: 39.0, p75NPR: 73.0, minPriceNPR: 30.8, maxPriceNPR: 113.0, dataPoints: 196 },
        { monthIndex: 2, monthName: "March", nepaliMonth: "चैत-वैशाख (Mar)", avgPriceNPR: 50.5, p25NPR: 36.0, p75NPR: 64.0, minPriceNPR: 30.8, maxPriceNPR: 88.0, dataPoints: 208 },
        { monthIndex: 3, monthName: "April", nepaliMonth: "वैशाख-जेठ (Apr)", avgPriceNPR: 40.9, p25NPR: 33.67, p75NPR: 41.0, minPriceNPR: 28.0, maxPriceNPR: 78.0, dataPoints: 203 },
        { monthIndex: 4, monthName: "May", nepaliMonth: "जेठ-असार (May)", avgPriceNPR: 40.3, p25NPR: 33.0, p75NPR: 39.6, minPriceNPR: 24.0, maxPriceNPR: 83.0, dataPoints: 214 },
        { monthIndex: 5, monthName: "June", nepaliMonth: "असार-साउन (Jun)", avgPriceNPR: 47.7, p25NPR: 39.0, p75NPR: 51.0, minPriceNPR: 24.0, maxPriceNPR: 102.6, dataPoints: 196 },
        { monthIndex: 6, monthName: "July", nepaliMonth: "साउन-भदौ (Jul)", avgPriceNPR: 50.8, p25NPR: 39.0, p75NPR: 53.63, minPriceNPR: 30.0, maxPriceNPR: 93.8, dataPoints: 215 },
        { monthIndex: 7, monthName: "August", nepaliMonth: "भदौ-असोज (Aug)", avgPriceNPR: 54.7, p25NPR: 37.5, p75NPR: 61.0, minPriceNPR: 30.0, maxPriceNPR: 132.0, dataPoints: 206 },
        { monthIndex: 8, monthName: "September", nepaliMonth: "असोज-कात्तिक (Sep)", avgPriceNPR: 65.0, p25NPR: 38.0, p75NPR: 74.6, minPriceNPR: 34.6, maxPriceNPR: 130.0, dataPoints: 181 },
        { monthIndex: 9, monthName: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", avgPriceNPR: 78.1, p25NPR: 51.0, p75NPR: 106.0, minPriceNPR: 33.0, maxPriceNPR: 138.0, dataPoints: 187 },
        { monthIndex: 10, monthName: "November", nepaliMonth: "मंसिर-पुस (Nov)", avgPriceNPR: 77.3, p25NPR: 51.2, p75NPR: 103.0, minPriceNPR: 31.25, maxPriceNPR: 128.0, dataPoints: 204 },
        { monthIndex: 11, monthName: "December", nepaliMonth: "पुस-माघ (Dec)", avgPriceNPR: 68.9, p25NPR: 49.0, p75NPR: 89.0, minPriceNPR: 30.5, maxPriceNPR: 147.5, dataPoints: 214 }
      ],
      peakWindow: { month: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", historicalAvgPrice: 78.1, expectedRange: "Rs 51.0 – 106.0/kg" },
      glutRiskWindow: { month: "May", nepaliMonth: "जेठ-असार (May)", historicalAvgPrice: 40.3, expectedRange: "Rs 24.0 – 33.0/kg" },
      yearlyTrend: { "2020": 69.3, "2021": 52.9, "2022": 43.4, "2023": 59.8, "2024": 87.6, "2025": 45.6, "2026": 43.5 }
    },
    carrot: {
      cropId: "carrot",
      totalDataPoints: 3956,
      monthlySeasonality: [
        { monthIndex: 0, monthName: "January", nepaliMonth: "माघ-फागुन (Jan)", avgPriceNPR: 54.6, p25NPR: 38.0, p75NPR: 65.0, minPriceNPR: 14.25, maxPriceNPR: 125.0, dataPoints: 416 },
        { monthIndex: 1, monthName: "February", nepaliMonth: "फागुन-चैत (Feb)", avgPriceNPR: 34.4, p25NPR: 25.0, p75NPR: 45.0, minPriceNPR: 17.5, maxPriceNPR: 75.0, dataPoints: 388 },
        { monthIndex: 2, monthName: "March", nepaliMonth: "चैत-वैशाख (Mar)", avgPriceNPR: 32.6, p25NPR: 27.5, p75NPR: 35.0, minPriceNPR: 17.5, maxPriceNPR: 65.0, dataPoints: 412 },
        { monthIndex: 3, monthName: "April", nepaliMonth: "वैशाख-जेठ (Apr)", avgPriceNPR: 39.7, p25NPR: 27.5, p75NPR: 52.5, minPriceNPR: 12.33, maxPriceNPR: 110.0, dataPoints: 391 },
        { monthIndex: 4, monthName: "May", nepaliMonth: "जेठ-असार (May)", avgPriceNPR: 46.8, p25NPR: 25.0, p75NPR: 65.0, minPriceNPR: 12.0, maxPriceNPR: 95.0, dataPoints: 299 },
        { monthIndex: 5, monthName: "June", nepaliMonth: "असार-साउन (Jun)", avgPriceNPR: 70.1, p25NPR: 48.0, p75NPR: 95.0, minPriceNPR: 12.0, maxPriceNPR: 135.0, dataPoints: 248 },
        { monthIndex: 6, monthName: "July", nepaliMonth: "साउन-भदौ (Jul)", avgPriceNPR: 92.1, p25NPR: 84.17, p75NPR: 105.0, minPriceNPR: 45.0, maxPriceNPR: 145.0, dataPoints: 297 },
        { monthIndex: 7, monthName: "August", nepaliMonth: "भदौ-असोज (Aug)", avgPriceNPR: 101.5, p25NPR: 85.0, p75NPR: 116.25, minPriceNPR: 29.0, maxPriceNPR: 195.0, dataPoints: 328 },
        { monthIndex: 8, monthName: "September", nepaliMonth: "असोज-कात्तिक (Sep)", avgPriceNPR: 109.4, p25NPR: 95.0, p75NPR: 126.67, minPriceNPR: 42.0, maxPriceNPR: 226.67, dataPoints: 300 },
        { monthIndex: 9, monthName: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", avgPriceNPR: 113.1, p25NPR: 95.0, p75NPR: 126.67, minPriceNPR: 55.0, maxPriceNPR: 185.0, dataPoints: 318 },
        { monthIndex: 10, monthName: "November", nepaliMonth: "मंसिर-पुस (Nov)", avgPriceNPR: 110.1, p25NPR: 86.67, p75NPR: 130.0, minPriceNPR: 35.0, maxPriceNPR: 210.0, dataPoints: 272 },
        { monthIndex: 11, monthName: "December", nepaliMonth: "पुस-माघ (Dec)", avgPriceNPR: 88.4, p25NPR: 65.0, p75NPR: 110.0, minPriceNPR: 35.0, maxPriceNPR: 170.0, dataPoints: 287 }
      ],
      peakWindow: { month: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", historicalAvgPrice: 113.1, expectedRange: "Rs 95.0 – 126.67/kg" },
      glutRiskWindow: { month: "March", nepaliMonth: "चैत-वैशाख (Mar)", historicalAvgPrice: 32.6, expectedRange: "Rs 17.5 – 27.5/kg" },
      yearlyTrend: { "2020": 45.9, "2021": 92.1, "2022": 76.1, "2023": 66.7, "2024": 77.9, "2025": 71.9, "2026": 59.3 }
    },
    cabbage: {
      cropId: "cabbage",
      totalDataPoints: 6114,
      monthlySeasonality: [
        { monthIndex: 0, monthName: "January", nepaliMonth: "माघ-फागुन (Jan)", avgPriceNPR: 49.1, p25NPR: 22.5, p75NPR: 55.0, minPriceNPR: 11.0, maxPriceNPR: 325.0, dataPoints: 796 },
        { monthIndex: 1, monthName: "February", nepaliMonth: "फागुन-चैत (Feb)", avgPriceNPR: 36.1, p25NPR: 17.5, p75NPR: 45.0, minPriceNPR: 10.0, maxPriceNPR: 145.0, dataPoints: 710 },
        { monthIndex: 2, monthName: "March", nepaliMonth: "चैत-वैशाख (Mar)", avgPriceNPR: 31.0, p25NPR: 13.67, p75NPR: 37.5, minPriceNPR: 9.0, maxPriceNPR: 135.0, dataPoints: 712 },
        { monthIndex: 3, monthName: "April", nepaliMonth: "वैशाख-जेठ (Apr)", avgPriceNPR: 36.4, p25NPR: 17.67, p75NPR: 45.0, minPriceNPR: 10.0, maxPriceNPR: 135.0, dataPoints: 555 },
        { monthIndex: 4, monthName: "May", nepaliMonth: "जेठ-असार (May)", avgPriceNPR: 42.1, p25NPR: 22.33, p75NPR: 55.0, minPriceNPR: 7.0, maxPriceNPR: 135.0, dataPoints: 431 },
        { monthIndex: 5, monthName: "June", nepaliMonth: "असार-साउन (Jun)", avgPriceNPR: 50.1, p25NPR: 25.0, p75NPR: 66.67, minPriceNPR: 7.6, maxPriceNPR: 165.0, dataPoints: 389 },
        { monthIndex: 6, monthName: "July", nepaliMonth: "साउन-भदौ (Jul)", avgPriceNPR: 68.9, p25NPR: 30.0, p75NPR: 66.67, minPriceNPR: 7.5, maxPriceNPR: 326.67, dataPoints: 388 },
        { monthIndex: 7, monthName: "August", nepaliMonth: "भदौ-असोज (Aug)", avgPriceNPR: 91.9, p25NPR: 35.0, p75NPR: 125.0, minPriceNPR: 12.33, maxPriceNPR: 375.0, dataPoints: 398 },
        { monthIndex: 8, monthName: "September", nepaliMonth: "असोज-कात्तिक (Sep)", avgPriceNPR: 120.7, p25NPR: 45.0, p75NPR: 176.67, minPriceNPR: 28.33, maxPriceNPR: 550.0, dataPoints: 339 },
        { monthIndex: 9, monthName: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", avgPriceNPR: 105.8, p25NPR: 45.0, p75NPR: 172.5, minPriceNPR: 15.0, maxPriceNPR: 425.0, dataPoints: 359 },
        { monthIndex: 10, monthName: "November", nepaliMonth: "मंसिर-पुस (Nov)", avgPriceNPR: 84.0, p25NPR: 46.25, p75NPR: 115.0, minPriceNPR: 19.0, maxPriceNPR: 275.0, dataPoints: 394 },
        { monthIndex: 11, monthName: "December", nepaliMonth: "पुस-माघ (Dec)", avgPriceNPR: 67.8, p25NPR: 35.0, p75NPR: 75.0, minPriceNPR: 18.0, maxPriceNPR: 275.0, dataPoints: 643 }
      ],
      peakWindow: { month: "September", nepaliMonth: "असोज-कात्तिक (Sep)", historicalAvgPrice: 120.7, expectedRange: "Rs 45.0 – 176.67/kg" },
      glutRiskWindow: { month: "March", nepaliMonth: "चैत-वैशाख (Mar)", historicalAvgPrice: 31.0, expectedRange: "Rs 9.0 – 13.67/kg" },
      yearlyTrend: { "2020": 39.4, "2021": 79.7, "2022": 63.9, "2023": 59.5, "2024": 56.2, "2025": 60.7, "2026": 46.5 }
    },
    cauliflower: {
      cropId: "cauliflower",
      totalDataPoints: 6843,
      monthlySeasonality: [
        { monthIndex: 0, monthName: "January", nepaliMonth: "माघ-फागुन (Jan)", avgPriceNPR: 45.2, p25NPR: 27.5, p75NPR: 55.0, minPriceNPR: 10.0, maxPriceNPR: 130.0, dataPoints: 851 },
        { monthIndex: 1, monthName: "February", nepaliMonth: "फागुन-चैत (Feb)", avgPriceNPR: 34.7, p25NPR: 24.0, p75NPR: 45.0, minPriceNPR: 10.0, maxPriceNPR: 86.0, dataPoints: 761 },
        { monthIndex: 2, monthName: "March", nepaliMonth: "चैत-वैशाख (Mar)", avgPriceNPR: 41.4, p25NPR: 27.5, p75NPR: 52.5, minPriceNPR: 10.0, maxPriceNPR: 110.0, dataPoints: 727 },
        { monthIndex: 3, monthName: "April", nepaliMonth: "वैशाख-जेठ (Apr)", avgPriceNPR: 53.8, p25NPR: 35.0, p75NPR: 66.67, minPriceNPR: 15.0, maxPriceNPR: 116.67, dataPoints: 616 },
        { monthIndex: 4, monthName: "May", nepaliMonth: "जेठ-असार (May)", avgPriceNPR: 62.6, p25NPR: 43.75, p75NPR: 75.0, minPriceNPR: 12.0, maxPriceNPR: 193.33, dataPoints: 575 },
        { monthIndex: 5, monthName: "June", nepaliMonth: "असार-साउन (Jun)", avgPriceNPR: 75.5, p25NPR: 55.0, p75NPR: 86.67, minPriceNPR: 12.0, maxPriceNPR: 213.33, dataPoints: 474 },
        { monthIndex: 6, monthName: "July", nepaliMonth: "साउन-भदौ (Jul)", avgPriceNPR: 91.8, p25NPR: 65.0, p75NPR: 110.0, minPriceNPR: 25.0, maxPriceNPR: 293.33, dataPoints: 501 },
        { monthIndex: 7, monthName: "August", nepaliMonth: "भदौ-असोज (Aug)", avgPriceNPR: 126.7, p25NPR: 86.0, p75NPR: 153.33, minPriceNPR: 55.0, maxPriceNPR: 283.33, dataPoints: 459 },
        { monthIndex: 8, monthName: "September", nepaliMonth: "असोज-कात्तिक (Sep)", avgPriceNPR: 150.5, p25NPR: 88.0, p75NPR: 223.33, minPriceNPR: 40.0, maxPriceNPR: 375.0, dataPoints: 342 },
        { monthIndex: 9, monthName: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", avgPriceNPR: 127.1, p25NPR: 85.0, p75NPR: 160.0, minPriceNPR: 30.0, maxPriceNPR: 310.0, dataPoints: 373 },
        { monthIndex: 10, monthName: "November", nepaliMonth: "मंसिर-पुस (Nov)", avgPriceNPR: 83.0, p25NPR: 55.0, p75NPR: 110.0, minPriceNPR: 10.0, maxPriceNPR: 192.0, dataPoints: 499 },
        { monthIndex: 11, monthName: "December", nepaliMonth: "पुस-माघ (Dec)", avgPriceNPR: 57.0, p25NPR: 35.0, p75NPR: 75.0, minPriceNPR: 12.0, maxPriceNPR: 170.0, dataPoints: 665 }
      ],
      peakWindow: { month: "September", nepaliMonth: "असोज-कात्तिक (Sep)", historicalAvgPrice: 150.5, expectedRange: "Rs 88.0 – 223.33/kg" },
      glutRiskWindow: { month: "February", nepaliMonth: "फागुन-चैत (Feb)", historicalAvgPrice: 34.7, expectedRange: "Rs 10.0 – 24.0/kg" },
      yearlyTrend: { "2020": 52.1, "2021": 71.8, "2022": 80.9, "2023": 71.0, "2024": 78.2, "2025": 68.3, "2026": 65.0 }
    },
    radish: {
      cropId: "radish",
      totalDataPoints: 8257,
      monthlySeasonality: [
        { monthIndex: 0, monthName: "January", nepaliMonth: "माघ-फागुन (Jan)", avgPriceNPR: 38.0, p25NPR: 18.33, p75NPR: 56.67, minPriceNPR: 11.0, maxPriceNPR: 76.67, dataPoints: 833 },
        { monthIndex: 1, monthName: "February", nepaliMonth: "फागुन-चैत (Feb)", avgPriceNPR: 35.4, p25NPR: 18.0, p75NPR: 55.0, minPriceNPR: 9.6, maxPriceNPR: 76.67, dataPoints: 747 },
        { monthIndex: 2, monthName: "March", nepaliMonth: "चैत-वैशाख (Mar)", avgPriceNPR: 40.6, p25NPR: 22.0, p75NPR: 55.0, minPriceNPR: 10.0, maxPriceNPR: 86.67, dataPoints: 760 },
        { monthIndex: 3, monthName: "April", nepaliMonth: "वैशाख-जेठ (Apr)", avgPriceNPR: 42.7, p25NPR: 25.0, p75NPR: 55.0, minPriceNPR: 12.0, maxPriceNPR: 105.0, dataPoints: 653 },
        { monthIndex: 4, monthName: "May", nepaliMonth: "जेठ-असार (May)", avgPriceNPR: 36.0, p25NPR: 17.67, p75NPR: 48.0, minPriceNPR: 11.6, maxPriceNPR: 86.67, dataPoints: 626 },
        { monthIndex: 5, monthName: "June", nepaliMonth: "असार-साउन (Jun)", avgPriceNPR: 37.7, p25NPR: 17.5, p75NPR: 55.0, minPriceNPR: 9.0, maxPriceNPR: 86.67, dataPoints: 631 },
        { monthIndex: 6, monthName: "July", nepaliMonth: "साउन-भदौ (Jul)", avgPriceNPR: 44.3, p25NPR: 23.0, p75NPR: 56.67, minPriceNPR: 12.0, maxPriceNPR: 225.0, dataPoints: 668 },
        { monthIndex: 7, monthName: "August", nepaliMonth: "भदौ-असोज (Aug)", avgPriceNPR: 49.5, p25NPR: 27.5, p75NPR: 75.0, minPriceNPR: 12.33, maxPriceNPR: 175.0, dataPoints: 689 },
        { monthIndex: 8, monthName: "September", nepaliMonth: "असोज-कात्तिक (Sep)", avgPriceNPR: 52.1, p25NPR: 28.33, p75NPR: 75.0, minPriceNPR: 17.5, maxPriceNPR: 126.67, dataPoints: 590 },
        { monthIndex: 9, monthName: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", avgPriceNPR: 54.9, p25NPR: 36.67, p75NPR: 75.0, minPriceNPR: 17.5, maxPriceNPR: 176.67, dataPoints: 656 },
        { monthIndex: 10, monthName: "November", nepaliMonth: "मंसिर-पुस (Nov)", avgPriceNPR: 47.9, p25NPR: 31.25, p75NPR: 65.0, minPriceNPR: 9.33, maxPriceNPR: 105.0, dataPoints: 669 },
        { monthIndex: 11, monthName: "December", nepaliMonth: "पुस-माघ (Dec)", avgPriceNPR: 43.6, p25NPR: 25.0, p75NPR: 56.67, minPriceNPR: 9.0, maxPriceNPR: 95.0, dataPoints: 735 }
      ],
      peakWindow: { month: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", historicalAvgPrice: 54.9, expectedRange: "Rs 36.67 – 75.0/kg" },
      glutRiskWindow: { month: "February", nepaliMonth: "फागुन-चैत (Feb)", historicalAvgPrice: 35.4, expectedRange: "Rs 9.6 – 18.0/kg" },
      yearlyTrend: { "2020": 35.7, "2021": 47.8, "2022": 44.2, "2023": 47.9, "2024": 46.5, "2025": 40.0, "2026": 36.5 }
    },
    brinjal: {
      cropId: "brinjal",
      totalDataPoints: 4526,
      monthlySeasonality: [
        { monthIndex: 0, monthName: "January", nepaliMonth: "माघ-फागुन (Jan)", avgPriceNPR: 51.2, p25NPR: 36.67, p75NPR: 62.0, minPriceNPR: 25.0, maxPriceNPR: 85.0, dataPoints: 428 },
        { monthIndex: 1, monthName: "February", nepaliMonth: "फागुन-चैत (Feb)", avgPriceNPR: 54.0, p25NPR: 45.0, p75NPR: 65.0, minPriceNPR: 20.0, maxPriceNPR: 86.67, dataPoints: 384 },
        { monthIndex: 2, monthName: "March", nepaliMonth: "चैत-वैशाख (Mar)", avgPriceNPR: 55.0, p25NPR: 45.0, p75NPR: 65.0, minPriceNPR: 25.0, maxPriceNPR: 95.0, dataPoints: 395 },
        { monthIndex: 3, monthName: "April", nepaliMonth: "वैशाख-जेठ (Apr)", avgPriceNPR: 39.7, p25NPR: 30.0, p75NPR: 45.0, minPriceNPR: 18.0, maxPriceNPR: 76.67, dataPoints: 401 },
        { monthIndex: 4, monthName: "May", nepaliMonth: "जेठ-असार (May)", avgPriceNPR: 42.6, p25NPR: 30.0, p75NPR: 55.0, minPriceNPR: 20.0, maxPriceNPR: 76.67, dataPoints: 388 },
        { monthIndex: 5, monthName: "June", nepaliMonth: "असार-साउन (Jun)", avgPriceNPR: 34.1, p25NPR: 25.0, p75NPR: 45.0, minPriceNPR: 12.33, maxPriceNPR: 76.67, dataPoints: 408 },
        { monthIndex: 6, monthName: "July", nepaliMonth: "साउन-भदौ (Jul)", avgPriceNPR: 50.3, p25NPR: 35.0, p75NPR: 62.0, minPriceNPR: 12.8, maxPriceNPR: 116.67, dataPoints: 386 },
        { monthIndex: 7, monthName: "August", nepaliMonth: "भदौ-असोज (Aug)", avgPriceNPR: 44.1, p25NPR: 35.0, p75NPR: 55.0, minPriceNPR: 12.4, maxPriceNPR: 96.67, dataPoints: 382 },
        { monthIndex: 8, monthName: "September", nepaliMonth: "असोज-कात्तिक (Sep)", avgPriceNPR: 42.7, p25NPR: 33.75, p75NPR: 55.0, minPriceNPR: 11.8, maxPriceNPR: 95.0, dataPoints: 321 },
        { monthIndex: 9, monthName: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", avgPriceNPR: 56.5, p25NPR: 45.0, p75NPR: 74.0, minPriceNPR: 15.0, maxPriceNPR: 115.0, dataPoints: 319 },
        { monthIndex: 10, monthName: "November", nepaliMonth: "मंसिर-पुस (Nov)", avgPriceNPR: 53.1, p25NPR: 42.0, p75NPR: 65.0, minPriceNPR: 15.0, maxPriceNPR: 95.0, dataPoints: 343 },
        { monthIndex: 11, monthName: "December", nepaliMonth: "पुस-माघ (Dec)", avgPriceNPR: 50.9, p25NPR: 36.67, p75NPR: 65.0, minPriceNPR: 17.5, maxPriceNPR: 95.0, dataPoints: 371 }
      ],
      peakWindow: { month: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", historicalAvgPrice: 56.5, expectedRange: "Rs 45.0 – 74.0/kg" },
      glutRiskWindow: { month: "June", nepaliMonth: "असार-साउन (Jun)", historicalAvgPrice: 34.1, expectedRange: "Rs 12.33 – 25.0/kg" },
      yearlyTrend: { "2020": 47.6, "2021": 43.2, "2022": 46.5, "2023": 51.1, "2024": 53.2, "2025": 42.1, "2026": 51.2 }
    },
    beans: {
      cropId: "beans",
      totalDataPoints: 11598,
      monthlySeasonality: [
        { monthIndex: 0, monthName: "January", nepaliMonth: "माघ-फागुन (Jan)", avgPriceNPR: 73.0, p25NPR: 55.0, p75NPR: 93.33, minPriceNPR: 27.67, maxPriceNPR: 170.0, dataPoints: 952 },
        { monthIndex: 1, monthName: "February", nepaliMonth: "फागुन-चैत (Feb)", avgPriceNPR: 77.8, p25NPR: 65.0, p75NPR: 95.0, minPriceNPR: 35.0, maxPriceNPR: 205.0, dataPoints: 715 },
        { monthIndex: 2, monthName: "March", nepaliMonth: "चैत-वैशाख (Mar)", avgPriceNPR: 81.1, p25NPR: 55.0, p75NPR: 98.0, minPriceNPR: 25.0, maxPriceNPR: 230.0, dataPoints: 912 },
        { monthIndex: 3, monthName: "April", nepaliMonth: "वैशाख-जेठ (Apr)", avgPriceNPR: 78.8, p25NPR: 56.67, p75NPR: 96.67, minPriceNPR: 15.0, maxPriceNPR: 170.0, dataPoints: 950 },
        { monthIndex: 4, monthName: "May", nepaliMonth: "जेठ-असार (May)", avgPriceNPR: 66.4, p25NPR: 45.0, p75NPR: 85.0, minPriceNPR: 17.5, maxPriceNPR: 170.0, dataPoints: 982 },
        { monthIndex: 5, monthName: "June", nepaliMonth: "असार-साउन (Jun)", avgPriceNPR: 66.0, p25NPR: 45.0, p75NPR: 85.0, minPriceNPR: 12.0, maxPriceNPR: 212.5, dataPoints: 1062 },
        { monthIndex: 6, monthName: "July", nepaliMonth: "साउन-भदौ (Jul)", avgPriceNPR: 82.8, p25NPR: 55.0, p75NPR: 110.0, minPriceNPR: 17.5, maxPriceNPR: 210.0, dataPoints: 1136 },
        { monthIndex: 7, monthName: "August", nepaliMonth: "भदौ-असोज (Aug)", avgPriceNPR: 86.2, p25NPR: 66.67, p75NPR: 105.0, minPriceNPR: 19.0, maxPriceNPR: 180.0, dataPoints: 1051 },
        { monthIndex: 8, monthName: "September", nepaliMonth: "असोज-कात्तिक (Sep)", avgPriceNPR: 88.6, p25NPR: 75.0, p75NPR: 96.67, minPriceNPR: 45.0, maxPriceNPR: 202.0, dataPoints: 829 },
        { monthIndex: 9, monthName: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", avgPriceNPR: 94.2, p25NPR: 65.0, p75NPR: 115.0, minPriceNPR: 17.0, maxPriceNPR: 266.67, dataPoints: 970 },
        { monthIndex: 10, monthName: "November", nepaliMonth: "मंसिर-पुस (Nov)", avgPriceNPR: 89.8, p25NPR: 59.0, p75NPR: 115.0, minPriceNPR: 15.0, maxPriceNPR: 205.0, dataPoints: 1001 },
        { monthIndex: 11, monthName: "December", nepaliMonth: "पुस-माघ (Dec)", avgPriceNPR: 85.2, p25NPR: 56.67, p75NPR: 107.0, minPriceNPR: 27.67, maxPriceNPR: 195.0, dataPoints: 1038 }
      ],
      peakWindow: { month: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", historicalAvgPrice: 94.2, expectedRange: "Rs 65.0 – 115.0/kg" },
      glutRiskWindow: { month: "June", nepaliMonth: "असार-साउन (Jun)", historicalAvgPrice: 66.0, expectedRange: "Rs 12.0 – 45.0/kg" },
      yearlyTrend: { "2020": 66.0, "2021": 83.3, "2022": 81.0, "2023": 76.1, "2024": 92.7, "2025": 82.6, "2026": 78.6 }
    },
    peas: {
      cropId: "peas",
      totalDataPoints: 1613,
      monthlySeasonality: [
        { monthIndex: 0, monthName: "January", nepaliMonth: "माघ-फागुन (Jan)", avgPriceNPR: 67.2, p25NPR: 55.0, p75NPR: 78.0, minPriceNPR: 35.0, maxPriceNPR: 145.0, dataPoints: 217 },
        { monthIndex: 1, monthName: "February", nepaliMonth: "फागुन-चैत (Feb)", avgPriceNPR: 66.2, p25NPR: 55.0, p75NPR: 76.67, minPriceNPR: 42.6, maxPriceNPR: 115.33, dataPoints: 195 },
        { monthIndex: 2, monthName: "March", nepaliMonth: "चैत-वैशाख (Mar)", avgPriceNPR: 57.5, p25NPR: 45.0, p75NPR: 65.0, minPriceNPR: 25.0, maxPriceNPR: 115.0, dataPoints: 206 },
        { monthIndex: 3, monthName: "April", nepaliMonth: "वैशाख-जेठ (Apr)", avgPriceNPR: 75.2, p25NPR: 56.0, p75NPR: 86.67, minPriceNPR: 28.0, maxPriceNPR: 195.0, dataPoints: 200 },
        { monthIndex: 4, monthName: "May", nepaliMonth: "जेठ-असार (May)", avgPriceNPR: 110.6, p25NPR: 85.0, p75NPR: 135.0, minPriceNPR: 45.0, maxPriceNPR: 210.0, dataPoints: 174 },
        { monthIndex: 5, monthName: "June", nepaliMonth: "असार-साउन (Jun)", avgPriceNPR: 160.5, p25NPR: 140.0, p75NPR: 190.0, minPriceNPR: 78.0, maxPriceNPR: 245.0, dataPoints: 102 },
        { monthIndex: 6, monthName: "July", nepaliMonth: "साउन-भदौ (Jul)", avgPriceNPR: 170.4, p25NPR: 145.0, p75NPR: 190.0, minPriceNPR: 125.0, maxPriceNPR: 192.5, dataPoints: 31 },
        { monthIndex: 7, monthName: "August", nepaliMonth: "भदौ-असोज (Aug)", avgPriceNPR: 65.0, p25NPR: 65.0, p75NPR: 65.0, minPriceNPR: 65.0, maxPriceNPR: 65.0, dataPoints: 1 },
        { monthIndex: 8, monthName: "September", nepaliMonth: "असोज-कात्तिक (Sep)", avgPriceNPR: 215.0, p25NPR: 200.0, p75NPR: 290.0, minPriceNPR: 85.0, maxPriceNPR: 310.0, dataPoints: 7 },
        { monthIndex: 9, monthName: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", avgPriceNPR: 228.7, p25NPR: 190.0, p75NPR: 275.0, minPriceNPR: 125.0, maxPriceNPR: 335.0, dataPoints: 122 },
        { monthIndex: 10, monthName: "November", nepaliMonth: "मंसिर-पुस (Nov)", avgPriceNPR: 147.5, p25NPR: 126.0, p75NPR: 165.0, minPriceNPR: 64.0, maxPriceNPR: 283.33, dataPoints: 172 },
        { monthIndex: 11, monthName: "December", nepaliMonth: "पुस-माघ (Dec)", avgPriceNPR: 107.1, p25NPR: 76.0, p75NPR: 135.0, minPriceNPR: 45.0, maxPriceNPR: 203.0, dataPoints: 186 }
      ],
      peakWindow: { month: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", historicalAvgPrice: 228.7, expectedRange: "Rs 190.0 – 275.0/kg" },
      glutRiskWindow: { month: "March", nepaliMonth: "चैत-वैशाख (Mar)", historicalAvgPrice: 57.5, expectedRange: "Rs 25.0 – 45.0/kg" },
      yearlyTrend: { "2020": 81.9, "2021": 111.8, "2022": 96.7, "2023": 115.2, "2024": 121.7, "2025": 114.8, "2026": 78.7 }
    },
    bitter_gourd: {
      cropId: "bitter_gourd",
      totalDataPoints: 2380,
      monthlySeasonality: [
        { monthIndex: 0, monthName: "January", nepaliMonth: "माघ-फागुन (Jan)", avgPriceNPR: 119.5, p25NPR: 105.0, p75NPR: 128.0, minPriceNPR: 75.0, maxPriceNPR: 210.0, dataPoints: 215 },
        { monthIndex: 1, monthName: "February", nepaliMonth: "फागुन-चैत (Feb)", avgPriceNPR: 134.0, p25NPR: 115.0, p75NPR: 145.0, minPriceNPR: 85.0, maxPriceNPR: 210.0, dataPoints: 195 },
        { monthIndex: 2, monthName: "March", nepaliMonth: "चैत-वैशाख (Mar)", avgPriceNPR: 127.2, p25NPR: 110.0, p75NPR: 145.0, minPriceNPR: 75.0, maxPriceNPR: 235.0, dataPoints: 202 },
        { monthIndex: 3, monthName: "April", nepaliMonth: "वैशाख-जेठ (Apr)", avgPriceNPR: 78.5, p25NPR: 55.0, p75NPR: 95.0, minPriceNPR: 25.0, maxPriceNPR: 175.0, dataPoints: 198 },
        { monthIndex: 4, monthName: "May", nepaliMonth: "जेठ-असार (May)", avgPriceNPR: 37.9, p25NPR: 25.0, p75NPR: 45.0, minPriceNPR: 12.0, maxPriceNPR: 85.0, dataPoints: 216 },
        { monthIndex: 5, monthName: "June", nepaliMonth: "असार-साउन (Jun)", avgPriceNPR: 38.9, p25NPR: 30.0, p75NPR: 45.0, minPriceNPR: 18.0, maxPriceNPR: 95.0, dataPoints: 209 },
        { monthIndex: 6, monthName: "July", nepaliMonth: "साउन-भदौ (Jul)", avgPriceNPR: 47.4, p25NPR: 28.0, p75NPR: 65.0, minPriceNPR: 11.4, maxPriceNPR: 115.0, dataPoints: 215 },
        { monthIndex: 7, monthName: "August", nepaliMonth: "भदौ-असोज (Aug)", avgPriceNPR: 40.6, p25NPR: 24.0, p75NPR: 45.0, minPriceNPR: 13.0, maxPriceNPR: 110.0, dataPoints: 207 },
        { monthIndex: 8, monthName: "September", nepaliMonth: "असोज-कात्तिक (Sep)", avgPriceNPR: 66.1, p25NPR: 55.0, p75NPR: 85.0, minPriceNPR: 22.0, maxPriceNPR: 115.0, dataPoints: 178 },
        { monthIndex: 9, monthName: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", avgPriceNPR: 72.7, p25NPR: 56.67, p75NPR: 87.5, minPriceNPR: 35.0, maxPriceNPR: 118.0, dataPoints: 184 },
        { monthIndex: 10, monthName: "November", nepaliMonth: "मंसिर-पुस (Nov)", avgPriceNPR: 93.1, p25NPR: 75.0, p75NPR: 110.0, minPriceNPR: 55.0, maxPriceNPR: 170.0, dataPoints: 175 },
        { monthIndex: 11, monthName: "December", nepaliMonth: "पुस-माघ (Dec)", avgPriceNPR: 89.4, p25NPR: 75.0, p75NPR: 105.0, minPriceNPR: 45.0, maxPriceNPR: 130.0, dataPoints: 186 }
      ],
      peakWindow: { month: "February", nepaliMonth: "फागुन-चैत (Feb)", historicalAvgPrice: 134.0, expectedRange: "Rs 115.0 – 145.0/kg" },
      glutRiskWindow: { month: "May", nepaliMonth: "जेठ-असार (May)", historicalAvgPrice: 37.9, expectedRange: "Rs 12.0 – 25.0/kg" },
      yearlyTrend: { "2020": 70.2, "2021": 75.6, "2022": 76.0, "2023": 81.8, "2024": 83.0, "2025": 74.4, "2026": 90.1 }
    },
    bottle_gourd: {
      cropId: "bottle_gourd",
      totalDataPoints: 2357,
      monthlySeasonality: [
        { monthIndex: 0, monthName: "January", nepaliMonth: "माघ-फागुन (Jan)", avgPriceNPR: 57.3, p25NPR: 48.0, p75NPR: 65.0, minPriceNPR: 35.0, maxPriceNPR: 90.0, dataPoints: 215 },
        { monthIndex: 1, monthName: "February", nepaliMonth: "फागुन-चैत (Feb)", avgPriceNPR: 56.8, p25NPR: 48.0, p75NPR: 65.0, minPriceNPR: 37.67, maxPriceNPR: 95.0, dataPoints: 196 },
        { monthIndex: 2, monthName: "March", nepaliMonth: "चैत-वैशाख (Mar)", avgPriceNPR: 55.7, p25NPR: 47.67, p75NPR: 65.0, minPriceNPR: 30.0, maxPriceNPR: 105.0, dataPoints: 208 },
        { monthIndex: 3, monthName: "April", nepaliMonth: "वैशाख-जेठ (Apr)", avgPriceNPR: 40.7, p25NPR: 32.5, p75NPR: 55.0, minPriceNPR: 13.75, maxPriceNPR: 76.67, dataPoints: 200 },
        { monthIndex: 4, monthName: "May", nepaliMonth: "जेठ-असार (May)", avgPriceNPR: 33.1, p25NPR: 20.0, p75NPR: 45.0, minPriceNPR: 12.0, maxPriceNPR: 66.67, dataPoints: 213 },
        { monthIndex: 5, monthName: "June", nepaliMonth: "असार-साउन (Jun)", avgPriceNPR: 46.2, p25NPR: 35.0, p75NPR: 55.0, minPriceNPR: 17.0, maxPriceNPR: 85.0, dataPoints: 199 },
        { monthIndex: 6, monthName: "July", nepaliMonth: "साउन-भदौ (Jul)", avgPriceNPR: 50.1, p25NPR: 35.0, p75NPR: 65.0, minPriceNPR: 18.0, maxPriceNPR: 110.0, dataPoints: 201 },
        { monthIndex: 7, monthName: "August", nepaliMonth: "भदौ-असोज (Aug)", avgPriceNPR: 47.5, p25NPR: 36.67, p75NPR: 55.0, minPriceNPR: 17.67, maxPriceNPR: 85.0, dataPoints: 204 },
        { monthIndex: 8, monthName: "September", nepaliMonth: "असोज-कात्तिक (Sep)", avgPriceNPR: 49.0, p25NPR: 45.0, p75NPR: 55.0, minPriceNPR: 25.0, maxPriceNPR: 95.0, dataPoints: 179 },
        { monthIndex: 9, monthName: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", avgPriceNPR: 53.3, p25NPR: 43.75, p75NPR: 65.0, minPriceNPR: 17.67, maxPriceNPR: 96.67, dataPoints: 180 },
        { monthIndex: 10, monthName: "November", nepaliMonth: "मंसिर-पुस (Nov)", avgPriceNPR: 54.1, p25NPR: 36.67, p75NPR: 66.67, minPriceNPR: 18.0, maxPriceNPR: 110.0, dataPoints: 176 },
        { monthIndex: 11, monthName: "December", nepaliMonth: "पुस-माघ (Dec)", avgPriceNPR: 56.5, p25NPR: 45.0, p75NPR: 65.0, minPriceNPR: 30.0, maxPriceNPR: 95.0, dataPoints: 186 }
      ],
      peakWindow: { month: "January", nepaliMonth: "माघ-फागुन (Jan)", historicalAvgPrice: 57.3, expectedRange: "Rs 48.0 – 65.0/kg" },
      glutRiskWindow: { month: "May", nepaliMonth: "जेठ-असार (May)", historicalAvgPrice: 33.1, expectedRange: "Rs 12.0 – 20.0/kg" },
      yearlyTrend: { "2020": 42.6, "2021": 46.4, "2022": 48.9, "2023": 51.9, "2024": 56.4, "2025": 48.8, "2026": 55.2 }
    },
    pumpkin: {
      cropId: "pumpkin",
      totalDataPoints: 6375,
      monthlySeasonality: [
        { monthIndex: 0, monthName: "January", nepaliMonth: "माघ-फागुन (Jan)", avgPriceNPR: 33.9, p25NPR: 25.0, p75NPR: 45.0, minPriceNPR: 12.33, maxPriceNPR: 76.67, dataPoints: 651 },
        { monthIndex: 1, monthName: "February", nepaliMonth: "फागुन-चैत (Feb)", avgPriceNPR: 34.7, p25NPR: 20.75, p75NPR: 45.0, minPriceNPR: 10.0, maxPriceNPR: 86.67, dataPoints: 584 },
        { monthIndex: 2, monthName: "March", nepaliMonth: "चैत-वैशाख (Mar)", avgPriceNPR: 35.6, p25NPR: 25.0, p75NPR: 45.0, minPriceNPR: 10.0, maxPriceNPR: 90.0, dataPoints: 612 },
        { monthIndex: 3, monthName: "April", nepaliMonth: "वैशाख-जेठ (Apr)", avgPriceNPR: 37.7, p25NPR: 28.0, p75NPR: 45.0, minPriceNPR: 15.0, maxPriceNPR: 66.67, dataPoints: 589 },
        { monthIndex: 4, monthName: "May", nepaliMonth: "जेठ-असार (May)", avgPriceNPR: 35.6, p25NPR: 27.5, p75NPR: 45.0, minPriceNPR: 12.0, maxPriceNPR: 57.5, dataPoints: 613 },
        { monthIndex: 5, monthName: "June", nepaliMonth: "असार-साउन (Jun)", avgPriceNPR: 36.6, p25NPR: 28.75, p75NPR: 45.0, minPriceNPR: 12.0, maxPriceNPR: 75.0, dataPoints: 552 },
        { monthIndex: 6, monthName: "July", nepaliMonth: "साउन-भदौ (Jul)", avgPriceNPR: 46.3, p25NPR: 33.33, p75NPR: 55.0, minPriceNPR: 11.0, maxPriceNPR: 110.0, dataPoints: 469 },
        { monthIndex: 7, monthName: "August", nepaliMonth: "भदौ-असोज (Aug)", avgPriceNPR: 52.0, p25NPR: 42.0, p75NPR: 62.5, minPriceNPR: 25.0, maxPriceNPR: 96.67, dataPoints: 445 },
        { monthIndex: 8, monthName: "September", nepaliMonth: "असोज-कात्तिक (Sep)", avgPriceNPR: 46.3, p25NPR: 38.0, p75NPR: 55.0, minPriceNPR: 25.0, maxPriceNPR: 85.0, dataPoints: 386 },
        { monthIndex: 9, monthName: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", avgPriceNPR: 49.1, p25NPR: 36.67, p75NPR: 56.67, minPriceNPR: 23.0, maxPriceNPR: 95.0, dataPoints: 404 },
        { monthIndex: 10, monthName: "November", nepaliMonth: "मंसिर-पुस (Nov)", avgPriceNPR: 42.3, p25NPR: 32.5, p75NPR: 55.0, minPriceNPR: 12.33, maxPriceNPR: 99.17, dataPoints: 513 },
        { monthIndex: 11, monthName: "December", nepaliMonth: "पुस-माघ (Dec)", avgPriceNPR: 39.5, p25NPR: 28.33, p75NPR: 46.67, minPriceNPR: 10.0, maxPriceNPR: 85.0, dataPoints: 557 }
      ],
      peakWindow: { month: "August", nepaliMonth: "भदौ-असोज (Aug)", historicalAvgPrice: 52.0, expectedRange: "Rs 42.0 – 62.5/kg" },
      glutRiskWindow: { month: "January", nepaliMonth: "माघ-फागुन (Jan)", historicalAvgPrice: 33.9, expectedRange: "Rs 12.33 – 25.0/kg" },
      yearlyTrend: { "2020": 35.3, "2021": 36.9, "2022": 37.9, "2023": 39.4, "2024": 47.8, "2025": 39.8, "2026": 42.5 }
    },
    ladies_finger: {
      cropId: "ladies_finger",
      totalDataPoints: 2377,
      monthlySeasonality: [
        { monthIndex: 0, monthName: "January", nepaliMonth: "माघ-फागुन (Jan)", avgPriceNPR: 106.8, p25NPR: 95.0, p75NPR: 120.0, minPriceNPR: 65.0, maxPriceNPR: 190.0, dataPoints: 212 },
        { monthIndex: 1, monthName: "February", nepaliMonth: "फागुन-चैत (Feb)", avgPriceNPR: 111.6, p25NPR: 98.0, p75NPR: 125.0, minPriceNPR: 78.0, maxPriceNPR: 155.0, dataPoints: 195 },
        { monthIndex: 2, monthName: "March", nepaliMonth: "चैत-वैशाख (Mar)", avgPriceNPR: 111.5, p25NPR: 105.0, p75NPR: 116.0, minPriceNPR: 75.0, maxPriceNPR: 155.0, dataPoints: 205 },
        { monthIndex: 3, monthName: "April", nepaliMonth: "वैशाख-जेठ (Apr)", avgPriceNPR: 85.1, p25NPR: 65.0, p75NPR: 96.0, minPriceNPR: 40.0, maxPriceNPR: 146.67, dataPoints: 198 },
        { monthIndex: 4, monthName: "May", nepaliMonth: "जेठ-असार (May)", avgPriceNPR: 46.2, p25NPR: 30.0, p75NPR: 55.0, minPriceNPR: 12.0, maxPriceNPR: 115.0, dataPoints: 214 },
        { monthIndex: 5, monthName: "June", nepaliMonth: "असार-साउन (Jun)", avgPriceNPR: 41.7, p25NPR: 28.0, p75NPR: 55.0, minPriceNPR: 15.0, maxPriceNPR: 106.0, dataPoints: 208 },
        { monthIndex: 6, monthName: "July", nepaliMonth: "साउन-भदौ (Jul)", avgPriceNPR: 55.3, p25NPR: 35.0, p75NPR: 66.67, minPriceNPR: 20.0, maxPriceNPR: 140.0, dataPoints: 216 },
        { monthIndex: 7, monthName: "August", nepaliMonth: "भदौ-असोज (Aug)", avgPriceNPR: 48.9, p25NPR: 35.0, p75NPR: 56.0, minPriceNPR: 19.0, maxPriceNPR: 96.0, dataPoints: 206 },
        { monthIndex: 8, monthName: "September", nepaliMonth: "असोज-कात्तिक (Sep)", avgPriceNPR: 58.5, p25NPR: 45.0, p75NPR: 67.0, minPriceNPR: 25.0, maxPriceNPR: 115.0, dataPoints: 176 },
        { monthIndex: 9, monthName: "October", nepaliMonth: "कात्तिक-मंसir (Oct)", avgPriceNPR: 79.2, p25NPR: 65.0, p75NPR: 95.0, minPriceNPR: 34.0, maxPriceNPR: 155.0, dataPoints: 184 },
        { monthIndex: 10, monthName: "November", nepaliMonth: "मंसिर-पुस (Nov)", avgPriceNPR: 91.0, p25NPR: 75.0, p75NPR: 110.0, minPriceNPR: 45.0, maxPriceNPR: 155.0, dataPoints: 178 },
        { monthIndex: 11, monthName: "December", nepaliMonth: "पुस-माघ (Dec)", avgPriceNPR: 106.3, p25NPR: 87.0, p75NPR: 125.0, minPriceNPR: 63.33, maxPriceNPR: 160.0, dataPoints: 185 }
      ],
      peakWindow: { month: "February", nepaliMonth: "फागुन-चैत (Feb)", historicalAvgPrice: 111.6, expectedRange: "Rs 98.0 – 125.0/kg" },
      glutRiskWindow: { month: "June", nepaliMonth: "असार-साउन (Jun)", historicalAvgPrice: 41.7, expectedRange: "Rs 15.0 – 28.0/kg" },
      yearlyTrend: { "2020": 75.1, "2021": 74.2, "2022": 73.5, "2023": 86.0, "2024": 78.3, "2025": 80.5, "2026": 78.4 }
    },
    spinach: {
      cropId: "spinach",
      totalDataPoints: 2111,
      monthlySeasonality: [
        { monthIndex: 0, monthName: "January", nepaliMonth: "माघ-फागुन (Jan)", avgPriceNPR: 73.6, p25NPR: 56.67, p75NPR: 95.0, minPriceNPR: 23.33, maxPriceNPR: 125.0, dataPoints: 217 },
        { monthIndex: 1, monthName: "February", nepaliMonth: "फागुन-चैत (Feb)", avgPriceNPR: 49.1, p25NPR: 35.0, p75NPR: 56.67, minPriceNPR: 27.5, maxPriceNPR: 115.0, dataPoints: 196 },
        { monthIndex: 2, monthName: "March", nepaliMonth: "चैत-वैशाख (Mar)", avgPriceNPR: 66.4, p25NPR: 50.0, p75NPR: 86.67, minPriceNPR: 22.0, maxPriceNPR: 116.67, dataPoints: 206 },
        { monthIndex: 3, monthName: "April", nepaliMonth: "वैशाख-जेठ (Apr)", avgPriceNPR: 92.0, p25NPR: 75.0, p75NPR: 115.0, minPriceNPR: 28.0, maxPriceNPR: 156.67, dataPoints: 202 },
        { monthIndex: 4, monthName: "May", nepaliMonth: "जेठ-असार (May)", avgPriceNPR: 93.3, p25NPR: 55.0, p75NPR: 135.0, minPriceNPR: 32.67, maxPriceNPR: 170.0, dataPoints: 216 },
        { monthIndex: 5, monthName: "June", nepaliMonth: "असार-साउन (Jun)", avgPriceNPR: 72.5, p25NPR: 36.25, p75NPR: 96.67, minPriceNPR: 22.0, maxPriceNPR: 190.0, dataPoints: 170 },
        { monthIndex: 6, monthName: "July", nepaliMonth: "साउन-भदौ (Jul)", avgPriceNPR: 93.5, p25NPR: 65.0, p75NPR: 110.0, minPriceNPR: 22.0, maxPriceNPR: 266.67, dataPoints: 139 },
        { monthIndex: 7, monthName: "August", nepaliMonth: "भदौ-असोज (Aug)", avgPriceNPR: 115.8, p25NPR: 75.0, p75NPR: 140.0, minPriceNPR: 42.0, maxPriceNPR: 275.0, dataPoints: 126 },
        { monthIndex: 8, monthName: "September", nepaliMonth: "असोज-कात्तिक (Sep)", avgPriceNPR: 130.8, p25NPR: 75.0, p75NPR: 176.67, minPriceNPR: 45.0, maxPriceNPR: 290.0, dataPoints: 110 },
        { monthIndex: 9, monthName: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", avgPriceNPR: 162.8, p25NPR: 96.67, p75NPR: 210.0, minPriceNPR: 55.0, maxPriceNPR: 375.0, dataPoints: 164 },
        { monthIndex: 10, monthName: "November", nepaliMonth: "मंसिर-पुस (Nov)", avgPriceNPR: 130.6, p25NPR: 87.0, p75NPR: 170.0, minPriceNPR: 55.0, maxPriceNPR: 275.0, dataPoints: 179 },
        { monthIndex: 11, monthName: "December", nepaliMonth: "पुस-माघ (Dec)", avgPriceNPR: 97.9, p25NPR: 85.0, p75NPR: 110.0, minPriceNPR: 65.0, maxPriceNPR: 165.0, dataPoints: 186 }
      ],
      peakWindow: { month: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", historicalAvgPrice: 162.8, expectedRange: "Rs 96.67 – 210.0/kg" },
      glutRiskWindow: { month: "February", nepaliMonth: "फागुन-चैत (Feb)", historicalAvgPrice: 49.1, expectedRange: "Rs 27.5 – 35.0/kg" },
      yearlyTrend: { "2020": 63.6, "2021": 97.1, "2022": 116.5, "2023": 101.5, "2024": 108.3, "2025": 95.0, "2026": 91.3 }
    },
    mushroom: {
      cropId: "mushroom",
      totalDataPoints: 6219,
      monthlySeasonality: [
        { monthIndex: 0, monthName: "January", nepaliMonth: "माघ-फागुन (Jan)", avgPriceNPR: 298.6, p25NPR: 138.0, p75NPR: 326.67, minPriceNPR: 70.0, maxPriceNPR: 900.0, dataPoints: 553 },
        { monthIndex: 1, monthName: "February", nepaliMonth: "फागुन-चैत (Feb)", avgPriceNPR: 295.9, p25NPR: 130.0, p75NPR: 335.0, minPriceNPR: 42.0, maxPriceNPR: 912.5, dataPoints: 502 },
        { monthIndex: 2, monthName: "March", nepaliMonth: "चैत-वैशाख (Mar)", avgPriceNPR: 293.1, p25NPR: 160.0, p75NPR: 305.0, minPriceNPR: 60.0, maxPriceNPR: 900.0, dataPoints: 532 },
        { monthIndex: 3, monthName: "April", nepaliMonth: "वैशाख-जेठ (Apr)", avgPriceNPR: 318.4, p25NPR: 190.0, p75NPR: 326.67, minPriceNPR: 75.0, maxPriceNPR: 900.0, dataPoints: 509 },
        { monthIndex: 4, monthName: "May", nepaliMonth: "जेठ-असार (May)", avgPriceNPR: 323.7, p25NPR: 165.0, p75NPR: 335.0, minPriceNPR: 90.0, maxPriceNPR: 1000.0, dataPoints: 571 },
        { monthIndex: 5, monthName: "June", nepaliMonth: "असार-साउन (Jun)", avgPriceNPR: 321.1, p25NPR: 196.67, p75NPR: 325.0, minPriceNPR: 125.0, maxPriceNPR: 900.0, dataPoints: 561 },
        { monthIndex: 6, monthName: "July", nepaliMonth: "साउन-भदौ (Jul)", avgPriceNPR: 348.8, p25NPR: 225.0, p75NPR: 375.0, minPriceNPR: 96.67, maxPriceNPR: 1050.0, dataPoints: 586 },
        { monthIndex: 7, monthName: "August", nepaliMonth: "भदौ-असोज (Aug)", avgPriceNPR: 386.7, p25NPR: 210.0, p75NPR: 414.0, minPriceNPR: 115.0, maxPriceNPR: 1050.0, dataPoints: 567 },
        { monthIndex: 8, monthName: "September", nepaliMonth: "असोज-कात्तिक (Sep)", avgPriceNPR: 326.9, p25NPR: 190.0, p75NPR: 355.0, minPriceNPR: 95.0, maxPriceNPR: 976.67, dataPoints: 449 },
        { monthIndex: 9, monthName: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", avgPriceNPR: 309.0, p25NPR: 175.0, p75NPR: 355.0, minPriceNPR: 54.0, maxPriceNPR: 953.33, dataPoints: 453 },
        { monthIndex: 10, monthName: "November", nepaliMonth: "मंसिर-पुस (Nov)", avgPriceNPR: 291.7, p25NPR: 180.0, p75NPR: 325.0, minPriceNPR: 56.67, maxPriceNPR: 950.0, dataPoints: 445 },
        { monthIndex: 11, monthName: "December", nepaliMonth: "पुस-माघ (Dec)", avgPriceNPR: 317.4, p25NPR: 180.0, p75NPR: 326.67, minPriceNPR: 90.0, maxPriceNPR: 900.0, dataPoints: 491 }
      ],
      peakWindow: { month: "August", nepaliMonth: "भदौ-असोज (Aug)", historicalAvgPrice: 386.7, expectedRange: "Rs 210.0 – 414.0/kg" },
      glutRiskWindow: { month: "November", nepaliMonth: "मंसिर-पुस (Nov)", historicalAvgPrice: 291.7, expectedRange: "Rs 56.67 – 180.0/kg" },
      yearlyTrend: { "2020": 232.9, "2021": 251.6, "2022": 258.9, "2023": 241.3, "2024": 302.6, "2025": 401.8, "2026": 442.6 }
    },
    cucumber: {
      cropId: "cucumber",
      totalDataPoints: 4912,
      monthlySeasonality: [
        { monthIndex: 0, monthName: "January", nepaliMonth: "माघ-फागुन (Jan)", avgPriceNPR: 78.0, p25NPR: 46.67, p75NPR: 110.0, minPriceNPR: 27.5, maxPriceNPR: 150.0, dataPoints: 431 },
        { monthIndex: 1, monthName: "February", nepaliMonth: "फागुन-चैत (Feb)", avgPriceNPR: 83.7, p25NPR: 45.0, p75NPR: 120.0, minPriceNPR: 25.0, maxPriceNPR: 190.0, dataPoints: 373 },
        { monthIndex: 2, monthName: "March", nepaliMonth: "चैत-वैशाख (Mar)", avgPriceNPR: 58.7, p25NPR: 36.67, p75NPR: 75.0, minPriceNPR: 17.5, maxPriceNPR: 175.0, dataPoints: 442 },
        { monthIndex: 3, monthName: "April", nepaliMonth: "वैशाख-जेठ (Apr)", avgPriceNPR: 48.6, p25NPR: 28.0, p75NPR: 65.0, minPriceNPR: 12.0, maxPriceNPR: 130.0, dataPoints: 420 },
        { monthIndex: 4, monthName: "May", nepaliMonth: "जेठ-असार (May)", avgPriceNPR: 44.0, p25NPR: 25.0, p75NPR: 56.25, minPriceNPR: 12.0, maxPriceNPR: 136.0, dataPoints: 441 },
        { monthIndex: 5, monthName: "June", nepaliMonth: "असार-साउन (Jun)", avgPriceNPR: 47.2, p25NPR: 25.0, p75NPR: 65.0, minPriceNPR: 8.2, maxPriceNPR: 130.0, dataPoints: 446 },
        { monthIndex: 6, monthName: "July", nepaliMonth: "साउन-भदौ (Jul)", avgPriceNPR: 49.2, p25NPR: 25.0, p75NPR: 65.0, minPriceNPR: 12.0, maxPriceNPR: 160.0, dataPoints: 452 },
        { monthIndex: 7, monthName: "August", nepaliMonth: "भदौ-असोज (Aug)", avgPriceNPR: 41.0, p25NPR: 23.0, p75NPR: 50.0, minPriceNPR: 9.5, maxPriceNPR: 140.0, dataPoints: 432 },
        { monthIndex: 8, monthName: "September", nepaliMonth: "असोज-कात्तिक (Sep)", avgPriceNPR: 50.5, p25NPR: 28.0, p75NPR: 65.0, minPriceNPR: 17.67, maxPriceNPR: 130.0, dataPoints: 347 },
        { monthIndex: 9, monthName: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", avgPriceNPR: 60.7, p25NPR: 36.0, p75NPR: 80.0, minPriceNPR: 14.33, maxPriceNPR: 141.25, dataPoints: 354 },
        { monthIndex: 10, monthName: "November", nepaliMonth: "मंसिर-पुस (Nov)", avgPriceNPR: 65.5, p25NPR: 38.0, p75NPR: 95.0, minPriceNPR: 9.5, maxPriceNPR: 195.0, dataPoints: 384 },
        { monthIndex: 11, monthName: "December", nepaliMonth: "पुस-माघ (Dec)", avgPriceNPR: 62.4, p25NPR: 37.0, p75NPR: 85.0, minPriceNPR: 17.5, maxPriceNPR: 145.0, dataPoints: 390 }
      ],
      peakWindow: { month: "February", nepaliMonth: "फागुन-चैत (Feb)", historicalAvgPrice: 83.7, expectedRange: "Rs 45.0 – 120.0/kg" },
      glutRiskWindow: { month: "August", nepaliMonth: "भदौ-असोज (Aug)", historicalAvgPrice: 41.0, expectedRange: "Rs 9.5 – 23.0/kg" },
      yearlyTrend: { "2020": 49.4, "2021": 51.0, "2022": 57.9, "2023": 59.9, "2024": 71.1, "2025": 55.7, "2026": 52.7 }
    },
    ginger: {
      cropId: "ginger",
      totalDataPoints: 2397,
      monthlySeasonality: [
        { monthIndex: 0, monthName: "January", nepaliMonth: "माघ-फागुन (Jan)", avgPriceNPR: 93.1, p25NPR: 65.0, p75NPR: 115.0, minPriceNPR: 34.0, maxPriceNPR: 190.0, dataPoints: 217 },
        { monthIndex: 1, monthName: "February", nepaliMonth: "फागुन-चैत (Feb)", avgPriceNPR: 107.4, p25NPR: 65.0, p75NPR: 115.0, minPriceNPR: 35.0, maxPriceNPR: 236.67, dataPoints: 195 },
        { monthIndex: 2, monthName: "March", nepaliMonth: "चैत-वैशाख (Mar)", avgPriceNPR: 108.6, p25NPR: 75.0, p75NPR: 115.0, minPriceNPR: 35.0, maxPriceNPR: 230.0, dataPoints: 208 },
        { monthIndex: 3, monthName: "April", nepaliMonth: "वैशाख-जेठ (Apr)", avgPriceNPR: 127.8, p25NPR: 76.67, p75NPR: 155.0, minPriceNPR: 45.0, maxPriceNPR: 285.0, dataPoints: 200 },
        { monthIndex: 4, monthName: "May", nepaliMonth: "जेठ-असार (May)", avgPriceNPR: 149.6, p25NPR: 80.0, p75NPR: 195.0, minPriceNPR: 53.33, maxPriceNPR: 290.0, dataPoints: 216 },
        { monthIndex: 5, monthName: "June", nepaliMonth: "असार-साउन (Jun)", avgPriceNPR: 152.4, p25NPR: 75.0, p75NPR: 245.0, minPriceNPR: 55.0, maxPriceNPR: 312.0, dataPoints: 210 },
        { monthIndex: 6, monthName: "July", nepaliMonth: "साउन-भदौ (Jul)", avgPriceNPR: 152.6, p25NPR: 85.0, p75NPR: 230.0, minPriceNPR: 42.0, maxPriceNPR: 312.0, dataPoints: 216 },
        { monthIndex: 7, monthName: "August", nepaliMonth: "भदौ-असोज (Aug)", avgPriceNPR: 150.4, p25NPR: 85.0, p75NPR: 213.33, minPriceNPR: 45.0, maxPriceNPR: 280.0, dataPoints: 206 },
        { monthIndex: 8, monthName: "September", nepaliMonth: "असोज-कात्तिक (Sep)", avgPriceNPR: 127.4, p25NPR: 86.67, p75NPR: 170.0, minPriceNPR: 45.0, maxPriceNPR: 216.67, dataPoints: 179 },
        { monthIndex: 9, monthName: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", avgPriceNPR: 105.4, p25NPR: 55.0, p75NPR: 150.0, minPriceNPR: 40.0, maxPriceNPR: 210.0, dataPoints: 186 },
        { monthIndex: 10, monthName: "November", nepaliMonth: "मंसिर-पुस (Nov)", avgPriceNPR: 91.7, p25NPR: 55.0, p75NPR: 140.0, minPriceNPR: 35.0, maxPriceNPR: 205.0, dataPoints: 179 },
        { monthIndex: 11, monthName: "December", nepaliMonth: "पुस-माघ (Dec)", avgPriceNPR: 86.1, p25NPR: 56.67, p75NPR: 120.0, minPriceNPR: 34.0, maxPriceNPR: 160.0, dataPoints: 185 }
      ],
      peakWindow: { month: "July", nepaliMonth: "साउन-भदौ (Jul)", historicalAvgPrice: 152.6, expectedRange: "Rs 85.0 – 230.0/kg" },
      glutRiskWindow: { month: "December", nepaliMonth: "पुस-माघ (Dec)", historicalAvgPrice: 86.1, expectedRange: "Rs 34.0 – 56.67/kg" },
      yearlyTrend: { "2020": 118.7, "2021": 66.4, "2022": 55.9, "2023": 176.2, "2024": 208.4, "2025": 100.6, "2026": 128.7 }
    },
    chilli: {
      cropId: "chilli",
      totalDataPoints: 8794,
      monthlySeasonality: [
        { monthIndex: 0, monthName: "January", nepaliMonth: "माघ-फागुन (Jan)", avgPriceNPR: 137.2, p25NPR: 66.0, p75NPR: 110.0, minPriceNPR: 45.0, maxPriceNPR: 750.0, dataPoints: 758 },
        { monthIndex: 1, monthName: "February", nepaliMonth: "फागुन-चैत (Feb)", avgPriceNPR: 137.1, p25NPR: 75.0, p75NPR: 126.67, minPriceNPR: 35.0, maxPriceNPR: 850.0, dataPoints: 659 },
        { monthIndex: 2, monthName: "March", nepaliMonth: "चैत-वैशाख (Mar)", avgPriceNPR: 163.2, p25NPR: 85.0, p75NPR: 176.67, minPriceNPR: 45.0, maxPriceNPR: 850.0, dataPoints: 683 },
        { monthIndex: 3, monthName: "April", nepaliMonth: "वैशाख-जेठ (Apr)", avgPriceNPR: 119.8, p25NPR: 65.0, p75NPR: 105.0, minPriceNPR: 38.0, maxPriceNPR: 750.0, dataPoints: 736 },
        { monthIndex: 4, monthName: "May", nepaliMonth: "जेठ-असार (May)", avgPriceNPR: 111.5, p25NPR: 55.0, p75NPR: 110.0, minPriceNPR: 20.0, maxPriceNPR: 550.0, dataPoints: 752 },
        { monthIndex: 5, monthName: "June", nepaliMonth: "असार-साउन (Jun)", avgPriceNPR: 88.5, p25NPR: 37.67, p75NPR: 95.0, minPriceNPR: 12.0, maxPriceNPR: 450.0, dataPoints: 809 },
        { monthIndex: 6, monthName: "July", nepaliMonth: "साउन-भदौ (Jul)", avgPriceNPR: 118.4, p25NPR: 50.0, p75NPR: 168.0, minPriceNPR: 17.0, maxPriceNPR: 450.0, dataPoints: 859 },
        { monthIndex: 7, monthName: "August", nepaliMonth: "भदौ-असोज (Aug)", avgPriceNPR: 117.0, p25NPR: 65.0, p75NPR: 140.0, minPriceNPR: 35.0, maxPriceNPR: 376.67, dataPoints: 819 },
        { monthIndex: 8, monthName: "September", nepaliMonth: "असोज-कात्तिक (Sep)", avgPriceNPR: 112.1, p25NPR: 65.0, p75NPR: 116.67, minPriceNPR: 23.0, maxPriceNPR: 350.0, dataPoints: 703 },
        { monthIndex: 9, monthName: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", avgPriceNPR: 137.0, p25NPR: 86.67, p75NPR: 174.0, minPriceNPR: 26.67, maxPriceNPR: 390.0, dataPoints: 639 },
        { monthIndex: 10, monthName: "November", nepaliMonth: "मंसिर-पुस (Nov)", avgPriceNPR: 114.9, p25NPR: 75.0, p75NPR: 135.0, minPriceNPR: 45.0, maxPriceNPR: 355.0, dataPoints: 650 },
        { monthIndex: 11, monthName: "December", nepaliMonth: "पुस-माघ (Dec)", avgPriceNPR: 127.6, p25NPR: 65.0, p75NPR: 135.0, minPriceNPR: 45.0, maxPriceNPR: 490.0, dataPoints: 727 }
      ],
      peakWindow: { month: "March", nepaliMonth: "चैत-वैशाख (Mar)", historicalAvgPrice: 163.2, expectedRange: "Rs 85.0 – 176.67/kg" },
      glutRiskWindow: { month: "June", nepaliMonth: "असार-साउन (Jun)", historicalAvgPrice: 88.5, expectedRange: "Rs 12.0 – 37.67/kg" },
      yearlyTrend: { "2020": 108.3, "2021": 107.0, "2022": 115.6, "2023": 134.5, "2024": 131.6, "2025": 108.3, "2026": 167.3 }
    },
    coriander: {
      cropId: "coriander",
      totalDataPoints: 2398,
      monthlySeasonality: [
        { monthIndex: 0, monthName: "January", nepaliMonth: "माघ-फागुन (Jan)", avgPriceNPR: 81.9, p25NPR: 56.67, p75NPR: 100.0, minPriceNPR: 25.0, maxPriceNPR: 175.0, dataPoints: 217 },
        { monthIndex: 1, monthName: "February", nepaliMonth: "फागुन-चैत (Feb)", avgPriceNPR: 60.3, p25NPR: 42.0, p75NPR: 66.67, minPriceNPR: 32.5, maxPriceNPR: 276.67, dataPoints: 196 },
        { monthIndex: 2, monthName: "March", nepaliMonth: "चैत-वैशाख (Mar)", avgPriceNPR: 55.9, p25NPR: 45.0, p75NPR: 65.0, minPriceNPR: 25.0, maxPriceNPR: 125.0, dataPoints: 208 },
        { monthIndex: 3, monthName: "April", nepaliMonth: "वैशाख-जेठ (Apr)", avgPriceNPR: 109.7, p25NPR: 50.0, p75NPR: 146.67, minPriceNPR: 30.0, maxPriceNPR: 433.33, dataPoints: 203 },
        { monthIndex: 4, monthName: "May", nepaliMonth: "जेठ-असार (May)", avgPriceNPR: 107.8, p25NPR: 50.0, p75NPR: 126.67, minPriceNPR: 33.0, maxPriceNPR: 550.0, dataPoints: 215 },
        { monthIndex: 5, monthName: "June", nepaliMonth: "असार-साउन (Jun)", avgPriceNPR: 125.5, p25NPR: 55.0, p75NPR: 136.0, minPriceNPR: 26.25, maxPriceNPR: 485.0, dataPoints: 210 },
        { monthIndex: 6, monthName: "July", nepaliMonth: "साउन-भदौ (Jul)", avgPriceNPR: 226.7, p25NPR: 123.33, p75NPR: 300.0, minPriceNPR: 50.0, maxPriceNPR: 600.0, dataPoints: 216 },
        { monthIndex: 7, monthName: "August", nepaliMonth: "भदौ-असोज (Aug)", avgPriceNPR: 271.7, p25NPR: 175.0, p75NPR: 370.0, minPriceNPR: 75.0, maxPriceNPR: 576.67, dataPoints: 207 },
        { monthIndex: 8, monthName: "September", nepaliMonth: "असोज-कात्तिक (Sep)", avgPriceNPR: 203.3, p25NPR: 110.0, p75NPR: 285.0, minPriceNPR: 52.0, maxPriceNPR: 483.33, dataPoints: 177 },
        { monthIndex: 9, monthName: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", avgPriceNPR: 209.5, p25NPR: 150.0, p75NPR: 233.33, minPriceNPR: 55.0, maxPriceNPR: 690.0, dataPoints: 186 },
        { monthIndex: 10, monthName: "November", nepaliMonth: "मंसिर-पुस (Nov)", avgPriceNPR: 176.7, p25NPR: 92.0, p75NPR: 202.0, minPriceNPR: 56.0, maxPriceNPR: 571.43, dataPoints: 178 },
        { monthIndex: 11, monthName: "December", nepaliMonth: "पुस-माघ (Dec)", avgPriceNPR: 103.3, p25NPR: 75.0, p75NPR: 130.0, minPriceNPR: 45.0, maxPriceNPR: 225.0, dataPoints: 185 }
      ],
      peakWindow: { month: "August", nepaliMonth: "भदौ-असोज (Aug)", historicalAvgPrice: 271.7, expectedRange: "Rs 175.0 – 370.0/kg" },
      glutRiskWindow: { month: "March", nepaliMonth: "चैत-वैशाख (Mar)", historicalAvgPrice: 55.9, expectedRange: "Rs 25.0 – 45.0/kg" },
      yearlyTrend: { "2020": 146.2, "2021": 143.0, "2022": 166.5, "2023": 113.8, "2024": 161.4, "2025": 152.5, "2026": 106.8 }
    },
    garlic: {
      cropId: "garlic",
      totalDataPoints: 4557,
      monthlySeasonality: [
        { monthIndex: 0, monthName: "January", nepaliMonth: "माघ-फागुन (Jan)", avgPriceNPR: 238.1, p25NPR: 196.0, p75NPR: 285.0, minPriceNPR: 85.0, maxPriceNPR: 595.0, dataPoints: 376 },
        { monthIndex: 1, monthName: "February", nepaliMonth: "फागुन-चैत (Feb)", avgPriceNPR: 260.1, p25NPR: 190.0, p75NPR: 290.0, minPriceNPR: 85.0, maxPriceNPR: 655.0, dataPoints: 285 },
        { monthIndex: 2, monthName: "March", nepaliMonth: "चैत-वैशाख (Mar)", avgPriceNPR: 213.6, p25NPR: 175.0, p75NPR: 245.0, minPriceNPR: 95.0, maxPriceNPR: 555.0, dataPoints: 374 },
        { monthIndex: 3, monthName: "April", nepaliMonth: "वैशाख-जेठ (Apr)", avgPriceNPR: 202.7, p25NPR: 130.0, p75NPR: 276.0, minPriceNPR: 95.0, maxPriceNPR: 395.0, dataPoints: 406 },
        { monthIndex: 4, monthName: "May", nepaliMonth: "जेठ-असार (May)", avgPriceNPR: 201.1, p25NPR: 126.67, p75NPR: 250.0, minPriceNPR: 85.0, maxPriceNPR: 395.0, dataPoints: 431 },
        { monthIndex: 5, monthName: "June", nepaliMonth: "असार-साउन (Jun)", avgPriceNPR: 174.5, p25NPR: 148.0, p75NPR: 207.5, minPriceNPR: 66.67, maxPriceNPR: 260.0, dataPoints: 420 },
        { monthIndex: 6, monthName: "July", nepaliMonth: "साउन-भदौ (Jul)", avgPriceNPR: 187.4, p25NPR: 155.0, p75NPR: 215.0, minPriceNPR: 105.0, maxPriceNPR: 276.0, dataPoints: 430 },
        { monthIndex: 7, monthName: "August", nepaliMonth: "भदौ-असोज (Aug)", avgPriceNPR: 195.2, p25NPR: 156.5, p75NPR: 230.0, minPriceNPR: 115.0, maxPriceNPR: 310.0, dataPoints: 412 },
        { monthIndex: 8, monthName: "September", nepaliMonth: "असोज-कात्तिक (Sep)", avgPriceNPR: 210.3, p25NPR: 165.0, p75NPR: 240.0, minPriceNPR: 125.0, maxPriceNPR: 330.0, dataPoints: 353 },
        { monthIndex: 9, monthName: "October", nepaliMonth: "कात्तिक-मंसिर (Oct)", avgPriceNPR: 217.0, p25NPR: 165.0, p75NPR: 255.0, minPriceNPR: 96.67, maxPriceNPR: 310.0, dataPoints: 370 },
        { monthIndex: 10, monthName: "November", nepaliMonth: "मंसिर-पुस (Nov)", avgPriceNPR: 224.2, p25NPR: 165.0, p75NPR: 290.0, minPriceNPR: 76.67, maxPriceNPR: 355.0, dataPoints: 358 },
        { monthIndex: 11, monthName: "December", nepaliMonth: "पुस-माघ (Dec)", avgPriceNPR: 234.6, p25NPR: 185.0, p75NPR: 290.0, minPriceNPR: 96.67, maxPriceNPR: 435.0, dataPoints: 342 }
      ],
      peakWindow: { month: "February", nepaliMonth: "फागुन-चैत (Feb)", historicalAvgPrice: 260.1, expectedRange: "Rs 190.0 – 290.0/kg" },
      glutRiskWindow: { month: "June", nepaliMonth: "असार-साउन (Jun)", historicalAvgPrice: 174.5, expectedRange: "Rs 66.67 – 148.0/kg" },
      yearlyTrend: { "2020": 234.0, "2021": 192.2, "2022": 157.4, "2023": 211.9, "2024": 259.9, "2025": 223.6, "2026": 195.6 }
    }
  }
};

/**
 * Standardized Crop ID normalizer
 */
export function normalizeCropId(idOrName: string): string {
  const clean = (idOrName || '').toLowerCase().trim().replace(/[\s_-]+/g, '_');
  if (clean.includes('tomato') || clean.includes('golbheda')) return 'tomato';
  if (clean.includes('potato') || clean.includes('aalu')) return 'potato';
  if (clean.includes('onion') || clean.includes('pyaj')) return 'onion';
  if (clean.includes('cauli') || clean.includes('kauli')) return 'cauliflower';
  if (clean.includes('cabbage') || clean.includes('banda')) return 'cabbage';
  if (clean.includes('carrot') || clean.includes('gajar')) return 'carrot';
  if (clean.includes('bean') || clean.includes('simi')) return 'beans';
  if (clean.includes('pea') || clean.includes('kerau')) return 'peas';
  if (clean.includes('bitter') || clean.includes('karela')) return 'bitter_gourd';
  if (clean.includes('bottle') || clean.includes('lauka')) return 'bottle_gourd';
  if (clean.includes('radish') || clean.includes('mula')) return 'radish';
  if (clean.includes('brinjal') || clean.includes('eggplant') || clean.includes('bhanta')) return 'brinjal';
  if (clean.includes('pumpkin') || clean.includes('farsi')) return 'pumpkin';
  if (clean.includes('okra') || clean.includes('bhindi') || clean.includes('finger')) return 'ladies_finger';
  if (clean.includes('spinach') || clean.includes('palungo')) return 'spinach';
  if (clean.includes('mushroom') || clean.includes('chyau')) return 'mushroom';
  if (clean.includes('cucumber') || clean.includes('kankro')) return 'cucumber';
  if (clean.includes('ginger') || clean.includes('aduwa')) return 'ginger';
  if (clean.includes('chilli') || clean.includes('chili') || clean.includes('khursani')) return 'chilli';
  if (clean.includes('coriander') || clean.includes('dhaniya')) return 'coriander';
  if (clean.includes('garlic') || clean.includes('lasun')) return 'garlic';
  return clean;
}

/**
 * Get Kalimati 2020-2026 data for a crop
 */
export function getKalimatiCrop(cropId: string): KalimatiCropSummary | undefined {
  const norm = normalizeCropId(cropId);
  return KALIMATI_DATASET.crops[norm];
}

/**
 * Get current (September 2026) verified benchmark price from Kalimati dataset
 */
export function getKalimatiCurrentPrice(cropId: string): number {
  const crop = getKalimatiCrop(cropId);
  if (!crop) return 45;
  // Current month is September (monthIndex: 8)
  const currentMonthData = crop.monthlySeasonality.find((m) => m.monthIndex === 8);
  if (currentMonthData) {
    return currentMonthData.avgPriceNPR;
  }
  return crop.yearlyTrend["2026"] || 45;
}

/**
 * Get full historical statistical metrics across 2020-2026
 */
export function getKalimatiHistoricalStats(cropId: string) {
  const crop = getKalimatiCrop(cropId);
  if (!crop) return null;

  const months = crop.monthlySeasonality;
  const currentMonth = months.find((m) => m.monthIndex === 8) || months[0];
  const prevMonth = months.find((m) => m.monthIndex === 7) || months[0];
  const nextMonth = months.find((m) => m.monthIndex === 9) || months[0];

  const allAvgs = months.map((m) => m.avgPriceNPR);
  const overallAvg = Number((allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length).toFixed(1));
  const minHistorical = Math.min(...months.map((m) => m.minPriceNPR));
  const maxHistorical = Math.max(...months.map((m) => m.maxPriceNPR));

  const monthlyChangePct = Number((((currentMonth.avgPriceNPR - prevMonth.avgPriceNPR) / prevMonth.avgPriceNPR) * 100).toFixed(1));
  const nextMonthOutlookPct = Number((((nextMonth.avgPriceNPR - currentMonth.avgPriceNPR) / currentMonth.avgPriceNPR) * 100).toFixed(1));

  return {
    cropId: crop.cropId,
    totalRecords: crop.totalDataPoints,
    currentPrice: currentMonth.avgPriceNPR,
    currentP25: currentMonth.p25NPR,
    currentP75: currentMonth.p75NPR,
    currentMin: currentMonth.minPriceNPR,
    currentMax: currentMonth.maxPriceNPR,
    overallAvg,
    minHistorical,
    maxHistorical,
    monthlyChangePct,
    nextMonthOutlookPct,
    peakWindow: crop.peakWindow,
    glutRiskWindow: crop.glutRiskWindow,
    yearlyTrend: crop.yearlyTrend,
    monthlySeasonality: crop.monthlySeasonality,
  };
}

export const getKalimatiCropSummary = getKalimatiHistoricalStats;
