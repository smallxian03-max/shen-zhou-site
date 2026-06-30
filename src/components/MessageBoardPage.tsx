import { useState, useRef, useEffect } from "react";
import { AppData, Message, CurrentUser } from "../types";
import { generateId } from "../utils/time";
import { fileToBase64, downloadImage } from "../utils/image";
import { uploadImage, isSupabaseConfigured } from "../utils/supabase";
import { QUICK_PHRASES } from "../data/quickPhrases";
import { Send, Image, Download, Camera } from "lucide-react";

interface Props {
  appData: AppData;
  updateData: (data: AppData) => void;
  currentUser: CurrentUser;
}

export default function MessageBoardPage({ appData, updateData, currentUser }: Props) {
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const messages = appData.messages;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSendText = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const msg: Message = {
      id: generateId(),
      type: "text",
      content: trimmed,
      createdBy: currentUser,
      createdAt: new Date().toISOString(),
    };
    updateData({ ...appData, messages: [...messages, msg] });
    setText("");
  };

  const handleSendImage = async (file: File) => {
    const base64 = await fileToBase64(file);
    const msg: Message = {
      id: generateId(),
      type: "image",
      imageUrl: base64,
      createdBy: currentUser,
      createdAt: new Date().toISOString(),
    };
    updateData({ ...appData, messages: [...messages, msg] });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (isSupabaseConfigured()) {
      const url = await uploadImage(file);
      if (url) {
        const msgItem: Message = { id: generateId(), type: "image" as const, imageUrl: url, createdBy: currentUser, createdAt: new Date().toISOString() };
        updateData({ ...appData, messages: [...messages, msgItem] });
      }
    } else {
      const base64 = await fileToBase64(file);
      const m = { id: generateId(), type: "image" as const, imageUrl: base64, createdBy: currentUser, createdAt: new Date().toISOString() };
      updateData({ ...appData, messages: [...messages, m] });
    }
    e.target.value = "";
  };

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (isSupabaseConfigured()) {
      const url = await uploadImage(file);
      if (url) {
        const msgItem: Message = { id: generateId(), type: "image" as const, imageUrl: url, createdBy: currentUser, createdAt: new Date().toISOString() };
        updateData({ ...appData, messages: [...messages, msgItem] });
      }
    } else {
      const base64 = await fileToBase64(file);
      const m = { id: generateId(), type: "image" as const, imageUrl: base64, createdBy: currentUser, createdAt: new Date().toISOString() };
      updateData({ ...appData, messages: [...messages, m] });
    }
    e.target.value = "";
  };

  const handleQuickPhrase = (phrase: string) => {
    setText(phrase);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const getUserName = (u: string) => (u === "shen" ? "小沈同学" : "小周同学");
  const getAvatar = (u: string) => (u === "shen" ? "☀️" : "🌙");
  const getBubbleColor = (u: string) =>
    u === "shen" ? "bg-pink-100 text-pink-800" : "bg-sky-100 text-sky-800";
  const isMine = (u: string) => u === currentUser;

  return (
    <div className="space-y-4 animate-fade-in-up flex flex-col h-[calc(100vh-12rem)]">
      {/* Quick phrases */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {QUICK_PHRASES.map((phrase) => (
          <button
            key={phrase}
            onClick={() => handleQuickPhrase(phrase)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs bg-amber-100 text-amber-700
              hover:bg-amber-200 transition-colors whitespace-nowrap"
          >
            {phrase}
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-3 px-1">
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-sm">来发第一条留言吧</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 ${isMine(msg.createdBy) ? "flex-row-reverse" : ""}`}
          >
            <div className="flex-shrink-0 text-xl mt-1">{getAvatar(msg.createdBy)}</div>
            <div className={`max-w-[75%] ${isMine(msg.createdBy) ? "items-end" : "items-start"}`}>
              <p className={`text-[10px] mb-0.5 ${isMine(msg.createdBy) ? "text-right" : ""} text-gray-400`}>
                {getUserName(msg.createdBy)}
              </p>
              {msg.type === "text" ? (
                <div
                  className={`px-3 py-2 rounded-2xl text-sm ${getBubbleColor(msg.createdBy)} ${
                    isMine(msg.createdBy) ? "rounded-br-md" : "rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
              ) : (
                <div className="relative group">
                  <img
                    src={msg.imageUrl}
                    alt="message"
                    className="max-w-[200px] max-h-40 rounded-xl object-cover cursor-pointer"
                    onClick={() => msg.imageUrl && window.open(msg.imageUrl)}
                  />
                  <button
                    onClick={() => msg.imageUrl && downloadImage(msg.imageUrl)}
                    className="absolute top-1 right-1 bg-white/80 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Download size={14} className="text-gray-600" />
                  </button>
                </div>
              )}
              <p className={`text-[10px] mt-0.5 ${isMine(msg.createdBy) ? "text-right" : ""} text-gray-400`}>
                {new Date(msg.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-100 p-3">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入留言..."
              rows={1}
              className="input-field resize-none !rounded-xl"
            />
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
              title="上传图片"
            >
              <Image size={20} />
            </button>
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="p-2 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
              title="拍照"
            >
              <Camera size={20} />
            </button>
            <button
              onClick={handleSendText}
              className="p-2 rounded-lg text-white bg-amber-400 hover:bg-amber-500 transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraCapture}
          className="hidden"
        />
      </div>
    </div>
  );
}
