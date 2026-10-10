import { playSmsChime } from '../utils/smsSound';

export interface IncomingSmsPayload {
  id: string;
  sender: string;
  phone: string;
  text: string;
  code?: string;
  timestamp: string;
  isLiveGateway?: boolean;
  carrier?: string;
}

type SmsListener = (sms: IncomingSmsPayload) => void;
const listeners = new Set<SmsListener>();

export const SmsNotifier = {
  subscribe(listener: SmsListener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  dispatch(payload: IncomingSmsPayload) {
    playSmsChime();
    listeners.forEach((fn) => fn(payload));
  },

  /**
   * Generates a device-native `sms:` URI to open the phone's native Messages app
   */
  getDeviceSmsUri(phone: string, text: string) {
    const cleanPhone = phone.replace(/\D/g, '');
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = isIOS ? '&' : '?';
    return `sms:${cleanPhone}${separator}body=${encodeURIComponent(text)}`;
  },

  /**
   * Generates a WhatsApp direct-to-chat web link
   */
  getWhatsAppUri(phone: string, text: string) {
    const cleanPhone = phone.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('977') ? cleanPhone : `977${cleanPhone}`;
    return `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(text)}`;
  },
};
