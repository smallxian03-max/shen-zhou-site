import { AppData, CurrentUser } from "../types";

const STORAGE_KEY = "shen-zhou-life-companion-app";

const defaultAppData: AppData = {
  currentUser: undefined,
  hasSelectedIdentity: false,
  anniversary: {
    togetherStartDate: "2026-05-31",
    birthdays: {
      shen: "12-03",
      zhou: "09-27",
    },
  },
  calendarEvents: [],
  memoItems: [],
  memoComments: [],
  messages: [],
  workoutUsers: [
    { id: "shen", name: "小沈", avatar: "☀️", streakDays: 0, totalCheckins: 0 },
    { id: "zhou", name: "小周", avatar: "🌙", streakDays: 0, totalCheckins: 0 },
  ],
  workoutRecords: [],
};

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as AppData;
      // Ensure workoutUsers exist
      if (!data.workoutUsers || data.workoutUsers.length === 0) {
        data.workoutUsers = defaultAppData.workoutUsers;
      }
      return data;
    }
  } catch (e) {
    console.warn("Failed to load data, using defaults", e);
  }
  return JSON.parse(JSON.stringify(defaultAppData));
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save data", e);
  }
}

export function resetAppData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getDefaultAppData(): AppData {
  return JSON.parse(JSON.stringify(defaultAppData));
}
