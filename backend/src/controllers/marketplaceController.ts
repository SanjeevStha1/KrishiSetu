import { Request, Response } from 'express';
import { MarketplaceListing } from '../../../shared/types/krishi';
import { getBearerToken } from '../middleware/authMiddleware';
import { authStore } from '../services/authStore';

const SEEDED_LISTINGS: MarketplaceListing[] = [
  {
    id: 'mkt-1',
    cropId: 'tomato',
    crop: 'tomato',
    cropName: 'Tomato (Local)',
    nepaliName: 'गोलभेडा',
    emoji: '🍅',
    farmerId: 'usr_ram_chitwan_001',
    farmerName: 'Ram Bahadur Thapa',
    farmerPhone: '+977 9845012345',
    village: 'Gitanagar Chowk',
    municipality: 'Bharatpur-11',
    district: 'chitwan',
    location: 'Bharatpur-11, Chitwan',
    quantityKg: 850,
    availableKg: 850,
    pricePerKg: 38,
    askingPricePerKg: 38,
    marketWholesalePrice: 42,
    harvestWindow: 'Ready in 3 Days',
    readyStatus: 'ready_now',
    qualityGrade: 'Grade A',
    isOrganic: true,
    verified: true,
    rating: 4.9,
    reviewsCount: 14,
    pickupHub: 'Bharatpur Highway Hub',
    description: 'Crisp, greenhouse-protected local tomatoes. Picked fresh at dawn; uniform color and high shelf-life.',
    status: 'active',
    allowPooling: true,
    bidsCount: 3,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'mkt-2',
    cropId: 'cauliflower',
    crop: 'cauliflower',
    cropName: 'Cauliflower (Snowball)',
    nepaliName: 'काउली',
    emoji: '🥦',
    farmerId: 'usr_sita_kavre_002',
    farmerName: 'Sita Devi Adhikari',
    farmerPhone: '+977 9801234567',
    village: 'Rampur Tole',
    municipality: 'Benighat-3',
    district: 'dhading',
    location: 'Benighat-3, Dhading',
    quantityKg: 1200,
    availableKg: 1200,
    pricePerKg: 22,
    askingPricePerKg: 22,
    marketWholesalePrice: 24,
    harvestWindow: 'Harvesting Today & Tomorrow',
    readyStatus: 'ready_now',
    qualityGrade: 'Organic Certified',
    isOrganic: true,
    verified: true,
    rating: 5.0,
    reviewsCount: 22,
    pickupHub: 'Malekhu Bridge Checkpoint',
    description: 'Completely pesticide-free white heads. Ideal for bulk vegetable retailers and Kathmandu restaurant orders.',
    status: 'active',
    allowPooling: true,
    bidsCount: 5,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'mkt-3',
    cropId: 'potato',
    crop: 'potato',
    cropName: 'Potato (Red Cardinal)',
    nepaliName: 'रातो आलु',
    emoji: '🥔',
    farmerId: 'usr_bikram_kavre_003',
    farmerName: 'Bikram Shrestha',
    farmerPhone: '+977 9812345678',
    village: 'Panchkhal Bazar',
    municipality: 'Panauti-4',
    district: 'kavre',
    location: 'Panauti-4, Kavre',
    quantityKg: 2500,
    availableKg: 2500,
    pricePerKg: 29,
    askingPricePerKg: 29,
    marketWholesalePrice: 32,
    harvestWindow: 'Ready in 7 Days',
    readyStatus: 'ready_this_month',
    qualityGrade: 'Grade A',
    isOrganic: false,
    verified: true,
    rating: 4.8,
    reviewsCount: 9,
    pickupHub: 'Araniko Highway Km 42',
    description: 'Dry-stored red potatoes with excellent curing. Graded above 45mm diameter.',
    status: 'active',
    allowPooling: true,
    bidsCount: 2,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'mkt-4',
    cropId: 'cabbage',
    crop: 'cabbage',
    cropName: 'Cabbage (Green Express)',
    nepaliName: 'बन्दा',
    emoji: '🥬',
    farmerId: 'usr_krishna_dhading_004',
    farmerName: 'Krishna Maya Tamang',
    farmerPhone: '+977 9860112233',
    village: 'Malekhu Riverside',
    municipality: 'Benighat-3',
    district: 'dhading',
    location: 'Benighat Rorang, Dhading',
    quantityKg: 1400,
    availableKg: 1400,
    pricePerKg: 23,
    askingPricePerKg: 23,
    marketWholesalePrice: 26,
    harvestWindow: 'Ready in 5 Days',
    readyStatus: 'ready_now',
    qualityGrade: 'Grade B',
    isOrganic: false,
    verified: true,
    rating: 4.7,
    reviewsCount: 11,
    pickupHub: 'Malekhu Bridge Checkpoint',
    description: 'Dense, tight heads grown along Trishuli fertile alluvial terraces. Fast road access to KTM.',
    status: 'active',
    allowPooling: true,
    bidsCount: 1,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

let dynamicListings: MarketplaceListing[] = [...SEEDED_LISTINGS];

export class MarketplaceController {
  public static getListings(req: Request, res: Response) {
    const crop = (req.query.crop as string) || (req.query.cropId as string);
    const district = req.query.district as string;

    let results = dynamicListings;
    if (crop && crop !== 'all') {
      results = results.filter((l) => (l.cropId || l.crop).toLowerCase() === crop.toLowerCase());
    }
    if (district && district !== 'all') {
      results = results.filter((l) => l.district.toLowerCase() === district.toLowerCase());
    }

    return res.json({ success: true, count: results.length, listings: results });
  }

  public static createListing(req: Request, res: Response) {
    try {
      const token = getBearerToken(req);
      let userId = 'usr_guest';
      let userName = 'Nepali Kisan';
      let userPhone = '+977 98XXXXXXXX';
      let userDistrict = 'chitwan';

      if (token) {
        const session = authStore.validateSession(token);
        if (session.isValid && session.user) {
          userId = session.user.id;
          userName = session.user.name || 'Farmer';
          userPhone = session.user.phone || '';
          userDistrict = session.user.district || 'chitwan';
        }
      }

      const body = req.body;
      const cropId = (body.cropId || body.crop || 'tomato').toLowerCase();
      const cropName = body.cropName || body.nepaliName || cropId.toUpperCase();
      const nepaliName = body.nepaliName || cropName;
      const emoji = body.emoji || '🌾';
      const quantityKg = Number(body.quantityKg) || 100;
      const pricePerKg = Number(body.askingPricePerKg || body.pricePerKg) || 30;
      const askingPricePerKg = pricePerKg;
      const farmerName = body.farmerName || userName;
      const farmerPhone = body.farmerPhone || userPhone;
      const farmerId = body.farmerId || userId;
      const district = (body.district || userDistrict).toLowerCase();
      const village = body.village || body.location || `${district.toUpperCase()} Center`;
      const municipality = body.municipality || `${district.toUpperCase()} Ward 1`;
      const pickupHub = body.pickupHub || village;
      const qualityGrade = body.qualityGrade || 'Grade A';
      const isOrganic = Boolean(body.isOrganic);
      const harvestWindow = body.harvestWindow || 'Ready Now';
      const description = body.description || `${quantityKg} kg fresh ${cropName} harvested in ${district.toUpperCase()}. Ready for wholesale pickup.`;

      const newListing: MarketplaceListing = {
        id: `list_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        cropId,
        crop: cropId,
        cropName,
        nepaliName,
        emoji,
        farmerId,
        farmerName,
        farmerPhone,
        village,
        municipality,
        district,
        location: `${village}, ${district.toUpperCase()}`,
        quantityKg,
        availableKg: quantityKg,
        pricePerKg,
        askingPricePerKg,
        marketWholesalePrice: Math.round(pricePerKg * 1.06),
        harvestWindow,
        readyStatus: 'ready_now',
        qualityGrade,
        isOrganic,
        verified: true,
        rating: 5.0,
        reviewsCount: 1,
        pickupHub,
        description,
        status: 'active',
        allowPooling: body.allowPooling !== undefined ? Boolean(body.allowPooling) : true,
        bidsCount: 0,
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      // Add to front of listings so other users see it immediately
      dynamicListings.unshift(newListing);

      console.log(`[Marketplace] New listing published by ${farmerName} (${district}): ${quantityKg}kg ${cropName}`);

      return res.json({
        success: true,
        listing: newListing,
        listings: dynamicListings,
      });
    } catch (err: any) {
      console.error('Error creating marketplace listing:', err);
      return res.status(500).json({ success: false, error: 'Failed to create marketplace listing' });
    }
  }
}
