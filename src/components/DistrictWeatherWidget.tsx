import React, { useState, useEffect } from 'react';
import {
  Sun,
  CloudRain,
  CloudSun,
  Droplets,
  Wind,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  MapPin,
  ChevronDown,
  ChevronUp,
  Sprout,
  Search,
} from 'lucide-react';
import { weatherApi, WeatherData } from '../api/weatherApi';
import { fetchLiveWeather } from '../services/weatherService';
import { DISTRICT_LIST } from '../data/agriData';
import { useLanguage } from '../context/LanguageContext';

interface DistrictWeatherWidgetProps {
  selectedDistrict: string;
  setSelectedDistrict?: (district: string) => void;
  compact?: boolean;
}

export const DistrictWeatherWidget: React.FC<DistrictWeatherWidgetProps> = ({
  selectedDistrict,
  setSelectedDistrict,
  compact = false,
}) => {
  const { language } = useLanguage();
  const isNe = language === 'ne';

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState<boolean>(false);
  const [districtSearch, setDistrictSearch] = useState<string>('');
  const [show7Day, setShow7Day] = useState<boolean>(false);

  const currentDistrictObj =
    DISTRICT_LIST.find((d) => d.id.toLowerCase() === selectedDistrict.toLowerCase()) || DISTRICT_LIST[0];

  const loadWeather = async (districtId: string, showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await weatherApi.getWeather(districtId);
      if (res && res.weather) {
        setWeather(res.weather);
      } else {
        const direct = await fetchLiveWeather(districtId);
        setWeather(direct);
      }
    } catch {
      try {
        const direct = await fetchLiveWeather(districtId);
        setWeather(direct);
      } catch (err) {
        console.warn('[DistrictWeatherWidget] Could not load weather:', err);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadWeather(selectedDistrict);
  }, [selectedDistrict]);

  const getWeatherIcon = (type: string, sizeClass = 'w-5 h-5') => {
    if (type === 'rain') return <CloudRain className={`${sizeClass} text-blue-500`} />;
    if (type === 'cloudy') return <CloudSun className={`${sizeClass} text-amber-500`} />;
    return <Sun className={`${sizeClass} text-amber-500`} />;
  };

  if (compact) {
    if (loading && !weather) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] text-xs text-[#746F68] animate-pulse">
          <Thermometer className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isNe ? 'मौसम लोड हुँदैछ...' : 'Loading weather...'}</span>
        </div>
      );
    }

    if (!weather) return null;

    return (
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] text-xs shadow-2xs">
        <div className="flex items-center gap-1.5">
          {getWeatherIcon(weather.conditionType, 'w-4 h-4')}
          <span className="font-mono font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">
            {weather.temp}°C
          </span>
        </div>
        <div className="h-3 w-px bg-[#E8E2D8] dark:bg-[#383530]" />
        <div className="flex items-center gap-1 text-[11px] text-[#746F68] dark:text-[#A6A096]">
          <Droplets className="w-3 h-3 text-blue-500" />
          <span className="font-mono">{weather.humidity}%</span>
        </div>
        <div className="h-3 w-px bg-[#E8E2D8] dark:bg-[#383530] hidden sm:block" />
        <span className="text-[11px] font-bold text-[#2E7D5A] dark:text-[#4ADE80] hidden sm:inline">
          {currentDistrictObj.name}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#22201D] rounded-3xl p-5 sm:p-6 border border-[#E8E2D8] dark:border-[#383530] shadow-xs relative overflow-hidden transition-all duration-200">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            {setSelectedDistrict ? (
              <button
                type="button"
                onClick={() => setDistrictDropdownOpen(!districtDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] hover:bg-[#F2ECE1] dark:hover:bg-[#302D28] text-xs font-bold text-[#1F1E1B] dark:text-[#F5F3EF] border border-[#E8E2D8] dark:border-[#383530] transition cursor-pointer shadow-2xs"
              >
                <MapPin className="w-3.5 h-3.5 text-[#2E7D5A]" />
                <span>{currentDistrictObj.name}</span>
                {(currentDistrictObj as any).province && (
                  <span className="text-[10px] font-medium text-[#746F68] dark:text-[#A6A096]">
                    · {(currentDistrictObj as any).province}
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-[#746F68]" />
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] text-xs font-bold text-[#1F1E1B] dark:text-[#F5F3EF] border border-[#E8E2D8] dark:border-[#383530]">
                <MapPin className="w-3.5 h-3.5 text-[#2E7D5A]" />
                <span>{currentDistrictObj.name}</span>
              </div>
            )}

            {districtDropdownOpen && setSelectedDistrict && (
              <div className="absolute left-0 top-full mt-1.5 z-30 w-72 bg-white dark:bg-[#22201D] border border-[#E8E2D8] dark:border-[#383530] rounded-2xl shadow-lg p-2 space-y-1.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#746F68] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={districtSearch}
                    onChange={(e) => setDistrictSearch(e.target.value)}
                    placeholder={isNe ? '७७ जिल्ला खोज्नुहोस्...' : 'Search 77 districts...'}
                    className="w-full bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-[#1F1E1B] dark:text-[#F5F3EF] focus:outline-none focus:border-[#2E7D5A]"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto space-y-0.5">
                  {DISTRICT_LIST.filter((dist) => {
                    if (!districtSearch.trim()) return true;
                    const q = districtSearch.toLowerCase().trim();
                    return (
                      dist.name.toLowerCase().includes(q) ||
                      dist.province.toLowerCase().includes(q) ||
                      dist.id.toLowerCase().includes(q)
                    );
                  }).map((dist) => (
                    <button
                      key={dist.id}
                      type="button"
                      onClick={() => {
                        setSelectedDistrict(dist.id);
                        setDistrictDropdownOpen(false);
                        setDistrictSearch('');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                        dist.id.toLowerCase() === selectedDistrict.toLowerCase()
                          ? 'bg-[#2E7D5A] text-white'
                          : 'text-[#1F1E1B] dark:text-[#F5F3EF] hover:bg-[#FAF7F2] dark:hover:bg-[#262421]'
                      }`}
                    >
                      <span className="truncate">{dist.name}</span>
                      <span className="text-[10px] opacity-75 font-mono shrink-0 ml-2">
                        {(dist as any).province || dist.elevation}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#2E7D5A] dark:text-[#4ADE80] text-[10px] font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isNe ? 'प्रत्यक्ष कृषि मौसम' : 'Live Open-Meteo'}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {weather?.dailyForecast && weather.dailyForecast.length > 1 && (
            <button
              type="button"
              onClick={() => setShow7Day((prev) => !prev)}
              className="px-2.5 py-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] text-[11px] font-bold text-[#1F1E1B] dark:text-[#F5F3EF] flex items-center gap-1 hover:bg-[#F2ECE1] dark:hover:bg-[#302D28] transition cursor-pointer"
            >
              <span>{isNe ? '७ दिने मौसम' : '7-Day Outlook'}</span>
              {show7Day ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
          <button
            type="button"
            onClick={() => loadWeather(selectedDistrict, true)}
            disabled={isRefreshing}
            title="Refresh Weather Data"
            className="p-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] text-[#746F68] hover:text-[#1F1E1B] dark:hover:text-[#F5F3EF] transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#2E7D5A]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Meteorological Grid */}
      {loading && !weather ? (
        <div className="py-8 text-center text-xs text-[#746F68] animate-pulse">
          {isNe ? 'उपग्रह मौसम तथ्याङ्क प्राप्त गर्दै...' : 'Fetching live meteorological data...'}
        </div>
      ) : weather ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. Temperature */}
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8]/80 dark:border-[#383530] space-y-1">
              <div className="flex items-center justify-between text-[#746F68] dark:text-[#A6A096] text-xs font-semibold">
                <span>{isNe ? 'तापक्रम' : 'Temperature'}</span>
                {getWeatherIcon(weather.conditionType, 'w-4 h-4')}
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-black text-[#1F1E1B] dark:text-[#F5F3EF]">
                {weather.temp}°C
              </div>
              <div className="text-[11px] font-mono text-[#746F68] dark:text-[#A6A096]">
                ↓ {weather.tempMin}° · ↑ {weather.tempMax}°
              </div>
            </div>

            {/* 2. Relative Humidity */}
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8]/80 dark:border-[#383530] space-y-1">
              <div className="flex items-center justify-between text-[#746F68] dark:text-[#A6A096] text-xs font-semibold">
                <span>{isNe ? 'सापेक्ष आर्द्रता' : 'Humidity'}</span>
                <Droplets className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-black text-[#1F1E1B] dark:text-[#F5F3EF]">
                {weather.humidity}%
              </div>
              <div className="text-[11px] font-medium text-[#746F68] dark:text-[#A6A096]">
                {weather.humidity > 70 ? (isNe ? 'उच्च आर्द्रता' : 'High Humidity') : (isNe ? 'सामान्य' : 'Optimal')}
              </div>
            </div>

            {/* 3. Rain Risk Probability */}
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8]/80 dark:border-[#383530] space-y-1">
              <div className="flex items-center justify-between text-[#746F68] dark:text-[#A6A096] text-xs font-semibold">
                <span>{isNe ? 'वर्षा सम्भावना' : 'Rain Probability'}</span>
                <CloudRain className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-black text-[#1F1E1B] dark:text-[#F5F3EF]">
                {weather.precipProb}%
              </div>
              <div className="text-[11px] font-medium text-[#746F68] dark:text-[#A6A096]">
                {weather.precipProb >= 40
                  ? (isNe ? 'त्रिपाल आवश्यक' : 'Tarp Recommended')
                  : (isNe ? 'वर्षाको जोखिम न्यून' : 'Dry & Clear')}
              </div>
            </div>

            {/* 4. Soil & Wind Telemetry */}
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8]/80 dark:border-[#383530] space-y-1">
              <div className="flex items-center justify-between text-[#746F68] dark:text-[#A6A096] text-xs font-semibold">
                <span>{typeof weather.soilMoisturePct === 'number' ? (isNe ? 'माटो चिस्यान' : 'Soil Moisture') : (isNe ? 'हावाको गति' : 'Wind Speed')}</span>
                {typeof weather.soilMoisturePct === 'number' ? (
                  <Sprout className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Wind className="w-4 h-4 text-teal-500" />
                )}
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-black text-[#1F1E1B] dark:text-[#F5F3EF]">
                {typeof weather.soilMoisturePct === 'number' ? (
                  <>{weather.soilMoisturePct}<span className="text-xs font-normal">%</span></>
                ) : (
                  <>{weather.windSpeedKmH ?? 8} <span className="text-xs font-normal">km/h</span></>
                )}
              </div>
              <div className="text-[11px] font-mono text-[#746F68] dark:text-[#A6A096] truncate">
                {typeof weather.soilTemp0Cm === 'number'
                  ? `${isNe ? 'माटो' : 'Soil'} ${weather.soilTemp0Cm}°C · ET₀ ${weather.evapotranspirationMm ?? 2.5}mm`
                  : `${currentDistrictObj.elevation} (${currentDistrictObj.zone})`}
              </div>
            </div>
          </div>

          {/* Expandable 7-Day Agro-Weather Strip */}
          {show7Day && weather.dailyForecast && weather.dailyForecast.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 pt-1">
              {weather.dailyForecast.map((day, idx) => {
                const dt = new Date(day.date);
                const dayLabel = idx === 0
                  ? (isNe ? 'आज' : 'Today')
                  : dt.toLocaleDateString(isNe ? 'ne-NP' : 'en-US', { weekday: 'short' });
                return (
                  <div
                    key={day.date}
                    className="p-2.5 rounded-2xl bg-[#FAF7F2] dark:bg-[#262421] border border-[#E8E2D8] dark:border-[#383530] text-center space-y-1"
                  >
                    <div className="text-[11px] font-bold text-[#746F68] dark:text-[#A6A096]">{dayLabel}</div>
                    <div className="flex justify-center">{getWeatherIcon(day.conditionType, 'w-4 h-4')}</div>
                    <div className="text-xs font-mono font-bold text-[#1F1E1B] dark:text-[#F5F3EF]">
                      {day.tempMax}° <span className="text-[#8C887B] font-normal">{day.tempMin}°</span>
                    </div>
                    <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400">
                      💧 {day.precipProb}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Agronomic Advisory Callout */}
          <div
            className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-colors ${
              weather.fieldStatus === 'caution'
                ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {weather.fieldStatus === 'caution' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-[#2E7D5A] dark:text-[#4ADE80]" />
              )}
            </div>
            <div className="text-xs space-y-0.5">
              <div className="font-bold flex flex-wrap items-center gap-2">
                <span>{weather.conditionLabel}</span>
                <span className="text-[10px] font-mono opacity-70">
                  • {isNe ? 'कृषि सल्लाह' : 'Field Advisory'}
                  {weather.windSpeedKmH ? ` · ${weather.windSpeedKmH} km/h` : ''}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs opacity-90 leading-relaxed font-medium">
                {isNe && weather.fieldAdviceNe ? weather.fieldAdviceNe : weather.fieldAdvice}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
