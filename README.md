# 🌱 KrishiSetu Nepal (कृषि सेतु नेपाल)
### *Agricultural Decision Engine & Shared Freight Cooperative for Nepali Smallholders*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Backend-Express%20v4-green.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)

---

## 📌 Executive Summary

Smallholder farmers across Nepal (in agricultural corridors like Dhading, Kavre, Nuwakot, and Chitwan) face three structural hurdles:
1. **Severe Information Asymmetry**: Intermediary middlemen exploit farmers by quoting local farmgate rates 40–60% below the actual wholesale clearing rate at the **Kalimati Fruit & Vegetable Market Development Board (कालीमाटी फलफूल तथा तरकारी बजार)** in Kathmandu.
2. **Punitive Transport Costs**: Smallholders with 200–500 kg of produce cannot charter an entire Bolero pickup or mini-truck alone, forcing them to pay high individual freight charges (Rs. 6–8/kg).
3. **Suboptimal Harvest Timing**: Without visibility into price momentum, highway closures (e.g., Prithvi Highway / Mugling landslides), and seasonal glut cycles, farmers harvest during market crashes instead of peak price windows.

**KrishiSetu** bridges this divide by providing:
- **Live Scraped Kalimati Wholesale Benchmarks** with automatic offline fallback to 107,599 historical auction records (2020–2026).
- **Econometric 7-Day & 14-Day Price Forecasting** that couples seasonal baseline distributions with momentum and supply elasticity.
- **Actionable Decision Engine ("Sell Today" vs. "Wait X Days")** that mathematically accounts for crop perishability, storage decay, and net profit.
- **Cooperative Freight Pooling Network** that coordinates local farmers on the same transport route, slashing logistics costs by 55%.
- **KrishiMitra Bilingual AI Advisory** grounded in local agricultural knowledge and real-time mandi data in English and Nepali (नेपाली).

---

## 🏛️ System Architecture

```
                               ┌──────────────────────────────────────────────┐
                               │           FARMER CLIENT (Vite + React)       │
                               │  - Nepali / English Bilingual Toggle         │
                               │  - Decision Engine & Trajectory Charts       │
                               │  - Group Freight Pooling Calculator          │
                               │  - Digital Khata (Farm Records System)       │
                               │  - Offline PWA Support & Local State Sync    │
                               └──────────────────────┬───────────────────────┘
                                                      │
                                                      │ REST API (/api/*)
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │             EXPRESS BACKEND ENGINE           │
                               │  - Port 3000 Unified Server                  │
                               │  - In-Memory Auth & Farm Records Store       │
                               │  - Fallback Cache & Request Rate Limiting    │
                               └───────┬──────────────┬──────────────┬────────┘
                                       │              │              │
                   ┌───────────────────┘              │              └──────────────────┐
                   ▼                                  ▼                                 ▼
    ┌─────────────────────────────┐    ┌─────────────────────────────┐    ┌─────────────────────────────┐
    │     KALIMATI SCRAPER        │    │    PRICE FORECAST ENGINE    │    │      KRISHIMITRA AI         │
    │ - Scrapes kalimatimarket    │    │ - Autoregressive Momentum   │    │ - Gemini 2.5 Flash          │
    │   .gov.np/price             │    │ - 107k Multi-Year Baseline  │    │ - Grounded in current spot  │
    │ - Devanagari ➔ Digit parser │    │ - Elasticity & Decay Matrix │    │   prices & farming context  │
    │ - 7-second auto-timeout     │    │ - Optimizes Net Day Profit  │    │ - Strict Nepali output mode │
    └─────────────────────────────┘    └─────────────────────────────┘    └─────────────────────────────┘
```

---

## 📊 How the Scraping & Data Pipeline Works

### 1. Web Scraping Routine (`kalimatiScraper.ts`)
- **Target Source**: Official portal of the Kalimati Fruit & Vegetable Market Development Board (`kalimatimarket.gov.np/price`).
- **Devanagari Conversion**: The official site renders numerical prices in Nepali script (`०, १, २, ३, ४, ५, ६, ७, ८, ९`). The scraper processes every table row through a character translation table to extract clean integer/float values for minimum, maximum, and average wholesale prices.
- **Commodity Entity Resolution**: Uses a phonetic and text-cleaning tokenizer to resolve varying government labels (e.g. `गोलभेडा ठूलो(नेपाली)`, `गोलभेडा सानो(लोकल)`, `आलु रातो`, `काउली स्थानीय`) to canonical IDs (`tomato`, `potato`, `cauliflower`, `cabbage`, `onion`, `green_chilli`).

### 2. High-Availability Fallback Cache (`kalimatiDataset.ts`)
- Government web servers experience frequent downtimes, network latency, and connectivity hiccups during peak morning trading hours (4:00 AM – 8:00 AM).
- If the live scraping request exceeds 7,000ms or fails, KrishiSetu automatically switches to an internal empirical database compiled from **107,599 historical daily auctions (2020 through 2026)**. The farmer's app never crashes or displays blank screens.

---

## 🧮 How the Price Prediction & Decision Engine Works

The forecasting model is **not a generic linear regression ($y = mx + b$)** nor an opaque black-box neural network that can hallucinate under unseasonal conditions. It is an **agricultural econometric model** integrating three empirical components:

$$\hat{P}_t = \text{round}\left( P_0 + \Delta_{\text{momentum}}(t) + \Delta_{\text{seasonal}}(t) + \Delta_{\text{supply}}(t) + \epsilon_t \right)$$

### 1. Autoregressive Momentum ($\Delta_{\text{momentum}}$)
Calculated from the directional velocity between yesterday's price ($P_{-1}$) and today's spot price ($P_0$):
$$\text{velocity} = P_0 - P_{-1}$$
$$\Delta_{\text{momentum}}(t) = \text{velocity} \times \alpha^t$$
*where $\alpha \in [0.65, 0.85]$ represents the temporal decay coefficient.*

### 2. 6-Year Empirical Seasonality & Mean Reversion ($\Delta_{\text{seasonal}}$)
Using the multi-year Kalimati dataset, the system holds empirical distributions ($P_{25}, P_{50}, P_{75}$) for all 12 Nepali calendar months (Baisakh to Chaitra). If an abnormal event pushed cauliflower to Rs. 120/kg, the model applies a mean-reversion force pulling prices back toward the seasonal equilibrium ($\mu_m \approx \text{Rs. } 65$):
$$\Delta_{\text{seasonal}}(t) = (\mu_m - P_0) \times (1 - e^{-\lambda t})$$

### 3. Supply Inflow & Road Disruption Elasticity ($\Delta_{\text{supply}}$)
Calculates wholesale clearing price impact when daily incoming truck volume fluctuates against standard market capacity ($V_{\text{actual}}$ vs. $V_{\text{expected}}$), factoring in landslides along the Narayanghat–Mugling highway or Prithvi Highway:
$$\Delta_{\text{supply}} = -E_s \times \left(\frac{V_{\text{actual}} - V_{\text{expected}}}{V_{\text{expected}}}\right) \times P_0$$

### 4. Perishability & Spoilage Penalty ($L_t$)
Holding crops on the farm introduces biological deterioration:
- **High Perishability** (Tomato, Cauliflower, Spinach): 6–10% weight/quality loss per day. Max holding: 2–3 days.
- **Medium Perishability** (Cabbage, Cucumber, Capsicum): 3–5% loss per day. Max holding: 4–6 days.
- **Low Perishability / Durable** (Red Potato, Dry Onion, Ginger): $<0.5\%$ loss per day. Safe holding: 15–30 days.

### 5. Financial Optimization ("Sell Now" vs. "Wait X Days")
$$\text{Net Margin} = \max_{t} \left[ \hat{P}_t \times (1 - L_t \times t) - \text{FreightCost}_{\text{pooled}} \right] - \left[ P_0 - \text{FreightCost}_{\text{solo}} \right]$$
- If $\text{Net Margin} \ge +10\%$ and within safe holding limits $\rightarrow$ Issues **"पर्खनुहोस् (Wait $t^*$ Days)"** with projected additional profit.
- Otherwise $\rightarrow$ Issues **"अहिले बेच्नुहोस् (Sell Today)"** to avoid spoilage erosion.

---

## 🚚 Group Freight Pooling Mechanics

Individual smallholders transporting 300 kg to Kalimati pay **Rs. 6.0/kg** for dedicated cargo space.
By pooling cargo space on shared Bolero or Tata Ace pickups with neighboring farmers in the same district:
- Fixed pickup charter cost ($\approx \text{Rs. } 12,000$) is distributed across the vehicle's total cargo capacity ($2,000 - 2,500\text{ kg}$).
- Transport cost drops down to **Rs. 2.2 – 2.7/kg** (a **55% net logistics savings**).
- For a typical 500 kg harvest, this saves **Rs. 1,650 – Rs. 2,000 per trip** straight into the farmer's pocket.

---

## 🌐 Language & Localization

The user interface features a native one-click switch between **English** and **नेपाली (Nepali)** in the top navigation bar:
- Full Devanagari translations across all navigation links, metrics, card labels, and chart tooltips.
- Context-aware Nepali number formatting (`रु ४५/केजी`).
- Dynamic language propagation to backend AI endpoints (`KrishiMitra`), ensuring recommendations are delivered entirely in native Devanagari script.

---

## 🚀 Getting Started & Local Development

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/krishisetu.git
   cd krishisetu
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment configuration:
   ```bash
   cp .env.example .env
   ```
   *(Optional)* Add your Google Gemini API key if using AI Chatbot features:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Launch the Unified Development Server**:
   ```bash
   npm run dev
   ```
   The application will start on **http://localhost:3000** (serving both backend API routes `/api/*` and the frontend React application with instant compilation).

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🧪 Testing & Verification

Run the TypeScript typecheck and syntax validator:
```bash
npm run lint
```

Test backend health status directly via cURL:
```bash
curl -s http://localhost:3000/api/health
```
Expected output:
```json
{"status":"ok","time":"...","service":"KrishiSetu Backend API"}
```

---

## 📁 Repository Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/      # REST API route handlers (Market, Auth, AI, Calculator)
│   │   ├── data/             # Historical 107k Kalimati auction records
│   │   ├── scrapers/         # Live Kalimati HTML scraper & Devanagari parser
│   │   └── services/         # Decision engine, momentum model, auth store, SMS service
│   └── tests/                # Automated API test suite
├── src/
│   ├── api/                  # Frontend HTTP clients connecting to /api/*
│   ├── components/           # UI views (Header, ForecastEngine, GroupPooling, Khata, KrishiMitra)
│   ├── context/              # LanguageContext (EN/NE), ThemeContext (Light/Dark)
│   ├── data/                 # Baseline agricultural profiles and district data
│   ├── i18n/                 # English and Nepali translations dictionary
│   ├── services/             # Client-side caching and session management
│   ├── types/                # TypeScript data interfaces
│   ├── App.tsx               # Root application component
│   └── main.tsx              # React DOM entrypoint
├── shared/
│   └── types/                # Shared TypeScript contracts between client & server
├── server.ts                 # Full-stack production entrypoint (Express + Vite)
├── package.json              # Project dependencies and build scripts
└── metadata.json             # AI Studio applet specifications
```

---

## 🛡️ License

This project is open-source and released under the [MIT License](LICENSE).
Built with ❤️ for the resilient farmers of Nepal.
