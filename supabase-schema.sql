-- ============================================
-- 小沈 & 小周 双人生活陪伴小站 - 数据库建表
-- ============================================
-- 使用方法：
-- 1. 在 supabase.com 创建项目
-- 2. 打开 SQL Editor
-- 3. 粘贴并运行此脚本
-- ============================================

-- 创建 app_state 表，存储整个应用数据（JSONB 格式）
CREATE TABLE IF NOT EXISTS app_state (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 插入初始数据（如果不存在）
INSERT INTO app_state (id, data, updated_at)
VALUES ('shen-zhou-app', '{}', NOW())
ON CONFLICT (id) DO NOTHING;

-- 启用实时订阅（让双方手机实时同步）
-- 在 Supabase Dashboard → Database → Replication 中，
-- 确保 "app_state" 表已开启 Realtime 订阅。
-- 
-- 或者运行以下 SQL：
ALTER PUBLICATION supabase_realtime ADD TABLE app_state;

-- 为 updated_at 添加索引，方便排序
CREATE INDEX IF NOT EXISTS idx_app_state_updated_at ON app_state (updated_at DESC);

-- ============================================
-- 如果以后需要独立的存储空间放图片：
-- 
-- 在 Supabase Dashboard → Storage 中
-- 创建一个名为 "images" 的 public bucket
-- 设置 Policy：允许所有人上传和查看
-- ============================================