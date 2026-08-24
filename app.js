document.addEventListener("DOMContentLoaded", () => {
    initLevelSelect();
    generateDayOptions();
});

function initLevelSelect() {
    const levelSelect = document.getElementById('levelSelect');
    if (!levelSelect) return;
    
    // En başta "Tümü" seçeneğinin olduğundan emin oluyoruz
    if (![...levelSelect.options].some(opt => opt.value === 'all')) {
        const allOpt = document.createElement('option');
        allOpt.value = 'all';
        allOpt.innerHTML = 'Tümü';
        levelSelect.insertBefore(allOpt, levelSelect.firstChild);
    }
    
    // Sayfa ilk açıldığında varsayılan olarak "Tümü" seçili gelsin
    levelSelect.value = 'all';
}

function generateDayOptions() {
    const levelSelect = document.getElementById('levelSelect');
    const daySelect = document.getElementById('daySelect');
    if (!levelSelect || !daySelect) return;
    
    const level = levelSelect.value;
    daySelect.innerHTML = ""; 
    
    let groupsToProcess = [];
    
    if (level === 'all') {
        groupsToProcess = [
            { letter: 'a', start: 100, end: 150 },
            { letter: 'a', start: 200, end: 250 },
            { letter: 'b', start: 100, end: 150 },
            { letter: 'b', start: 200, end: 250 },
            { letter: 'c', start: 100, end: 150 },
            { letter: 'c', start: 200, end: 250 }
        ];
    } else {
        let letter = 'a';
        let startNum = 100;
        let maxFiles = 51;
        
        // HATA DÜZELTİLDİ: Harf ve başlangıç numaraları birbirinden ayrıldı
        if (level === 'a1') { letter = 'a'; startNum = 100; maxFiles = 51; }
        else if (level === 'a2') { letter = 'a'; startNum = 200; maxFiles = 51; }
        else if (level === 'b1') { letter = 'b'; startNum = 100; maxFiles = 51; }
        else if (level === 'b2') { letter = 'b'; startNum = 200; maxFiles = 51; }
        else if (level === 'c1') { letter = 'c'; startNum = 100; maxFiles = 51; }
        else if (level === 'c2') { letter = 'c'; startNum = 200; maxFiles = 51; }
        
        groupsToProcess = [{ letter: letter, start: startNum, end: startNum + maxFiles - 1 }];
    }
    
    groupsToProcess.forEach(g => {
        for (let i = g.start; i <= g.end; i++) {
            const fileName = `${g.letter}${i}`; // Örn: a + 100 = a100
            const opt = document.createElement('option');
            opt.value = fileName;
            opt.innerHTML = `${fileName.toUpperCase()}`;
            daySelect.appendChild(opt);
        }
    });
    
    daySelect.selectedIndex = 0;
    loadData();
}

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

async function loadData() {
    const daySelect = document.getElementById('daySelect');
    if (!daySelect || !daySelect.value) return;
    
    const fileName = daySelect.value;
    const content = document.getElementById('content');
    const sceneBanner = document.getElementById('sceneBanner');
    
    const oldStoryContainer = document.querySelector('.story-container');
    if (oldStoryContainer) oldStoryContainer.remove();

    if (content) content.innerHTML = "<p>Veriler yükleniyor...</p>";
    if (sceneBanner) sceneBanner.innerHTML = `<div class="banner-title">Yükleniyor...</div>`;

    try {
        const filePath = `data/${fileName}.json`;
        const res = await fetch(filePath);
        
        if (!res.ok) {
            throw new Error(`Dosya bulunamadı (${filePath})`);
        }
        
        const data = await res.json();
        const wordsList = Array.isArray(data) ? data : (data.words || []);
        
        if (sceneBanner) {
            sceneBanner.innerHTML = `
                <div class="banner-level">Seviye: ${data.level || fileName.substring(0,2).toUpperCase()}</div>
                <div class="banner-title">Sahne: ${data.scene_title || fileName.toUpperCase()}</div>
                <div class="banner-count">Toplam Kelime: ${wordsList.length}</div>
            `;
        }
        
        if (data.story_en && content) {
            const processedStoryEn = highlightStoryWordsEn(data.story_en, wordsList);
            const processedStoryTr = highlightStoryWordsTr(data.story_tr, wordsList);
            
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
        
        if (wordsList.length === 0) {
            if (content) content.innerHTML = "<p style='color: #e67e22; font-weight: bold;'>Bu dosya mevcut ancak içerisinde henüz kelime eklenmemiş.</p>";
            return;
        }
        
        if (content) {
            content.innerHTML = wordsList.map(w => `
                <div class="card">
                    <div class="word-row">
                        <div class="word-box">
                            <span class="en-word">${w.word || ''}</span>
                            <button class="sound-btn" onclick="speakText('${w.word || ''}', 'en-US')" title="İngilizce Seslendir">🔊</button>
                        </div>
                        <span class="type">${w.type || ''}</span>
                    </div>
                    
                    <div class="tr-row">
                        <span class="tr">${w.turkish || ''}</span>
                        <button class="sound-btn" onclick="speakText('${w.turkish || ''}', 'tr-TR')" title="Türkçe Seslendir">🔊</button>
                    </div>

                    <div class="example">
                        <div class="example-line">
                            <p><strong>EN:</strong> <span class="en-sentence">${w.example_en || ''}</span></p>
                            <button class="sound-btn" onclick="speakText('${w.example_en || ''}', 'en-US')" title="İngilizce Cümleyi Seslendir">🔊</button>
                        </div>
                        <div class="example-line">
                            <p><strong>TR:</strong> <span class="tr-sentence">${w.example_tr || ''}</span></p>
                            <button class="sound-btn" onclick="speakText('${w.example_tr || ''}', 'tr-TR')" title="Türkçe Cümleyi Seslendir">🔊</button>
                        </div>
                    </div>

                    <div class="related"><strong>İlişkili Fiiller:</strong> ${w.related_verbs ? w.related_verbs.join(', ') : ''}</div>
                </div>
            `).join('');
        }

    } catch (e) {
        if (sceneBanner) sceneBanner.innerHTML = `<div class="banner-title" style="color: #ffcccc;">Dosya Bulunamadı</div>`;
        if (content) {
            content.innerHTML = `
                <div style="background: #fff; padding: 20px; border-radius: 8px; border-left: 5px solid #e74c3c; grid-column: 1 / -1;">
                    <p style='color: #e74c3c; font-weight: bold; margin: 0 0 10px 0;'>⚠️ Seçilen JSON dosyası sunucuda mevcut değil.</p>
                    <p style='color: #555; margin: 0; font-size: 0.9em;'>Aranan dosya yolu: <code>data/${fileName}.json</code></p>
                </div>
            `;
        }
    }
}

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
