import React, { useState } from 'react';
import {
  GroundTruthFeedback,
  Commodity,
} from '../types/krishi';
import {
  X,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Database,
  Layers,
  ArrowRight,
  ShieldCheck,
  Send,
  Radio,
  FileCheck,
} from 'lucide-react';
import {
  COMMODITY_SEEDS,
  SAMPLE_ACCURACY_PROGRESSION,
  DISTRICT_LIST,
  SAMPLE_GROUND_TRUTH_FEEDBACKS,
} from '../data/agriData';

export interface FeedbackFlywheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  commodities?: Commodity[];
  recentFeedbacks?: GroundTruthFeedback[];
  feedbacks?: GroundTruthFeedback[];
  userDistrict?: string;
  onAddFeedback: (feedback: GroundTruthFeedback) => void;
}

export const FeedbackFlywheelModal: React.FC<FeedbackFlywheelModalProps> = ({
  isOpen,
  onClose,
  commodities,
  recentFeedbacks,
  feedbacks,
  userDistrict,
  onAddFeedback,
}) => {
  const [selectedCrop, setSelectedCrop] = useState('tomato');
  const [district, setDistrict] = useState(userDistrict || 'chitwan');
  const [harvestDate, setHarvestDate] = useState('2026-03-02');
  const [actualPrice, setActualPrice] = useState<string>('43.5');
  const [volumeSold, setVolumeSold] = useState<string>('350');
  const [buyerType, setBuyerType] = useState<GroundTruthFeedback['buyerType']>('kalimati_wholesaler');
  const [roadCondition, setRoadCondition] = useState<GroundTruthFeedback['roadCondition']>('clear');
  const [transportCost, setTransportCost] = useState<string>('2.5');
  const [comments, setComments] = useState('Sold through pooled transport to Kalimati Mandi. Good color grade.');
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  const activeFeedbackList = recentFeedbacks || feedbacks || SAMPLE_GROUND_TRUTH_FEEDBACKS;

  if (!isOpen) return null;

  const currentCropObj = COMMODITY_SEEDS.find((c) => c.id === selectedCrop) || COMMODITY_SEEDS[0];
  const predictedBase = currentCropObj?.basePrice || 45;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFeedback: GroundTruthFeedback = {
      id: `gt-${Date.now()}`,
      farmerId: 'farmer-ram-01',
      farmerName: 'Ram Bahadur Thapa',
      district,
      cropId: selectedCrop,
      cropName: currentCropObj?.name || 'Tomato',
      harvestDate,
      actualPricePerKg: parseFloat(actualPrice) || predictedBase,
      predictedPricePerKg: predictedBase,
      volumeSoldKg: parseFloat(volumeSold) || 100,
      buyerType,
      roadCondition,
      transportCostPaidPerKg: parseFloat(transportCost) || 0,
      comments,
      timestamp: 'Just now',
      verified: true,
    };

    onAddFeedback(newFeedback);
    setIsSubmittedSuccess(true);
    setTimeout(() => {
      setIsSubmittedSuccess(false);
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#F7F4EB] rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-[#EBE4D5] shadow-2xl text-[#2B2118] flex flex-col">
        {/* Header with Flywheel Banner */}
        <div className="bg-[#245A3E] text-white p-5 sm:p-6 rounded-t-3xl relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#E2D8C3] hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-[#82E0AA] text-xs font-black uppercase tracking-wider mb-1.5">
            <Cpu className="w-4 h-4" /> Ground Truth Retraining Flywheel
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Log Harvest Outcome & Close the Loop
          </h2>
          <p className="text-xs text-[#E2D8C3] mt-1 max-w-xl">
            When you report what price you actually received at the farm gate or mandi, KrishiSetu's ensemble model retrains on ground reality — boosting next season's forecast precision for you and your community.
          </p>

          {/* Flywheel Stats Bar */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 pt-4 border-t border-white/15 text-center">
            <div className="bg-white/10 rounded-xl p-2.5">
              <span className="text-[11px] text-[#E2D8C3] block">Ground Truth Logs</span>
              <span className="text-base font-black text-white">1,843 Points</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5">
              <span className="text-[11px] text-[#E2D8C3] block">Current Error Rate</span>
              <span className="text-base font-black text-[#82E0AA]">3.8% (Down from 14.2%)</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5">
              <span className="text-[11px] text-[#E2D8C3] block">Retraining Cadence</span>
              <span className="text-base font-black text-[#FAD7A0]">Daily 02:00 AM</span>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-6">
          {isSubmittedSuccess ? (
            <div className="py-12 px-6 text-center bg-white rounded-2xl border border-[#245A3E]/30 shadow-sm space-y-4 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-[#EBF5EE] text-[#245A3E] mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#2B2118]">Harvest Outcome Confirmed!</h3>
                <p className="text-xs text-[#6E6155] mt-1 max-w-md mx-auto">
                  Your entry has been verified and registered into KrishiSetu's empirical calibration table. Regional transport and farmgate price differentials updated.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 bg-[#F7F4EB] px-4 py-2 rounded-xl text-xs font-bold text-[#245A3E] border border-[#E8DFD0]">
                <Database className="w-4 h-4" /> Log ID: gt-{Date.now().toString().slice(-6)} • Chitwan Cluster
              </div>
            </div>
          ) : (
            <>
              {/* Submission Form */}
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 border border-[#EBE4D5] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#EBE4D5] pb-3">
                  <h3 className="text-sm font-bold text-[#2B2118] flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[#245A3E]" /> Submit Recent Harvest & Sale Data
                  </h3>
                  <span className="text-[11px] bg-[#EBF5EE] text-[#245A3E] font-bold px-2.5 py-0.5 rounded-full border border-[#245A3E]/20">
                    Takes 30 seconds
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#6E6155] mb-1">Crop Harvested</label>
                    <select
                      value={selectedCrop}
                      onChange={(e) => setSelectedCrop(e.target.value)}
                      className="w-full bg-[#F7F4EB] border border-[#E2D8C3] rounded-xl px-3 py-2 text-xs font-semibold text-[#2B2118] focus:outline-[#245A3E] cursor-pointer"
                    >
                      {COMMODITY_SEEDS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.emoji} {c.name} ({c.nepaliName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#6E6155] mb-1">District of Farm</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-[#F7F4EB] border border-[#E2D8C3] rounded-xl px-3 py-2 text-xs font-semibold text-[#2B2118] focus:outline-[#245A3E] cursor-pointer"
                    >
                      {DISTRICT_LIST.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#6E6155] mb-1">Harvest / Sale Date</label>
                    <input
                      type="date"
                      value={harvestDate}
                      onChange={(e) => setHarvestDate(e.target.value)}
                      className="w-full bg-[#F7F4EB] border border-[#E2D8C3] rounded-xl px-3 py-2 text-xs font-semibold text-[#2B2118] focus:outline-[#245A3E]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#6E6155] mb-1">
                      Actual Farmgate Price Received (Rs./kg)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="5"
                        max="500"
                        value={actualPrice}
                        onChange={(e) => setActualPrice(e.target.value)}
                        className="w-full bg-[#F7F4EB] border border-[#E2D8C3] rounded-xl px-3 py-2 text-xs font-black text-[#2B2118] focus:outline-[#245A3E]"
                        required
                      />
                      <span className="absolute right-3 top-2 text-[10px] text-[#6E6155] font-bold">Rs./kg</span>
                    </div>
                    <span className="text-[10px] text-[#6E6155] mt-0.5 block">
                      Model predicted: Rs. {predictedBase.toFixed(2)}/kg
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#6E6155] mb-1">Total Volume Sold (kg)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="10"
                        min="10"
                        value={volumeSold}
                        onChange={(e) => setVolumeSold(e.target.value)}
                        className="w-full bg-[#F7F4EB] border border-[#E2D8C3] rounded-xl px-3 py-2 text-xs font-bold text-[#2B2118] focus:outline-[#245A3E]"
                        required
                      />
                      <span className="absolute right-3 top-2 text-[10px] text-[#6E6155] font-bold">KG</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#6E6155] mb-1">Buyer Channel</label>
                    <select
                      value={buyerType}
                      onChange={(e) => setBuyerType(e.target.value as any)}
                      className="w-full bg-[#F7F4EB] border border-[#E2D8C3] rounded-xl px-3 py-2 text-xs font-semibold text-[#2B2118] focus:outline-[#245A3E] cursor-pointer"
                    >
                      <option value="kalimati_wholesaler">Kalimati Wholesale Mandi</option>
                      <option value="pokhara_mandi">Pokhara Wholesale Mandi</option>
                      <option value="cooperative">Cooperative Collection Center</option>
                      <option value="local_middleman">Local Middleman / Farm Gate</option>
                      <option value="hotel_direct">Hotel / Restaurant Direct</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#6E6155] mb-1">Highway / Route Condition</label>
                    <select
                      value={roadCondition}
                      onChange={(e) => setRoadCondition(e.target.value as any)}
                      className="w-full bg-[#F7F4EB] border border-[#E2D8C3] rounded-xl px-3 py-2 text-xs font-semibold text-[#2B2118] focus:outline-[#245A3E] cursor-pointer"
                    >
                      <option value="clear">Clear & Normal (On-time arrival)</option>
                      <option value="minor_delay">Minor Highway Delay (1-3 hrs)</option>
                      <option value="severe_landslide">Severe Landslide / Blockage (&gt;6 hrs)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#6E6155] mb-1">Transport Freight Paid (Rs./kg)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={transportCost}
                        onChange={(e) => setTransportCost(e.target.value)}
                        className="w-full bg-[#F7F4EB] border border-[#E2D8C3] rounded-xl px-3 py-2 text-xs font-semibold text-[#2B2118] focus:outline-[#245A3E]"
                      />
                      <span className="absolute right-3 top-2 text-[10px] text-[#6E6155] font-bold">Rs./kg</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#6E6155] mb-1">Farmer Notes / Market Feedback</label>
                  <textarea
                    rows={2}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="e.g., Heavy arrivals from Sarlahi dropped price in evening session..."
                    className="w-full bg-[#F7F4EB] border border-[#E2D8C3] rounded-xl p-2.5 text-xs text-[#2B2118] focus:outline-[#245A3E]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#245A3E] hover:bg-[#1C4731] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Submit Ground Truth & Retrain Model
                </button>
              </form>

              {/* Accuracy Progression over Seasons (The Moat Chart) */}
              <div className="bg-white rounded-2xl p-5 border border-[#EBE4D5] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#2B2118] flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#245A3E]" /> Model Error Rate Drop Over Time (The Flywheel Effect)
                    </h3>
                    <p className="text-xs text-[#6E6155]">
                      More farmer logs = Lower prediction error = Higher farmer profit.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#245A3E] bg-[#EBF5EE] border border-[#245A3E]/20 px-2.5 py-1 rounded-xl">
                    Self-Correction Active
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                  {SAMPLE_ACCURACY_PROGRESSION.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-center ${
                        idx === SAMPLE_ACCURACY_PROGRESSION.length - 1
                          ? 'bg-[#EBF5EE] border-[#245A3E]/30'
                          : 'bg-[#F7F4EB] border-[#E8DFD0]'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-[#6E6155] block">{item.season}</span>
                      <div className="text-lg font-black text-[#2B2118] mt-1">{item.accuracyPct}%</div>
                      <span className="text-[10px] font-bold text-[#C88A34] block">Error: {item.errorPct}%</span>
                      <span className="text-[10px] text-[#6E6155] mt-1 block">{item.feedbackCount} logs (MAE: {item.mae})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Community Logs Stream */}
              <div className="bg-white rounded-2xl p-5 border border-[#EBE4D5] shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-[#2B2118] flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#245A3E] animate-pulse" /> Live Community Ground-Truth Stream
                </h3>

                <div className="space-y-2.5">
                  {activeFeedbackList.slice(0, 4).map((feed) => (
                    <div
                      key={feed.id}
                      className="p-3 bg-[#F7F4EB] rounded-xl flex items-center justify-between gap-3 text-xs border border-[#E8DFD0]"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#2B2118]">{feed.farmerName}</span>
                          <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-[#EBE4D5] text-[#6E6155] capitalize">
                            {feed.district}
                          </span>
                          <span className="text-[10px] text-[#245A3E] font-bold flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3" /> Verified Sale
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6E6155] mt-0.5">
                          {feed.cropName} • {feed.volumeSoldKg} kg sold via {feed.buyerType.replace('_', ' ')}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-[#245A3E]">Rs. {feed.actualPricePerKg.toFixed(2)}/kg</span>
                        <span className="text-[10px] text-[#6E6155] block">{feed.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
