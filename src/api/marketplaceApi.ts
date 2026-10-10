import { apiRequest } from './apiClient';
import { MarketplaceListing } from '../../shared/types/krishi';

export const marketplaceApi = {
  async getListings(crop?: string, district?: string) {
    const params = new URLSearchParams();
    if (crop) params.set('crop', crop);
    if (district) params.set('district', district);
    return apiRequest<{ success: boolean; count: number; listings: MarketplaceListing[] }>(`/api/marketplace/listings?${params.toString()}`, {
      method: 'GET',
    });
  },

  async createListing(listing: {
    crop: string;
    cropName?: string;
    quantityKg: number;
    pricePerKg: number;
    qualityGrade?: 'Grade A' | 'Grade B' | 'Export';
    isOrganic?: boolean;
    allowPooling?: boolean;
    location?: string;
  }) {
    return apiRequest<{ success: boolean; listing: MarketplaceListing; listings: MarketplaceListing[] }>('/api/marketplace/listings', {
      method: 'POST',
      body: JSON.stringify(listing),
    });
  },
};
