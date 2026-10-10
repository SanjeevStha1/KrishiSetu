import React from 'react';

/**
 * KrishiSetu Central Crop Identifier & Illustration Registry
 * 
 * Maps stable crop identifiers (crop_id, slug, English/Nepali names) to
 * handcrafted, clean, premium cartoon agricultural illustrations.
 * 
 * Visual Family:
 * - Clean cartoon agricultural vector illustrations
 * - Natural produce colors & textures
 * - Friendly, modern agricultural SaaS aesthetic
 * - Subtle depth and soft shadows
 * - Consistent 200x200 canvas framing
 */

export interface CropMetadata {
  id: string;
  name: string;
  nepaliName: string;
  category: 'vegetable' | 'staple' | 'spices' | 'exotic' | 'cereal' | 'fruit';
  primaryColor: string;
  secondaryColor: string;
  aliases: string[];
}

export const CROP_METADATA_LIST: CropMetadata[] = [
  {
    id: 'tomato',
    name: 'Tomato (Local)',
    nepaliName: 'गोलभेडा',
    category: 'vegetable',
    primaryColor: '#EF4444',
    secondaryColor: '#10B981',
    aliases: ['tomato', 'tomatoes', 'tamatar', 'golbheda', 'local tomato', 'hybrid tomato', 'गोलभेडा', 'टमाटर', 'गोलभेडा (स्थानीय)'],
  },
  {
    id: 'potato',
    name: 'Potato (Red)',
    nepaliName: 'रातो आलु',
    category: 'staple',
    primaryColor: '#B45309',
    secondaryColor: '#D97706',
    aliases: ['potato', 'potatoes', 'aalu', 'alu', 'red potato', 'white potato', 'आलु', 'रातो आलु', 'सेतो आलु', 'mude potato'],
  },
  {
    id: 'onion',
    name: 'Dry Onion',
    nepaliName: 'सुकेको प्याज',
    category: 'staple',
    primaryColor: '#C2410C',
    secondaryColor: '#EA580C',
    aliases: ['onion', 'onions', 'pyaj', 'dry onion', 'प्याज', 'सुकेको प्याज', 'हरियो प्याज'],
  },
  {
    id: 'cauliflower',
    name: 'Cauliflower',
    nepaliName: 'काउली',
    category: 'vegetable',
    primaryColor: '#15803D',
    secondaryColor: '#F8FAFC',
    aliases: ['cauliflower', 'kauli', 'gobi', 'snowball', 'काउली', 'स्थानीय काउली', 'फूलगोभी'],
  },
  {
    id: 'cabbage',
    name: 'Cabbage',
    nepaliName: 'बन्दा',
    category: 'vegetable',
    primaryColor: '#16A34A',
    secondaryColor: '#22C55E',
    aliases: ['cabbage', 'banda', 'patagobi', 'बन्दा', 'बन्दा गोभी', 'हरियो बन्दा'],
  },
  {
    id: 'carrot',
    name: 'Carrot',
    nepaliName: 'गाजर',
    category: 'vegetable',
    primaryColor: '#EA580C',
    secondaryColor: '#16A34A',
    aliases: ['carrot', 'carrots', 'gajar', 'गाजर', 'स्थानीय गाजर'],
  },
  {
    id: 'capsicum',
    name: 'Capsicum',
    nepaliName: 'भेडे खुर्सानी',
    category: 'exotic',
    primaryColor: '#15803D',
    secondaryColor: '#4ADE80',
    aliases: ['capsicum', 'bell pepper', 'shimla mirch', 'bhede khursani', 'भेडे खुर्सानी', 'सिमला मिर्च', 'क्याप्सिकम'],
  },
  {
    id: 'cucumber',
    name: 'Cucumber',
    nepaliName: 'काँक्रो',
    category: 'vegetable',
    primaryColor: '#15803D',
    secondaryColor: '#86EFAC',
    aliases: ['cucumber', 'kankro', 'khira', 'काँक्रो', 'स्थानीय काँक्रो', 'काक्रा'],
  },
  {
    id: 'brinjal',
    name: 'Brinjal (Eggplant)',
    nepaliName: 'भन्टा',
    category: 'vegetable',
    primaryColor: '#6B21A8',
    secondaryColor: '#15803D',
    aliases: ['brinjal', 'eggplant', 'aubergine', 'bhanta', 'baingan', 'भन्टा', 'बैगुन', 'गोलो भन्टा', 'लामो भन्टा'],
  },
  {
    id: 'green_chilli',
    name: 'Green Chilli',
    nepaliName: 'हरियो खुर्सानी',
    category: 'spices',
    primaryColor: '#15803D',
    secondaryColor: '#DC2626',
    aliases: ['green chilli', 'chilli', 'chili', 'chilli_green', 'khursani', 'hariyo khursani', 'mirch', 'हरियो खुर्सानी', 'खुर्सानी'],
  },
  {
    id: 'garlic',
    name: 'Dry Garlic',
    nepaliName: 'सुकेको लसुन',
    category: 'spices',
    primaryColor: '#E2E8F0',
    secondaryColor: '#94A3B8',
    aliases: ['garlic', 'dry garlic', 'lasun', 'lahsun', 'लसुन', 'सुकेको लसुन'],
  },
  {
    id: 'ginger',
    name: 'Fresh Ginger',
    nepaliName: 'अदुवा',
    category: 'spices',
    primaryColor: '#B45309',
    secondaryColor: '#FBBF24',
    aliases: ['ginger', 'fresh ginger', 'aduwa', 'adrak', 'अदुवा', 'ताजा अदुवा'],
  },
  {
    id: 'bitter_gourd',
    name: 'Bitter Gourd',
    nepaliName: 'करेला',
    category: 'vegetable',
    primaryColor: '#166534',
    secondaryColor: '#22C55E',
    aliases: ['bitter gourd', 'bitter_gourd', 'karela', 'tito karela', 'करेला', 'तीतो करेला'],
  },
  {
    id: 'bottle_gourd',
    name: 'Bottle Gourd',
    nepaliName: 'लौका',
    category: 'vegetable',
    primaryColor: '#65A30D',
    secondaryColor: '#A3E635',
    aliases: ['bottle gourd', 'bottle_gourd', 'lauka', 'kaddu', 'लौका'],
  },
  {
    id: 'beans',
    name: 'French Beans',
    nepaliName: 'सिमी',
    category: 'vegetable',
    primaryColor: '#15803D',
    secondaryColor: '#86EFAC',
    aliases: ['beans', 'french beans', 'french_beans', 'simi', 'bodi', 'सिमी', 'घिउ सिमी', 'बोडी'],
  },
  {
    id: 'peas',
    name: 'Green Peas',
    nepaliName: 'केराउ',
    category: 'vegetable',
    primaryColor: '#16A34A',
    secondaryColor: '#4ADE80',
    aliases: ['peas', 'green peas', 'green_peas', 'kerau', 'matar', 'केराउ', 'हरियो केराउ', 'मटर'],
  },
  {
    id: 'radish',
    name: 'White Radish',
    nepaliName: 'मूला',
    category: 'vegetable',
    primaryColor: '#F8FAFC',
    secondaryColor: '#15803D',
    aliases: ['radish', 'white radish', 'mula', 'mooli', 'मूला', 'सेतो मूला', 'रातो मूला'],
  },
  {
    id: 'ladies_finger',
    name: 'Okra (Bhindi)',
    nepaliName: 'भिन्डी',
    category: 'vegetable',
    primaryColor: '#15803D',
    secondaryColor: '#22C55E',
    aliases: ['ladies finger', 'ladies_finger', 'okra', 'bhindi', 'ramtori', 'भिन्डी', 'रामतोरिया'],
  },
  {
    id: 'spinach',
    name: 'Palungo Spinach',
    nepaliName: 'पालुङ्गो',
    category: 'vegetable',
    primaryColor: '#166534',
    secondaryColor: '#22C55E',
    aliases: ['spinach', 'palungo', 'saag', 'palak', 'पालुङ्गो', 'साग', 'पालक साग'],
  },
  {
    id: 'mushroom',
    name: 'Button Mushroom',
    nepaliName: 'च्याउ',
    category: 'exotic',
    primaryColor: '#F1F5F9',
    secondaryColor: '#94A3B8',
    aliases: ['mushroom', 'button mushroom', 'kanya mushroom', 'chyau', 'guchhi', 'च्याउ', 'कन्ये च्याउ', 'गोब्रे च्याउ'],
  },
  {
    id: 'pumpkin',
    name: 'Pumpkin',
    nepaliName: 'फर्सी',
    category: 'staple',
    primaryColor: '#D97706',
    secondaryColor: '#15803D',
    aliases: ['pumpkin', 'farsi', 'kaddu', 'फर्सी', 'पाकेको फर्सी', 'हरियो फर्सी'],
  },
  {
    id: 'sweet_potato',
    name: 'Sweet Potato',
    nepaliName: 'सखरखण्ड',
    category: 'staple',
    primaryColor: '#9A3412',
    secondaryColor: '#F97316',
    aliases: ['sweet potato', 'sweet_potato', 'sakharkhand', 'shakarkand', 'सखरखण्ड', 'सुठुनी'],
  },
  {
    id: 'coriander',
    name: 'Green Coriander',
    nepaliName: 'धनिया',
    category: 'spices',
    primaryColor: '#15803D',
    secondaryColor: '#86EFAC',
    aliases: ['coriander', 'green coriander', 'dhaniya', 'धनिया', 'हरियो धनिया'],
  },
  {
    id: 'paddy',
    name: 'Paddy / Rice (Dhan)',
    nepaliName: 'धान',
    category: 'cereal',
    primaryColor: '#CA8A04',
    secondaryColor: '#15803D',
    aliases: ['paddy', 'rice', 'dhan', 'chamal', 'धान', 'चामल', 'बासमती धान'],
  },
  {
    id: 'wheat',
    name: 'Wheat (Gahu)',
    nepaliName: 'गहुँ',
    category: 'cereal',
    primaryColor: '#D97706',
    secondaryColor: '#FDE68A',
    aliases: ['wheat', 'gahu', 'gehu', 'गहुँ', 'गहु'],
  },
  {
    id: 'maize',
    name: 'Maize (Makai)',
    nepaliName: 'मकै',
    category: 'cereal',
    primaryColor: '#EAB308',
    secondaryColor: '#15803D',
    aliases: ['maize', 'corn', 'makai', 'makka', 'मकै'],
  },
  {
    id: 'mustard',
    name: 'Mustard (Tori)',
    nepaliName: 'तोरी',
    category: 'spices',
    primaryColor: '#EAB308',
    secondaryColor: '#15803D',
    aliases: ['mustard', 'tori', 'sarson', 'तोरी', 'रायो तोरी'],
  },
  {
    id: 'apple',
    name: 'Highland Apple',
    nepaliName: 'स्याउ',
    category: 'fruit',
    primaryColor: '#DC2626',
    secondaryColor: '#15803D',
    aliases: ['apple', 'syau', 'marpha apple', 'mustang apple', 'स्याउ', 'मार्फा स्याउ', 'मुस्ताङ स्याउ'],
  },
];

/**
 * Normalizes any crop identifier, slug, display string, or Nepali text into
 * a canonical crop ID.
 */
export function normalizeCropId(rawInput?: string | null): string {
  if (!rawInput || typeof rawInput !== 'string') return 'unknown';

  const clean = rawInput
    .toLowerCase()
    .trim()
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ');

  // Direct lookup
  for (const meta of CROP_METADATA_LIST) {
    if (meta.id === clean) return meta.id;
    for (const alias of meta.aliases) {
      const cleanAlias = alias.toLowerCase().trim().replace(/[_-]/g, ' ');
      if (clean === cleanAlias || clean.includes(cleanAlias) || cleanAlias.includes(clean)) {
        return meta.id;
      }
    }
  }

  // Token matching fallback
  if (clean.includes('tomat') || clean.includes('गोलभेडा') || clean.includes('टमाटर')) return 'tomato';
  if (clean.includes('potat') || clean.includes('आलु')) return 'potato';
  if (clean.includes('onion') || clean.includes('प्याज')) return 'onion';
  if (clean.includes('cauli') || clean.includes('काउली')) return 'cauliflower';
  if (clean.includes('cabb') || clean.includes('बन्दा')) return 'cabbage';
  if (clean.includes('carr') || clean.includes('गाजर')) return 'carrot';
  if (clean.includes('cucum') || clean.includes('काँक्रो') || clean.includes('काक्रा')) return 'cucumber';
  if (clean.includes('brinj') || clean.includes('eggplant') || clean.includes('भन्टा')) return 'brinjal';
  if (clean.includes('chill') || clean.includes('खुर्सानी')) return 'green_chilli';
  if (clean.includes('capsic') || clean.includes('भेडे')) return 'capsicum';
  if (clean.includes('garl') || clean.includes('लसुन')) return 'garlic';
  if (clean.includes('ging') || clean.includes('अदुवा')) return 'ginger';
  if (clean.includes('bitter') || clean.includes('karel') || clean.includes('करेला')) return 'bitter_gourd';
  if (clean.includes('bottle') || clean.includes('lauk') || clean.includes('लौका')) return 'bottle_gourd';
  if (clean.includes('bean') || clean.includes('simi') || clean.includes('सिमी')) return 'beans';
  if (clean.includes('pea') || clean.includes('kerau') || clean.includes('केराउ')) return 'peas';
  if (clean.includes('radish') || clean.includes('mula') || clean.includes('मूला')) return 'radish';
  if (clean.includes('okra') || clean.includes('bhindi') || clean.includes('भिन्डी')) return 'ladies_finger';
  if (clean.includes('spinach') || clean.includes('palung') || clean.includes('पालुङ्गो')) return 'spinach';
  if (clean.includes('mush') || clean.includes('chyau') || clean.includes('च्याउ')) return 'mushroom';
  if (clean.includes('pump') || clean.includes('farsi') || clean.includes('फर्सी')) return 'pumpkin';
  if (clean.includes('sweet') || clean.includes('sakharkhand') || clean.includes('सखरखण्ड')) return 'sweet_potato';
  if (clean.includes('coriand') || clean.includes('dhaniya') || clean.includes('धनिया')) return 'coriander';
  if (clean.includes('paddy') || clean.includes('dhan') || clean.includes('धान')) return 'paddy';
  if (clean.includes('wheat') || clean.includes('gahu') || clean.includes('गहुँ')) return 'wheat';
  if (clean.includes('maize') || clean.includes('corn') || clean.includes('मकै')) return 'maize';
  if (clean.includes('mustard') || clean.includes('tori') || clean.includes('तोरी')) return 'mustard';
  if (clean.includes('apple') || clean.includes('syau') || clean.includes('स्याउ')) return 'apple';

  return 'unknown';
}

/**
 * Returns metadata for a given crop ID or string.
 */
export function getCropMetadata(cropInput?: string | null): CropMetadata | undefined {
  const normId = normalizeCropId(cropInput);
  return CROP_METADATA_LIST.find((c) => c.id === normId);
}
