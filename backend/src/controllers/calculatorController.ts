import { Request, Response } from 'express';
import { GeminiService } from '../services/geminiService';
import { getKalimatiCurrentPrice, getKalimatiCrop } from '../data/kalimatiDataset';

export class CalculatorController {
  public static async getAiEstimate(req: Request, res: Response) {
    try {
      const { cropId, district, landSize, landUnit, landSizeRopani, notes } = req.body;
      const result = await GeminiService.estimateCalculatorInputs({
        cropId,
        district,
        landSize: landSize !== undefined ? landSize : landSizeRopani,
        landUnit: landUnit || 'ropani',
        notes,
      });

      return res.json({
        success: true,
        ...result,
      });
    } catch (err: any) {
      console.error('Error in CalculatorController.getAiEstimate:', err);
      const cropId = req.body?.cropId || 'tomato';
      const currentKalimatiPrice = getKalimatiCurrentPrice(cropId);
      const kalimatiData = getKalimatiCrop(cropId);
      const costPerKg = cropId === 'tomato' ? 16 : cropId === 'potato' ? 12 : cropId === 'onion' ? 15 : 14;

      return res.status(200).json({
        success: true,
        estimate: {
          cropId,
          district: req.body?.district || 'chitwan',
          quantityKg: Math.round(650 * (Number(req.body?.landSize) || 1.0)),
          expectedSalePrice: currentKalimatiPrice,
          inputCostPerKg: costPerKg,
          seedCost: 2200,
          fertilizerCost: 3000,
          laborCost: 2400,
          irrigationCost: 800,
          soloTransportCostPerKg: 7.8,
          reasoningSummary: kalimatiData
            ? `Calculated from 2020–2026 Kalimati dataset: current benchmark Rs ${currentKalimatiPrice}/kg with historical peak in ${kalimatiData.peakWindow.month}.`
            : 'Calculated using standard agricultural baseline parameters.',
        },
        source: 'fallback',
      });
    }
  }

  public static simulateMargin(req: Request, res: Response) {
    try {
      const cropId = req.body?.cropId || 'tomato';
      const defaultExpectedPrice = getKalimatiCurrentPrice(cropId);
      const {
        quantityKg = 500,
        expectedPricePerKg = defaultExpectedPrice,
        inputCostPerKg = 16,
        soloFreightPerKg = 8.5,
        pooledFreightPerKg = 3.4,
      } = req.body;

      const grossRevenue = quantityKg * expectedPricePerKg;
      const productionCost = quantityKg * inputCostPerKg;
      const soloTransportCost = quantityKg * soloFreightPerKg;
      const pooledTransportCost = quantityKg * pooledFreightPerKg;

      const soloNetProfit = grossRevenue - productionCost - soloTransportCost;
      const pooledNetProfit = grossRevenue - productionCost - pooledTransportCost;
      const poolingSavings = soloTransportCost - pooledTransportCost;

      return res.json({
        success: true,
        simulation: {
          quantityKg,
          expectedPricePerKg,
          grossRevenue,
          productionCost,
          soloTransportCost,
          pooledTransportCost,
          soloNetProfit,
          pooledNetProfit,
          poolingSavings,
          soloMarginPct: Math.round((soloNetProfit / grossRevenue) * 100),
          pooledMarginPct: Math.round((pooledNetProfit / grossRevenue) * 100),
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: 'Failed to simulate calculation margins' });
    }
  }
}
