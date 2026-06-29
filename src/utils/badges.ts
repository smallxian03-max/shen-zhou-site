import { DailyRecord, UserId, Badge } from "../types";

export const BADGES: Badge[] = [
  { name: "第一次打卡", condition: "完成第 1 次打卡", icon: "🌟" },
  { name: "连续三天", condition: "连续打卡 3 天", icon: "🔥" },
  { name: "一周小勇士", condition: "连续打卡 7 天", icon: "🏆" },
  { name: "有氧达人", condition: "有氧运动累计完成 10 次", icon: "🏃" },
  { name: "力量新星", condition: "无氧运动累计完成 10 次", icon: "💪" },
  { name: "时间管理小能手", condition: "累计记录运动计时 5 次", icon: "⏰" },
  { name: "稳定输出奖", condition: "单日累计运动时间超过 30 分钟", icon: "🎯" },
];

export function getEarnedBadges(records: DailyRecord[], userId: UserId): Badge[] {
  const earned: Badge[] = [];
  const userRecords = records.filter((r) => r.userId === userId);
  const totalCheckins = userRecords.filter((r) => r.completed).length;
  const totalAerobic = userRecords.reduce((sum, r) => sum + r.aerobic.length, 0);
  const totalStrength = userRecords.reduce((sum, r) => sum + r.strength.length, 0);
  const totalSessions = userRecords.reduce(
    (sum, r) => sum + r.workoutSessions.filter((s) => s.durationSeconds && s.durationSeconds > 0).length,
    0
  );

  let streak = 0;
  const today = new Date();
  let checkDate = new Date(today);
  const sorted = [...userRecords].sort((a, b) => b.date.localeCompare(a.date));
  for (const r of sorted) {
    if (r.completed) {
      const expected = formatDate(checkDate);
      if (r.date === expected) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  if (totalCheckins >= 1) earned.push(BADGES[0]);
  if (streak >= 3) earned.push(BADGES[1]);
  if (streak >= 7) earned.push(BADGES[2]);
  if (totalAerobic >= 10) earned.push(BADGES[3]);
  if (totalStrength >= 10) earned.push(BADGES[4]);
  if (totalSessions >= 5) earned.push(BADGES[5]);
  
  const hasLongSession = userRecords.some((r) =>
    r.workoutSessions.some((s) => (s.durationSeconds || 0) >= 1800)
  );
  if (hasLongSession) earned.push(BADGES[6]);

  return earned;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
