import { useState } from "react";
import { AppData, CalendarEvent, CalendarEventType } from "../types";
import { getToday, getMonthDays, getFirstDayOfMonth, formatDisplayMonth, formatShortDate } from "../utils/date";
import { getEventCountdown } from "../utils/countdown";
import { generateId } from "../utils/time";
import { X, Plus } from "lucide-react";

const EVENT_TYPES: CalendarEventType[] = ["吃饭", "约会", "看电影", "旅行", "运动", "演唱会", "自定义"];

interface Props {
  appData: AppData;
  updateData: (data: AppData) => void;
}

export default function CalendarPage({ appData, updateData }: Props) {
  const today = getToday();
  const [viewYear, setViewYear] = useState(today.year);
  const [viewMonth, setViewMonth] = useState(today.month);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [eventType, setEventType] = useState<CalendarEventType>("吃饭");
  const [customTitle, setCustomTitle] = useState("");
  const [note, setNote] = useState("");

  const daysInMonth = getMonthDays(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const events = appData.calendarEvents;
  const currentUser = appData.currentUser!;

  // Get events for a specific date
  const getEventsForDate = (dateStr: string) =>
    events.filter((e) => e.date === dateStr);

  // Check if a date has events
  const hasEvents = (dateStr: string) => getEventsForDate(dateStr).length > 0;

  // Get event emoji
  const getEventEmoji = (type: CalendarEventType) => {
    const map: Record<CalendarEventType, string> = {
      "吃饭": "🍽️",
      "约会": "💑",
      "看电影": "🎬",
      "旅行": "✈️",
      "运动": "🏃",
      "演唱会": "🎤",
      "自定义": "📌",
    };
    return map[type] || "📌";
  };

  // Future events countdown
  const todayStr = `${today.year}-${String(today.month).padStart(2, "0")}-${String(today.day).padStart(2, "0")}`;
  const futureEvents = events
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewYear(viewYear - 1);
      setViewMonth(12);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear(viewYear + 1);
      setViewMonth(1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setEventType("吃饭");
    setCustomTitle("");
    setNote("");
    setShowModal(true);
  };

  const handleAddEvent = () => {
    const newEvent: CalendarEvent = {
      id: generateId(),
      date: selectedDate,
      type: eventType,
      customTitle: eventType === "自定义" && customTitle ? customTitle : undefined,
      note: note || undefined,
      createdBy: currentUser,
      createdAt: new Date().toISOString(),
    };
    updateData({ ...appData, calendarEvents: [...events, newEvent] });
    setShowModal(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    updateData({ ...appData, calendarEvents: events.filter((e) => e.id !== eventId) });
  };

  const eventTypeLabel = (e: CalendarEvent) =>
    e.type === "自定义" && e.customTitle ? e.customTitle : e.type;

  const eventCreatorName = (e: CalendarEvent) =>
    e.createdBy === "shen" ? "小沈" : "小周";

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Countdown list */}
      {futureEvents.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-bold text-amber-600 mb-3">📅 即将到来的活动</h3>
          <div className="space-y-2">
            {futureEvents.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-amber-50/50 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span>{getEventEmoji(e.type)}</span>
                  <span className="text-gray-700">{eventTypeLabel(e)}</span>
                  <span className="text-xs text-gray-400">
                    {formatShortDate(e.date)}
                  </span>
                </div>
                <span className="font-medium text-amber-600">
                  还剩 {getEventCountdown(e.date)} 天
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar header */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={handlePrevMonth} className="btn-secondary !px-3 !py-1.5">‹</button>
        <h2 className="text-lg font-bold text-amber-700" style={{ fontFamily: "'ZCOOL KuaiLe', cursive" }}>
          {formatDisplayMonth(viewYear, viewMonth)}
        </h2>
        <button onClick={handleNextMonth} className="btn-secondary !px-3 !py-1.5">›</button>
      </div>

      {/* Calendar grid */}
      <div className="card p-3">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
            <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${viewYear}-${String(viewMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isToday = dateStr === todayStr;
            const dayEvents = getEventsForDate(dateStr);
            const isFuture = dateStr >= todayStr;

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`
                  relative flex flex-col items-center justify-center py-2 rounded-xl text-sm transition-all duration-200
                  ${isToday ? "bg-amber-200 font-bold text-amber-800" : "hover:bg-amber-50 text-gray-600"}
                  ${isFuture ? "cursor-pointer" : "cursor-default opacity-60"}
                `}
              >
                <span>{day}</span>
                {hasEvents(dateStr) && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 2).map((e) => (
                      <span key={e.id} className="text-[8px]">{getEventEmoji(e.type)}</span>
                    ))}
                    {dayEvents.length > 2 && <span className="text-[8px] text-gray-400">+</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events on selected date */}
      {selectedDate && (
        <div className="card">
          <h3 className="text-sm font-bold text-amber-600 mb-2">
            {formatShortDate(selectedDate)} 的活动
          </h3>
          {getEventsForDate(selectedDate).length === 0 ? (
            <p className="text-xs text-gray-400">暂无活动安排</p>
          ) : (
            <div className="space-y-2">
              {getEventsForDate(selectedDate).map((e) => (
                <div key={e.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-amber-50/50">
                  <div className="flex items-center gap-2">
                    <span>{getEventEmoji(e.type)}</span>
                    <span className="text-sm text-gray-700">{eventTypeLabel(e)}</span>
                    {e.note && <span className="text-xs text-gray-400">- {e.note}</span>}
                    <span className="text-[10px] text-gray-400">({eventCreatorName(e)})</span>
                  </div>
                  <button
                    onClick={() => handleDeleteEvent(e.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add event button */}
      <div className="flex justify-center">
        <button onClick={() => handleDateClick(today.day)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          添加活动
        </button>
      </div>

      {/* Event modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full animate-pop border border-amber-100 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">添加活动</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1.5">日期</label>
              <p className="text-sm font-medium text-amber-700">{formatShortDate(selectedDate)}</p>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-2">活动类型</label>
              <div className="flex flex-wrap gap-2">
                {EVENT_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setEventType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-200
                      ${eventType === type
                        ? "bg-amber-200 text-amber-800 font-medium shadow-sm"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                  >
                    {getEventEmoji(type)} {type}
                  </button>
                ))}
              </div>
            </div>

            {eventType === "自定义" && (
              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-1.5">活动名称</label>
                <input
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="请输入活动名称"
                  className="input-field"
                />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-xs text-gray-500 mb-1.5">备注（可选）</label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="添加备注..."
                className="input-field"
              />
            </div>

            <button onClick={handleAddEvent} className="btn-primary w-full">
              添加活动
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
