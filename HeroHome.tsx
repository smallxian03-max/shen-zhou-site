import { CurrentUser } from "../types";

interface Props {
  togetherDays: number;
  onSelectIdentity: (user: CurrentUser) => void;
}

export default function HeroHome({ togetherDays, onSelectIdentity }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-amber-50 via-amber-50 to-orange-50">
      {/* Dog illustration */}
      <div className="text-8xl mb-4 animate-bounce-slow">
        🐕
      </div>

      <h1 className="text-2xl font-bold text-amber-800 mb-2 text-center" style={{ fontFamily: "'ZCOOL KuaiLe', cursive" }}>
        小沈&小周的快乐星球~
      </h1>

      <p className="text-sm text-amber-500 mb-8 text-center">
        🪐 双人快乐星球
      </p>

      {/* Together days card */}
      <div className="card-strong mb-10 text-center w-full max-w-xs">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-2xl">🐾</span>
          <span className="text-xs text-amber-400">一起走过的日子</span>
          <span className="text-2xl">🐾</span>
        </div>
        <div className="text-5xl font-bold text-amber-600 mb-1" style={{ fontFamily: "'ZCOOL KuaiLe', cursive" }}>
          {togetherDays}
        </div>
        <p className="text-lg text-amber-700" style={{ fontFamily: "'ZCOOL KuaiLe', cursive" }}>
          天啦
        </p>
        <p className="text-xs text-amber-400 mt-2">从 2026 年 5 月 31 日开始</p>
      </div>

      <p className="text-sm text-amber-600 mb-4">选择你的身份进入小站</p>

      <div className="flex gap-4">
        <button
          onClick={() => onSelectIdentity("shen")}
          className="btn-shen text-base px-8 py-3 flex items-center gap-2"
        >
          <span>☀️</span>
          小沈同学
        </button>
        <button
          onClick={() => onSelectIdentity("zhou")}
          className="btn-zhou text-base px-8 py-3 flex items-center gap-2"
        >
          <span>🌙</span>
          小周同学
        </button>
      </div>

      <div className="mt-12 flex gap-4 text-2xl opacity-30">
        <span>⭐</span>
        <span>💌</span>
        <span>🌼</span>
        <span>🐾</span>
      </div>
    </div>
  );
}
