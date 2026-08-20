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
    const sceneHeaderInfo = document.getElementById('sceneHeaderInfo');
    
    content.innerHTML = "<p>Veriler yükleniyor...</p>";

    try {
        // GitHub Pages için dosya yolu kontrolü
        const filePath = `data/${fileName}.json`;
        const res = await fetch(filePath);
        if (!res.ok) throw new Error(`Dosya bulunamadı: ${filePath}`);
        
        const data = await res.json();
        
        // Sayfa başında seviye, sahne ve toplam kelime bilgisi
        sceneHeaderInfo.innerHTML = `Seviye: ${data.level || '-'} | Sahne ${data.scene_id || '-'}: ${data.scene_title || ''} <span style="font-size:0.9em; color:#555;">(Toplam Kelime: ${data.total_words_in_scene || data.words.length})</span>`;
        
        content.innerHTML = data.words.map(w => `
            <div class="card">
                <div class="word">
                    <span class="en-word">${w.word}</span>
                    <button class="sound-btn" onclick="speakText('${w.word}', 'en-US')" title="Kelimeyi Seslendir">🔊</button>
                    <span class="type">${w.type}</span>
                </div>
                <div class="tr">${w.turkish}</div>
                <div class="example">
                    <div class="example-line">
                        <p><strong>EN:</strong> <span class="en-sentence">${w.example_en}</span></p>
                        <button class="sound-btn" onclick="speakText('${w.example_en}', 'en-US')" title="Cümleyi Seslendir">🔊</button>
                    </div>
                    <p><strong>TR:</strong> <span class="tr-sentence">${w.example_tr}</span></p>
                </div>
                <div class="related"><strong>İlişkili Fiiller:</strong> ${w.related_verbs ? w.related_verbs.join(', ') : ''}</div>
            </div>
        `).join('');
    } catch (e) {
        sceneHeaderInfo.innerHTML = "Hata Oluştu";
        content.innerHTML = `<p style='color: #e74c3c; font-weight: bold;'>Dosya yüklenemedi. Lütfen 'data/${fileName}.json' dosyasının sunucuda (GitHub'da) küçük harflerle var olduğundan emin olun.<br><small>${e.message}</small></p>`;
    }
}

// Seslendirme Fonksiyonu (İngilizce için)
function speakText(text, lang = 'en-US') {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Önceki sesi durdur
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Tarayıcınız seslendirme özelliğini desteklemiyor.");
    }
}
