/**
 * Canonical Nepali & Metric Land Measurement System
 * Single Source of Truth for Area Conversions & Regional Defaults
 * 
 * Hill & Mountain System (Ropani-Aana-Paisa-Daam)
 * Terai Plains System (Bigha-Kattha-Dhur)
 * Universal Metric (Hectare, Square Meter)
 * 
 * All units are canonicalized to Square Meters (m²).
 */

export type LandUnit =
  | 'ropani'
  | 'aana'
  | 'paisa'
  | 'daam'
  | 'bigha'
  | 'kattha'
  | 'dhur'
  | 'hectare'
  | 'sqm';

export type LandSystem = 'ropani' | 'bigha' | 'metric';

export interface LandUnitMetadata {
  id: LandUnit;
  system: LandSystem;
  nameEn: string;
  nameNe: string;
  symbolEn: string;
  symbolNe: string;
  sqMeters: number; // 1 unit in canonical m²
  subdivisions?: string;
  descriptionEn: string;
  descriptionNe: string;
}

export const LAND_UNIT_TABLE: Record<LandUnit, LandUnitMetadata> = {
  // Ropani System (Hills & Mountains, Kathmandu Valley)
  ropani: {
    id: 'ropani',
    system: 'ropani',
    nameEn: 'Ropani',
    nameNe: 'रोपनी',
    symbolEn: 'Ropani',
    symbolNe: 'रोपनी',
    sqMeters: 508.72,
    subdivisions: '16 Aana = 64 Paisa = 256 Daam',
    descriptionEn: 'Hills & Kathmandu Valley standard (508.72 m²)',
    descriptionNe: 'पहाड र काठमाडौँ उपत्यकाको मुख्य एकाइ (५०८.७२ वर्ग मिटर)',
  },
  aana: {
    id: 'aana',
    system: 'ropani',
    nameEn: 'Aana',
    nameNe: 'आना',
    symbolEn: 'Aana',
    symbolNe: 'आना',
    sqMeters: 31.795, // 508.72 / 16
    subdivisions: '1/16 Ropani = 4 Paisa = 16 Daam',
    descriptionEn: 'Subdivision of Ropani (31.80 m²)',
    descriptionNe: 'रोपनीको १/१६ भाग (३१.८० वर्ग मिटर)',
  },
  paisa: {
    id: 'paisa',
    system: 'ropani',
    nameEn: 'Paisa',
    nameNe: 'पैसा',
    symbolEn: 'Paisa',
    symbolNe: 'पैसा',
    sqMeters: 7.94875, // 31.795 / 4
    subdivisions: '1/64 Ropani = 4 Daam',
    descriptionEn: 'Subdivision of Aana (7.95 m²)',
    descriptionNe: 'आनाको १/४ भाग (७.९५ वर्ग मिटर)',
  },
  daam: {
    id: 'daam',
    system: 'ropani',
    nameEn: 'Daam',
    nameNe: 'दाम',
    symbolEn: 'Daam',
    symbolNe: 'दाम',
    sqMeters: 1.9871875, // 7.94875 / 4
    subdivisions: '1/256 Ropani',
    descriptionEn: 'Smallest Ropani unit (1.99 m²)',
    descriptionNe: 'सबैभन्दा सानो पहाडी एकाइ (१.९९ वर्ग मिटर)',
  },

  // Bigha System (Terai Plains)
  bigha: {
    id: 'bigha',
    system: 'bigha',
    nameEn: 'Bigha',
    nameNe: 'बिघा',
    symbolEn: 'Bigha',
    symbolNe: 'बिघा',
    sqMeters: 6772.63,
    subdivisions: '20 Kattha = 400 Dhur',
    descriptionEn: 'Terai Plains standard (6,772.63 m² = 13.31 Ropani)',
    descriptionNe: 'तराईको मुख्य एकाइ (६,७७२.६३ वर्ग मिटर = १३.३१ रोपनी)',
  },
  kattha: {
    id: 'kattha',
    system: 'bigha',
    nameEn: 'Kattha',
    nameNe: 'कट्ठा',
    symbolEn: 'Kattha',
    symbolNe: 'कट्ठा',
    sqMeters: 338.6315, // 6772.63 / 20
    subdivisions: '1/20 Bigha = 20 Dhur',
    descriptionEn: 'Subdivision of Bigha (338.63 m² ≈ 0.67 Ropani)',
    descriptionNe: 'बिघाको १/२० भाग (३३८.६३ वर्ग मिटर ≈ ०.६७ रोपनी)',
  },
  dhur: {
    id: 'dhur',
    system: 'bigha',
    nameEn: 'Dhur',
    nameNe: 'धुर',
    symbolEn: 'Dhur',
    symbolNe: 'धुर',
    sqMeters: 16.931575, // 338.6315 / 20
    subdivisions: '1/400 Bigha',
    descriptionEn: 'Subdivision of Kattha (16.93 m²)',
    descriptionNe: 'कट्ठाको १/२० भाग (१६.९३ वर्ग मिटर)',
  },

  // Universal Metric
  hectare: {
    id: 'hectare',
    system: 'metric',
    nameEn: 'Hectare',
    nameNe: 'हेक्टर',
    symbolEn: 'Ha',
    symbolNe: 'हे.',
    sqMeters: 10000.0,
    subdivisions: '10,000 m² = 19.66 Ropani = 1.48 Bigha',
    descriptionEn: 'Standard metric unit (10,000 m²)',
    descriptionNe: 'अन्तर्राष्ट्रिय मेट्रिक एकाइ (१०,००० वर्ग मिटर)',
  },
  sqm: {
    id: 'sqm',
    system: 'metric',
    nameEn: 'Square Meter',
    nameNe: 'वर्ग मिटर',
    symbolEn: 'm²',
    symbolNe: 'व.मि.',
    sqMeters: 1.0,
    subdivisions: '1 m²',
    descriptionEn: 'Base SI area unit',
    descriptionNe: 'आधारभूत वर्ग मिटर',
  },
};

export const LAND_UNITS_ORDERED: LandUnit[] = [
  // Ropani system
  'ropani',
  'aana',
  'paisa',
  'daam',
  // Bigha system
  'bigha',
  'kattha',
  'dhur',
  // Universal
  'hectare',
  'sqm',
];

/**
 * Converts any land value in a given unit to canonical Square Meters (m²)
 */
export function toSquareMeters(value: number, unit: LandUnit): number {
  const meta = LAND_UNIT_TABLE[unit] || LAND_UNIT_TABLE.ropani;
  const safeVal = isNaN(value) || value < 0 ? 0 : value;
  return Number((safeVal * meta.sqMeters).toFixed(4));
}

/**
 * Converts canonical Square Meters (m²) to any target unit
 */
export function fromSquareMeters(valueInM2: number, targetUnit: LandUnit): number {
  const meta = LAND_UNIT_TABLE[targetUnit] || LAND_UNIT_TABLE.ropani;
  const safeM2 = isNaN(valueInM2) || valueInM2 < 0 ? 0 : valueInM2;
  return Number((safeM2 / meta.sqMeters).toFixed(3));
}

/**
 * Direct conversion between any two land units through canonical m²
 */
export function convertLandUnit(value: number, fromUnit: LandUnit, toUnit: LandUnit): number {
  if (fromUnit === toUnit) return value;
  const inM2 = toSquareMeters(value, fromUnit);
  return fromSquareMeters(inM2, toUnit);
}

/**
 * Terai district identifiers that naturally use the Bigha-Kattha system
 */
const TERAI_DISTRICT_KEYS = new Set([
  'chitwan',
  'rupandehi',
  'jhapa',
  'morang',
  'sunsari',
  'saptari',
  'siraha',
  'dhanusha',
  'mahottari',
  'sarlahi',
  'rautahat',
  'bara',
  'parsa',
  'nawalparasi',
  'nawalpur',
  'parasi',
  'kapilvastu',
  'dang',
  'banke',
  'bardiya',
  'kailali',
  'kanchanpur',
]);

/**
 * Smart Regional Default: Hill/Mountain/Kathmandu Valley -> 'ropani', Terai -> 'bigha'
 */
export function getDefaultLandUnitForDistrict(districtIdOrName?: string): LandUnit {
  if (!districtIdOrName) return 'ropani';
  const clean = districtIdOrName.trim().toLowerCase();
  for (const teraiKey of TERAI_DISTRICT_KEYS) {
    if (clean.includes(teraiKey)) {
      return 'bigha';
    }
  }
  return 'ropani';
}

/**
 * Unit Label in English or Nepali
 */
export function getLandUnitLabel(unit: LandUnit, lang: 'en' | 'ne' = 'en'): string {
  const meta = LAND_UNIT_TABLE[unit] || LAND_UNIT_TABLE.ropani;
  return lang === 'ne' ? meta.nameNe : meta.nameEn;
}

/**
 * Grouped metadata for visually distinct segmented select inputs
 */
export const LAND_SYSTEM_GROUPS = [
  {
    system: 'ropani' as LandSystem,
    labelEn: 'Hills & Kathmandu System (रोपनी प्रणाली)',
    labelNe: 'पहाड तथा उपत्यका प्रणाली (रोपनी)',
    units: ['ropani', 'aana', 'paisa', 'daam'] as LandUnit[],
  },
  {
    system: 'bigha' as LandSystem,
    labelEn: 'Terai Plains System (बिघा प्रणाली)',
    labelNe: 'तराई समथर प्रणाली (बिघा)',
    units: ['bigha', 'kattha', 'dhur'] as LandUnit[],
  },
  {
    system: 'metric' as LandSystem,
    labelEn: 'Universal & Metric (हेक्टर / मिटर)',
    labelNe: 'मेट्रिक एकाइ (हेक्टर / मिटर)',
    units: ['hectare', 'sqm'] as LandUnit[],
  },
];

/**
 * Compound Ropani Representation (Ropani - Aana - Paisa - Daam)
 */
export interface CompoundRopani {
  ropani: number;
  aana: number;
  paisa: number;
  daam: number;
}

export function ropaniToCompound(ropaniDecimal: number): CompoundRopani {
  const safe = Math.max(0, ropaniDecimal);
  const ropani = Math.floor(safe);
  const remAana = (safe - ropani) * 16;
  const aana = Math.floor(remAana);
  const remPaisa = (remAana - aana) * 4;
  const paisa = Math.floor(remPaisa);
  const remDaam = (remPaisa - paisa) * 4;
  const daam = Number(remDaam.toFixed(1));

  return { ropani, aana, paisa, daam };
}

export function compoundToRopani(c: Partial<CompoundRopani>): number {
  const r = c.ropani || 0;
  const a = c.aana || 0;
  const p = c.paisa || 0;
  const d = c.daam || 0;
  return Number((r + a / 16 + p / 64 + d / 256).toFixed(4));
}

/**
 * Compound Bigha Representation (Bigha - Kattha - Dhur)
 */
export interface CompoundBigha {
  bigha: number;
  kattha: number;
  dhur: number;
}

export function bighaToCompound(bighaDecimal: number): CompoundBigha {
  const safe = Math.max(0, bighaDecimal);
  const bigha = Math.floor(safe);
  const remKattha = (safe - bigha) * 20;
  const kattha = Math.floor(remKattha);
  const remDhur = (remKattha - kattha) * 20;
  const dhur = Number(remDhur.toFixed(1));

  return { bigha, kattha, dhur };
}

export function compoundToBigha(c: Partial<CompoundBigha>): number {
  const b = c.bigha || 0;
  const k = c.kattha || 0;
  const d = c.dhur || 0;
  return Number((b + k / 20 + d / 400).toFixed(4));
}

/**
 * Formats a friendly cross-unit equivalent string (e.g. "~1.2 Bigha equivalent" or "~4 Kattha")
 */
export function formatCrossEquivalent(
  value: number,
  activeUnit: LandUnit,
  lang: 'en' | 'ne' = 'en'
): string {
  const sqMeters = toSquareMeters(value, activeUnit);
  if (sqMeters <= 0) return '';

  const meta = LAND_UNIT_TABLE[activeUnit];
  if (meta.system === 'ropani') {
    // Show equivalent in Bigha / Kattha
    const bighaVal = fromSquareMeters(sqMeters, 'bigha');
    if (bighaVal >= 1) {
      return lang === 'ne'
        ? `~${bighaVal.toFixed(2)} बिघा बराबर (${Math.round(sqMeters)} m²)`
        : `~${bighaVal.toFixed(2)} Bigha equivalent (${Math.round(sqMeters)} m²)`;
    }
    const katthaVal = fromSquareMeters(sqMeters, 'kattha');
    return lang === 'ne'
      ? `~${katthaVal.toFixed(1)} कट्ठा बराबर (${Math.round(sqMeters)} m²)`
      : `~${katthaVal.toFixed(1)} Kattha equivalent (${Math.round(sqMeters)} m²)`;
  } else if (meta.system === 'bigha') {
    // Show equivalent in Ropani
    const ropaniVal = fromSquareMeters(sqMeters, 'ropani');
    return lang === 'ne'
      ? `~${ropaniVal.toFixed(2)} रोपनी बराबर (${Math.round(sqMeters)} m²)`
      : `~${ropaniVal.toFixed(2)} Ropani equivalent (${Math.round(sqMeters)} m²)`;
  } else {
    // Metric
    const ropaniVal = fromSquareMeters(sqMeters, 'ropani');
    const bighaVal = fromSquareMeters(sqMeters, 'bigha');
    return lang === 'ne'
      ? `~${ropaniVal.toFixed(2)} रोपनी / ~${bighaVal.toFixed(2)} बिघा`
      : `~${ropaniVal.toFixed(2)} Ropani / ~${bighaVal.toFixed(2)} Bigha`;
  }
}
