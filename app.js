let currentSceneWords = []; // Sahne kelimelerini hafızada tutmak için dizi

document.addEventListener("DOMContentLoaded", () => {
    generateDayOptions();
});

function generateDayOptions() {
    const level = document.getElementById('levelSelect').value;
    const daySelect = document.getElementById('daySelect');
    daySelect.innerHTML = ""; 
    
    let maxFiles = 50; 
    if (level === 'a1') maxFiles = 51;
    else if (level === 'a2') maxFiles = 51;
    else if (level === 'b1') maxFiles = 51;
    else if (level === 'b2') maxFiles = 51;
    else if (level === 'c1') maxFiles = 51;
    
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

// Türkçe hikaye için ek almış kelimeleri bile yakalayıp mavi yapan fonksiyon
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
        currentSceneWords = data.words || []; // Verileri diziye aktarıyoruz
        
        sceneBanner.innerHTML = `
            <div class="banner-level">Seviye: ${data.level || '-'}</div>
            <div class="banner-title">Sahne ${data.scene_id || '-'}: ${data.scene_title || ''}</div>
            <div class="banner-count">Toplam Kelime: ${data.total_words_in_scene || currentSceneWords.length}</div>
        `;
        
        if (data.story_en) {
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
            content.innerHTML = "<p style='color: #e67e22; font-weight: bold;'>Bu dosya mevcut ancak içerisinde henüz kelime eklenmemiş.</p>";
            return;
        }
        
        content.innerHTML = currentSceneWords.map((w, index) => `
            <div class="card ${index === 0 ? 'active-card' : ''}" onclick="selectCard(this, ${index})">
                <div class="word-row">
                    <div class="word-box">
                        <span class="en-word">${w.word}</span>
                        <button class="sound-btn" onclick="event.stopPropagation(); speakText('${w.word}', 'en-US')" title="İngilizce Seslendir">🔊</button>
                    </div>
                    <span class="type">${w.type}</span>
                </div>
                
                <div class="tr-row">
                    <span class="tr">${w.turkish}</span>
                    <button class="sound-btn" onclick="event.stopPropagation(); speakText('${w.turkish}', 'tr-TR')" title="Türkçe Seslendir">🔊</button>
                </div>

                <div class="example">
                    <div class="example-line">
                        <p><strong>EN:</strong> <span class="en-sentence">${w.example_en}</span></p>
                        <button class="sound-btn" onclick="event.stopPropagation(); speakText('${w.example_en}', 'en-US')" title="İngilizce Cümleyi Seslendir">🔊</button>
                    </div>
                    <div class="example-line">
                        <p><strong>TR:</strong> <span class="tr-sentence">${w.example_tr}</span></p>
                        <button class="sound-btn" onclick="event.stopPropagation(); speakText('${w.example_tr}', 'tr-TR')" title="Türkçe Cümleyi Seslendir">🔊</button>
                    </div>
                </div>

                <div class="related"><strong>İlişkili Fiiller:</strong> ${w.related_verbs ? w.related_verbs.join(', ') : ''}</div>
            </div>
        `).join('');

        // Sayfa yüklendiğinde ilk kelimenin detayını sağ panele otomatik getir
        if (currentSceneWords.length > 0) {
            showWordDetail(currentSceneWords[0]);
        }

    } catch (e) {
        sceneBanner.innerHTML = `<div class="banner-title" style="color: #ffcccc;">Dosya Bulunamadı</div>`;
        content.innerHTML = `
            <div style="background: #fff; padding: 20px; border-radius: 8px; border-left: 5px solid #e74c3c; grid-column: 1 / -1;">
                <p style='color: #e74c3c; font-weight: bold; margin: 0 0 10px 0;'>⚠️ Seçilen JSON dosyası sunucuda mevcut değil veya yüklenmemiş.</p>
                <p style='color: #555; margin: 0; font-size: 0.9em;'>Aranan dosya yolu: <code>data/${fileName}.json</code></p>
            </div>
        `;
    }
}

// Kart seçildiğinde aktif sınıfını değiştirme ve detay gösterme fonksiyonu
function selectCard(cardElement, index) {
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active-card'));
    cardElement.classList.add('active-card');
    if (currentSceneWords[index]) {
        showWordDetail(currentSceneWords[index]);
    }
}

// Sağ taraftaki 4. Sütun detay panelini dolduran ve görsel çeken fonksiyon
async function showWordDetail(w) {
    document.getElementById('detailTitle').textContent = w.word || '';
    document.getElementById('detailTranslation').textContent = w.turkish || '';

    const imageContainer = document.getElementById('detailImageContainer');
    imageContainer.innerHTML = `<div class="detail-placeholder-text">Görsel aranıyor...</div>`;

    try {
        const wikiRes = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(w.word)}&gsrlimit=1&prop=imageinfo&iiprop=url&format=json&origin=*`);
        const wikiData = await wikiRes.json();
        
        let imageUrl = '';
        if (wikiData.query && wikiData.query.pages) {
            const pages = wikiData.query.pages;
            const pageId = Object.keys(pages)[0];
            if (pages[pageId].imageinfo && pages[pageId].imageinfo[0]) {
                imageUrl = pages[pageId].imageinfo[0].url;
            }
        }

        if (!imageUrl) {
            imageUrl = `https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&q=80`;
        }

        imageContainer.innerHTML = `<img src="${imageUrl}" alt="${w.word}" onerror="this.src='https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&q=80'">`;
    } catch (err) {
        imageContainer.innerHTML = `<img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&q=80" alt="${w.word}">`;
    }

    let metaHtml = `<b>Tür:</b> ${w.type || '-'}<br>`;
    if (w.example_en) {
        metaHtml += `<br><b>Örnek (EN):</b> ${w.example_en}<br>`;
    }
    if (w.example_tr) {
        metaHtml += `<b>Örnek (TR):</b> ${w.example_tr}<br>`;
    }
    if (w.related_verbs && w.related_verbs.length > 0) {
        metaHtml += `<br><b>İlişkili Fiiller:</b> ${w.related_verbs.join(', ')}`;
    }

    document.getElementById('detailMetaBox').innerHTML = metaHtml;
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
