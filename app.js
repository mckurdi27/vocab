// Sayfa yüklendiğinde ilk seviye listesini oluştur
document.addEventListener("DOMContentLoaded", () => {
    generateDayOptions();
});

// A1-C1 arası seviyeler ve 01-50 arası küçük harfli dosya adlarını (örn: a101.json) yöneten fonksiyon
function generateDayOptions() {
    const level = document.getElementById('levelSelect').value;
    const daySelect = document.getElementById('daySelect');
    daySelect.innerHTML = ""; 
    
    for(let i = 1; i <= 50; i++) {
        const num = i.toString().padStart(2, '0'); // 1 -> 01, 2 -> 02 ...
        const fileName = `${level}${num}`; // Örn: a101, b250
        const opt = document.createElement('option');
        opt.value = fileName;
        opt.innerHTML = `${level.toUpperCase()} - ${i}. Dosya (${fileName})`;
        daySelect.appendChild(opt);
    }
    loadData();
}

// JSON verilerini `data/` klasöründen çeken fonksiyon
async function loadData() {
    const fileName = document.getElementById('daySelect').value;
    const content = document.getElementById('content');
    
    content.innerHTML = "<p>Yükleniyor...</p>";

    try {
        const res = await fetch(`data/${fileName}.json`);
        if (!res.ok) throw new Error('Dosya bulunamadı');
        
        const data = await res.json();
        
        content.innerHTML = data.words.map(w => `
            <div class="card">
                <div class="word">
                    <span>${w.word}</span>
                    <div>
                        <span class="type">${w.type}</span>
                        <button class="sound-btn" onclick="speakText('${w.word}')" title="Kelimeyi Seslendir">🔊</button>
                    </div>
                </div>
                <div class="tr">${w.turkish}</div>
                <div class="example">
                    <p><strong>EN:</strong> ${w.example_en}</p>
                    <p><strong>TR:</strong> ${w.example_tr}</p>
                </div>
                <div class="related"><strong>İlişkili Fiiller:</strong> ${w.related_verbs.join(', ')}</div>
            </div>
        `).join('');
    } catch (e) {
        content.innerHTML = `<p style='color: #e74c3c; font-weight: bold;'>Bu dosya henüz eklenmemiş veya bulunamadı: data/${fileName}.json</p>`;
    }
}

// Seslendirme Altyapısı
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Tarayıcınız seslendirme özelliğini desteklemiyor.");
    }
}
