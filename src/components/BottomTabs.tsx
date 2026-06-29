import { TabType } from "../App";
import { CurrentUser } from "../types";
import { Heart, Calendar, FileText, MessageSquare, Dumbbell, Repeat } from "lucide-react";

interface Props {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  currentUser: CurrentUser;
  onSwitchIdentity: () => void;
}

const TABS: { key: TabType; label: string; icon: React.ReactNode }[] = [
  { key: "anniversary", label: "纪念日", icon: <Heart size={22} /> },
  { key: "calendar", label: "日历", icon: <Calendar size={22} /> },
  { key: "memo", label: "备忘录", icon: <FileText size={22} /> },
  { key: "message", label: "留言板", icon: <MessageSquare size={22} /> },
  { key: "workout", label: "运动记录", icon: <Dumbbell size={22} /> },
];

export default function BottomTabs({ activeTab, onTabChange, currentUser, onSwitchIdentity }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-amber-100 safe-bottom">
      <div className="max-w-lg mx-auto">
        {/* 当前身份栏 */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-amber-50">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">当前：</span>
            <span className={`text-sm font-medium ${currentUser === "shen" ? "text-pink-500" : "text-sky-500"}`}>
              {currentUser === "shen" ? "☀️ 小沈同学" : "🌙 小周同学"}
            </span>
          </div>
          <button
            onClick={onSwitchIdentity}
            className="flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
          >
            <Repeat size={16} />
            切换
          </button>
        </div>

        {/* Tab 栏 - 加大触摸区域 */}
        <div className="flex items-center justify-around px-1 py-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`flex flex-col items-center gap-0.5 py-2 px-4 rounded-xl transition-all duration-200 min-w-0
                  ${isActive
                    ? "text-amber-600 bg-amber-50 scale-105"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <div className={`transition-transform duration-200 ${isActive ? "scale-110" : ""}`}>
                  {tab.icon}
                </div>
                <span className="text-[11px] font-medium">{tab.label}</span>
                {isActive && <div className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}