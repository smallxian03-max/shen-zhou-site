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
  { key: "anniversary", label: "纪念日", icon: <Heart size={20} /> },
  { key: "calendar", label: "日历", icon: <Calendar size={20} /> },
  { key: "memo", label: "备忘录", icon: <FileText size={20} /> },
  { key: "message", label: "留言板", icon: <MessageSquare size={20} /> },
  { key: "workout", label: "运动记录", icon: <Dumbbell size={20} /> },
];

export default function BottomTabs({ activeTab, onTabChange, currentUser, onSwitchIdentity }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-lg border-t border-amber-100">
      <div className="max-w-lg mx-auto">
        {/* Current identity bar */}
        <div className="flex items-center justify-between px-4 py-1.5 border-b border-amber-50">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">当前：</span>
            <span className={`text-xs font-medium ${currentUser === "shen" ? "text-pink-500" : "text-sky-500"}`}>
              {currentUser === "shen" ? "☀️ 小沈同学" : "🌙 小周同学"}
            </span>
          </div>
          <button
            onClick={onSwitchIdentity}
            className="flex items-center gap-1 text-xs text-amber-500 hover:text-amber-600 transition-colors"
          >
            <Repeat size={14} />
            切换身份
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex items-center justify-around px-2 py-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200
                  ${isActive
                    ? "text-amber-600 bg-amber-50 scale-105"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <div className={`transition-transform duration-200 ${isActive ? "scale-110" : ""}`}>
                  {tab.icon}
                </div>
                <span className="text-[10px] font-medium">{tab.label}</span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
