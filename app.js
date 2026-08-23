let currentSceneWords = []; // Sahne kelimelerini hafızada tutmak için

document.addEventListener("DOMContentLoaded", () => {
    loadData();
});

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
    const daySelect = document.getElementById('daySelect');
    let fileName = daySelect ? daySelect.value : 'a101';
    
    // Eğer menüde 'all' seçilmişse veya boşsa, hata vermemesi için varsayılan bir dosyaya yönlendiriyoruz
    if (!fileName || fileName === 'all') {
        fileName = 'a101'; 
    }
    
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
        currentSceneWords = Array.isArray(data) ? data : (data.words || []);
        
        if (sceneBanner) {
            sceneBanner.innerHTML = `
                <div class="banner-level">Seviye: ${data.level || 'Genel'}</div>
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
        
        if (currentSceneWords.length === 0 && content) {
            content.innerHTML = "<p style='color: #e67e22; font-weight: bold;'>Bu dosya mevcut ancak içerisinde kelime bulunmuyor.</p>";
            return;
        }
        
        if (content) {
            content.innerHTML = currentSceneWords.map((w, index) => `
                <div class="card ${index === 0 ? 'active-card' : ''}" onclick="selectCard(this, ${index})">
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

        if (currentSceneWords.length > 0) {
            showWordDetail(currentSceneWords[0]);
        }

    } catch (e) {
        if (sceneBanner) sceneBanner.innerHTML = `<div class="banner-title" style="color: #ffcccc;">Dosya Bulunamadı</div>`;
        if (content) {
            content.innerHTML = `
                <div style="background: #fff; padding: 20px; border-radius: 8px; border-left: 5px solid #e74c3c; grid-column: 1 / -1;">
                    <p style='color: #e74c3c; font-weight: bold; margin: 0 0 10px 0;'>⚠️ Seçilen JSON dosyası sunucuda (GitHub'da) mevcut değil.</p>
                    <p style='color: #555; margin: 0; font-size: 0.9em;'>Aranan dosya yolu: <code>data/${fileName}.json</code></p>
                </div>
            `;
        }
    }
}

function selectCard(cardElement, index) {
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active-card'));
    cardElement.classList.add('active-card');
    if (currentSceneWords[index]) {
        showWordDetail(currentSceneWords[index]);
    }
}

async function showWordDetail(w) {
    const titleEl = document.getElementById('detailTitle');
    const transEl = document.getElementById('detailTranslation');
    const imageContainer = document.getElementById('detailImageContainer');
    const metaBox = document.getElementById('detailMetaBox');

    if (titleEl) titleEl.textContent = w.word || '';
    if (transEl) transEl.textContent = w.turkish || '';

    if (imageContainer) imageContainer.innerHTML = `<div class="detail-placeholder-text">İnternetten görsel aranıyor...</div>`;
    if (metaBox) metaBox.innerHTML = `İnternetten ek bilgiler taranıyor...`;

    let imageUrl = '';
    let wikiExtract = '';

    try {
        const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(w.word)}`);
        if (wikiRes.ok) {
            const wikiData = await wikiRes.json();
            if (wikiData.thumbnail && wikiData.thumbnail.source) {
                imageUrl = wikiData.thumbnail.source;
            }
            if (wikiData.extract) {
                wikiExtract = wikiData.extract;
            }
        }
    } catch (e) {
        console.log("Wiki API bağlantı hatası:", e);
    }

    if (!imageUrl) {
        imageUrl = `https://loremflickr.com/600/400/${encodeURIComponent(w.word)}`;
    }

    if (imageContainer) {
        imageContainer.innerHTML = `<img src="${imageUrl}" alt="${w.word || ''}" onerror="this.src='https://loremflickr.com/600/400/abstract'">`;
    }

    let metaHtml = `<b>Tür:</b> ${w.type || '-'}<br>`;
    if (w.example_en) {
        metaHtml += `<br><b>Örnek (EN):</b> ${w.example_en}<br>`;
    }
    if (w.example_tr) {
        metaHtml += `<b>Örnek (TR):</b> ${w.example_tr}<br>`;
    }
    if (w.related_verbs && w.related_verbs.length > 0) {
        metaHtml += `<br><b>İlişkili Fiiller:</b> ${w.related_verbs.join(', ')}<br>`;
    }

    if (wikiExtract) {
        metaHtml += `<hr style="border:0; border-top:1px solid #e2e8f0; margin:10px 0;">`;
        metaHtml += `<b style="color:#2563eb;">İnternet Açıklaması (Wiki):</b> <span style="font-style:italic; color:#475569;">${wikiExtract}</span>`;
    } else {
        metaHtml += `<hr style="border:0; border-top:1px solid #e2e8f0; margin:10px 0;">`;
        metaHtml += `<span style="color:#94a3b8; font-size:0.8rem;">Bu kelime için ek internet açıklaması bulunamadı.</span>`;
    }

    if (metaBox) {
        metaBox.innerHTML = metaHtml;
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
