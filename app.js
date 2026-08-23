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

// 2. Gün/Dosya listesini oluşturan fonksiyon (Başta Tümü yok, A1 100'den C2 250'ye kadar tam uyumlu sıralama)
function generateDayOptions() {
    const levelSelect = document.getElementById('levelSelect');
    const daySelect = document.getElementById('daySelect');
    if (!levelSelect || !daySelect) return;
    
    const selectedLevel = levelSelect.value;
    daySelect.innerHTML = ""; 
    
    // Eğer birinci panelde "Tümü" seçiliyse tüm seviyeler sırayla işlenir
    const levelsToProcess = selectedLevel === 'all' 
        ? ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'] 
        : [selectedLevel];
        
    levelsToProcess.forEach(lvl => {
        const displayLevel = lvl.toUpperCase(); 
        const letter = lvl.charAt(0); 
        const levelNum = lvl.charAt(1); 
        
        // C2 seviyesi 250'ye kadar, diğer seviyeler 150'ye kadar gider
        let start = 100;
        let end = (lvl === 'c2') ? 250 : 150;
        
        for (let i = start; i <= end; i++) {
            // Dosya adı çakışmasını ve 404 hatalarını önleyen kusursuz eşleme
            const suffix = i.toString().substring(1); // Örn: 100 -> '00', 150 -> '50', 250 -> '50' vb.
            let fileName = `${letter}${levelNum}${suffix}`;
            
            // Eğer C2 için 250'ye gidiliyorsa özel dosya adı formatı
            if (lvl === 'c2' && i === 250) {
                fileName = `c2250`; 
            }
            
            const opt = document.createElement('option');
            opt.value = fileName;
            opt.innerHTML = `${displayLevel} ${i}`; // Örn: A1 100, C2 250
            daySelect.appendChild(opt);
        }
    });
    
    // Sayfa açıldığında ilk dosya otomatik seçilsin
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
    const content = document.getElementById('content');
    const sceneBanner = document.getElementById('sceneBanner');
    
    const oldStoryContainer = document.querySelector('.story-container');
    if (oldStoryContainer) oldStoryContainer.remove();

    if (content) content.innerHTML = "<p>Veriler yükleniyor...</p>";
    if (sceneBanner) sceneBanner.innerHTML = `<h3>Yükleniyor...</h3>`;

    try {
        currentSceneWords = [];
        
        // Doğrudan seçilen JSON dosyasını yükler
        const filePath = `data/${fileName}.json`;
        const res = await fetch(filePath);
        
        if (!res.ok) {
            throw new Error(`Dosya bulunamadı (${filePath})`);
        }
        
        const data = await res.json();
        currentSceneWords = Array.isArray(data) ? data : (data.words || []);
        
        const detectedLevel = fileName.substring(0, 2).toUpperCase();

        if (sceneBanner) {
            sceneBanner.innerHTML = `
                <div class="banner-level">Seviye: ${detectedLevel}</div>
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
