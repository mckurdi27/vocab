let currentSceneWords = [];

document.addEventListener("DOMContentLoaded", () => {
    initLevelSelect();
    generateDayOptions();
});

// 1. Üst Seviye menüsüne "Tümü" seçeneğini ekleyen fonksiyon
function initLevelSelect() {
    const levelSelect = document.getElementById('levelSelect');
    if (!levelSelect) return;
    
    if (![...levelSelect.options].some(opt => opt.value === 'all')) {
        const allOpt = document.createElement('option');
        allOpt.value = 'all';
        allOpt.innerHTML = 'Tümü';
        levelSelect.insertBefore(allOpt, levelSelect.firstChild);
    }
}

// 2. Seviye seçildiğinde gün listesini oluşturan fonksiyon (Tümü yok, 100 - 150 arası)
function generateDayOptions() {
    const levelSelect = document.getElementById('levelSelect');
    const daySelect = document.getElementById('daySelect');
    if (!levelSelect || !daySelect) return;
    
    const selectedLevel = levelSelect.value;
    daySelect.innerHTML = ""; 
    
    let prefix = 'a';
    let displayLevel = 'A1';
    
    if (selectedLevel !== 'all' && selectedLevel) {
        prefix = selectedLevel.charAt(0).toLowerCase();
        displayLevel = selectedLevel.toUpperCase();
    }
    
    // 100'den 150'ye kadar olan dosyalar (100 dahil, 51 dosya)
    for(let i = 100; i <= 150; i++) {
        const fileName = `${prefix}${i}`; // Örn: a100, a101 ... a150
        const opt = document.createElement('option');
        opt.value = fileName;
        opt.innerHTML = `${displayLevel} ${fileName.toUpperCase()}`; // Örn: A1 A100
        daySelect.appendChild(opt);
    }
    
    // Sayfa açıldığında ilk dosya (100) otomatik seçilsin
    daySelect.selectedIndex = 0;
    loadData();
}

// İngilizce hikaye kelime vurgulama
function highlightStoryWordsEn(text, wordsArray) {
    if (!text || !wordsArray) return text;
    let highlightedText = text;
    const sortedWords = [...wordsArray].sort((a, b) => b.word.length - a.word.length);

    sortedWords.forEach(w => {
        const regex = new RegExp(`\\b(${w.word})\\b`, 'gi');
        highlightedText = highlightedText.replace(regex, `<span class="highlight-word-en">$1</span>`);
    });

    return highlightedText;
}

// Türkçe hikaye kelime vurgulama
function highlightStoryWordsTr(text, wordsArray) {
    if (!text || !wordsArray) return text;
    let highlightedText = text;
    const sortedWords = [...wordsArray].sort((a, b) => b.turkish.length - a.turkish.length);

    sortedWords.forEach(w => {
        if (w.turkish) {
            let primaryTr = w.turkish.split(',')[0].trim();
            let rootTr = primaryTr.replace(/(mek|mak)$/i, '');
            
            if (rootTr.length > 2) {
                const regex = new RegExp(`\\b(${rootTr}[a-üçğışö]*)\\b`, 'gi');
                highlightedText = highlightedText.replace(regex, `<span class="highlight-word-tr">$1</span>`);
            } else {
                const regex = new RegExp(`\\b(${primaryTr})\\b`, 'gi');
                highlightedText = highlightedText.replace(regex, `<span class="highlight-word-tr">$1</span>`);
            }
        }
    });

    return highlightedText;
}

// Verileri ve Hikayeleri Yükleme Fonksiyonu
async function loadData() {
    const levelSelect = document.getElementById('levelSelect');
    const daySelect = document.getElementById('daySelect');
    if (!daySelect || !levelSelect) return;
    
    const fileName = daySelect.value;
    const selectedLevel = levelSelect.value;
    const content = document.getElementById('content');
    const sceneBanner = document.getElementById('sceneBanner');
    
    const oldStoryContainer = document.querySelector('.story-container');
    if (oldStoryContainer) oldStoryContainer.remove();

    if (content) content.innerHTML = "<p>Veriler yükleniyor...</p>";
    if (sceneBanner) sceneBanner.innerHTML = `<h3>Yükleniyor...</h3>`;

    try {
        currentSceneWords = [];
        let combinedStoryEn = "";
        let combinedStoryTr = "";

        if (selectedLevel === 'all') {
            // Üst menüde "Tümü" seçildiyse all.json aranmaz, tüm seviyelerdeki bu dosya numarası toplanır
            const prefixes = ['a', 'b', 'c']; // Seviye harfleri
            const fileNum = fileName.replace(/[^0-9]/g, ''); // Örn: 100

            for (const p of prefixes) {
                try {
                    const res = await fetch(`data/${p}${fileNum}.json`);
                    if (res.ok) {
                        const data = await res.json();
                        const words = Array.isArray(data) ? data : (data.words || []);
                        currentSceneWords = currentSceneWords.concat(words);
                        if (data.story_en) combinedStoryEn += data.story_en + "\n\n";
                        if (data.story_tr) combinedStoryTr += data.story_tr + "\n\n";
                    }
                } catch (err) {
                    // Bulunamayanları atla
                }
            }

            if (sceneBanner) {
                sceneBanner.innerHTML = `
                    <div class="banner-level">Seviye: TÜMÜ</div>
                    <div class="banner-title">Dosya: ${fileName.toUpperCase()} (Tüm Seviyeler)</div>
                    <div class="banner-count">Toplam Kelime: ${currentSceneWords.length}</div>
                `;
            }

            if (combinedStoryEn && content) {
                const processedStoryEn = highlightStoryWordsEn(combinedStoryEn, currentSceneWords);
                const processedStoryTr = highlightStoryWordsTr(combinedStoryTr, currentSceneWords);
                
                const storyHTML = document.createElement('div');
                storyHTML.className = 'story-container';
                storyHTML.innerHTML = `
                    <div class="story-box-en">
                        <span class="story-title">English Story (Tümü)</span>
                        <p>${processedStoryEn}</p>
                    </div>
                    <div class="story-box-tr">
                        <span class="story-title">Türkçe Hikaye (Tümü)</span>
                        <p>${processedStoryTr}</p>
                    </div>
                `;
                sceneBanner.insertAdjacentElement('afterend', storyHTML);
            }

        } else {
            // Tek dosya seçildiyse doğrudan o dosyayı yükler (Örn: data/a100.json)
            const filePath = `data/${fileName}.json`;
            const res = await fetch(filePath);
            
            if (!res.ok) {
                throw new Error(`Dosya bulunamadı (${filePath})`);
            }
            
            const data = await res.json();
            currentSceneWords = Array.isArray(data) ? data : (data.words || []);
            
            if (sceneBanner) {
                sceneBanner.innerHTML = `
                    <div class="banner-level">Seviye: ${data.level || selectedLevel.toUpperCase()}</div>
                    <div class="banner-title">${data.scene_title || fileName.toUpperCase()}</div>
                    <div class="banner-count">Toplam Kelime: ${currentSceneWords.length}</div>
                `;
            }
            
            if (data.story_en && content) {
                const processedStoryEn = highlightStoryWordsEn(data.story_en, currentSceneWords);
                const processedStoryTr = highlightStoryWordsTr(data.story_tr, currentSceneWords);
                
                const storyHTML = document.createElement('div');
                storyHTML.className = 'story-container';
                storyHTML.innerHTML = `
                    <div class="story-box-en">
                        <span class="story-title">English Story</span>
                        <p>${processedStoryEn}</p>
                    </div>
                    <div class="story-box-tr">
                        <span class="story-title">Türkçe Hikaye</span>
                        <p>${processedStoryTr}</p>
                    </div>
                `;
                sceneBanner.insertAdjacentElement('afterend', storyHTML);
            }
        }
        
        if (currentSceneWords.length === 0) {
            if (content) content.innerHTML = "<p style='color: #e67e22; font-weight: bold;'>Bu seçimde görüntülenecek kelime bulunmuyor.</p>";
            return;
        }
        
        if (content) {
            content.innerHTML = currentSceneWords.map((w, index) => `
                <div class="card">
                    <div class="word-row">
                        <div class="word-box">
                            <span class="en-word">${w.word || ''}</span>
                            <button class="sound-btn" onclick="event.stopPropagation(); speakText('${w.word || ''}', 'en-US')" title="İngilizce Seslendir">🔊</button>
                        </div>
                        <span class="type">${w.type || ''}</span>
                    </div>
                    
                    <div class="tr-row">
                        <span class="tr">${w.turkish || ''}</span>
                        <button class="sound-btn" onclick="event.stopPropagation(); speakText('${w.turkish || ''}', 'tr-TR')" title="Türkçe Seslendir">🔊</button>
                    </div>

                    <div class="example">
                        <div class="example-line">
                            <p><strong>EN:</strong> <span class="en-sentence">${w.example_en || ''}</span></p>
                            <button class="sound-btn" onclick="event.stopPropagation(); speakText('${w.example_en || ''}', 'en-US')" title="İngilizce Cümleyi Seslendir">🔊</button>
                        </div>
                        <div class="example-line">
                            <p><strong>TR:</strong> <span class="tr-sentence">${w.example_tr || ''}</span></p>
                            <button class="sound-btn" onclick="event.stopPropagation(); speakText('${w.example_tr || ''}', 'tr-TR')" title="Türkçe Cümleyi Seslendir">🔊</button>
                        </div>
                    </div>

                    <div class="related"><strong>İlişkili Fiiller:</strong> ${w.related_verbs ? w.related_verbs.join(', ') : ''}</div>
                </div>
            `).join('');
        }

    } catch (e) {
        if (sceneBanner) sceneBanner.innerHTML = `<h3 style="color: #dc2626;">Dosya Bulunamadı</h3>`;
        if (content) {
            content.innerHTML = `
                <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #fecaca; color: #dc2626; grid-column: 1 / -1;">
                    <p style='font-weight: bold; margin: 0 0 5px 0;'>⚠️ Seçilen JSON dosyası sunucuda mevcut değil.</p>
                    <p style='margin: 0; font-size: 0.9em; color: #64748b;'>Aranan yol: <code>data/${fileName}.json</code></p>
                </div>
            `;
        }
    }
}

// Seslendirme Fonksiyonu
function speakText(text, lang = 'en-US') {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Tarayıcınız seslendirme özelliğini desteklemiyor.");
    }
}
