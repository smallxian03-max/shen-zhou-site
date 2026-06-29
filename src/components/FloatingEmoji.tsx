import { useEffect, useState } from "react";

const EMOJIS = ["🐶", "🐾", "⭐", "💌", "🌼", "🎈"];

interface FloatItem {
  id: number;
  emoji: string;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

export default function FloatingEmoji() {
  const [items, setItems] = useState<FloatItem[]>([]);

  useEffect(() => {
    const initial: FloatItem[] = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      emoji: EMOJIS[i % EMOJIS.length],
      x: 5 + Math.random() * 90,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 4,
      size: 16 + Math.random() * 12,
    }));
    setItems(initial);

    const interval = setInterval(() => {
      setItems((prev) => {
        const newItems = [...prev];
        const idx = Math.floor(Math.random() * newItems.length);
        newItems[idx] = {
          ...newItems[idx],
          x: 5 + Math.random() * 90,
          delay: 0,
          duration: 4 + Math.random() * 4,
        };
        return newItems;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute animate-float"
          style={{
            left: `${item.x}%`,
            top: `${10 + Math.random() * 70}%`,
            fontSize: `${item.size}px`,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
            opacity: 0.25,
          }}
        >
          {item.emoji}
        </div>
      ))}
    </div>
  );
}
