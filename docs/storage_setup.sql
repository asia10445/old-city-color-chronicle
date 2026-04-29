-- =========================================================================
-- 舊城時光色譜 - Storage 儲存桶建置語法
-- 
-- 請將以下整段複製，並在 Supabase 管理後台左側選單的「SQL Editor」中
-- 開啟一個新的 Query (New query)，貼上後點擊執行 (Run)。
-- 這將為您的資料庫開通接受使用者上傳相片的能力。
-- =========================================================================

-- 1. 建立名為 'shop-photos' 的公開儲存桶 (Bucket)
INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-photos', 'shop-photos', true)
ON CONFLICT (id) DO NOTHING; -- 避免重複執行報錯

-- 2. 允許任何人 (anon) 上傳圖片至 'shop-photos'
CREATE POLICY "Allow anonymous uploads"
ON storage.objects FOR INSERT
TO anon
WITH CHECK ( bucket_id = 'shop-photos' );

-- 3. 允許任何人讀取 'shop-photos' 內的圖片
CREATE POLICY "Allow public access"
ON storage.objects FOR SELECT
TO anon
USING ( bucket_id = 'shop-photos' );

-- 4. 為原本的 submissions 表格新增一個 'image_path' 欄位，用來接收剛上傳的檔案路徑
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS image_path text;

