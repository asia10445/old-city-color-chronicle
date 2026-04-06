/**
 * 舊城時光色譜 - 首頁瀑布流互動與資料處理
 */

const supabaseUrl = 'https://ccqcmzsopezfmmmvlqlr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjcWNtenNvcGV6Zm1tbXZscWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MTE4NjUsImV4cCI6MjA5MDk4Nzg2NX0.v2T_HyAYnwW2wSNBYVUdtRCDMTyffIFQ5nU-JLwvMI4';


document.addEventListener('DOMContentLoaded', async () => {
    // 預設瀑布流的假資料 (Fallback) 置於最頂端避免生命週期錯誤
    let displayData = [
        { color: '#FCD553', name: '好伴社計', code: 'HP-2026-0324-0001' },
        { color: '#E0E7FF', name: '舊城雜貨', code: 'TG-2026-0324-0002' },
        { color: '#FF4D4D', name: '熱情紅磚', code: 'RB-2026-0324-0003' },
        { color: '#FFF3C7', name: '時光藝廊', code: 'OS-2026-0324-0004' },
        { image: './assets/images/stores/001-HAP-PEN/色譜-好伴社計藍.png', name: '好伴社計藍', code: 'TC-2026-0324-0005' },
        { color: '#C084FC', name: '紫羅蘭工坊', code: 'VW-2026-0324-0006' },
        { color: '#FCD553', name: '角落咖啡館', code: 'HP-2026-0324-0007' },
        { color: '#FFF3C7', name: '好伴社計', code: 'HP-2026-0324-0008' },
        { color: '#FF4D4D', name: '春日小舖', code: 'HP-2026-0324-0009' },
        { color: '#67B8C9', name: '風徐徐書局', code: 'HP-2026-0324-0010' },
    ];
    const leftCol = document.getElementById('masonry-col-left');
    const rightCol = document.getElementById('masonry-col-right');

    // 抽離出「渲染卡片」的邏輯，方便重複呼叫
    function renderCards(dataArray) {
        // 先清空畫面
        leftCol.innerHTML = '';
        rightCol.innerHTML = '';

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
                card.style.backgroundSize = 'auto'; // 維持原始尺寸絕不縮放
                card.style.backgroundPosition = 'top left'; // 從左上角開始拼貼
                card.style.backgroundRepeat = 'repeat'; // 允許圖騰無限上下左右拼貼
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
            codeEle.textContent = data.code;

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

    try {
        // 1. 為了確保網頁不要白畫面，先立即渲染原本的 10 筆假資料
        renderCards(displayData);
        console.log('預設瀑布流卡片載入！準備讀取 Supabase...');

        // 2. 嘗試動態載入 Supabase SDK (防止防毒軟體或擴充套件阻擋網頁主體)
        try {
            console.log('正在從背景動態載入 Supabase...');
            const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
            const supabase = createClient(supabaseUrl, supabaseKey);

            const { data, error } = await supabase.from('shops').select('*');
            if (error) {
                console.warn('Supabase 資料庫連線或權限錯誤，維持假資料：', error.message);
            } else if (data && data.length > 0) {
                console.log('成功從 Supabase 取得真實店家資料！更新畫面...', data);
                // 用遠端真實資料重新渲染！
                renderCards(data);
            } else {
                console.warn('Supabase 表單為空，維持假資料。');
            }
        } catch (sdkErr) {
            console.warn('Supabase SDK 載入或連線失敗，可能是網路阻擋。', sdkErr);
        }
    } catch (err) {
        console.warn('資料或渲染過程發生預期外錯誤', err);
        document.body.insertAdjacentHTML('afterbegin', `<div style="position:fixed;top:0;left:0;width:100%;background:red;color:white;z-index:9999;padding:20px;">發生致命錯誤：${err.message}</div>`);
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
});
