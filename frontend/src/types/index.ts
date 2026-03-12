export type Priority = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
export type SmartListType = 'today' | 'scheduled' | 'all' | 'flagged' | 'completed';
export type ListColor = 'red' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue' | 'purple' | 'pink' | 'brown' | 'gray' | 'indigo' | 'teal';
export type ListIcon = 'list' | 'bookmark' | 'pin' | 'gift' | 'birthday' | 'work' | 'school' | 'home' | 'shopping' | 'health' | 'travel' | 'finance';

export interface ReminderList {
  id: number;
  name: string;
  color: ListColor;
  icon: ListIcon;
  position: number;
  incompleteCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: number;
  listId: number;
  parentId: number | null;
  title: string;
  notes: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  dueDate: string | null;
  dueTime: string | null;
  priority: Priority;
  isFlagged: boolean;
  position: number;
  tags: Tag[];
  subtasks: Reminder[];
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface ReminderListRequest {
  name: string;
  color: ListColor;
  icon: ListIcon;
}

export interface ReminderRequest {
  listId: number;
  parentId?: number | null;
  title: string;
  notes?: string | null;
  dueDate?: string | null;
  dueTime?: string | null;
  priority?: Priority;
  isFlagged?: boolean;
  tagIds?: number[];
}

export interface SmartListCounts {
  today: number;
  scheduled: number;
  all: number;
  flagged: number;
  completed: number;
}
