/**
 * 中興新村省府生活色譜 - 首頁瀑布流互動與資料處理
 */

const supabaseUrl = 'https://ccqcmzsopezfmmmvlqlr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjcWNtenNvcGV6Zm1tbXZscWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MTE4NjUsImV4cCI6MjA5MDk4Nzg2NX0.v2T_HyAYnwW2wSNBYVUdtRCDMTyffIFQ5nU-JLwvMI4';


document.addEventListener('DOMContentLoaded', async () => {
    const leftCol = document.getElementById('masonry-col-left');
    const rightCol = document.getElementById('masonry-col-right');

    // 抽離出「渲染卡片」的邏輯，方便重複呼叫
    function renderCards(dataArray) {
        // 先清空畫面
        leftCol.innerHTML = '';
        rightCol.innerHTML = '';

        if (!dataArray || dataArray.length === 0) {
            leftCol.innerHTML = '<div class="body-16-24" style="padding: 32px 16px; color: #888; text-align: center; grid-column: span 2;">尚無色譜資料</div>';
            return;
        }

        dataArray.forEach((data, index) => {
            const card = document.createElement('div');

            const isLeft = index % 2 === 0;
            let isTall = false;
            if (isLeft) {
                isTall = (index / 2) % 2 === 0;
            } else {
                isTall = ((index - 1) / 2) % 2 !== 0;
            }

            card.className = `color-card ${isTall ? 'ratio-1-1-5' : 'ratio-1-1'}`;

            if (data.image) {
                card.style.backgroundImage = `url('${data.image}')`;
                // 為了讓 4500x3000 大圖在瀑布流卡片中呈現最佳美感，使用 cover 填滿並置中
                card.style.backgroundSize = 'cover'; 
                card.style.backgroundPosition = 'center';
                card.style.backgroundRepeat = 'no-repeat';
            } else if (data.color) {
                card.style.backgroundColor = data.color;
            }

            const caption = document.createElement('div');
            caption.className = 'card-caption glass-effect';

            const nameEle = document.createElement('div');
            nameEle.className = 'store-name';
            nameEle.textContent = data.name;

            const codeEle = document.createElement('div');
            codeEle.className = 'body-12-18';
            codeEle.textContent = data.code || data.slug || '';

            caption.appendChild(nameEle);
            caption.appendChild(codeEle);
            card.appendChild(caption);

            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                // 將商店的 ID 帶入網址列參數中，傳給 detail.html
                window.location.href = `detail.html?id=${data.id}`;
            });

            if (isLeft) {
                leftCol.appendChild(card);
            } else {
                rightCol.appendChild(card);
            }
        });
    }

    // 載入中提示
    leftCol.innerHTML = '<div class="body-16-24" style="padding: 32px 16px; color: #888; text-align: center;">載入色譜中...</div>';

    try {
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase.from('shops').select('*');
        if (error) {
            console.warn('Supabase 資料庫連線或權限錯誤：', error.message);
            leftCol.innerHTML = '<div class="body-16-24" style="padding: 32px 16px; color: #888; text-align: center;">資料載入失敗</div>';
        } else if (data && data.length > 0) {
            console.log('成功從 Supabase 取得店家資料！', data);
            
            // 打亂陣列順序，讓每次重新整理都有隨機排列
            for (let i = data.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [data[i], data[j]] = [data[j], data[i]];
            }

            window.allShopsData = data;
            renderCards(data);
        } else {
            renderCards([]); // 顯示空資料提示
        }
    } catch (err) {
        console.warn('Supabase SDK 載入或連線失敗', err);
        leftCol.innerHTML = '<div class="body-16-24" style="padding: 32px 16px; color: #888; text-align: center;">資料載入失敗</div>';
    }

    // 資訊彈窗邏輯
    const infoBtn = document.querySelector('button[aria-label="詳細資訊"]');
    const infoModal = document.getElementById('info-modal');

    if (infoBtn && infoModal) {
        infoBtn.addEventListener('click', () => {
            infoModal.classList.remove('hidden');
        });
        infoModal.addEventListener('click', () => {
            infoModal.classList.add('hidden');
        });
    }

    // 搜尋器邏輯 (index.html)
    const searchInput = document.getElementById('search-input-field');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            if (!window.allShopsData) return;
            const query = e.target.value.trim().toLowerCase();
            if (!query) {
                renderCards(window.allShopsData);
            } else {
                const filtered = window.allShopsData.filter(shop => {
                    const nameMatch = shop.name && shop.name.toLowerCase().includes(query);
                    const slugMatch = shop.slug && shop.slug.toLowerCase().includes(query);
                    const codeMatch = shop.code && shop.code.toLowerCase().includes(query);
                    const addressMatch = shop.address && shop.address.toLowerCase().includes(query);
                    return nameMatch || slugMatch || codeMatch || addressMatch;
                });
                renderCards(filtered);
            }
        });
    }
});

