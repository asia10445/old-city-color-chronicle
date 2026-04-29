-- =========================================================================
-- 舊城時光色譜 - 官方店家圖庫 (shop-assets) 建置語法
-- 
-- 請將以下整段複製，並在 Supabase 管理後台的「SQL Editor」中執行。
-- 這將為您的資料庫開通一個專屬用來存放「官方店家照片與色譜細節」的靜態檔案櫃。
-- =========================================================================

-- 1. 建立名為 'shop-assets' 的公開儲存桶 (Bucket)
INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-assets', 'shop-assets', true)
ON CONFLICT (id) DO NOTHING; 

-- 2. 設定原則 (Policy)：允許所有人（包含網頁前台）讀取這些圖片，以利網頁正確顯示
CREATE POLICY "開放所有人讀取官方店卡圖片"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'shop-assets' );

-- （注意：這裡刻意不加入「允許所有人寫入 (INSERT)」的指令。
-- 因為這是官方素材庫，只有擁有 Supabase 後台權限的您，才能手動上傳與建立資料夾，
-- 這樣能保護您的核心圖庫不被路人隨意覆蓋或塞滿垃圾檔案。）

