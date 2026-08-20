document.addEventListener("DOMContentLoaded", () => {
    generateDayOptions();
});

function generateDayOptions() {
    const level = document.getElementById('levelSelect').value;
    const daySelect = document.getElementById('daySelect');
    daySelect.innerHTML = ""; 
    
    for(let i = 1; i <= 50; i++) {
        const num = i.toString().padStart(2, '0');
        const fileName = `${level}${num}`;
        const opt = document.createElement('option');
        opt.value = fileName;
        opt.innerHTML = `${level.toUpperCase()} - ${i}. Dosya (${fileName})`;
        daySelect.appendChild(opt);
    }
    loadData();
}

async function loadData() {
    const fileName = document.getElementById('daySelect').value;
    const content = document.getElementById('content');
    const sceneBanner = document.getElementById('sceneBanner');
    
    content.innerHTML = "<p>Veriler yükleniyor...</p>";

    try {
        const filePath = `data/${fileName}.json`;
        const res = await fetch(filePath);
        if (!res.ok) throw new Error(`Dosya bulunamadı: ${filePath}`);
        
        const data = await res.json();
        
        sceneBanner.innerHTML = `
            <div class="banner-level">Seviye: ${data.level || '-'}</div>
            <div class="banner-title">Sahne ${data.scene_id || '-'}: ${data.scene_title || ''}</div>
            <div class="banner-count">Toplam Kelime: ${data.total_words_in_scene || data.words.length}</div>
        `;
        
        content.innerHTML = data.words.map(w => `
            <div class="card">
                <!-- Kelime Satırı (İngilizce ve Türkçe seslendirmeli) -->
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

                <!-- Örnek Cümleler (İngilizce ve Türkçe seslendirmeli) -->
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
        sceneBanner.innerHTML = `<h3>Hata Oluştu</h3>`;
        content.innerHTML = 
        `<p style='color: #e74c3c; font-weight: bold;'>Dosya yüklenemedi.`;<br><small>${e.message}</small></p>`;
    }
    }
        `<p style='color: #e74c3c; font-weight: bold;'>Lütfen 'data/${fileName}.json' dosyasının sunucuda küçük harfle var olduğundan emin olun.`;
    }
}

// Genel Seslendirme Fonksiyonu (Dil koduna göre EN veya TR okur)
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
