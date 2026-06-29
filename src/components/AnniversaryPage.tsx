import { getNextBirthdayCountdown } from "../utils/countdown";

interface Props {
  togetherDays: number;
}

export default function AnniversaryPage({ togetherDays }: Props) {
  const shenBirthday = "12-03";
  const zhouBirthday = "09-27";
  const shenCountdown = getNextBirthdayCountdown(shenBirthday);
  const zhouCountdown = getNextBirthdayCountdown(zhouBirthday);

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Together days big card */}
      <div className="card-strong text-center py-8 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-3xl">🐾</span>
          <span className="text-sm text-amber-400 font-medium">在一起的日子</span>
          <span className="text-3xl">🐾</span>
        </div>
        <div className="text-6xl font-bold text-amber-600 mb-2" style={{ fontFamily: "'ZCOOL KuaiLe', cursive" }}>
          {togetherDays}
        </div>
        <p className="text-xl text-amber-700" style={{ fontFamily: "'ZCOOL KuaiLe', cursive" }}>
          天啦 🎉
        </p>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-amber-400">
          <span>⭐</span>
          <span>从 2026-05-31 开始</span>
          <span>⭐</span>
        </div>
      </div>

      {/* Birthday cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Shen's birthday */}
        <div className="card bg-gradient-to-br from-pink-50 to-pink-100/50 border-pink-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">☀️</span>
            <h3 className="font-bold text-pink-600">小沈生日</h3>
          </div>
          <p className="text-3xl font-bold text-pink-500 mb-1">12月3日</p>
          <div className="flex items-center gap-2 text-sm text-pink-400">
            <span>⏰</span>
            <span>距离生日还有</span>
            <span className="font-bold text-pink-500 text-lg">{shenCountdown}</span>
            <span>天</span>
          </div>
        </div>

        {/* Zhou's birthday */}
        <div className="card bg-gradient-to-br from-sky-50 to-sky-100/50 border-sky-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🌙</span>
            <h3 className="font-bold text-sky-600">小周生日</h3>
          </div>
          <p className="text-3xl font-bold text-sky-500 mb-1">9月27日</p>
          <div className="flex items-center gap-2 text-sm text-sky-400">
            <span>⏰</span>
            <span>距离生日还有</span>
            <span className="font-bold text-sky-500 text-lg">{zhouCountdown}</span>
            <span>天</span>
          </div>
        </div>
      </div>

      {/* Decorative paw prints */}
      <div className="flex justify-center gap-3 text-amber-300 text-sm opacity-50 pt-2">
        <span>🐾</span>
        <span>💕</span>
        <span>⭐</span>
        <span>💕</span>
        <span>🐾</span>
      </div>
    </div>
  );
}
