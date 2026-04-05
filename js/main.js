/**
 * 舊城時光色譜 - 首頁瀑布流互動與資料處理
 */

document.addEventListener('DOMContentLoaded', () => {
    const leftCol = document.getElementById('masonry-col-left');
    const rightCol = document.getElementById('masonry-col-right');
    
    // 預設瀑布流的假資料 (包含：圖片、背景顏色、假名、假編碼)
    const placeholderData = [
        { color: '#FCD553', name: '好伴社計', code: 'HP-2026-0324-0001' },
        { color: '#E0E7FF', name: '舊城雜貨', code: 'TG-2026-0324-0002' },
        { color: '#FF4D4D', name: '熱情紅磚', code: 'RB-2026-0324-0003' },
        { color: '#FFF3C7', name: '時光藝廊', code: 'OS-2026-0324-0004' },
        { image: './assets/images/色譜-好伴社計藍.png', name: '好伴社計藍', code: 'TC-2026-0324-0005' },
        { color: '#C084FC', name: '紫羅蘭工坊', code: 'VW-2026-0324-0006' },
        { color: '#FCD553', name: '角落咖啡館', code: 'HP-2026-0324-0007' },
        { color: '#FFF3C7', name: '好伴社計', code: 'HP-2026-0324-0008' },
        { color: '#FF4D4D', name: '春日小舖', code: 'HP-2026-0324-0009' },
        { color: '#67B8C9', name: '風徐徐書局', code: 'HP-2026-0324-0010' },
    ];

    placeholderData.forEach((data, index) => {
        // 卡片外框
        const card = document.createElement('div');
        
        // 判斷在左欄還是右欄，假定0,2,4為左欄，1,3,5為右欄
        const isLeft = index % 2 === 0;
        
        // 判斷該使用長框 (1:1.5) 還是 方框 (1:1)
        // 規則：交錯。左邊第一個 (0) 是 1:1.5, 第 2 個左邊 (2) 則是 1:1, 接著 (4) 又 1:1.5
        // 右邊第一個 (1) 是 1:1, 第 2 個右邊 (3) 則是 1:1.5, 接著 (5) 又 1:1
        let isTall = false;
        if (isLeft) {
            isTall = (index / 2) % 2 === 0;
        } else {
            isTall = ((index - 1) / 2) % 2 !== 0;
        }
        
        // 加上包含比例的 Class
        card.className = `color-card ${isTall ? 'ratio-1-1-5' : 'ratio-1-1'}`;
        
        // 套用圖片或是色票為背景
        if (data.image) {
            card.style.backgroundImage = `url('${data.image}')`;
            card.style.backgroundSize = 'cover';
            card.style.backgroundPosition = 'center';
            card.style.backgroundRepeat = 'no-repeat';
        } else if (data.color) {
            card.style.backgroundColor = data.color;
        }

        // 卡片下方的資訊與標籤疊加區域（玻璃效果）
        const caption = document.createElement('div');
        caption.className = 'card-caption glass-effect';
        
        // 店家名稱
        const nameEle = document.createElement('div');
        nameEle.className = 'store-name';
        nameEle.textContent = data.name;

        // 編碼
        const codeEle = document.createElement('div');
        codeEle.className = 'body-12-18';
        codeEle.textContent = data.code;

        // 組合卡片內容
        caption.appendChild(nameEle);
        caption.appendChild(codeEle);
        card.appendChild(caption);

        // 綁定點擊事件導向到詳情頁
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            window.location.href = 'detail.html';
        });

        // 分發到指定的欄位內
        if (isLeft) {
            leftCol.appendChild(card);
        } else {
            rightCol.appendChild(card);
        }
    });

    console.log('左右雙欄瀑布流卡片載入並設置長寬比完成！');

    // 資訊彈窗邏輯
    const infoBtn = document.querySelector('button[aria-label="詳細資訊"]');
    const infoModal = document.getElementById('info-modal');
    
    if (infoBtn && infoModal) {
        // 點擊事件：開啟
        infoBtn.addEventListener('click', () => {
            infoModal.classList.remove('hidden');
        });
        
        // 點擊事件：關閉 (點擊螢幕任一處關閉)
        infoModal.addEventListener('click', () => {
            infoModal.classList.add('hidden');
        });
    }
});
