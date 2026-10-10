import { InAppMessage, InAppMessageType } from '../types/inAppMessage';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { AuthService } from './authService';

const STORAGE_KEY = 'krishisetu_inapp_messages_v2';
const NOTIF_ENABLED_KEY = 'krishisetu_notifications_enabled';

const INITIAL_MESSAGES: InAppMessage[] = [
  {
    id: 'msg-1',
    key: 'notif.kalimatiMorning',
    params: {
      tomatoPrice: '46',
      tomatoPct: '8',
      potatoPrice: '38',
      cauliPrice: '34',
    },
    titleEn: 'Kalimati Wholesale Price Bulletin (Morning Mandi Update)',
    titleNe: 'कालिमाटी दैनिक थोक मूल्य बुलेटिन (Morning Mandi Update)',
    bodyEn: 'Today in Kalimati: Tomato Rs 46/kg (+8%), Potato Rs 38/kg, and Cauliflower Rs 34/kg. Freight pooling from Chitwan is active.',
    bodyNe: 'आज कालिमाटीमा गोलभेडा रु ४६/केजी (+८%), आलु रु ३८/केजी र काउली रु ३४/केजी पुगेको छ। चितवनबाट काठमाडौँ ढुवानी पुलिङ सक्रिय छ।',
    type: 'price_bulletin',
    timestamp: 'Today 7:30 AM',
    timestampIso: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: false,
    priority: 'high',
    badge: 'Mandi Rate',
    badgeEn: 'Mandi Rate',
    badgeNe: 'बजार दर',
    actionLabelKey: 'notif.viewPrices',
    actionLabelEn: 'View Market Rates',
    actionLabelNe: 'बजार मूल्य हेर्नुहोस्',
    actionTab: 'prices',
  },
  {
    id: 'msg-2',
    key: 'notif.poolingTruck',
    params: {
      departureTime: '3:00 PM',
      location: 'Bharatpur',
      loadedKg: '2,400',
      savingsPerKg: '5',
    },
    titleEn: 'Prithvi Highway Freight Pool Dispatch (Active Match)',
    titleNe: 'पृथ्वी राजमार्ग ढुवानी पुलिङ म्याच (Freight Pool Active)',
    bodyEn: 'Chitwan-Kathmandu 5-ton mini-truck departs at 3:00 PM from Bharatpur. Currently 2,400 kg loaded. Add your crop to save Rs 5/kg freight.',
    bodyNe: 'चितवन-काठमाडौँ ५ टन मिनिट्रक ३:०० PM मा भरतपुरबाट प्रस्थान गर्दैछ। हाल २,४०० केजी लोड भइसकेको छ। रु ५/केजी भाडा बचतको लागि आफ्नो उत्पादन थप्नुहोस्।',
    type: 'pooling_match',
    timestamp: 'Today 8:15 AM',
    timestampIso: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    read: false,
    priority: 'high',
    badge: 'Truck Match',
    badgeEn: 'Truck Match',
    badgeNe: 'गाडी म्याच',
    actionLabelKey: 'notif.joinPool',
    actionLabelEn: 'Join Freight Pool',
    actionLabelNe: 'पुलिङमा जोडिनुहोस्',
    actionTab: 'sell',
  },
  {
    id: 'msg-3',
    key: 'notif.highwayAlert',
    params: {
      location: 'Tuin Khola',
    },
    titleEn: 'Road & Transit Clearance Alert (Highway Open)',
    titleNe: 'सडक तथा मौसम सतर्कता (Road Clearance Alert)',
    bodyEn: 'Narayangadh-Mugling highway at Tuin Khola is cleared for two-way traffic. Shipments will arrive on schedule.',
    bodyNe: 'नारायणगढ-मुग्लिन सडकखण्ड तुइनखोलामा पहिरो पन्छाएर दुईतर्फी सवारी सञ्चालनमा आएको छ। ढुवानी समयमा नै पुग्नेछ।',
    type: 'weather_alert',
    timestamp: 'Today 6:45 AM',
    timestampIso: new Date(Date.now() - 3600000 * 3).toISOString(),
    read: true,
    badge: 'Transit Open',
    badgeEn: 'Transit Open',
    badgeNe: 'सडक खुला',
    actionLabelKey: 'notif.checkRoad',
    actionLabelEn: 'Check Road Status',
    actionLabelNe: 'सडक स्थिति हेर्नुहोस्',
    actionTab: 'sell',
  },
];

type MessageListener = (messages: InAppMessage[]) => void;
type ToastListener = (message: InAppMessage) => void;

class InAppMessageServiceSingleton {
  private messages: InAppMessage[] = [];
  private listeners: Set<MessageListener> = new Set();
  private toastListeners: Set<ToastListener> = new Set();
  private notificationsEnabled: boolean = true;
  private isSupabaseSyncActive: boolean = false;

  constructor() {
    this.loadFromStorage();
    this.initSupabaseSync();
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined') {
        const enabledStored = localStorage.getItem(NOTIF_ENABLED_KEY);
        this.notificationsEnabled = enabledStored !== null ? enabledStored === 'true' : true;

        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.messages = JSON.parse(stored);
        } else {
          this.messages = [...INITIAL_MESSAGES];
          this.saveToStorage();
        }
      }
    } catch (e) {
      this.messages = [...INITIAL_MESSAGES];
    }
  }

  private saveToStorage() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.messages));
        localStorage.setItem(NOTIF_ENABLED_KEY, String(this.notificationsEnabled));
      }
    } catch (e) {}
  }

  private async initSupabaseSync() {
    if (!isSupabaseConfigured || !supabase || this.isSupabaseSyncActive) return;
    this.isSupabaseSyncActive = true;

    try {
      // 1. Initial Fetch from Postgres
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (!error && data && data.length > 0) {
        const remoteMsgs: InAppMessage[] = data.map((row: any) => {
          const rowData = row.data || {};
          return {
            id: String(row.id),
            key: rowData.key,
            params: rowData.params,
            title: rowData.title,
            titleEn: rowData.titleEn,
            titleNe: rowData.titleNe,
            body: rowData.body || rowData.messageText,
            bodyEn: rowData.bodyEn,
            bodyNe: rowData.bodyNe,
            type: (row.type_key?.replace('notification.', '') as InAppMessageType) || 'price_bulletin',
            timestamp: row.created_at ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
            timestampIso: row.created_at || new Date().toISOString(),
            read: Boolean(row.read),
            priority: rowData.priority || 'normal',
            badge: rowData.badge,
            badgeEn: rowData.badgeEn,
            badgeNe: rowData.badgeNe,
            code: rowData.code,
            actionLabel: rowData.actionLabel,
            actionLabelEn: rowData.actionLabelEn,
            actionLabelNe: rowData.actionLabelNe,
            actionTab: rowData.actionTab,
          };
        });

        // Merge remote messages with initial static announcements
        const merged = [...remoteMsgs];
        INITIAL_MESSAGES.forEach((initMsg) => {
          if (!merged.some((m) => m.id === initMsg.id)) {
            merged.push(initMsg);
          }
        });

        this.messages = merged;
        this.saveToStorage();
        this.notify();
      }

      // 2. Real-time PostgreSQL subscription
      supabase
        .channel('public:notifications')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications' },
          (payload: any) => {
            const newRow = payload.new;
            if (!newRow) return;
            const rowData = newRow.data || {};
            const incoming: InAppMessage = {
              id: String(newRow.id),
              key: rowData.key,
              params: rowData.params,
              title: rowData.title || 'New Mandi Alert',
              titleEn: rowData.titleEn,
              titleNe: rowData.titleNe,
              body: rowData.body || 'New agricultural update received',
              bodyEn: rowData.bodyEn,
              bodyNe: rowData.bodyNe,
              type: (newRow.type_key?.replace('notification.', '') as InAppMessageType) || 'price_bulletin',
              timestamp: 'Just now',
              timestampIso: newRow.created_at || new Date().toISOString(),
              read: Boolean(newRow.read),
              priority: rowData.priority || 'normal',
              badge: rowData.badge,
              code: rowData.code,
              actionLabel: rowData.actionLabel,
              actionTab: rowData.actionTab,
            };

            // Avoid duplicate additions
            if (!this.messages.some((m) => m.id === incoming.id)) {
              this.messages = [incoming, ...this.messages];
              this.saveToStorage();
              this.notify();

              if (this.notificationsEnabled) {
                this.toastListeners.forEach((t) => t(incoming));
              }
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'notifications' },
          (payload: any) => {
            const updatedRow = payload.new;
            if (!updatedRow) return;
            this.messages = this.messages.map((m) =>
              m.id === String(updatedRow.id) ? { ...m, read: Boolean(updatedRow.read) } : m
            );
            this.saveToStorage();
            this.notify();
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'notifications' },
          (payload: any) => {
            const oldRow = payload.old;
            if (!oldRow) return;
            this.messages = this.messages.filter((m) => m.id !== String(oldRow.id));
            this.saveToStorage();
            this.notify();
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Supabase notifications sync fallback to local store:', err);
    }
  }

  private notify() {
    const copy = [...this.messages];
    this.listeners.forEach((l) => l(copy));
  }

  public areNotificationsEnabled(): boolean {
    return this.notificationsEnabled;
  }

  public setNotificationsEnabled(enabled: boolean) {
    this.notificationsEnabled = enabled;
    this.saveToStorage();
  }

  public getMessages(): InAppMessage[] {
    return [...this.messages];
  }

  public getUnreadCount(): number {
    return this.messages.filter((m) => !m.read).length;
  }

  public subscribe(listener: MessageListener): () => void {
    this.listeners.add(listener);
    listener([...this.messages]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeToToast(listener: ToastListener): () => void {
    this.toastListeners.add(listener);
    return () => {
      this.toastListeners.delete(listener);
    };
  }

  public dispatchMessage(msg: Omit<InAppMessage, 'id' | 'timestamp' | 'read'> & { id?: string }): InAppMessage {
    const newMsg: InAppMessage = {
      ...msg,
      id: msg.id || `msg-${Date.now()}`,
      timestamp: 'Just now',
      timestampIso: new Date().toISOString(),
      read: false,
    };

    this.messages = [newMsg, ...this.messages];
    this.saveToStorage();
    this.notify();

    // Async write to Supabase Postgres if configured
    if (isSupabaseConfigured && supabase) {
      const currentUser = AuthService.getCurrentUser();
      (async () => {
        try {
          const { error } = await supabase
            .from('notifications')
            .insert({
              farmer_id: currentUser?.phone || 'guest_farmer',
              type_key: `notification.${newMsg.type}`,
              data: {
                key: newMsg.key,
                params: newMsg.params,
                title: newMsg.title,
                titleEn: newMsg.titleEn,
                titleNe: newMsg.titleNe,
                body: newMsg.body,
                bodyEn: newMsg.bodyEn,
                bodyNe: newMsg.bodyNe,
                priority: newMsg.priority,
                badge: newMsg.badge,
                badgeEn: newMsg.badgeEn,
                badgeNe: newMsg.badgeNe,
                code: newMsg.code,
                actionLabel: newMsg.actionLabel,
                actionTab: newMsg.actionTab,
                targetDistrict: newMsg.targetDistrict,
                createdAt: new Date().toISOString(),
              },
              read: false,
            });
          if (error) console.warn('Failed to persist notification to Supabase:', error.message);
        } catch (err) {
          console.warn('Supabase insert notification error:', err);
        }
      })();
    }

    // Trigger toast if enabled
    if (this.notificationsEnabled) {
      this.toastListeners.forEach((t) => t(newMsg));
    }

    return newMsg;
  }

  public markAsRead(id: string) {
    this.messages = this.messages.map((m) => (m.id === id ? { ...m, read: true } : m));
    this.saveToStorage();
    this.notify();

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from('notifications').update({ read: true }).eq('id', id);
        } catch (e) {}
      })();
    }
  }

  public markAllAsRead() {
    this.messages = this.messages.map((m) => ({ ...m, read: true }));
    this.saveToStorage();
    this.notify();

    if (isSupabaseConfigured && supabase) {
      const currentUser = AuthService.getCurrentUser();
      (async () => {
        try {
          await supabase
            .from('notifications')
            .update({ read: true })
            .eq('farmer_id', currentUser?.phone || 'guest_farmer');
        } catch (e) {}
      })();
    }
  }

  public deleteMessage(id: string) {
    this.messages = this.messages.filter((m) => m.id !== id);
    this.saveToStorage();
    this.notify();

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from('notifications').delete().eq('id', id);
        } catch (e) {}
      })();
    }
  }

  public clearAllMessages() {
    this.messages = [];
    this.saveToStorage();
    this.notify();
  }

  public resetToDefault() {
    this.messages = [...INITIAL_MESSAGES];
    this.notificationsEnabled = true;
    this.saveToStorage();
    this.notify();
  }

  public sendVerificationCode(code: string, phone: string) {
    return this.dispatchMessage({
      key: 'notif.securityOtp',
      params: { code },
      titleEn: 'KrishiSetu In-App Security Verification Code',
      titleNe: 'कृषिसेतु एप प्रमाणीकरण कोड (In-App Security Code)',
      bodyEn: `Your 6-digit security code is: [ ${code} ]. Do not share this code with anyone. Valid for 5 minutes.`,
      bodyNe: `तपाईँको ६-अङ्के सुरक्षा कोड: [ ${code} ] हो। यो कोड कसैसँग सेयर नगर्नुहोस्। कोड ५ मिनेटसम्म मान्य रहनेछ।`,
      type: 'system_verification',
      priority: 'high',
      badgeEn: 'Security Code',
      badgeNe: 'सुरक्षा कोड',
      code,
    });
  }

  public generateInAppVerificationCode(phoneNumber: string): string {
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.sendVerificationCode(randomCode, phoneNumber);
    return randomCode;
  }

  public generatePriceBulletin(district: string, cropSummaries: string) {
    return this.dispatchMessage({
      key: 'notif.priceBulletin',
      params: {
        district,
        cropSummaries,
      },
      titleEn: `${district} Agri Market Rate Bulletin`,
      titleNe: `${district} कृषि बजार ताजा मूल्य बुलेटिन`,
      bodyEn: `Today's wholesale rates: ${cropSummaries}. Kalimati and local mandi arbitrage analysis is available.`,
      bodyNe: `आजको थोक बजार दर: ${cropSummaries}। कालिमाटी र स्थानीय मन्डीबीचको मध्यस्थता विश्लेषण उपलब्ध छ।`,
      type: 'price_bulletin',
      priority: 'high',
      badgeEn: 'Mandi Rates',
      badgeNe: 'बजार दर',
      actionLabelKey: 'notif.viewPrices',
      actionLabelEn: 'View Market Rates',
      actionLabelNe: 'बजार मूल्य हेर्नुहोस्',
      actionTab: 'prices',
      targetDistrict: district,
    });
  }
}

export const InAppMessageService = new InAppMessageServiceSingleton();

