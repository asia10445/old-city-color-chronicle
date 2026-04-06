/**
 * 舊城時光色譜 - 詳情頁資料處理
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 取得網址列參數的 ID
    const params = new URLSearchParams(window.location.search);
    const shopId = params.get('id');

    // 若無 ID，僅元素頁允許 fallback（抓第一筆）；一般詳情頁直接略過
    if (!shopId && !document.getElementById('element-cards-container')) {
        console.warn("沒有收到特定的店家 ID，維持使用假資料顯示。");
        return;
    }

    const supabaseUrl = 'https://ccqcmzsopezfmmmvlqlr.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjcWNtenNvcGV6Zm1tbXZscWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MTE4NjUsImV4cCI6MjA5MDk4Nzg2NX0.v2T_HyAYnwW2wSNBYVUdtRCDMTyffIFQ5nU-JLwvMI4';

    try {
        console.log(shopId ? `正在讀取店家 [${shopId}] 的資料...` : '無 ID，讀取第一筆店家資料作為預覽...');
        // 使用動態載入避開阻擋
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 有 ID 精準查詢；無 ID 時抓第一筆（元素頁 fallback 預覽）
        const query = shopId
            ? supabase.from('shops').select('*').eq('id', shopId).single()
            : supabase.from('shops').select('*').limit(1).single();
        const { data, error } = await query;

        if (error) {
            console.error('Supabase 讀取錯誤', error);
            return;
        }

        if (data) {
            console.log("成功讀取店家資料", data);
            
            // 更新網頁標題 (Tab)
            document.title = `${data.name} - 舊城時光色譜`;

            // 更新 Header 文字
            const titleElem = document.querySelector('.app-container.detail-view .store-name');
            const codeElem = document.querySelector('.app-container.detail-view .header-titles .code-text');
            if (titleElem) titleElem.textContent = data.name;
            if (codeElem) codeElem.textContent = data.code;

            // 更新背景區塊 (直接更新 .detail-view 容器，並套用背景重複拼貼設定)
            const detailContainer = document.querySelector('.app-container.detail-view');
            if (detailContainer) {
                if (data.image) {
                    detailContainer.style.backgroundImage = `url('${data.image}')`;
                    // 若是圖片，維持 CSS 原先定義的 `repeat` 和 `100% auto` 屬性，不要用 cover 蓋掉
                } else if (data.color) {
                    detailContainer.style.backgroundColor = data.color;
                    detailContainer.style.backgroundImage = 'none'; // 取消預設的底圖
                }
            }

            // 同步更新地圖按鈕的搜尋連結（使用資料庫的地址 + 店名）
            const mapBtn = document.querySelector('.detail-floating-nav button[aria-label="地圖"]');
            if (mapBtn && (data.address || data.name)) {
                const mapQuery = encodeURIComponent((data.address || '') + (data.name || ''));
                mapBtn.setAttribute('onclick', `window.open('https://www.google.com/maps/search/?api=1&query=${mapQuery}', '_blank')`);
            }

            // === 自動填入或隱藏詳情頁各個卡片段落 ===
            // 1. 店家標語 Slogan (即使沒有標語，店名也必定顯示)
            const cardSlogan = document.getElementById('card-slogan');
            if (cardSlogan) {
                const shopNameElem = document.getElementById('slogan-shop-name');
                if (shopNameElem) shopNameElem.textContent = data.name || '';
                
                const sloganTextElem = document.getElementById('slogan-text');
                if (sloganTextElem) {
                    if (data.slogan) {
                        sloganTextElem.textContent = data.slogan;
                        sloganTextElem.style.display = 'block';
                    } else {
                        sloganTextElem.style.display = 'none'; // 只隱藏文字段落，保留卡片與店名
                    }
                }
            }

            // 2. 聯絡資訊 Contact
            const cardContact = document.getElementById('card-contact');
            if (cardContact) {
                let hasInfo = false;
                const setContact = (id, value) => {
                    const el = document.getElementById(id);
                    if (el) {
                        if (value) { el.textContent = value; el.style.display = 'block'; hasInfo = true; }
                        else { el.style.display = 'none'; }
                    }
                };
                setContact('contact-address', data.address);
                setContact('contact-phone', data.phone);
                setContact('contact-email', data.email);
                setContact('contact-website', data.website);
                
                if (!hasInfo) {
                    cardContact.style.display = 'none';
                }
            }

            // 3. 理念與文字 Philosophy
            const cardPhilosophy = document.getElementById('card-philosophy');
            if (cardPhilosophy) {
                if (data.philosophy_title || data.philosophy_content) {
                    const pTitle = document.getElementById('philosophy-title');
                    const pText = document.getElementById('philosophy-text');
                    
                    if (pTitle) {
                        if (data.philosophy_title) { pTitle.textContent = data.philosophy_title; pTitle.style.display = 'block'; }
                        else { pTitle.style.display = 'none'; }
                    }
                    if (pText) {
                        if (data.philosophy_content) { pText.textContent = data.philosophy_content; pText.style.display = 'block'; }
                        else { pText.style.display = 'none'; }
                    }
                } else {
                    cardPhilosophy.style.display = 'none';
                }
            }

            // 4. (已移除職人故事，改由照片文字模組彈性取代)

            // 5. 店家照片與排版圖文區 Photos
            const cardPhotos = document.getElementById('card-photos');
            if (cardPhotos) {
                const photosContainer = document.getElementById('photos-container');
                let hasPhotos = false;
                
                if (photosContainer) {
                    // 清空原本寫在 HTML 裡的東西 (以防萬一)
                    photosContainer.innerHTML = '';
                    
                    // 依序檢查並建立最多 5 組圖文
                    for (let i = 1; i <= 5; i++) {
                        const url = data[`photo_url_${i}`];
                        const caption = data[`photo_caption_${i}`];
                        
                        // 只要有圖或有文字，我們就顯示這一段
                        if (url || caption) {
                            hasPhotos = true;
                            
                            const photoCard = document.createElement('div');
                            photoCard.className = 'photo-card';
                            
                            // 只有在填入網址時才產生圖片區塊
                            if (url) {
                                const photoPlaceholder = document.createElement('div');
                                photoPlaceholder.className = 'photo-placeholder';
                                photoPlaceholder.style.backgroundImage = `url('${url}')`;
                                photoCard.appendChild(photoPlaceholder);
                            }
                            
                            // 只要有文字就產生文字區塊 (即使沒有圖片也可以純放文字當作故事佈局)
                            if (caption) {
                                const captionText = document.createElement('p');
                                captionText.className = 'body-12-18 photo-caption';
                                captionText.style.whiteSpace = 'pre-wrap'; // 支援資料庫中輸入的斷行
                                captionText.textContent = caption;
                                photoCard.appendChild(captionText);
                            }
                            
                            photosContainer.appendChild(photoCard);
                        }
                    }
                }
                
                if (!hasPhotos) {
                    cardPhotos.style.display = 'none'; // 沒有半張照片也沒有任何文字，才隱藏卡片
                }
            }


            // ==========================================
            // 6. 元素頁專屬：設計轉譯卡片 + 色票比例
            // ==========================================
            const elementContainer = document.getElementById('element-cards-container');
            if (elementContainer) {

                // --- 6a. 元素轉換卡片（最多 5 組，有資料才顯示）---
                for (let i = 1; i <= 5; i++) {
                    const eName   = data[`element_${i}_name`];
                    const eDesc   = data[`element_${i}_desc`];
                    const eOrigin = data[`element_${i}_origin`];
                    const eMotif  = data[`element_${i}_motif`];

                    // 四個欄位都空則跳過（不顯示此卡片）
                    if (!eName && !eDesc && !eOrigin && !eMotif) continue;

                    const section = document.createElement('section');
                    section.className = 'info-card glass-effect center-align';

                    // 圖解區：原始元素 → 視覺圖騰
                    section.innerHTML = `
                        <div class="transform-graphic" style="display:flex; align-items:center; justify-content:center; gap:12px; margin-bottom:12px;">
                            <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
                                ${eOrigin
                                    ? `<img src="${eOrigin}" alt="原始元素" style="width:120px; height:80px; object-fit:contain; border-radius:4px; outline:1px solid rgba(0,0,0,0.08);">`
                                    : `<div style="width:120px; height:80px; background:rgba(105,187,205,0.15); border-radius:4px;"></div>`}
                                <span class="body-12-18" style="opacity:0.55;">原始元素</span>
                            </div>
                            <div style="font-size:20px; opacity:0.6; flex-shrink:0;">→</div>
                            <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
                                ${eMotif
                                    ? `<img src="${eMotif}" alt="視覺圖騰" style="width:120px; height:80px; object-fit:contain; border-radius:4px; outline:1px solid rgba(0,0,0,0.08);">`
                                    : `<div style="width:120px; height:80px; background:rgba(105,187,205,0.15); border-radius:4px;"></div>`}
                                <span class="body-12-18" style="opacity:0.55;">視覺圖騰</span>
                            </div>
                        </div>
                        ${eName ? `<h3 class="section-title" style="margin-bottom:8px;">${eName}</h3>` : ''}
                        ${eDesc ? `<p class="body-12-18 photo-caption" style="white-space:pre-wrap;">${eDesc}</p>` : ''}
                    `;
                    elementContainer.appendChild(section);
                }

                // --- 6b. 色票應用比例 ---
                const colors = [];
                for (let i = 1; i <= 5; i++) {
                    const hex   = data[`color_${i}_hex`];
                    const cName = data[`color_${i}_name`];
                    const ratio = data[`color_${i}_ratio`];
                    if (hex) colors.push({ hex: hex.replace('#', ''), name: cName || '', ratio: Number(ratio) || 0 });
                }

                const cardColorRatio = document.getElementById('card-color-ratio');
                if (cardColorRatio && colors.length > 0) {
                    cardColorRatio.style.display = '';

                    const totalRatio = colors.reduce((s, c) => s + c.ratio, 0) || 100;

                    // 色條
                    const ratioBar = document.getElementById('color-ratio-bar');
                    if (ratioBar) {
                        ratioBar.innerHTML = colors.map(c =>
                            `<div style="background-color:#${c.hex}; flex:${c.ratio};"></div>`
                        ).join('');
                    }

                    // 比例文字
                    const ratioLabel = document.getElementById('color-ratio-label');
                    if (ratioLabel) {
                        ratioLabel.textContent = '色票應用比例 ' + colors.map(c =>
                            `${Math.round(c.ratio / totalRatio * 100)}%`
                        ).join(' ');
                    }

                    // 色票清單
                    const specList = document.getElementById('color-spec-list');
                    if (specList) {
                        specList.innerHTML = colors.map((c, idx) => {
                            const r = parseInt(c.hex.substring(0, 2), 16);
                            const g = parseInt(c.hex.substring(2, 4), 16);
                            const b = parseInt(c.hex.substring(4, 6), 16);
                            const rgb = isNaN(r) ? '' : `${r} ${g} ${b}`;
                            const pct = Math.round(c.ratio / totalRatio * 100);
                            const mb = idx < colors.length - 1 ? 'margin-bottom:16px;' : '';
                            return `
                                <div style="display:flex; justify-content:center; gap:16px; text-align:left; ${mb}">
                                    <div style="width:48px; height:48px; background-color:#${c.hex}; flex-shrink:0; outline:1px solid rgba(0,0,0,0.08);"></div>
                                     <div class="body-12-18" style="line-height:1.6; flex:1;">
                                        <strong>${c.name}</strong><br>
                                        <span style="display:inline-block; width:90px;">Hex&nbsp;${c.hex.toUpperCase()}</span>RGB&nbsp;${rgb}
                                    </div>
                                </div>`;
                        }).join('');
                    }
                }
            }

            // 同步維護兩個詳情頁之間的跳轉網址，確保帶著 ID 走
            const toElementBtn = document.querySelector('button[aria-label="色票組成元素"]');
            if (toElementBtn) {
                toElementBtn.setAttribute('onclick', `window.location.href='detail-element.html?id=${shopId}'`);
            }
            const toInfoBtn = document.querySelector('button[aria-label="色票資訊"]');
            if (toInfoBtn) {
                toInfoBtn.setAttribute('onclick', `window.location.href='detail.html?id=${shopId}'`);
            }
            // 拍照按鈕：改為跳出採集時光選擇視窗
            const toCameraBtn = document.querySelector('.detail-floating-nav button[aria-label="拍照"]');
            if (toCameraBtn) {
                // 移除寫死在 HTML 上的 onclick
                toCameraBtn.removeAttribute('onclick');
                // 先清除所有既有的選取監聽器，避免重複綁定（若是按鈕為單純的 button 可用克隆來確保乾淨）
                const newCameraBtn = toCameraBtn.cloneNode(true);
                toCameraBtn.parentNode.replaceChild(newCameraBtn, toCameraBtn);
                
                newCameraBtn.addEventListener('click', () => {
                    const modal = document.getElementById('capture-modal-overlay');
                    if (modal) modal.style.display = 'flex';
                });
            }

            // ==========================================
            // 7. 下載按鈕：下載色譜圖片 (優先使用 download_color 欄位，若無則使用 image 欄位)
            // ==========================================
            const downloadShopNameEl = document.getElementById('download-shop-name');
            if (downloadShopNameEl) {
                downloadShopNameEl.textContent = data.name || '色譜';
            }

            const downloadBtn = document.querySelector('button[aria-label="下載"]');
            const downloadToast = document.getElementById('download-toast');
            
            const downloadUrl = data.download_color || data.image;

            if (downloadBtn && downloadUrl) {
                downloadBtn.addEventListener('click', async () => {
                    const filename = `色譜-${data.name || 'download'}.png`;

                    const showToast = () => {
                        if (downloadToast) {
                            downloadToast.classList.remove('hidden');
                            setTimeout(() => downloadToast.classList.add('hidden'), 3000);
                        }
                    };

                    try {
                        const response = await fetch(downloadUrl, { mode: 'cors' });
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        const blob = await response.blob();
                        const blobUrl = URL.createObjectURL(blob);

                        const a = document.createElement('a');
                        a.href = blobUrl;
                        a.download = filename;
                        a.style.display = 'none';
                        document.body.appendChild(a);
                        a.click();

                        setTimeout(() => {
                            document.body.removeChild(a);
                            URL.revokeObjectURL(blobUrl);
                        }, 200);

                        showToast();
                    } catch (err) {
                        console.warn('Blob 下載失敗，改用直接開啟', err);
                        const a = document.createElement('a');
                        a.href = downloadUrl;
                        a.download = filename;
                        a.target = '_blank';
                        a.rel = 'noopener noreferrer';
                        a.style.display = 'none';
                        document.body.appendChild(a);
                        a.click();
                        setTimeout(() => document.body.removeChild(a), 200);

                        showToast();
                    }
                });
            }
        }
    } catch (err) {
        console.error("詳情頁載入發生錯誤：", err);
    }

        // ==========================================
        // 8. 建立「採集時光」詢問視窗 (供拍照按鈕呼叫)
        // ==========================================
        if (!document.getElementById('capture-modal-overlay')) {
            const modalHTML = `
                <div id="capture-modal-overlay" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: none; align-items: center; justify-content: center; z-index: 200; background: rgba(0,0,0,0.5);">
                    <div class="modal-panel glass-effect" style="display: flex; flex-direction: column; align-items: center; padding: 32px 40px; border-radius: 24px; gap: 24px; background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); box-shadow: 0 8px 32px rgba(0,0,0,0.15);">
                        <h3 class="body-16-24" style="font-weight: 500; color: #111;">開始採集時光</h3>
                        <div style="display: flex; flex-direction: column; gap: 16px;">
                            <button class="nav-btn glass-effect" id="btn-modal-camera" style="width: 80px; height: 80px; border-radius: 20px; display: flex; align-items: center; justify-content: center;">
                                 <img src="./assets/icons/camera.svg" alt="相機" style="width: 32px; height: 32px;">
                            </button>
                            <label class="nav-btn glass-effect" style="width: 80px; height: 80px; border-radius: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; margin: 0;">
                                 <img src="./assets/icons/image.svg" alt="相簿" style="width: 32px; height: 32px;">
                                 <input type="file" accept="image/*" style="display:none;" id="btn-modal-upload">
                            </label>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            const captureModal = document.getElementById('capture-modal-overlay');
            // 點擊背景可關閉
            captureModal.addEventListener('click', (e) => {
                if (e.target === captureModal) captureModal.style.display = 'none';
            });

            // 1. 點擊相機進入拍照
            const btnCamera = document.getElementById('btn-modal-camera');
            btnCamera.addEventListener('click', () => {
                const id = shopId || '';
                window.location.href = id ? `camera.html?id=${id}` : 'camera.html';
            });

            // 2. 點擊圖片上傳
            const btnUpload = document.getElementById('btn-modal-upload');
            btnUpload.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = function(evt) {
                        try {
                            sessionStorage.setItem('uploadedImage', evt.target.result);
                            const id = shopId || '';
                            window.location.href = id ? `result.html?id=${id}&upload=1` : 'result.html?upload=1';
                        } catch (err) {
                            alert("圖片檔案過大，無法載入");
                            captureModal.style.display = 'none';
                        }
                    }
                    reader.readAsDataURL(file);
                }
            });
        }
    }); // end DOMContentLoaded
