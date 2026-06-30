import { useState, useEffect, useCallback, useRef } from "react";
import { AppData, CurrentUser } from "./types";
import { loadAppData } from "./utils/storage";
import { syncLoad, syncSave, subscribeToChanges, unsubscribeFromChanges, isSupabaseConfigured } from "./utils/supabase";
import { getTodayString } from "./utils/date";
import { getDaysBetween } from "./utils/date";
import HeroHome from "./components/HeroHome";
import BottomTabs from "./components/BottomTabs";
import AnniversaryPage from "./components/AnniversaryPage";
import CalendarPage from "./components/CalendarPage";
import MemoPage from "./components/MemoPage";
import MessageBoardPage from "./components/MessageBoardPage";
import WorkoutPage from "./components/WorkoutPage";
import FloatingEmoji from "./components/FloatingEmoji";
import ConfirmDialog from "./components/ConfirmDialog";

export type TabType = "anniversary" | "calendar" | "memo" | "message" | "workout";

const STORAGE_KEY = "shen-zhou-app-saved-at";

function App() {
  const [appData, setAppData] = useState<AppData>(() => loadAppData());
  const [activeTab, setActiveTab] = useState<TabType>("anniversary");
  const [showConfirm, setShowConfirm] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [nextTab, setNextTab] = useState<TabType | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const supabaseReady = isSupabaseConfigured();
  

  const togetherDays = getDaysBetween(appData.anniversary.togetherStartDate, getTodayString());

    useEffect(() => {
    async function initApp() {
      if (supabaseReady) {
        setSyncing(true);
        try {
          const remoteData = await syncLoad();
          setAppData(remoteData);
        } catch (e) {}
        setSyncing(false);
        subscribeToChanges((newData) => {
          setAppData(newData);
        });
      }
      setInitialLoading(false);
    }
    initApp();
    return () => { unsubscribeFromChanges(); };
  }, []);
  const persistData = useCallback((newData: AppData) => {
    syncSave(newData);
    const now = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, now);
  }, []);

  const handleSelectIdentity = useCallback(
    (user: CurrentUser) => {
      const newData = { ...appData, currentUser: user, hasSelectedIdentity: true };
      setAppData(newData);
      persistData(newData);
    },
    [appData, persistData]
  );

  const handleSwitchIdentity = useCallback(() => {
    if (!appData.currentUser) return;
    const newUser: CurrentUser = appData.currentUser === "shen" ? "zhou" : "shen";
    const newData = { ...appData, currentUser: newUser };
    setAppData(newData);
    persistData(newData);
    setShowConfirm(false);
  }, [appData, persistData]);

  const updateData = (newData: AppData) => {
    setAppData(newData);
    persistData(newData);
  };

  const handleTabChange = useCallback((tab: TabType) => {
    if (tab === activeTab) return;
    setNextTab(tab);
    setAnimating(true);
    setTimeout(() => {
      setActiveTab(tab);
      setTimeout(() => {
        setAnimating(false);
        setNextTab(null);
      }, 50);
    }, 200);
  }, [activeTab]);

    if (initialLoading && supabaseReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center">
          <p className="text-5xl mb-4 animate-bounce">🐶</p>
          <p className="text-sm text-amber-500">正在加载快乐星球...</p>
        </div>
      </div>
    );
  }
if (!appData.hasSelectedIdentity || !appData.currentUser) {
    return (
      <>
        {supabaseReady && (
          <div className="fixed top-0 left-0 right-0 z-50 text-center text-[10px] py-1 bg-green-100 text-green-600">
            {syncing ? "🔄 同步中..." : "☁️ 云端已连接"}
          </div>
        )}
        {!supabaseReady && (
          <div className="fixed top-0 left-0 right-0 z-50 text-center text-[10px] py-1 bg-amber-100 text-amber-600">
            💾 本地存储模式（未配置云端）
          </div>
        )}
        <HeroHome togetherDays={togetherDays} onSelectIdentity={handleSelectIdentity} />
        <FloatingEmoji />
      </>
    );
  }

  const currentUser: CurrentUser = appData.currentUser;

  const renderContent = () => {
    const currentTab = animating && nextTab ? nextTab : activeTab;
    return (
      <div
        key={currentTab}
        className={`${animating ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"}
          transition-all duration-300 ease-out h-full overflow-y-auto pb-24`}
      >
        {currentTab === "anniversary" && <AnniversaryPage togetherDays={togetherDays} />}
        {currentTab === "calendar" && <CalendarPage appData={appData} updateData={updateData} />}
        {currentTab === "memo" && <MemoPage appData={appData} updateData={updateData} />}
        {currentTab === "message" && (
          <MessageBoardPage appData={appData} updateData={updateData} currentUser={currentUser} />
        )}
        {currentTab === "workout" && (
          <WorkoutPage appData={appData} updateData={updateData} currentUser={currentUser} />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Sync status bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 text-center text-[10px] py-1 ${
          supabaseReady ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
        }`}
      >
        {supabaseReady
          ? `☁️ 云端已连接${syncing ? " · 同步中..." : " · 实时同步"}`
          : "💾 本地存储（未配置云端，留言仅限本机可见）"}
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-4">
        <div className="pt-5">{renderContent()}</div>
      </main>

      <BottomTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        currentUser={currentUser}
        onSwitchIdentity={() => setShowConfirm(true)}
      />

      {showConfirm && (
        <ConfirmDialog
          title="确定要切换身份吗？"
          message="切换后将以对方身份进入网站。"
          confirmText="确认切换"
          cancelText="取消"
          onConfirm={handleSwitchIdentity}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <FloatingEmoji />
    </div>
  );
}

export default App;