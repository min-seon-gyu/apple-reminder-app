import type { ListIcon, SmartListType } from '../types';

export const LIST_ICONS: Record<ListIcon, string> = {
  list: 'list-outline',
  bookmark: 'bookmark-outline',
  pin: 'pin-outline',
  gift: 'gift-outline',
  birthday: 'happy-outline',
  work: 'briefcase-outline',
  school: 'school-outline',
  home: 'home-outline',
  shopping: 'cart-outline',
  health: 'heart-outline',
  travel: 'airplane-outline',
  finance: 'card-outline',
};

export const SMART_LIST_ICONS: Record<SmartListType, string> = {
  today: 'calendar-number-outline',
  scheduled: 'calendar-outline',
  all: 'file-tray-full-outline',
  flagged: 'flag',
  completed: 'checkmark-circle',
};
