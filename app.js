// Sayfa ilk açıldığında a1 seçeneklerini oluştur
document.addEventListener("DOMContentLoaded", () => {
    generateDayOptions();
});

function generateDayOptions() {
    const level = document.getElementById('levelSelect').value; // küçük harf (a1 vb.)
    const daySelect = document.getElementById('daySelect');
    daySelect.innerHTML = ""; 
    
    for(let i = 1; i <= 50; i++) {
        const num = i.toString().padStart(2, '0'); // 1 -> 01, 2 -> 02 ...
        const fileName = `${level}${num}`; // Örn: a101, a102
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
    
    content.innerHTML = "<p>Yükleniyor...</p>";

    try {
        // Küçük harfli dosya adlarıyla veri çekme (örn: data/a101.json)
        const res = await fetch(`data/${fileName}.json`);
        if (!res.ok) throw new Error('Dosya bulunamadı');
        
        const data = await res.json();
        
        content.innerHTML = data.words.map((w, index) => `
            <div class="card">
                <div class="word">
                    <span>${w.word}</span>
                    <div>
                        <span class="type">${w.type}</span>
                        <!-- İleride seslendirme eklemek için buton altyapısı -->
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

// İleride detaylı seslendirebilmeniz için tarayıcının yerleşik ses motorunu kullanan temel fonksiyon
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US'; // İngilizce seslendirme (İstersen değiştirebilirsin)
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Tarayıcınız seslendirme özelliğini desteklemiyor.");
    }
}
