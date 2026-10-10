export type InAppMessageType =
  | 'price_bulletin'
  | 'pooling_match'
  | 'weather_alert'
  | 'system_verification'
  | 'farmer_direct';

export interface InAppMessage {
  id: string;
  key?: string;
  params?: Record<string, string | number>;
  title?: string;
  titleEn?: string;
  titleNe?: string;
  body?: string;
  bodyEn?: string;
  bodyNe?: string;
  type: InAppMessageType;
  timestamp: string;
  timestampIso?: string;
  read: boolean;
  priority?: 'high' | 'normal';
  badge?: string;
  badgeEn?: string;
  badgeNe?: string;
  code?: string;
  targetDistrict?: string;
  actionLabelKey?: string;
  actionLabel?: string;
  actionLabelEn?: string;
  actionLabelNe?: string;
  actionTab?: 'prices' | 'sell' | 'calculator' | 'home' | 'decision' | 'analytics' | 'records' | 'marketplace' | 'market';
}
