document.addEventListener("DOMContentLoaded", () => {
    initLevelSelect();
    generateDayOptions();
});

function initLevelSelect() {
    const levelSelect = document.getElementById('levelSelect');
    if (!levelSelect) return;
    
    if (![...levelSelect.options].some(opt => opt.value === 'all')) {
        const allOpt = document.createElement('option');
        allOpt.value = 'all';
        allOpt.innerHTML = 'Tümü';
        levelSelect.insertBefore(allOpt, levelSelect.firstChild);
    }
    
    if (!levelSelect.value) {
        levelSelect.value = 'all';
    }
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
            { letter: 'a', start: 100, end: 299 },
            { letter: 'b', start: 100, end: 299 },
            { letter: 'c', start: 100, end: 299 }
        ];
    } else {
        let letter = 'a';
        let startNum = 100;
        
        if (level.includes('a2') || level.includes('200')) { letter = 'a'; startNum = 200; }
        else if (level.includes('b1')) { letter = 'b'; startNum = 100; }
        else if (level.includes('b2') || level.includes('200')) { letter = 'b'; startNum = 200; }
        else if (level.includes('c1')) { letter = 'c'; startNum = 100; }
        else if (level.includes('c2') || level.includes('200')) { letter = 'c'; startNum = 200; }
        else { letter = level.charAt(0); startNum = level.includes('200') ? 200 : 100; }
        
        groupsToProcess = [{ letter: letter, start: startNum, end: startNum + 99 }];
    }
    
    groupsToProcess.forEach(g => {
        for (let i = g.start; i <= g.end; i++) {
            const fileName = `${g.letter}${i}`; 
            const opt = document.createElement('option');
            opt.value = fileName;
            opt.innerHTML = `${fileName.toUpperCase()}`;
            daySelect.appendChild(opt);
        }
    });
    
    daySelect.selectedIndex = 0;
    loadData();
}

// Düzenli ifade özel karakterlerini kaçış karakteriyle güvenli hale getiren yardımcı fonksiyon
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightStoryWordsEn(text, wordsArray) {
    if (!text || !wordsArray) return text;
    let highlightedText = text;
    const sortedWords = [...wordsArray].sort((a, b) => b.word.length - a.word.length);

    sortedWords.forEach(w => {
        try {
            const escapedWord = escapeRegExp(w.word);
            const regex = new RegExp(`\\b(${escapedWord})\\b`, 'gi');
            highlightedText = highlightedText.replace(regex, `<span class="highlight-word-en">$1</span>`);
        } catch (err) {
            // Hatalı kelime regex'ini atla
        }
    });

    return highlightedText;
}

function highlightStoryWordsTr(text, wordsArray) {
    if (!text || !wordsArray) return text;
    let highlightedText = text;
    const sortedWords = [...wordsArray].sort((a, b) => b.turkish.length - a.turkish.length);

    sortedWords.forEach(w => {
        if (w.turkish) {
            try {
                let primaryTr = w.turkish.split(',')[0].trim();
                let rootTr = primaryTr.replace(/(mek|mak)$/i, '');
                
                if (rootTr.length > 2) {
                    const escapedRoot = escapeRegExp(rootTr);
                    const regex = new RegExp(`\\b(${escapedRoot}[a-üçğışö]*)\\b`, 'gi');
                    highlightedText = highlightedText.replace(regex, `<span class="highlight-word-tr">$1</span>`);
                } else {
                    const escapedPrimary = escapeRegExp(primaryTr);
                    const regex = new RegExp(`\\b(${escapedPrimary})\\b`, 'gi');
                    highlightedText = highlightedText.replace(regex, `<span class="highlight-word-tr">$1</span>`);
                }
            } catch (err) {
                // Parantez veya özel karakter içeren çevirilerin çökmesini engeller
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
            throw new Error(`Dosya sunucuda bulunamadı (${fileName}.json).`);
        }
        
        let data;
        try {
            data = await res.json();
        } catch (jsonErr) {
            throw new Error(`JSON Yazım Hatası (${fileName}.json): Süslü parantez veya virgül hatası var!`);
        }
        
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
        if (sceneBanner) sceneBanner.innerHTML = `<div class="banner-title" style="color: #ffcccc;">Hata Oluştu</div>`;
        if (content) {
            content.innerHTML = `
                <div style="background: #fff; padding: 20px; border-radius: 8px; border-left: 5px solid #e74c3c; grid-column: 1 / -1;">
                    <p style='color: #e74c3c; font-weight: bold; margin: 0 0 10px 0;'>⚠️ Dosya Okunamadı!</p>
                    <p style='color: #333; margin: 0; font-size: 0.95em;'>${e.message}</p>
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
