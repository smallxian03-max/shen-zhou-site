import { DailyRecord, UserId } from "../types";

export function calculateStreak(records: DailyRecord[], userId: UserId): number {
  const userRecords = records
    .filter((r) => r.userId === userId && r.completed)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (userRecords.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  let checkDate = new Date(today);

  for (let i = 0; i < 365; i++) {
    const dateStr = formatDateYYYYMMDD(checkDate);
    const record = userRecords.find((r) => r.date === dateStr);
    if (record) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function formatDateYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getWeekProgress(records: DailyRecord[], userId: UserId): { completed: number; total: number } {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  
  let completed = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = formatDateYYYYMMDD(d);
    const record = records.find((r) => r.userId === userId && r.date === dateStr);
    if (record?.completed) completed++;
  }
  
  return { completed, total: 7 };
}
