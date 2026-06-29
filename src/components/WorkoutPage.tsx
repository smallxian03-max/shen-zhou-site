import { useState, useEffect, useRef, useCallback } from "react";
import { AppData, CurrentUser, DailyRecord, WorkoutSession, UserId } from "../types";
import { AEROBIC_EXERCISES, STRENGTH_EXERCISES } from "../data/defaultExercises";
import { ENCOURAGEMENTS } from "../data/encouragements";
import { generateId, formatDuration, formatDurationMinutes } from "../utils/time";
import { getTodayString } from "../utils/date";
import { calculateStreak, getWeekProgress } from "../utils/streak";
import { getEarnedBadges } from "../utils/badges";
import { Play, Square, Check, Trophy, Flame, History, Sparkles } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

interface Props {
  appData: AppData;
  updateData: (data: AppData) => void;
  currentUser: CurrentUser;
}

export default function WorkoutPage({ appData, updateData, currentUser }: Props) {
  const todayStr = getTodayString();
  const [viewingUser, setViewingUser] = useState<UserId>(currentUser);
  const [showConfirmEdit, setShowConfirmEdit] = useState(false);
  const [pendingEditUserId, setPendingEditUserId] = useState<UserId | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationText, setCelebrationText] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isEditingOther = viewingUser !== currentUser;

  // Get today's record for the viewing user
  const getRecord = useCallback(
    (userId: UserId): DailyRecord | undefined =>
      appData.workoutRecords.find((r) => r.date === todayStr && r.userId === userId),
    [appData.workoutRecords, todayStr]
  );

  const myRecord = getRecord(viewingUser);
  const allRecords = appData.workoutRecords;
  const streak = calculateStreak(allRecords, viewingUser);
  const weekProgress = getWeekProgress(allRecords, viewingUser);
  const badges = getEarnedBadges(allRecords, viewingUser);
  const userInfo = appData.workoutUsers.find((u) => u.id === viewingUser);

  // Timer effect
  useEffect(() => {
    const record = getRecord(viewingUser);
    const activeSession = record?.workoutSessions?.find((s) => s.startTime && !s.endTime);
    if (activeSession) {
      const startTime = new Date(activeSession.startTime).getTime();
      const updateElapsed = () => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      };
      updateElapsed();
      timerRef.current = setInterval(updateElapsed, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [viewingUser, getRecord]);

  const getOrCreateRecord = (userId: UserId): DailyRecord => {
    let record = appData.workoutRecords.find((r) => r.date === todayStr && r.userId === userId);
    if (!record) {
      record = {
        date: todayStr,
        userId,
        aerobic: [],
        strength: [],
        completed: false,
        encouragement: "",
        workoutSessions: [],
      };
    }
    return record;
  };

  const saveRecord = (userId: UserId, record: DailyRecord) => {
    const others = appData.workoutRecords.filter(
      (r) => !(r.date === todayStr && r.userId === userId)
    );
    updateData({ ...appData, workoutRecords: [...others, record] });
  };

  const toggleAerobic = (exercise: string) => {
    if (isEditingOther) {
      setPendingEditUserId(viewingUser);
      setShowConfirmEdit(true);
      return;
    }
    const record = getOrCreateRecord(viewingUser);
    const aerobic = record.aerobic.includes(exercise)
      ? record.aerobic.filter((e) => e !== exercise)
      : [...record.aerobic, exercise];
    saveRecord(viewingUser, { ...record, aerobic });
  };

  const toggleStrength = (exercise: string) => {
    if (isEditingOther) {
      setPendingEditUserId(viewingUser);
      setShowConfirmEdit(true);
      return;
    }
    const record = getOrCreateRecord(viewingUser);
    const strength = record.strength.includes(exercise)
      ? record.strength.filter((e) => e !== exercise)
      : [...record.strength, exercise];
    saveRecord(viewingUser, { ...record, strength });
  };

  const handleStartWorkout = () => {
    if (isEditingOther) {
      setPendingEditUserId(viewingUser);
      setShowConfirmEdit(true);
      return;
    }
    const record = getOrCreateRecord(viewingUser);
    // Check if already has active session
    const hasActive = record.workoutSessions?.some((s) => s.startTime && !s.endTime);
    if (hasActive) return;
    const session: WorkoutSession = {
      id: generateId(),
      startTime: new Date().toISOString(),
    };
    saveRecord(viewingUser, {
      ...record,
      workoutSessions: [...(record.workoutSessions || []), session],
    });
  };

  const handleEndWorkout = () => {
    const record = getOrCreateRecord(viewingUser);
    const sessionIndex = record.workoutSessions?.findIndex((s) => s.startTime && !s.endTime);
    if (sessionIndex === undefined || sessionIndex < 0) return;
    const session = { ...record.workoutSessions[sessionIndex] };
    session.endTime = new Date().toISOString();
    session.durationSeconds = Math.floor(
      (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000
    );
    const sessions = [...record.workoutSessions];
    sessions[sessionIndex] = session;
    saveRecord(viewingUser, { ...record, workoutSessions: sessions });
  };

  const handleCompleteCheckin = () => {
    const record = getOrCreateRecord(viewingUser);
    // Check if there's an active session
    const hasActive = record.workoutSessions?.some((s) => s.startTime && !s.endTime);
    if (hasActive) return;
    
    const encouragement = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
    const completedRecord: DailyRecord = {
      ...record,
      completed: true,
      encouragement,
      completedAt: new Date().toISOString(),
    };
    
    // Update user streak
    const users = appData.workoutUsers.map((u) => {
      if (u.id === viewingUser) {
        const newStreak = calculateStreak(
          [...appData.workoutRecords.filter((r) => !(r.date === todayStr && r.userId === viewingUser)), completedRecord],
          viewingUser
        );
        return { ...u, streakDays: newStreak, totalCheckins: u.totalCheckins + 1 };
      }
      return u;
    });
    
    saveRecord(viewingUser, completedRecord);
    updateData({ ...appData, workoutUsers: users, workoutRecords: [...appData.workoutRecords.filter((r) => !(r.date === todayStr && r.userId === viewingUser)), completedRecord] });
    
    // Show celebration
    setCelebrationText(encouragement);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 4000);
  };

  const confirmEditOther = () => {
    setShowConfirmEdit(false);
    setPendingEditUserId(null);
  };

  // Get daily total duration
  const totalDuration = (myRecord?.workoutSessions || []).reduce(
    (sum, s) => sum + (s.durationSeconds || 0),
    0
  );
  const workoutCount = (myRecord?.workoutSessions || []).filter(
    (s) => s.durationSeconds && s.durationSeconds > 0
  ).length;

  // Status
  const getUserStatus = () => {
    const record = myRecord;
    if (record?.workoutSessions?.some((s) => s.startTime && !s.endTime)) return "运动中";
    if (record?.completed) return "今日已完成";
    if ((record?.aerobic?.length ?? 0) > 0 || (record?.strength?.length ?? 0) > 0 || totalDuration > 0)
      return "努力中";
    return "休息中";
  };

  const status = getUserStatus();
  const statusColors: Record<string, string> = {
    "休息中": "text-gray-400 bg-gray-100",
    "运动中": "text-green-600 bg-green-100",
    "努力中": "text-amber-600 bg-amber-100",
    "今日已完成": "text-purple-600 bg-purple-100",
  };

  // History records (latest first)
  const userAllRecords = allRecords
    .filter((r) => r.userId === viewingUser)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);

  return (
    <div className="space-y-4 animate-fade-in-up pb-4">
      {/* User selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewingUser("shen")}
          className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
            viewingUser === "shen"
              ? "bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-sm"
              : "bg-white/80 text-gray-500 hover:bg-pink-50"
          }`}
        >
          ☀️ 小沈
        </button>
        <button
          onClick={() => setViewingUser("zhou")}
          className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
            viewingUser === "zhou"
              ? "bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-sm"
              : "bg-white/80 text-gray-500 hover:bg-sky-50"
          }`}
        >
          🌙 小周
        </button>
      </div>

      {isEditingOther && (
        <div className="text-center text-xs text-amber-500 bg-amber-50 rounded-xl py-2">
          你正在查看 {viewingUser === "shen" ? "小沈" : "小周"} 的数据
        </div>
      )}

      {/* User status card */}
      <div className="card-strong">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{userInfo?.avatar || "🐶"}</span>
            <div>
              <h3 className="font-bold text-gray-800">{userInfo?.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Flame size={12} className="text-orange-400" />
                <span className="text-xs text-orange-400">连续 {streak} 天</span>
              </div>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || ""}`}>
            {status}
          </span>
        </div>

        {/* Today's stats */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">今日累计运动</p>
            <p className="text-lg font-bold text-amber-600">{formatDurationMinutes(totalDuration)}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">今日运动次数</p>
            <p className="text-lg font-bold text-amber-600">{workoutCount} 次</p>
          </div>
        </div>

        {/* Week progress */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>本周进度</span>
            <span>{weekProgress.completed} / {weekProgress.total} 天</span>
          </div>
          <div className="w-full h-2 bg-amber-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${(weekProgress.completed / weekProgress.total) * 100}%` }}
            />
          </div>
        </div>

        {/* Timer */}
        {status === "运动中" && (
          <div className="bg-green-50 rounded-xl p-4 text-center mb-3 animate-pulse">
            <p className="text-xs text-green-500 mb-1">正在运动中</p>
            <p className="text-3xl font-bold text-green-600 font-mono">{formatDuration(elapsed)}</p>
          </div>
        )}

        {/* Timer buttons */}
        <div className="flex gap-2">
          {status !== "运动中" ? (
            <button
              onClick={handleStartWorkout}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 
                ${myRecord?.completed ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "btn-primary"}`}
              disabled={myRecord?.completed}
            >
              <Play size={16} />
              开始运动
            </button>
          ) : (
            <button
              onClick={handleEndWorkout}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200"
            >
              <Square size={16} />
              结束运动
            </button>
          )}

          {status !== "今日已完成" && (
            <button
              onClick={handleCompleteCheckin}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${status === "运动中"
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-400 to-purple-500 text-white hover:from-purple-500 hover:to-purple-600"
                }`}
              disabled={status === "运动中"}
            >
              <Check size={16} />
              完成今日打卡
            </button>
          )}
        </div>
        {status === "运动中" && (
          <p className="text-xs text-red-400 text-center mt-2">
            你还有正在进行中的运动，请先点击"结束运动"再完成今日打卡。
          </p>
        )}
      </div>

      {/* Exercise checklists */}
      <div className="card-strong">
        <h4 className="text-sm font-bold text-amber-600 mb-3">🏃 有氧运动</h4>
        <div className="grid grid-cols-2 gap-2">
          {AEROBIC_EXERCISES.map((ex) => {
            const checked = myRecord?.aerobic?.includes(ex) || false;
            return (
              <label
                key={ex}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm cursor-pointer transition-all duration-200
                  ${checked ? "bg-green-100 text-green-700" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAerobic(ex)}
                  className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-400"
                />
                <span className={checked ? "line-through opacity-70" : ""}>{ex}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="card-strong">
        <h4 className="text-sm font-bold text-amber-600 mb-3">💪 无氧运动</h4>
        <div className="grid grid-cols-2 gap-2">
          {STRENGTH_EXERCISES.map((ex) => {
            const checked = myRecord?.strength?.includes(ex) || false;
            return (
              <label
                key={ex}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm cursor-pointer transition-all duration-200
                  ${checked ? "bg-green-100 text-green-700" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleStrength(ex)}
                  className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-400"
                />
                <span className={checked ? "line-through opacity-70" : ""}>{ex}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="card">
          <h4 className="text-sm font-bold text-amber-600 mb-3 flex items-center gap-1">
            <Trophy size={16} />
            成就徽章
          </h4>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <div
                key={badge.name}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-xs text-amber-700"
                title={badge.condition}
              >
                <span>{badge.icon}</span>
                <span>{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {userAllRecords.length > 0 && (
        <div className="card">
          <h4 className="text-sm font-bold text-amber-600 mb-3 flex items-center gap-1">
            <History size={16} />
            历史记录
          </h4>
          <div className="space-y-2">
            {userAllRecords.slice(0, 5).map((r) => (
              <div key={r.date} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-amber-50/50 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{r.date}</span>
                  {r.aerobic.length > 0 && (
                    <span className="text-green-600">
                      有氧：{r.aerobic.join("、")}
                    </span>
                  )}
                  {r.strength.length > 0 && (
                    <span className="text-purple-600">
                      无氧：{r.strength.join("、")}
                    </span>
                  )}
                  {r.workoutSessions.length > 0 && (
                    <span className="text-amber-600">
                      {formatDurationMinutes(
                        r.workoutSessions.reduce((s, sess) => s + (sess.durationSeconds || 0), 0)
                      )}
                    </span>
                  )}
                </div>
                <span className={`font-medium ${r.completed ? "text-green-500" : "text-gray-400"}`}>
                  {r.completed ? "✅" : "⬜"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="text-center animate-celebration">
            <div className="text-5xl mb-3">🎉</div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl px-6 py-4 max-w-xs mx-auto border border-amber-100">
              <div className="flex justify-center gap-2 text-2xl mb-2">
                <span>⭐</span>
                <span>🎉</span>
                <span>💪</span>
                <span>🎉</span>
                <span>⭐</span>
              </div>
              <p className="text-sm text-gray-600">{celebrationText}</p>
              <div className="flex justify-center gap-2 text-2xl mt-2">
                <span>🐶</span>
                <span>💕</span>
                <span>🐾</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit other user confirmation */}
      {showConfirmEdit && (
        <ConfirmDialog
          title="你正在修改对方的运动记录，确定继续吗？"
          message=""
          confirmText="确认修改"
          cancelText="取消"
          onConfirm={confirmEditOther}
          onCancel={() => { setShowConfirmEdit(false); setPendingEditUserId(null); }}
        />
      )}
    </div>
  );
}
