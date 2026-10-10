import { Request, Response } from 'express';
import { GeminiService } from '../services/geminiService';
import { OpenRouterService } from '../services/openRouterService';

export class AiController {
  /**
   * Main chat endpoint POST /api/chat supporting both Gemini API and OpenRouter API
   */
  public static async handleChat(req: Request, res: Response) {
    try {
      const { message, language, history, farmerContext } = req.body;

      // Normalize language: 'en' or 'ne'
      const normalizedLang: 'en' | 'ne' = language === 'ne' || language === 'np' ? 'ne' : 'en';

      if (!message || typeof message !== 'string' || !message.trim()) {
        const errorMsg = normalizedLang === 'ne'
          ? 'कृपया आफ्नो तरकारी, बजार भाउ वा कृषिसेतु सम्बन्धी प्रश्न सोध्नुहोस्।'
          : 'Please ask a question about your vegetables, market prices, or KrishiSetu features.';
        return res.status(400).json({
          error: errorMsg,
          reply: errorMsg,
        });
      }

      const cleanMessage = message.trim();

      // Custom API keys optionally passed in headers or body
      const customGeminiKey =
        (req.headers['x-api-key'] as string) ||
        (req.headers['x-gemini-key'] as string) ||
        req.body?.apiKey ||
        req.body?.geminiApiKey;

      const customOpenRouterKey =
        (req.headers['x-openrouter-key'] as string) ||
        req.body?.openRouterApiKey;

      const hasGeminiKey = Boolean(customGeminiKey || process.env.GEMINI_API_KEY);
      const hasOpenRouterKey = Boolean(customOpenRouterKey || process.env.OPENROUTER_API_KEY);

      // Strategy 1: Try OpenRouter if OpenRouter key is present (user-configured key for Krishi Mitra)
      if (hasOpenRouterKey) {
        try {
          const openRouterResult = await OpenRouterService.generateChatResponse(
            {
              message: cleanMessage,
              language: normalizedLang,
              history,
              farmerContext,
            },
            customOpenRouterKey
          );

          if (openRouterResult.reply && openRouterResult.reply.trim()) {
            return res.json({
              reply: openRouterResult.reply.trim(),
              success: true,
              provider: 'openrouter',
            });
          }
        } catch (openRouterError: any) {
          console.warn('[AiController] OpenRouter generation failed, falling back:', openRouterError.message || openRouterError);
        }
      }

      // Strategy 2: Try Gemini if Gemini key is present
      if (hasGeminiKey) {
        try {
          const conversationTurns: Array<{ role: string; content?: string; text?: string }> = [];
          if (history && Array.isArray(history)) {
            for (const h of history) {
              if (h.content || h.text) {
                conversationTurns.push({
                  role: h.role === 'assistant' ? 'assistant' : 'user',
                  text: h.content || h.text,
                });
              }
            }
          }
          conversationTurns.push({ role: 'user', text: cleanMessage });

          const geminiReply = await GeminiService.generateKrishiMitraReply(
            conversationTurns,
            farmerContext,
            normalizedLang,
            customGeminiKey
          );

          if (geminiReply && geminiReply.trim()) {
            return res.json({
              reply: geminiReply.trim(),
              success: true,
              provider: 'gemini',
            });
          }
        } catch (geminiError: any) {
          console.warn('[AiController] Gemini generation failed, falling back:', geminiError.message || geminiError);
        }
      }

      // Strategy 3: Grounded agricultural rule engine fallback
      const groundedFallback = OpenRouterService.generateGroundedFallback(
        cleanMessage,
        farmerContext,
        normalizedLang
      );

      return res.json({
        reply: groundedFallback,
        success: true,
        provider: 'grounded_rules',
      });
    } catch (error: any) {
      console.error('[AiController.handleChat] Error generating AI response:', error.message || error);
      const safeError = req.body?.language === 'ne' || req.body?.language === 'np'
        ? 'कृषि मित्र सेवा अहिले उपलब्ध हुन सकेन। कृपया केही समयपछि पुन: प्रयास गर्नुहोस्।'
        : 'KrishiSetu AI is temporarily unavailable. Please try again.';
      return res.status(500).json({
        error: safeError,
        reply: safeError,
      });
    }
  }

  /**
   * Backward-compatible endpoint POST /api/krishi-mitra
   */
  public static async handleKrishiMitra(req: Request, res: Response) {
    try {
      const { messages, userContext, language } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      const rawLang = language || userContext?.language;
      const normalizedLang: 'en' | 'ne' = rawLang === 'ne' || rawLang === 'np' ? 'ne' : 'en';

      const lastUserMsg = messages[messages.length - 1]?.text || '';
      const previousTurns = messages.slice(0, -1).map((m: any) => ({
        role: m.role === 'assistant' || m.role === 'model' ? ('assistant' as const) : ('user' as const),
        content: m.text || '',
      }));

      // Re-use handleChat logic
      req.body = {
        message: lastUserMsg,
        language: normalizedLang,
        history: previousTurns,
        farmerContext: userContext ? {
          name: userContext.name || userContext.userName,
          district: userContext.district,
          crops: userContext.primaryCrops,
        } : undefined,
      };

      return AiController.handleChat(req, res);
    } catch (error: any) {
      console.error('Error in AiController.handleKrishiMitra:', error);
      const lastUserMsg = req.body?.messages?.[req.body.messages.length - 1]?.text || '';
      const rawLang = req.body?.language || req.body?.userContext?.language;
      const normalizedLang: 'en' | 'ne' = rawLang === 'ne' || rawLang === 'np' ? 'ne' : 'en';
      const fallback = OpenRouterService.generateGroundedFallback(lastUserMsg, req.body?.userContext, normalizedLang);
      return res.json({ reply: fallback });
    }
  }
}

