let currentSceneWords = [];

document.addEventListener("DOMContentLoaded", () => {
    initLevelSelect();
    generateDayOptions();
    
    // Panel değişimlerini dinleyen olaylar
    const levelSelect = document.getElementById('levelSelect');
    const daySelect = document.getElementById('daySelect');
    
    if (levelSelect) {
        levelSelect.addEventListener('change', () => {
            generateDayOptions();
        });
    }
    
    if (daySelect) {
        daySelect.addEventListener('change', () => {
            loadData();
        });
    }
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

// 2. Dosya listesini tam istenen aralıklarda oluşturan fonksiyon
function generateDayOptions() {
    const levelSelect = document.getElementById('levelSelect');
    const daySelect = document.getElementById('daySelect');
    if (!levelSelect || !daySelect) return;
    
    const selectedLevel = levelSelect.value;
    daySelect.innerHTML = ""; 
    
    let groupsToProcess = [];
    
    if (selectedLevel === 'all') {
        groupsToProcess = [
            { letter: 'a', start: 100, end: 150 },
            { letter: 'a', start: 200, end: 250 },
            { letter: 'b', start: 100, end: 150 },
            { letter: 'b', start: 200, end: 250 },
            { letter: 'c', start: 100, end: 150 },
            { letter: 'c', start: 200, end: 250 }
        ];
    } else if (selectedLevel === 'a1') {
        groupsToProcess = [{ letter: 'a', start: 100, end: 150 }];
    } else if (selectedLevel === 'a2') {
        groupsToProcess = [{ letter: 'a', start: 200, end: 250 }];
    } else if (selectedLevel === 'b1') {
        groupsToProcess = [{ letter: 'b', start: 100, end: 150 }];
    } else if (selectedLevel === 'b2') {
        groupsToProcess = [{ letter: 'b', start: 200, end: 250 }];
    } else if (selectedLevel === 'c1') {
        groupsToProcess = [{ letter: 'c', start: 100, end: 150 }];
    } else if (selectedLevel === 'c2') {
        groupsToProcess = [{ letter: 'c', start: 200, end: 250 }];
    }
    
    groupsToProcess.forEach(g => {
        for (let i = g.start; i <= g.end; i++) {
            const fileName = `${g.letter}${i}`; // Örn: a100, a200, b100, c250
            const opt = document.createElement('option');
            opt.value = fileName;
            opt.innerHTML = fileName.toUpperCase(); // Örn: A100, A200, C250
            daySelect.appendChild(opt);
        }
    });
    
    // Sayfa açıldığında veya filtre değiştiğinde ilk dosya otomatik seçilsin
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
    const daySelect = document.getElementById('daySelect');
    if (!daySelect) return;
    
    const fileName = daySelect.value;
    if (!fileName) return;

    const content = document.getElementById('content');
    const sceneBanner = document.getElementById('sceneBanner');
    
    const oldStoryContainer = document.querySelector('.story-container');
    if (oldStoryContainer) oldStoryContainer.remove();

    if (content) content.innerHTML = "<p>Veriler yükleniyor...</p>";
    if (sceneBanner) sceneBanner.innerHTML = `<h3>Yükleniyor...</h3>`;

    try {
        currentSceneWords = [];
        
        // Doğrudan seçilen JSON dosyasını yükler (örn: data/a100.json, data/a200.json vb.)
        const filePath = `data/${fileName}.json`;
        const res = await fetch(filePath);
        
        if (!res.ok) {
            throw new Error(`Dosya bulunamadı (${filePath})`);
        }
        
        const data = await res.json();
        currentSceneWords = Array.isArray(data) ? data : (data.words || []);
        
        // Dosya adına göre seviye tespiti
        let detectedLevel = '';
        if (fileName.startsWith('a1')) detectedLevel = 'A1';
        else if (fileName.startsWith('a2')) detectedLevel = 'A2';
        else if (fileName.startsWith('b1')) detectedLevel = 'B1';
        else if (fileName.startsWith('b2')) detectedLevel = 'B2';
        else if (fileName.startsWith('c1')) detectedLevel = 'C1';
        else if (fileName.startsWith('c2')) detectedLevel = 'C2';
        else detectedLevel = fileName.substring(0, 1).toUpperCase();

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
