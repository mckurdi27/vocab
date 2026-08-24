document.addEventListener("DOMContentLoaded", () => {
    initLevelSelect();
    generateDayOptions();
    initJumpInput();
});

function initLevelSelect() {
    const levelSelect = document.getElementById('levelSelect');
    if (!levelSelect) return;
    
    const currentValue = levelSelect.value;
    
    // Sadece istenen temiz seçenekler bırakıldı
    levelSelect.innerHTML = `
        <option value="all">Tümü</option>
        <option value="a1">A1</option>
        <option value="a2">A2</option>
        <option value="b1">B1</option>
        <option value="b2">B2</option>
        <option value="c1">C1</option>
        <option value="c2">C2</option>
    `;
    
    if (currentValue && [...levelSelect.options].some(opt => opt.value === currentValue)) {
        levelSelect.value = currentValue;
    } else {
        levelSelect.value = 'all';
    }
}

function initJumpInput() {
    if (document.getElementById('fileJumpInput')) return;
    
    const buttons = document.querySelectorAll('button');
    let prevBtn = null, nextBtn = null;
    
    buttons.forEach(btn => {
        if (btn.textContent.includes('Önceki')) {
            prevBtn = btn;
            if (!btn.onclick) btn.onclick = prevDay;
        }
        if (btn.textContent.includes('Sonraki')) {
            nextBtn = btn;
            if (!btn.onclick) btn.onclick = nextDay;
        }
    });
    
    if (prevBtn && nextBtn) {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'fileJumpInput';
        input.placeholder = 'örn: a123';
        input.title = 'Gitmek istediğiniz dosya adını yazıp Enter\'a basın';
        input.style.width = '70px';
        input.style.textAlign = 'center';
        input.style.padding = '4px 6px';
        input.style.marginLeft = '5px';
        input.style.marginRight = '5px';
        input.style.border = '1px solid #b0c4de';
        input.style.borderRadius = '4px';
        input.style.fontSize = '14px';
        input.style.backgroundColor = '#fff';
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                jumpToFile(input.value.trim());
                input.blur();
            }
        });
        
        prevBtn.parentNode.insertBefore(input, nextBtn);
    }
}

function prevDay() {
    const daySelect = document.getElementById('daySelect');
    if (!daySelect) return;
    if (daySelect.selectedIndex > 0) {
        daySelect.selectedIndex--;
        loadData();
    }
}

function nextDay() {
    const daySelect = document.getElementById('daySelect');
    if (!daySelect) return;
    if (daySelect.selectedIndex < daySelect.options.length - 1) {
        daySelect.selectedIndex++;
        loadData();
    }
}

function jumpToFile(query) {
    if (!query) return;
    query = query.toLowerCase().replace(/\s+/g, '');
    
    let letter = 'a';
    let numStr = query;
    
    const match = query.match(/^([a-c])(\d+)$/);
    if (match) {
        letter = match[1];
        numStr = match[2];
    } else {
        const daySelect = document.getElementById('daySelect');
        if (daySelect && daySelect.value) {
            letter = daySelect.value.charAt(0);
        }
    }
    
    const num = parseInt(numStr, 10);
    if (isNaN(num)) {
        alert("Geçersiz format! Örn: a100 veya 123 yazın.");
        return;
    }
    
    const fileName = `${letter}${num}`;
    let targetLevel = 'all';
    
    if (letter === 'a') targetLevel = num < 200 ? 'a1' : 'a2';
    else if (letter === 'b') targetLevel = num < 200 ? 'b1' : 'b2';
    else if (letter === 'c') targetLevel = num < 200 ? 'c1' : 'c2';
    
    const levelSelect = document.getElementById('levelSelect');
    const daySelect = document.getElementById('daySelect');
    
    if (levelSelect) {
        levelSelect.value = targetLevel;
        generateDayOptions();
    }
    
    if (daySelect) {
        const optionExists = [...daySelect.options].some(opt => opt.value === fileName);
        if (optionExists) {
            daySelect.value = fileName;
            loadData();
        } else {
            if (levelSelect) {
                levelSelect.value = 'all';
                generateDayOptions();
                daySelect.value = fileName;
                loadData();
            } else {
                alert(`Dosya bulunamadı: ${fileName}`);
            }
        }
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
        let letter = level.charAt(0);
        let startNum = level.endsWith('2') ? 200 : 100;
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

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightStoryWordsEn(text, wordsArray) {
    if (!text || !wordsArray) return text;
    let highlightedText = text;
    const sortedWords = [...wordsArray].sort((a, b) => b.word.length - a.word.length);

    sortedWords.forEach(w => {
        if (w.word) {
            try {
                const escapedWord = escapeRegExp(w.word);
                const regex = new RegExp(`\\b(${escapedWord})\\b`, 'gi');
                highlightedText = highlightedText.replace(regex, `<span class="highlight-word-en">$1</span>`);
            } catch (err) {}
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
                let cleanTr = w.turkish.split(',')[0].split('/')[0].replace(/\(.*?\)/g, '').trim();
                let rootTr = cleanTr.replace(/(mek|mak)$/i, '').trim();
                
                if (rootTr.length > 2) {
                    const escapedRoot = escapeRegExp(rootTr);
                    const regex = new RegExp(`\\b(${escapedRoot}[a-üçğışö]*)\\b`, 'gi');
                    highlightedText = highlightedText.replace(regex, `<span class="highlight-word-tr">$1</span>`);
                } else if (cleanTr.length > 0) {
                    const escapedPrimary = escapeRegExp(cleanTr);
                    const regex = new RegExp(`\\b(${escapedPrimary})\\b`, 'gi');
                    highlightedText = highlightedText.replace(regex, `<span class="highlight-word-tr">$1</span>`);
                }
            } catch (err) {}
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
