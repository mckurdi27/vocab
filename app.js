document.addEventListener("DOMContentLoaded", () => {
    generateDayOptions();
});

function generateDayOptions() {
    const level = document.getElementById('levelSelect').value;
    const daySelect = document.getElementById('daySelect');
    daySelect.innerHTML = ""; 
    
    let maxFiles = 50; 
    if (level === 'a1') maxFiles = 31;
    else if (level === 'a2') maxFiles = 11;
    else if (level === 'b1') maxFiles = 51;
    else if (level === 'b2') maxFiles = 11;
    else if (level === 'c1') maxFiles = 11;
    
    for(let i = 1; i <= maxFiles; i++) {
        const num = i.toString().padStart(2, '0');
        const fileName = `${level}${num}`;
        const opt = document.createElement('option');
        opt.value = fileName;
        opt.innerHTML = `${level.toUpperCase()} - ${i}. Dosya (${fileName})`;
        daySelect.appendChild(opt);
    }
    loadData();
}

// İngilizce hikaye için kelimeyi kırmızı vurgulayan fonksiyon
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

// Türkçe hikaye için karşılık gelen kelimeyi mavi vurgulayan fonksiyon
function highlightStoryWordsTr(text, wordsArray) {
    if (!text || !wordsArray) return text;
    let highlightedText = text;
    
    const sortedWords = [...wordsArray].sort((a, b) => b.turkish.length - a.turkish.length);

    sortedWords.forEach(w => {
        if (w.turkish) {
            // Türkçe anlamlarda virgül olabileceği için ilk kelimeyi veya tam eşleşmeyi baz alabiliriz
            const primaryTr = w.turkish.split(',')[0].trim();
            const regex = new RegExp(`\\b(${primaryTr})\\b`, 'gi');
            highlightedText = highlightedText.replace(regex, `<span class="highlight-word-tr">$1</span>`);
        }
    });

    return highlightedText;
}

async function loadData() {
    const fileName = document.getElementById('daySelect').value;
    const content = document.getElementById('content');
    const sceneBanner = document.getElementById('sceneBanner');
    
    const oldStoryContainer = document.querySelector('.story-container');
    if (oldStoryContainer) oldStoryContainer.remove();

    content.innerHTML = "<p>Veriler yükleniyor...</p>";
    sceneBanner.innerHTML = `<div class="banner-title">Yükleniyor...</div>`;

    try {
        const filePath = `data/${fileName}.json`;
        const res = await fetch(filePath);
        
        if (!res.ok) {
            throw new Error(`Dosya bulunamadı (${filePath})`);
        }
        
        const data = await res.json();
        
        sceneBanner.innerHTML = `
            <div class="banner-level">Seviye: ${data.level || '-'}</div>
            <div class="banner-title">Sahne ${data.scene_id || '-'}: ${data.scene_title || ''}</div>
            <div class="banner-count">Toplam Kelime: ${data.total_words_in_scene || (data.words ? data.words.length : 0)}</div>
        `;
        
        if (data.story_en) {
            const processedStoryEn = highlightStoryWordsEn(data.story_en, data.words);
            const processedStoryTr = highlightStoryWordsTr(data.story_tr, data.words);
            
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
        
        if (!data.words || data.words.length === 0) {
            content.innerHTML = "<p style='color: #e67e22; font-weight: bold;'>Bu dosya mevcut ancak içerisinde henüz kelime eklenmemiş.</p>";
            return;
        }
        
        content.innerHTML = data.words.map(w => `
            <div class="card">
                <div class="word-row">
                    <div class="word-box">
                        <span class="en-word">${w.word}</span>
                        <button class="sound-btn" onclick="speakText('${w.word}', 'en-US')" title="İngilizce Seslendir">🔊</button>
                    </div>
                    <span class="type">${w.type}</span>
                </div>
                
                <div class="tr-row">
                    <span class="tr">${w.turkish}</span>
                    <button class="sound-btn" onclick="speakText('${w.turkish}', 'tr-TR')" title="Türkçe Seslendir">🔊</button>
                </div>

                <div class="example">
                    <div class="example-line">
                        <p><strong>EN:</strong> <span class="en-sentence">${w.example_en}</span></p>
                        <button class="sound-btn" onclick="speakText('${w.example_en}', 'en-US')" title="İngilizce Cümleyi Seslendir">🔊</button>
                    </div>
                    <div class="example-line">
                        <p><strong>TR:</strong> <span class="tr-sentence">${w.example_tr}</span></p>
                        <button class="sound-btn" onclick="speakText('${w.example_tr}', 'tr-TR')" title="Türkçe Cümleyi Seslendir">🔊</button>
                    </div>
                </div>

                <div class="related"><strong>İlişkili Fiiller:</strong> ${w.related_verbs ? w.related_verbs.join(', ') : ''}</div>
            </div>
        `).join('');

    } catch (e) {
        sceneBanner.innerHTML = `<div class="banner-title" style="color: #ffcccc;">Dosya Bulunamadı</div>`;
        content.innerHTML = `
            <div style="background: #fff; padding: 20px; border-radius: 8px; border-left: 5px solid #e74c3c; grid-column: 1 / -1;">
                <p style='color: #e74c3c; font-weight: bold; margin: 0 0 10px 0;'>⚠️ Seçilen JSON dosyası sunucuda (GitHub'da) mevcut değil veya yüklenmemiş.</p>
                <p style='color: #555; margin: 0; font-size: 0.9em;'>Aranan dosya yolu: <code>data/${fileName}.json</code></p>
                <p style='color: #777; margin: 5px 0 0 0; font-size: 0.85em;'>Lütfen dosya adının küçük harfle yazıldığından ve <code>data</code> klasörünün içinde olduğundan emin olun.</p>
            </div>
        `;
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
