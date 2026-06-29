export type CurrentUser = "shen" | "zhou";

export type UserId = CurrentUser;

export interface User {
  id: UserId;
  name: string;
  avatar: string;
  streakDays: number;
  totalCheckins: number;
}

export interface AnniversaryData {
  togetherStartDate: string;
  birthdays: {
    shen: string;
    zhou: string;
  };
}

export type CalendarEventType = "吃饭" | "约会" | "看电影" | "旅行" | "运动" | "演唱会" | "自定义";

export interface CalendarEvent {
  id: string;
  date: string;
  type: CalendarEventType;
  customTitle?: string;
  note?: string;
  createdBy: CurrentUser;
  createdAt: string;
}

export type MemoCategory = "共同" | "小沈" | "小周";

export interface MemoItem {
  id: string;
  category: MemoCategory;
  title: string;
  content: string;
  imageUrl?: string;
  createdBy: CurrentUser;
  createdAt: string;
  completed: boolean;
}

export interface MemoComment {
  id: string;
  memoId: string;
  content: string;
  createdBy: CurrentUser;
  createdAt: string;
}

export interface Message {
  id: string;
  type: "text" | "image";
  content?: string;
  imageUrl?: string;
  createdBy: CurrentUser;
  createdAt: string;
}

export interface WorkoutSession {
  id: string;
  startTime: string;
  endTime?: string;
  durationSeconds?: number;
}

export interface DailyRecord {
  date: string;
  userId: UserId;
  aerobic: string[];
  strength: string[];
  completed: boolean;
  encouragement: string;
  completedAt?: string;
  workoutSessions: WorkoutSession[];
}

export interface Badge {
  name: string;
  condition: string;
  icon: string;
}

export interface AppData {
  currentUser?: CurrentUser;
  hasSelectedIdentity: boolean;
  anniversary: AnniversaryData;
  calendarEvents: CalendarEvent[];
  memoItems: MemoItem[];
  memoComments: MemoComment[];
  messages: Message[];
  workoutUsers: User[];
  workoutRecords: DailyRecord[];
}
