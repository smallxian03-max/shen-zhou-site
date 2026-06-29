import { useState, useRef } from "react";
import { AppData, MemoItem, MemoComment, MemoCategory } from "../types";
import { generateId } from "../utils/time";
import { fileToBase64 } from "../utils/image";
import { Plus, Trash2, Image, X, Send, Check } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

interface Props {
  appData: AppData;
  updateData: (data: AppData) => void;
}

const CATEGORIES: { key: MemoCategory; emoji: string }[] = [
  { key: "共同", emoji: "💕" },
  { key: "小沈", emoji: "☀️" },
  { key: "小周", emoji: "🌙" },
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

  const handleSelectMemo = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
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

  const getUserName = (u: string) => (u === "shen" ? "小沈" : "小周");

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Category tabs */}
      <div className="flex gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => { setCategory(cat.key); setSelectedIds(new Set()); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-all duration-200
              ${category === cat.key
                ? "bg-amber-200 text-amber-800 font-medium shadow-sm"
                : "bg-white/80 text-gray-500 hover:bg-amber-50"
              }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.key}</span>
          </button>
        ))}
      </div>

      {/* Batch delete */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-2">
          <span className="text-sm text-red-500">已选择 {selectedIds.size} 项</span>
          <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600">
            <Trash2 size={14} />
            删除
          </button>
        </div>
      )}

      {/* Memo list */}
      <div className="space-y-3">
        {memos.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            <p className="mb-2">📝 暂无 {category} 备忘录</p>
            <p className="text-xs">点击下方按钮创建一条吧</p>
          </div>
        )}
        {memos.map((memo) => {
          const memoComments = comments.filter((c) => c.memoId === memo.id);
          const creatorName = getUserName(memo.createdBy);

          return (
            <div
              key={memo.id}
              className={`card transition-all duration-200 ${selectedIds.has(memo.id) ? "ring-2 ring-amber-300" : ""}`}
            >
              <div className="flex items-start gap-3">
                <label className="flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(memo.id)}
                    onChange={() => handleSelectMemo(memo.id)}
                    className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                  />
                </label>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-800 text-sm">{memo.title}</h4>
                    <span className="text-[10px] text-gray-400">
                      {creatorName} · {new Date(memo.createdAt).toLocaleDateString("zh-CN")}
                    </span>
                  </div>
                  {memo.content && (
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{memo.content}</p>
                  )}
                  {memo.imageUrl && (
                    <div className="mt-2">
                      <img src={memo.imageUrl} alt="memo" className="max-h-40 rounded-lg object-cover" />
                    </div>
                  )}

                  {/* Comments */}
                  {memoComments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-amber-100 space-y-2">
                      {memoComments.map((c) => (
                        <div key={c.id} className="flex items-start gap-2 text-xs">
                          <span className={`font-medium ${c.createdBy === "shen" ? "text-pink-500" : "text-sky-500"}`}>
                            {getUserName(c.createdBy)}：
                          </span>
                          <span className="text-gray-500">{c.content}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment input */}
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      value={commentText[memo.id] || ""}
                      onChange={(e) =>
                        setCommentText((prev) => ({ ...prev, [memo.id]: e.target.value }))
                      }
                      placeholder="添加留言..."
                      className="input-field !py-1.5 !text-xs flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddComment(memo.id);
                      }}
                    />
                    <button
                      onClick={() => handleAddComment(memo.id)}
                      className="text-amber-500 hover:text-amber-600"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add memo button */}
      <div className="flex justify-center">
        <button onClick={() => setShowEditor(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          添加备忘录
        </button>
      </div>

      {/* Editor modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full animate-pop border border-amber-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">新建备忘录</h3>
              <button onClick={() => { setShowEditor(false); setImageUrl(undefined); }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1.5">分类</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MemoCategory)}
                className="input-field"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.key} value={cat.key}>{cat.emoji} {cat.key}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1.5">标题</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="标题..."
                className="input-field"
              />
            </div>

            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1.5">内容</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="写下你想记录的内容..."
                rows={3}
                className="input-field resize-none"
              />
            </div>

            <div className="mb-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-sm text-amber-500 hover:text-amber-600"
              >
                <Image size={16} />
                添加图片
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {imageUrl && (
                <div className="relative mt-2 inline-block">
                  <img src={imageUrl} alt="preview" className="h-20 rounded-lg object-cover" />
                  <button
                    onClick={() => setImageUrl(undefined)}
                    className="absolute -top-1 -right-1 bg-red-400 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            <button onClick={handleAddMemo} className="btn-primary w-full">
              保存备忘录
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
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
