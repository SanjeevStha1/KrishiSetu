import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  PastPredictionTrackRecord,
} from '../types/krishi';
import {
  LandUnit,
  LAND_SYSTEM_GROUPS,
  LAND_UNIT_TABLE,
  toSquareMeters,
  fromSquareMeters,
  getLandUnitLabel,
  formatCrossEquivalent,
} from '../utils/landMeasurement';
import {
  X,
  User,
  CheckCircle2,
  Award,
  ShieldCheck,
  Edit2,
  Save,
} from 'lucide-react';
import { DISTRICT_LIST, DEFAULT_USER_PROFILE, SAMPLE_TRACK_RECORD } from '../data/agriData';

export interface FarmerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: UserProfile;
  userProfile?: UserProfile;
  onUpdateProfile?: (updated: UserProfile) => void;
  onSaveProfile?: (updated: UserProfile) => void;
  trackRecord?: PastPredictionTrackRecord[];
  trackRecords?: PastPredictionTrackRecord[];
  onOpenFeedbackModal?: () => void;
}

export const FarmerProfileModal: React.FC<FarmerProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  userProfile,
  onUpdateProfile,
  onSaveProfile,
  trackRecord,
  trackRecords,
  onOpenFeedbackModal,
}) => {
  const currentProfile = profile || userProfile || DEFAULT_USER_PROFILE;
  const currentTrackRecord = trackRecord || trackRecords || SAMPLE_TRACK_RECORD;

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentProfile?.name || 'Ram Bahadur Thapa');
  const [phone, setPhone] = useState(currentProfile?.phone || '9845012345');
  const [district, setDistrict] = useState(currentProfile?.district || 'chitwan');
  const [municipality, setMunicipality] = useState(currentProfile?.municipality || 'Bharatpur-11');
  const [landUnit, setLandUnit] = useState<LandUnit>(currentProfile?.landUnit || 'ropani');
  const [landSize, setLandSize] = useState<number>(currentProfile?.landSize ?? currentProfile?.landSizeRopani ?? 1.2);

  useEffect(() => {
    if (currentProfile) {
      setName(currentProfile.name || '');
      setPhone(currentProfile.phone || '');
      setDistrict(currentProfile.district || 'chitwan');
      setMunicipality(currentProfile.municipality || '');
      setLandUnit(currentProfile.landUnit || 'ropani');
      setLandSize(currentProfile.landSize ?? currentProfile.landSizeRopani ?? 1.2);
    }
  }, [currentProfile, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const sqMeters = toSquareMeters(landSize, landUnit);
    const ropaniEqv = Number((sqMeters / 508.72).toFixed(3));

    const updated: UserProfile = {
      ...currentProfile,
      name,
      phone,
      district,
      municipality,
      landUnit,
      landSize: Number(landSize) || 1.0,
      landSizeRopani: ropaniEqv,
    };
    if (onUpdateProfile) {
      onUpdateProfile(updated);
    } else if (onSaveProfile) {
      onSaveProfile(updated);
    }
    setIsEditing(false);
  };

  const harvestedRecords = currentTrackRecord.filter((r) => r.status === 'harvested');
  const avgAccuracy = (
    harvestedRecords.reduce((acc, r) => acc + r.accuracyPct, 0) / (harvestedRecords.length || 1)
  ).toFixed(1);

  const displayLandUnit = currentProfile?.landUnit || 'ropani';
  const displayLandSize = currentProfile?.landSize ?? currentProfile?.landSizeRopani ?? 1.2;
  const displayUnitMeta = LAND_UNIT_TABLE[displayLandUnit] || LAND_UNIT_TABLE.ropani;

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn font-sans text-[#0F172A]">
      <div className="bg-[#FFFFFF] rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-[#E2EEF2] shadow-2xl flex flex-col transition-colors duration-200">
        {/* Header */}
        <div className="bg-[#0F172A] text-[#FFFFFF] p-5 sm:p-6 rounded-t-3xl relative border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#FFFFFF] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#10B981] border-2 border-white/20 flex items-center justify-center text-[#FFFFFF] text-2xl font-black shrink-0 shadow-lg">
              {currentProfile?.name?.charAt(0) || 'R'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">{currentProfile?.name || 'Farmer Profile'}</h2>
                <span className="bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Farmer
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-1 flex items-center gap-2">
                <span>{currentProfile?.phone || ''}</span>
                <span>•</span>
                <span>{currentProfile?.municipality || ''}</span>
              </p>
              <p className="text-[11px] text-[#60A5FA] mt-0.5 font-medium">
                {currentProfile?.cooperativeMembership || 'Cooperative Member'}
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-5 pt-4 border-t border-white/15 text-center">
            <div className="bg-white/10 rounded-2xl p-2.5 backdrop-blur-xs">
              <span className="text-[11px] text-[#94A3B8] block">Total Land</span>
              <span className="text-base font-extrabold text-white">
                {displayLandSize} {displayUnitMeta.nameEn}
              </span>
            </div>
            <div className="bg-white/10 rounded-2xl p-2.5 backdrop-blur-xs">
              <span className="text-[11px] text-[#94A3B8] block">Forecast Accuracy</span>
              <span className="text-base font-extrabold text-[#10B981]">{avgAccuracy}%</span>
            </div>
            <div className="bg-white/10 rounded-2xl p-2.5 backdrop-blur-xs">
              <span className="text-[11px] text-[#94A3B8] block">Smart Profit Gain</span>
              <span className="text-base font-extrabold text-[#60A5FA]">+Rs. {(currentProfile?.totalEarningsGainNPR || 48500).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Edit Profile Form / View Toggle */}
          <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2EEF2] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
                <User className="w-4 h-4 text-[#2563EB]" /> Farm & Personal Configuration
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                <span>{isEditing ? 'Cancel' : 'Edit Farm Data'}</span>
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#E2EEF2] rounded-xl px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-[#2563EB]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] mb-1">Mobile (WhatsApp/SMS)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#E2EEF2] rounded-xl px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-[#2563EB]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] mb-1">District</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#E2EEF2] rounded-xl px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-[#2563EB] cursor-pointer"
                    >
                      {DISTRICT_LIST.map((d) => (
                        <option key={d.id} value={d.id} className="bg-[#FFFFFF] text-[#0F172A]">
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] mb-1">Municipality & Ward</label>
                    <input
                      type="text"
                      value={municipality}
                      onChange={(e) => setMunicipality(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#E2EEF2] rounded-xl px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-[#2563EB]"
                    />
                  </div>
                  
                  {/* Land Size and Measurement Unit */}
                  <div className="sm:col-span-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#64748B]">
                        Land Area & Regional Unit System
                      </label>
                      <span className="text-[11px] text-[#2563EB] font-bold">
                        {formatCrossEquivalent(landSize, landUnit, 'en')}
                      </span>
                    </div>
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-5 sm:col-span-6">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="5000"
                          value={landSize}
                          onChange={(e) => setLandSize(Number(e.target.value) || 0.1)}
                          className="w-full bg-[#FFFFFF] border border-[#E2EEF2] rounded-xl px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-[#2563EB]"
                        />
                      </div>
                      <div className="col-span-7 sm:col-span-6">
                        <select
                          value={landUnit}
                          onChange={(e) => setLandUnit(e.target.value as LandUnit)}
                          className="w-full bg-[#FFFFFF] border border-[#E2EEF2] rounded-xl px-2.5 py-2 text-xs font-semibold text-[#0F172A] focus:outline-[#2563EB] cursor-pointer"
                        >
                          {LAND_SYSTEM_GROUPS.map((grp) => (
                            <optgroup key={grp.system} label={grp.labelEn}>
                              {grp.units.map((u) => {
                                const m = LAND_UNIT_TABLE[u];
                                return (
                                  <option key={u} value={u}>
                                    {m.nameEn} ({m.sqMeters >= 1 ? `${Math.round(m.sqMeters)} m²` : `${m.sqMeters.toFixed(1)} m²`})
                                  </option>
                                );
                              })}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-[#FFFFFF] py-2.5 rounded-full font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Profile Preferences
                </button>
              </form>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                <div>
                  <span className="text-[#64748B] block">Primary Location</span>
                  <span className="font-extrabold capitalize text-[#0F172A]">{currentProfile?.district || 'Chitwan'}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Land Allocation</span>
                  <span className="font-extrabold text-[#0F172A]">
                    {displayLandSize} {displayUnitMeta.nameEn}
                  </span>
                  <span className="text-[10px] text-[#2563EB] block">
                    ({Math.round(toSquareMeters(displayLandSize, displayLandUnit))} m²)
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Primary Crops</span>
                  <span className="font-extrabold text-[#0F172A]">Tomato, Beans</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Member Since</span>
                  <span className="font-extrabold text-[#0F172A]">{currentProfile?.memberSince?.split(' ')[0] || 'October 2024'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Past Prediction Track Record (Layer 1 Memory) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#2563EB]" /> Your Prediction Track Record (Actual vs Model)
                </h3>
                <p className="text-xs text-[#64748B]">
                  How your harvested crops performed compared to KrishiSetu's sowing advice.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenFeedbackModal?.();
                }}
                className="bg-[#0F172A] hover:bg-[#1E293B] text-[#FFFFFF] text-xs font-extrabold px-3 py-1.5 rounded-full transition shadow-xs cursor-pointer"
              >
                + Log New Harvest
              </button>
            </div>

            <div className="space-y-3">
              {currentTrackRecord.map((record) => {
                const isHarvested = record.status === 'harvested';
                return (
                  <div
                    key={record.id}
                    className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2EEF2] shadow-xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#0F172A]">{record.cropName}</span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              isHarvested
                                ? 'bg-[#F0FDF4] text-[#166534] border border-[#10B981]/30'
                                : 'bg-blue-50 text-[#2563EB] border border-blue-200'
                            }`}
                          >
                            {isHarvested ? 'Verified Harvested' : 'Active Growth Phase'}
                          </span>
                        </div>
                        <span className="text-xs text-[#64748B]">
                          {record.season} • {record.district.toUpperCase()} ({record.landSizeRopani} Ropani)
                        </span>
                      </div>

                      {isHarvested && (
                        <div className="text-right">
                          <span className="text-[11px] text-[#64748B] block">Accuracy</span>
                          <span className="text-sm font-black text-[#10B981]">{record.accuracyPct}%</span>
                        </div>
                      )}
                    </div>

                    {isHarvested ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#FFFFFF] p-2.5 rounded-xl text-xs border border-[#E2EEF2]">
                        <div>
                          <span className="text-[#64748B] block text-[10px]">Predicted Price</span>
                          <span className="font-bold text-[#0F172A]">Rs. {record.predictedPrice.toFixed(2)}/kg</span>
                        </div>
                        <div>
                          <span className="text-[#64748B] block text-[10px]">Actual Farmgate</span>
                          <span className="font-bold text-[#10B981]">Rs. {record.actualPrice.toFixed(2)}/kg</span>
                        </div>
                        <div>
                          <span className="text-[#64748B] block text-[10px]">Delta Realized</span>
                          <span className="font-bold text-[#10B981]">
                            {record.deltaPerKg > 0 ? `+Rs. ${record.deltaPerKg.toFixed(2)}` : `Rs. ${record.deltaPerKg.toFixed(2)}`}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#64748B] block text-[10px]">Net Realized Profit</span>
                          <span className="font-black text-[#0F172A]">Rs. {record.actualProfit.toLocaleString()}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#FFFFFF] p-2.5 rounded-xl text-xs border border-blue-200 text-[#2563EB]">
                        <span className="font-bold">Target Harvest Window:</span> Week 4 of May 2026. Target Price: <span className="font-black">Rs. {record.predictedPrice.toFixed(2)}/kg</span>.
                      </div>
                    )}

                    <p className="text-xs text-[#64748B] italic border-l-2 border-[#2563EB]/40 pl-2">
                      "{record.notes}"
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F8FAFC] border-t border-[#E2EEF2] rounded-b-3xl flex items-center justify-between text-xs text-[#64748B]">
          <span className="flex items-center gap-1.5 text-[#10B981] font-bold">
            <CheckCircle2 className="w-4 h-4" /> Logged to KrishiSetu Real-Time Flywheel
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-[#FFFFFF] font-bold rounded-full transition cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
