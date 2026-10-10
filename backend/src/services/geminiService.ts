import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

export function getGeminiAI(customKey?: string): GoogleGenAI | null {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (customKey) {
    return new GoogleGenAI({ apiKey: customKey });
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export class GeminiService {
  public static async generateKrishiMitraReply(
    messages: Array<{ role: string; text?: string; content?: string }>,
    userContext?: any,
    language: 'en' | 'ne' = 'en',
    customApiKey?: string
  ): Promise<string> {
    const ai = getGeminiAI(customApiKey);

    if (!ai) {
      const lastUserMsg = messages[messages.length - 1]?.text || messages[messages.length - 1]?.content || '';
      return this.generateSmartFallbackReply(lastUserMsg, userContext, language);
    }

    const isNp = language === 'ne';
    const district = userContext?.district || 'Chitwan';
    const crops = userContext?.crops || userContext?.primaryCrops || ['Tomato', 'Potato', 'Cauliflower'];
    const cropStr = Array.isArray(crops) ? crops.join(', ') : String(crops);

    const systemInstruction = `You are Krishi Mitra (कृषि मित्र), a calm, respectful, neighborly agricultural assistant inside the KrishiSetu application for Nepali smallholder farmers.
Your role is to guide farmers on vegetable market prices (Kalimati Mandi, Narayangarh, Pokhara), harvest timing decisions (Hold vs Sell), and cooperative transport pooling savings.

Farmer Context:
- Name: ${userContext?.name || 'Farmer'}
- District: ${district}
- Primary Crops: ${cropStr}

REAL GROUNDED AGRI DATA:
- Kalimati Wholesale Clearing Rates: Tomato (Local) Rs 42-46/kg, Cauliflower Rs 35-40/kg, Potato Rs 36-38/kg, Cabbage Rs 28-32/kg.
- Transport Freight Pooling: Shared transport pool from ${district} to Kalimati costs ~Rs 3.8/kg compared to Rs 8.8/kg solo rental (saves ~Rs 5/kg).
- Decision Engine: Recommends staggering tomato sales now to avoid the upcoming lowland harvest glut.

LANGUAGE MANDATE:
${isNp ? 'Respond STRICTLY and ENTIRELY in polite, natural Nepali (नेपाली - Devanagari script). Do not mix English sentences.' : 'Respond STRICTLY and ENTIRELY in polite, clear English.'}

CRITICAL RULES:
1. Stay focused on agricultural market pricing, transport pooling, harvest decisions, and crop revenue.
2. Keep responses concise and conversational: 2 to 4 sentences maximum.
3. Be respectful, encouraging, and neighborly.`;

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
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.3,
          maxOutputTokens: 400,
        },
      });

      return response.text?.trim() || (isNp ? 'नमस्ते! म कृषि मित्र हुँ। म कसरी सहयोग गर्न सक्छु?' : 'Hello! I am Krishi Mitra. How can I help you?');
    } catch (err: any) {
      console.warn('Gemini generateContent with gemini-3.8-flash failed, attempting fallback:', err.message);
      try {
        const fallbackRes = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.3,
            maxOutputTokens: 400,
          },
        });
        return fallbackRes.text?.trim() || (isNp ? 'नमस्ते! म कृषि मित्र हुँ। म कसरी सहयोग गर्न सक्छु?' : 'Hello! I am Krishi Mitra. How can I help you?');
      } catch (innerErr: any) {
        console.warn('Gemini fallback model also failed, using grounded fallback reply:', innerErr.message);
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
    const safeDistrict = district || 'chitwan';

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
      tomato: { basePrice: 46, yieldPerRopaniKg: 650, prodCostPerKg: 14 },
      potato: { basePrice: 38, yieldPerRopaniKg: 850, prodCostPerKg: 12 },
      cauliflower: { basePrice: 35, yieldPerRopaniKg: 500, prodCostPerKg: 10 },
      cabbage: { basePrice: 28, yieldPerRopaniKg: 700, prodCostPerKg: 8 },
      onion: { basePrice: 58, yieldPerRopaniKg: 450, prodCostPerKg: 18 },
      green_chilli: { basePrice: 85, yieldPerRopaniKg: 280, prodCostPerKg: 24 },
      cucumber: { basePrice: 36, yieldPerRopaniKg: 600, prodCostPerKg: 11 },
      bitter_gourd: { basePrice: 52, yieldPerRopaniKg: 380, prodCostPerKg: 16 },
    };

    const cropBench = benchmarkData[safeCrop.toLowerCase()] || benchmarkData.tomato;
    const defaultQty = Math.round(cropBench.yieldPerRopaniKg * ropaniEquivalent);
    const distDistances: Record<string, number> = {
      chitwan: 160,
      dhading: 65,
      kavre: 40,
      makwanpur: 120,
      kathmandu: 15,
      nuwakot: 55,
      sindhupalchok: 85,
      sarlahi: 210,
    };
    const distanceKm = distDistances[safeDistrict.toLowerCase()] || 160;
    const defaultSoloFreight = Number((3.2 + distanceKm / 36).toFixed(1));
    const totalProd = Math.round(cropBench.prodCostPerKg * defaultQty);

    const fallbackEstimate = {
      cropId: safeCrop,
      district: safeDistrict,
      quantityKg: defaultQty,
      expectedSalePrice: cropBench.basePrice,
      inputCostPerKg: cropBench.prodCostPerKg,
      seedCost: Math.round(totalProd * 0.28),
      fertilizerCost: Math.round(totalProd * 0.36),
      laborCost: Math.round(totalProd * 0.24),
      irrigationCost: Math.round(totalProd * 0.12),
      soloTransportCostPerKg: defaultSoloFreight,
      reasoningSummary: `Grounded on ${rawLandSize} ${selectedUnit} (~${Math.round(canonicalSqMeters)} m² / ${ropaniEquivalent} Ropani eqv) standard yield (~${defaultQty} kg) and Kalimati Mandi seasonal benchmark of Rs ${cropBench.basePrice}/kg for ${safeDistrict.toUpperCase()}.`,
    };

    const ai = getGeminiAI();
    if (!ai || !process.env.GEMINI_API_KEY) {
      return { estimate: fallbackEstimate, source: 'grounded_rules' };
    }

    try {
      const proposeCalculatorInputsTool: FunctionDeclaration = {
        name: 'proposeCalculatorInputs',
        description: 'Propose realistic agricultural input parameters for a Nepali smallholder farmer based on crop, district, land size, and canonical area. Note: Propose INPUT VALUES only (quantity, prices, costs), not computed profit margins.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            cropId: { type: Type.STRING, description: 'The crop ID, e.g. tomato, cauliflower, potato' },
            quantityKg: { type: Type.NUMBER, description: 'Estimated harvest quantity in kg for this land area' },
            expectedSalePrice: { type: Type.NUMBER, description: 'Estimated Kalimati wholesale selling price in NPR/kg' },
            inputCostPerKg: { type: Type.NUMBER, description: 'Estimated production input cost per kg in NPR' },
            seedCost: { type: Type.NUMBER, description: 'Estimated seed cost in NPR' },
            fertilizerCost: { type: Type.NUMBER, description: 'Estimated fertilizer and manure cost in NPR' },
            laborCost: { type: Type.NUMBER, description: 'Estimated field labor cost in NPR' },
            irrigationCost: { type: Type.NUMBER, description: 'Estimated irrigation/water cost in NPR' },
            soloTransportCostPerKg: { type: Type.NUMBER, description: 'Solo transport freight rate per kg to Kathmandu' },
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

      const prompt = `A Nepali smallholder farmer in ${safeDistrict.toUpperCase()} is planning to harvest and sell ${safeCrop} on ${rawLandSize} ${selectedUnit} of land (${Math.round(canonicalSqMeters)} m², equivalent to ${ropaniEquivalent} Ropani).
Additional field conditions/notes: "${notes || 'Standard lowland farming, highway access to Kathmandu'}".
Use the proposeCalculatorInputs function to propose realistic agricultural input values grounded in Nepal's agricultural benchmarks.`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            tools: [{ functionDeclarations: [proposeCalculatorInputsTool] }],
            toolConfig: {
              functionCallingConfig: {
                mode: 'ANY' as any,
                allowedFunctionNames: ['proposeCalculatorInputs'],
              },
            },
            temperature: 0.2,
          },
        });
      } catch (e: any) {
        console.warn('Gemini 3.8-flash function calling failed, trying 3.6-flash:', e.message);
        response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            tools: [{ functionDeclarations: [proposeCalculatorInputsTool] }],
            toolConfig: {
              functionCallingConfig: {
                mode: 'ANY' as any,
                allowedFunctionNames: ['proposeCalculatorInputs'],
              },
            },
            temperature: 0.2,
          },
        });
      }

      const functionCalls = response.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        const args = functionCalls[0].args as any;
        return {
          estimate: {
            cropId: args.cropId || safeCrop,
            district: safeDistrict,
            quantityKg: Math.round(Number(args.quantityKg) || defaultQty),
            expectedSalePrice: Math.round(Number(args.expectedSalePrice) || cropBench.basePrice),
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
      console.warn('Gemini estimation failed, using grounded fallback:', err.message);
    }

    return { estimate: fallbackEstimate, source: 'grounded_rules' };
  }

  public static generateSmartFallbackReply(query: string, context?: any, language: 'en' | 'ne' = 'en'): string {
    const q = query.toLowerCase();
    const district = context?.district || 'Chitwan';
    const crop = context?.primaryCrops?.[0] || 'Tomato';
    const isNp = language === 'ne';

    if (q.includes('नमस्ते') || q.includes('namaste') || q.includes('hello') || q.includes('hi')) {
      if (isNp) {
        return `नमस्ते ${context?.name ? context.name + ' जी' : 'किसान साथी'}! म कृषि मित्र हुँ। तपाईंको ${district} जिल्लामा कुन बाली रोप्ने, कालीमाटी बजार भाउ, वा साझा ढुवानी (pooling) बारे के जानकारी चाहिन्छ?`;
      }
      return `Hello ${context?.name ? context.name : 'farmer friend'}! I am Krishi Mitra. How can I assist you today with Kalimati wholesale prices, crop harvest timing, or freight transport pooling from ${district}?`;
    }

    if (q.includes('tomato') || q.includes('गोलभेडा') || q.includes('tamatar')) {
      if (isNp) {
        return `चितवनमा गोलभेडा (Tomato) को हालको कालीमाटी थोक मूल्य रु ४२–४६ प्रति किलो छ। आगामी हप्ताहरूमा आपूर्ति बढ्ने भएकाले केही फसल अहिले नै बेच्न सिफारिस गरिएको छ। साझा गाडी प्रयोग गर्दा ढुवानीमा प्रतिकिलो रु ५ सम्म बचत गर्न सकिन्छ।`;
      }
      return `In Kalimati Mandi, Tomato wholesale prices are currently averaging NPR 42–46/kg. Our decision engine recommends harvesting mature yield now to beat upcoming supply surges. Transport pooling saves ~NPR 5.0/kg on freight.`;
    }

    if (q.includes('cauliflower') || q.includes('काउली') || q.includes('kauli')) {
      if (isNp) {
        return `काउली (Cauliflower) को बजार अहिले स्थिर छ (करिब रु ३५–४०/केजी)। आउँदो सिजनमा गुणस्तरीय उत्पादनले राम्रो मूल्य पाउनेछ। साझा ढुवानीबाट ढुवानी खर्च घटाउन सकिन्छ।`;
      }
      return `Cauliflower prices are currently holding steady around NPR 35–40/kg in Kalimati. Group pooling provides a freight reduction of 55% from ${district}.`;
    }

    if (q.includes('pool') || q.includes('transport') || q.includes('ढुवानी') || q.includes('गाडी') || q.includes('truck')) {
      if (isNp) {
        return `${district} बाट अहिले किसान साथीहरूले काठमाडौंका लागि बोलेरो/मिनी-ट्रक साझा ढुवानी बुकिङ गरिरहनुभएको छ। एक्लै पठाउँदा रु ८.८/केजी पर्ने भाडा साझा गर्दा रु ३.८/केजीमा झर्छ (प्रतिकिलो रु ५ बचत)।`;
      }
      return `Shared transport pools from ${district} to Kathmandu are currently filling. Pooling drops freight costs from NPR 8.8/kg solo down to NPR 3.8/kg, saving you Rs. 5.0/kg net.`;
    }

    if (q.includes('profit') || q.includes('money') || q.includes('नाफा') || q.includes('margin') || q.includes('cost') || q.includes('लागत')) {
      if (isNp) {
        return `KrishiSetu क्याल्कुलेटर अनुसार बिउ, मल, ज्यामी र ढुवानी खर्च घटाएर तपाईंको ५०० केजी उत्पादनमा राम्रो खुद नाफा (Net Margin) रहने अनुमान छ।`;
      }
      return `According to KrishiSetu's profit calculator, factoring in seeds, fertilizer, labor, and pooled freight, your net profit margin on 500kg of ${crop} exceeds 55%.`;
    }

    if (isNp) {
      return `म तपाईंलाई ${district} को कालीमाटी बजार भाउ, फसल बेच्ने निर्णय, वा साझा ढुवानी (Transport Pool) बारे सहयोग गर्न सक्छु। तपाईं आज के बारे बुझ्न चाहनुहुन्छ?`;
    }
    return `I can help you check expected harvest revenue, Kalimati wholesale prices, or find nearby transport pooling matches in ${district}. Would you like to check prices for ${crop} or calculate your net margin?`;
  }
}
