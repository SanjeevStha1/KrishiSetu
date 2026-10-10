import { InAppMessage } from '../types/inAppMessage';
import { Language } from '../i18n/translations';

export interface LocalizedNotificationContent {
  title: string;
  body: string;
  badge?: string;
  actionLabel?: string;
  timestamp: string;
}

export function getLocalizedNotification(
  msg: InAppMessage,
  language: Language,
  t: (key: string, fallback?: string, params?: Record<string, string | number>) => string
): LocalizedNotificationContent {
  let title = '';
  let body = '';
  let badge = '';
  let actionLabel = '';

  // 1. Resolve Title
  if (msg.key) {
    title = t(`${msg.key}.title`, language === 'ne' ? msg.titleNe : msg.titleEn, msg.params);
  } else if (language === 'ne' && msg.titleNe) {
    title = msg.titleNe;
  } else if (language === 'en' && msg.titleEn) {
    title = msg.titleEn;
  } else {
    title = msg.title || msg.titleEn || msg.titleNe || '';
  }

  // 2. Resolve Body
  if (msg.key) {
    body = t(`${msg.key}.body`, language === 'ne' ? msg.bodyNe : msg.bodyEn, msg.params);
  } else if (language === 'ne' && msg.bodyNe) {
    body = msg.bodyNe;
  } else if (language === 'en' && msg.bodyEn) {
    body = msg.bodyEn;
  } else {
    body = msg.body || msg.bodyEn || msg.bodyNe || '';
  }

  // 3. Resolve Badge
  if (language === 'ne' && msg.badgeNe) {
    badge = msg.badgeNe;
  } else if (language === 'en' && msg.badgeEn) {
    badge = msg.badgeEn;
  } else {
    badge = msg.badge || msg.badgeEn || msg.badgeNe || '';
  }

  // 4. Resolve Action Label
  if (msg.actionLabelKey) {
    actionLabel = t(msg.actionLabelKey, language === 'ne' ? msg.actionLabelNe : msg.actionLabelEn);
  } else if (language === 'ne' && msg.actionLabelNe) {
    actionLabel = msg.actionLabelNe;
  } else if (language === 'en' && msg.actionLabelEn) {
    actionLabel = msg.actionLabelEn;
  } else {
    actionLabel = msg.actionLabel || '';
  }

  // 5. Localize Timestamp
  let timestamp = msg.timestamp;
  if (msg.timestamp.includes('Just now')) {
    timestamp = t('notif.justNow', 'Just now');
  } else if (msg.timestamp.includes('7:30 AM')) {
    timestamp = t('notif.todayMorning', 'Today 7:30 AM');
  } else if (msg.timestamp.includes('8:15 AM')) {
    timestamp = t('notif.todayMidMorning', 'Today 8:15 AM');
  } else if (msg.timestamp.includes('6:45 AM')) {
    timestamp = t('notif.todayEarly', 'Today 6:45 AM');
  }

  return {
    title,
    body,
    badge,
    actionLabel,
    timestamp,
  };
}
