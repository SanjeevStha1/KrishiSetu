import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { MarketDataService } from './marketDataService';
import { findDistrictMandi } from '../data/nepalMandis';

let aiClient: GoogleGenAI | null = null;

/**
 * Initializes the server-only @google/genai SDK client using process.env.GEMINI_API_KEY.
 */
export function getGeminiAI(): GoogleGenAI | null {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export class GeminiService {
  public static async generateKrishiMitraReply(
    messages: Array<{ role: string; text?: string; content?: string }>,
    userContext?: any,
    language: 'en' | 'ne' = 'en'
  ): Promise<string> {
    const ai = getGeminiAI();

    if (!ai) {
      const lastUserMsg = messages[messages.length - 1]?.text || messages[messages.length - 1]?.content || '';
      return this.generateSmartFallbackReply(lastUserMsg, userContext, language);
    }

    const isNp = language === 'ne';
    const districtInput = userContext?.district || 'Chitwan';
    const mandi = findDistrictMandi(districtInput);
    const crops = userContext?.crops || userContext?.primaryCrops || ['tomato', 'potato', 'cauliflower'];
    const cropStr = Array.isArray(crops) ? crops.join(', ') : String(crops);

    // Fetch live 3-layer localized rates for the farmer's district
    let liveRateSummary = 'Kalimati Wholesale Rates: Tomato ~Rs 53/kg, Potato ~Rs 32/kg, Cauliflower ~Rs 65/kg.';
    try {
      const regional = await MarketDataService.getDistrictCommodityPrices(mandi.id);
      const topRates = regional.prices
        .slice(0, 6)
        .map((p) => `${p.name}: Rs ${p.localizedWholesalePrice}/kg (${p.priceSourceLabelEn})`)
        .join('; ');
      if (topRates) {
        liveRateSummary = `Live ${mandi.name} (${mandi.province}) rates: ${topRates}.`;
      }
    } catch {
      // keep grounded summary fallback
    }

    const systemInstruction = `You are Krishi Mitra (कृषि मित्र), a calm, respectful, neighborly agricultural assistant inside the KrishiSetu application for Nepali smallholder farmers across all 77 districts.
Your role is to guide farmers on localized mandi prices, harvest timing decisions (Hold vs Sell), and cooperative transport pooling savings.

Farmer Context:
- Name: ${userContext?.name || 'Farmer'}
- District: ${mandi.name} (${mandi.province}, ${mandi.mandiName})
- Primary Crops: ${cropStr}

LIVE GROUNDED KRISHISETU DATA:
- ${liveRateSummary}
- Transport Freight Pooling: Shared transport pool from ${mandi.name} costs ~Rs ${mandi.pooledFreightPerKg}/kg compared to Rs ${mandi.soloFreightPerKg}/kg solo dispatch.

LANGUAGE MANDATE:
${isNp ? 'Respond STRICTLY and ENTIRELY in polite, natural Nepali (नेपाली - Devanagari script). Do not mix English sentences.' : 'Respond STRICTLY and ENTIRELY in polite, clear English.'}

CRITICAL RULES:
1. Stay focused on agricultural market pricing, transport pooling, harvest decisions, and crop revenue.
2. Keep responses concise and conversational: 2 to 4 sentences maximum.
3. Never fabricate prices; rely strictly on the live KrishiSetu context provided above.`;

    const contents = messages
      .filter((m) => (m.text || m.content || '').trim().length > 0)
      .map((m) => ({
        role: m.role === 'assistant' || m.role === 'model' ? ('model' as const) : ('user' as const),
        parts: [{ text: (m.text || m.content || '').trim() }],
      }));

    if (contents.length === 0) {
      return isNp
        ? 'नमस्ते! म कृषि मित्र हुँ। म कसरी सहयोग गर्न सक्छु?'
        : 'Hello! I am Krishi Mitra. How can I help you today?';
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction,
        },
      });

      return response.text?.trim() || (isNp ? 'नमस्ते! म कृषि मित्र हुँ। म कसरी सहयोग गर्न सक्छु?' : 'Hello! I am Krishi Mitra. How can I help you?');
    } catch (err: any) {
      console.warn('[GeminiService] gemini-4-hydrogen call failed, attempting gemini-3.1-flash-lite fallback:', err?.message);
      try {
        const fallbackRes = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents,
          config: {
            systemInstruction,
          },
        });
        return fallbackRes.text?.trim() || (isNp ? 'नमस्ते! म कृषि मित्र हुँ। म कसरी सहयोग गर्न सक्छु?' : 'Hello! I am Krishi Mitra. How can I help you?');
      } catch (innerErr: any) {
        console.warn('[GeminiService] Fallback model failed, using grounded rule engine:', innerErr?.message);
        const lastUserMsg = messages[messages.length - 1]?.text || messages[messages.length - 1]?.content || '';
        return this.generateSmartFallbackReply(lastUserMsg, userContext, language);
      }
    }
  }

  public static async estimateCalculatorInputs(params: {
    cropId: string;
    district: string;
    landSize: number;
    landUnit: string;
    notes?: string;
  }) {
    const { cropId, district, landSize, landUnit, notes } = params;
    const safeCrop = cropId || 'tomato';
    const mandi = findDistrictMandi(district || 'chitwan');
    const safeDistrict = mandi.id;

    const UNIT_M2_MAP: Record<string, number> = {
      ropani: 508.72,
      aana: 31.795,
      paisa: 7.94875,
      daam: 1.9871875,
      bigha: 6772.63,
      kattha: 338.6315,
      dhur: 16.931575,
      hectare: 10000.0,
      sqm: 1.0,
    };

    const selectedUnit = (landUnit || 'ropani').toLowerCase();
    const unitMultiplier = UNIT_M2_MAP[selectedUnit] || 508.72;
    const rawLandSize = Number(landSize) || 1.0;
    const canonicalSqMeters = rawLandSize * unitMultiplier;
    const ropaniEquivalent = Number((canonicalSqMeters / 508.72).toFixed(3));

    const benchmarkData: Record<string, { basePrice: number; yieldPerRopaniKg: number; prodCostPerKg: number }> = {
      tomato: { basePrice: 53, yieldPerRopaniKg: 650, prodCostPerKg: 14 },
      potato: { basePrice: 32, yieldPerRopaniKg: 850, prodCostPerKg: 12 },
      cauliflower: { basePrice: 65, yieldPerRopaniKg: 500, prodCostPerKg: 10 },
      cabbage: { basePrice: 47, yieldPerRopaniKg: 700, prodCostPerKg: 8 },
      onion: { basePrice: 44, yieldPerRopaniKg: 450, prodCostPerKg: 18 },
      green_chilli: { basePrice: 167, yieldPerRopaniKg: 280, prodCostPerKg: 24 },
      chilli: { basePrice: 167, yieldPerRopaniKg: 280, prodCostPerKg: 24 },
      cucumber: { basePrice: 53, yieldPerRopaniKg: 600, prodCostPerKg: 11 },
      bitter_gourd: { basePrice: 90, yieldPerRopaniKg: 380, prodCostPerKg: 16 },
    };

    const cropBench = benchmarkData[safeCrop.toLowerCase()] || benchmarkData.tomato;

    // Ground expected sale price dynamically on live 3-layer 77-district data
    let liveLocalizedPrice = cropBench.basePrice;
    try {
      const reg = await MarketDataService.getDistrictCommodityPrices(mandi.id);
      const found = reg.prices.find((p) => p.cropId === safeCrop.toLowerCase());
      if (found) liveLocalizedPrice = found.localizedWholesalePrice;
    } catch {
      // use baseline
    }

    const defaultQty = Math.round(cropBench.yieldPerRopaniKg * ropaniEquivalent);
    const defaultSoloFreight = mandi.soloFreightPerKg;
    const totalProd = Math.round(cropBench.prodCostPerKg * defaultQty);

    const fallbackEstimate = {
      cropId: safeCrop,
      district: safeDistrict,
      quantityKg: defaultQty,
      expectedSalePrice: liveLocalizedPrice,
      inputCostPerKg: cropBench.prodCostPerKg,
      seedCost: Math.round(totalProd * 0.28),
      fertilizerCost: Math.round(totalProd * 0.36),
      laborCost: Math.round(totalProd * 0.24),
      irrigationCost: Math.round(totalProd * 0.12),
      soloTransportCostPerKg: defaultSoloFreight,
      reasoningSummary: `Grounded on ${rawLandSize} ${selectedUnit} (~${Math.round(canonicalSqMeters)} m² / ${ropaniEquivalent} Ropani eqv) standard yield (~${defaultQty} kg) and live ${mandi.name} localized benchmark of Rs ${liveLocalizedPrice}/kg.`,
    };

    const ai = getGeminiAI();
    if (!ai) {
      return { estimate: fallbackEstimate, source: 'grounded_rules' };
    }

    try {
      const proposeCalculatorInputsTool: FunctionDeclaration = {
        name: 'proposeCalculatorInputs',
        description: 'Propose realistic agricultural input parameters for a Nepali smallholder farmer based on crop, district, land size, and canonical area. Propose INPUT VALUES only, not computed profit margins.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            cropId: { type: Type.STRING, description: 'The crop ID, e.g. tomato, cauliflower, potato' },
            quantityKg: { type: Type.NUMBER, description: 'Estimated harvest quantity in kg for this land area' },
            expectedSalePrice: { type: Type.NUMBER, description: 'Estimated wholesale selling price in NPR/kg' },
            inputCostPerKg: { type: Type.NUMBER, description: 'Estimated production input cost per kg in NPR' },
            seedCost: { type: Type.NUMBER, description: 'Estimated seed cost in NPR' },
            fertilizerCost: { type: Type.NUMBER, description: 'Estimated fertilizer and manure cost in NPR' },
            laborCost: { type: Type.NUMBER, description: 'Estimated field labor cost in NPR' },
            irrigationCost: { type: Type.NUMBER, description: 'Estimated irrigation/water cost in NPR' },
            soloTransportCostPerKg: { type: Type.NUMBER, description: 'Solo transport freight rate per kg to terminal mandi' },
            reasoningSummary: { type: Type.STRING, description: 'Short 1-2 sentence explanation of the agronomic assumptions' },
          },
          required: [
            'cropId',
            'quantityKg',
            'expectedSalePrice',
            'inputCostPerKg',
            'seedCost',
            'fertilizerCost',
            'laborCost',
            'irrigationCost',
            'soloTransportCostPerKg',
            'reasoningSummary',
          ],
        },
      };

      const prompt = `A Nepali smallholder farmer in ${mandi.name} (${mandi.province}) is planning to harvest and sell ${safeCrop} on ${rawLandSize} ${selectedUnit} of land (${Math.round(canonicalSqMeters)} m², equivalent to ${ropaniEquivalent} Ropani).
Current localized wholesale benchmark for ${safeCrop} in ${mandi.name} is Rs ${liveLocalizedPrice}/kg, and solo freight is ~Rs ${defaultSoloFreight}/kg.
Additional field conditions/notes: "${notes || 'Standard local cultivation with mandi highway access'}".
Use the proposeCalculatorInputs function to propose realistic agricultural input values grounded in these Nepal benchmarks.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          tools: [{ functionDeclarations: [proposeCalculatorInputsTool] }],
          toolConfig: {
            functionCallingConfig: {
              mode: 'ANY' as any,
              allowedFunctionNames: ['proposeCalculatorInputs'],
            },
          },
        },
      });

      const functionCalls = response.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        const args = functionCalls[0].args as any;
        return {
          estimate: {
            cropId: args.cropId || safeCrop,
            district: safeDistrict,
            quantityKg: Math.round(Number(args.quantityKg) || defaultQty),
            expectedSalePrice: Math.round(Number(args.expectedSalePrice) || liveLocalizedPrice),
            inputCostPerKg: Number(args.inputCostPerKg) || cropBench.prodCostPerKg,
            seedCost: Math.round(Number(args.seedCost) || fallbackEstimate.seedCost),
            fertilizerCost: Math.round(Number(args.fertilizerCost) || fallbackEstimate.fertilizerCost),
            laborCost: Math.round(Number(args.laborCost) || fallbackEstimate.laborCost),
            irrigationCost: Math.round(Number(args.irrigationCost) || fallbackEstimate.irrigationCost),
            soloTransportCostPerKg: Number(Number(args.soloTransportCostPerKg || defaultSoloFreight).toFixed(1)),
            reasoningSummary: args.reasoningSummary || fallbackEstimate.reasoningSummary,
          },
          source: 'gemini_function_calling',
        };
      }
    } catch (err: any) {
      console.warn('[GeminiService] Estimation failed, using grounded fallback:', err?.message);
    }

    return { estimate: fallbackEstimate, source: 'grounded_rules' };
  }

  public static generateSmartFallbackReply(query: string, context?: any, language: 'en' | 'ne' = 'en'): string {
    const q = query.toLowerCase();
    const district = context?.district || 'Chitwan';
    const crop = context?.primaryCrops?.[0] || 'Tomato';
    const isNp = language === 'ne';

    const tomatoLive = MarketDataService.getCommodity('tomato')?.currentPrice || 53;
    const cauliflowerLive = MarketDataService.getCommodity('cauliflower')?.currentPrice || 65;

    if (q.includes('नमस्ते') || q.includes('namaste') || q.includes('hello') || q.includes('hi')) {
      if (isNp) {
        return `नमस्ते ${context?.name ? context.name + ' जी' : 'किसान साथी'}! म कृषि मित्र हुँ। तपाईंको ${district} जिल्लामा कुन बाली रोप्ने, स्थानीय बजार भाउ, वा साझा ढुवानी (pooling) बारे के जानकारी चाहिन्छ?`;
      }
      return `Hello ${context?.name ? context.name : 'farmer friend'}! I am Krishi Mitra. How can I assist you today with localized mandi prices, crop harvest timing, or freight transport pooling from ${district}?`;
    }

    if (q.includes('tomato') || q.includes('गोलभेडा') || q.includes('tamatar')) {
      if (isNp) {
        return `गोलभेडा (Tomato) को हालको कालिमाटी थोक मूल्य करिब रु ${tomatoLive}/केजी छ। साझा गाडी (Transport Pool) प्रयोग गर्दा ढुवानी भाडा प्रतिकिलो रु ५ सम्म बचत गर्न सकिन्छ।`;
      }
      return `Kalimati Tomato wholesale prices are currently averaging NPR ${tomatoLive}/kg. Transport pooling from ${district} cuts freight expenses significantly.`;
    }

    if (q.includes('cauliflower') || q.includes('काउली') || q.includes('kauli')) {
      if (isNp) {
        return `काउली (Cauliflower) को बजार दर अहिले करिब रु ${cauliflowerLive}/केजी छ। साझा ढुवानीबाट ढुवानी खर्च घटाउन सकिन्छ।`;
      }
      return `Cauliflower prices are currently around NPR ${cauliflowerLive}/kg at Kalimati. Group pooling cuts freight cost substantially from ${district}.`;
    }

    if (q.includes('pool') || q.includes('transport') || q.includes('ढुवानी') || q.includes('गाडी') || q.includes('truck')) {
      if (isNp) {
        return `${district} बाट किसान साथीहरूले काठमाडौं वा क्षेत्रीय बजारका लागि साझा ढुवानी (Transport Pool) प्रयोग गर्दा एक्लै गाडी भाडामा लिनेभन्दा ५०% भन्दा बढी भाडा बचत हुन्छ।`;
      }
      return `Shared transport pools from ${district} help farmers combine crates and save over 50% compared to solo truck hire.`;
    }

    if (isNp) {
      return `म तपाईंलाई ${district} को बजार भाउ, फसल बेच्ने निर्णय, वा साझा ढुवानी (Transport Pool) बारे सहयोग गर्न सक्छु। तपाईं आज के बारे बुझ्न चाहनुहुन्छ?`;
    }
    return `I can help you check expected harvest revenue, localized 77-district mandi prices, or transport pooling options in ${district}. What crop would you like to check?`;
  }
}
