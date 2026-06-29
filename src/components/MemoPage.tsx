import { useState, useRef } from "react";
import { AppData, MemoItem, MemoComment, MemoCategory } from "../types";
import { generateId } from "../utils/time";
import { fileToBase64 } from "../utils/image";
import { Plus, Trash2, Image as ImageIcon, X, Send } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

interface Props {
  appData: AppData;
  updateData: (data: AppData) => void;
}

const CATEGORIES: { key: MemoCategory; emoji: string; color: string }[] = [
  { key: "共同", emoji: "💕", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { key: "小沈", emoji: "☀️", color: "bg-pink-100 text-pink-600 border-pink-200" },
  { key: "小周", emoji: "🌙", color: "bg-sky-100 text-sky-600 border-sky-200" },
];

export default function MemoPage({ appData, updateData }: Props) {
  const [category, setCategory] = useState<MemoCategory>("共同");
  const [showEditor, setShowEditor] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUser = appData.currentUser!;

  const memos = appData.memoItems.filter((m) => m.category === category);
  const comments = appData.memoComments;

  const getCategoryColor = (cat: MemoCategory) =>
    CATEGORIES.find((c) => c.key === cat)?.color || CATEGORIES[0].color;
  const getCategoryEmoji = (cat: MemoCategory) =>
    CATEGORIES.find((c) => c.key === cat)?.emoji || "";
  const getUserName = (u: string) => (u === "shen" ? "小沈" : "小周");

  const handleAddMemo = () => {
    if (!title.trim() && !content.trim()) return;
    const newMemo: MemoItem = {
      id: generateId(),
      category,
      title: title.trim() || "无标题",
      content: content.trim(),
      imageUrl,
      createdBy: currentUser,
      createdAt: new Date().toISOString(),
      completed: false,
    };
    updateData({ ...appData, memoItems: [...appData.memoItems, newMemo] });
    resetEditor();
  };

  const resetEditor = () => {
    setTitle("");
    setContent("");
    setImageUrl(undefined);
    setShowEditor(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setImageUrl(base64);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    const remaining = appData.memoItems.filter((m) => !selectedIds.has(m.id));
    const remainingComments = appData.memoComments.filter((c) => !selectedIds.has(c.memoId));
    updateData({ ...appData, memoItems: remaining, memoComments: remainingComments });
    setSelectedIds(new Set());
    setShowDeleteConfirm(false);
  };

  const handleAddComment = (memoId: string) => {
    const text = commentText[memoId]?.trim();
    if (!text) return;
    const newComment: MemoComment = {
      id: generateId(),
      memoId,
      content: text,
      createdBy: currentUser,
      createdAt: new Date().toISOString(),
    };
    updateData({ ...appData, memoComments: [...appData.memoComments, newComment] });
    setCommentText((prev) => ({ ...prev, [memoId]: "" }));
  };

  return (
    <div className="space-y-3 px-1 pb-4">
      {/* 分类标签 */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => { setCategory(cat.key); setSelectedIds(new Set()); }}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0
              ${category === cat.key
                ? `${cat.color} shadow-sm border`
                : "bg-white/70 text-gray-400 border border-transparent hover:bg-white"
              }`}
          >
            <span className="text-lg">{cat.emoji}</span>
            <span>{cat.key}</span>
            <span className="text-xs ml-1 opacity-60">
              {appData.memoItems.filter((m) => m.category === cat.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* 批量删除栏 */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-3 border border-red-100">
          <span className="text-sm font-medium text-red-500">已选 {selectedIds.size} 项</span>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 bg-red-100/50 px-3 py-1.5 rounded-lg"
          >
            <Trash2 size={16} />
            删除
          </button>
        </div>
      )}

      {/* 备忘录列表 */}
      <div className="space-y-3">
        {memos.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">{getCategoryEmoji(category)}</p>
            <p className="text-sm mb-1">暂无{category}备忘录</p>
            <p className="text-xs">点下方按钮创建一条吧</p>
          </div>
        )}

        {memos.map((memo) => {
          const memoComments = comments.filter((c) => c.memoId === memo.id);
          const isSelected = selectedIds.has(memo.id);

          return (
            <div
              key={memo.id}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden
                ${isSelected ? "ring-2 ring-amber-400 border-amber-300" : "border-amber-100 shadow-sm"}`}
            >
              {/* 顶部：勾选 + 标题行 */}
              <div className="flex items-start gap-3 p-4">
                {/* 选择框 - 加大触摸区域 */}
                <label className="flex items-center justify-center shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(memo.id)}
                    className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                  />
                </label>

                <div className="flex-1 min-w-0">
                  {/* 标题行 */}
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800 text-[15px] leading-tight">{memo.title}</h4>
                    <span className={`tag text-[10px] px-2 py-0.5 rounded-full border ${getCategoryColor(memo.category)}`}>
                      {getCategoryEmoji(memo.category)} {memo.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">
                    {getUserName(memo.createdBy)} · {new Date(memo.createdAt).toLocaleDateString("zh-CN")}
                  </p>

                  {/* 内容 */}
                  {memo.content && (
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mb-2">
                      {memo.content}
                    </p>
                  )}

                  {/* 图片 */}
                  {memo.imageUrl && (
                    <div className="mt-2 mb-2">
                      <div className="relative inline-block max-w-full rounded-xl overflow-hidden border border-amber-100">
                        <img
                          src={memo.imageUrl}
                          alt="memo"
                          className="max-h-48 w-auto object-cover cursor-pointer"
                          onClick={() => window.open(memo.imageUrl)}
                        />
                      </div>
                    </div>
                  )}

                  {/* 留言区域 */}
                  {memoComments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-amber-100 space-y-2">
                      {memoComments.map((c) => (
                        <div key={c.id} className="flex items-start gap-2 text-sm">
                          <span className={`font-medium shrink-0 ${
                            c.createdBy === "shen" ? "text-pink-500" : "text-sky-500"
                          }`}>
                            {getUserName(c.createdBy)}
                          </span>
                          <span className="text-gray-500 break-words">{c.content}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 留言输入框 */}
                  <div className="mt-3 flex items-center gap-2 bg-amber-50/50 rounded-xl p-1.5">
                    <input
                      value={commentText[memo.id] || ""}
                      onChange={(e) =>
                        setCommentText((prev) => ({ ...prev, [memo.id]: e.target.value }))
                      }
                      placeholder="写留言..."
                      className="flex-1 bg-transparent border-none outline-none text-sm px-2 py-2 placeholder-gray-400"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddComment(memo.id);
                      }}
                    />
                    <button
                      onClick={() => handleAddComment(memo.id)}
                      className="p-2 rounded-lg text-amber-500 hover:text-amber-600 hover:bg-amber-100 active:scale-95 transition-all"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 添加按钮 */}
      <div className="fixed bottom-24 left-0 right-0 flex justify-center pointer-events-none z-20">
        <button
          onClick={() => setShowEditor(true)}
          className="pointer-events-auto btn-primary flex items-center gap-2 shadow-lg px-6 py-3 text-base"
        >
          <Plus size={20} />
          写备忘录
        </button>
      </div>

      {/* 编辑弹窗 */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up border border-amber-100"
               onClick={(e) => e.stopPropagation()}>
            {/* 顶部栏 */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-800">新建备忘录</h3>
              <button onClick={resetEditor} className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
                <X size={22} className="text-gray-400" />
              </button>
            </div>

            {/* 分类选择 */}
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-2 font-medium">分类</label>
              <div className="flex gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setCategory(cat.key as MemoCategory)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border
                      ${category === cat.key
                        ? cat.color + " shadow-sm"
                        : "bg-gray-50 text-gray-400 border-gray-100"
                      }`}
                  >
                    {cat.emoji} {cat.key}
                  </button>
                ))}
              </div>
            </div>

            {/* 标题 */}
            <div className="mb-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="标题..."
                className="input-field"
                autoFocus
              />
            </div>

            {/* 内容 */}
            <div className="mb-3">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="写下你想记录的内容..."
                rows={4}
                className="input-field resize-none"
              />
            </div>

            {/* 图片上传 */}
            <div className="mb-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-sm text-amber-500 hover:text-amber-600 bg-amber-50 px-4 py-2.5 rounded-xl w-full active:scale-[0.98] transition-all"
              >
                <ImageIcon size={18} />
                添加图片
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              {imageUrl && (
                <div className="relative mt-2 inline-block">
                  <img src={imageUrl} alt="preview" className="h-24 rounded-xl object-cover border border-amber-100" />
                  <button
                    onClick={() => setImageUrl(undefined)}
                    className="absolute -top-2 -right-2 bg-red-400 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm active:scale-90"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            <button onClick={handleAddMemo} className="btn-primary w-full py-3.5 text-base">
              保存备忘录
            </button>
          </div>
        </div>
      )}

      {/* 删除确认 */}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="确定要删除选中的备忘录吗？"
          message="删除后双方都将看不到这些内容。"
          confirmText="确认删除"
          cancelText="取消"
          onConfirm={handleDeleteSelected}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}