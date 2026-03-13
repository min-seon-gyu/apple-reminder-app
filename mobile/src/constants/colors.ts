import type { ListColor, SmartListType } from '../types';

export const LIST_COLORS: Record<ListColor, string> = {
  red: '#FF3B30',
  orange: '#FF9500',
  yellow: '#FFCC00',
  green: '#34C759',
  cyan: '#5AC8FA',
  blue: '#007AFF',
  purple: '#AF52DE',
  pink: '#FF2D55',
  brown: '#A2845E',
  gray: '#8E8E93',
  indigo: '#5856D6',
  teal: '#64D2A0',
};

export const SMART_LIST_COLORS: Record<SmartListType, string> = {
  today: '#007AFF',
  scheduled: '#FF3B30',
  all: '#8E8E93',
  flagged: '#FF9500',
  completed: '#8E8E93',
};

export const SMART_LIST_LABELS: Record<SmartListType, string> = {
  today: '오늘',
  scheduled: '예정',
  all: '전체',
  flagged: '플래그 지정됨',
  completed: '완료됨',
};

export const IOS_COLORS = {
  systemGroupedBackground: '#F2F2F7',
  secondarySystemGroupedBackground: '#FFFFFF',
  separator: '#C6C6C8',
  label: '#000000',
  secondaryLabel: '#3C3C43',
  tertiaryLabel: '#8E8E93',
  systemBlue: '#007AFF',
  destructiveRed: '#FF3B30',
};
