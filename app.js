// Global Kelime Haritası ve Dosya Listesi
let globalWordMap = {};
let allDaysFiles = [];

// 1. Uygulama Başlangıcı
async function initApp() {
    try {
        let response = await fetch('data/days.json');
        
        if (!response.ok) {
            throw new Error(`HTTP Hata Kodu: ${response.status} (${response.statusText})`);
        }

        const data = await response.json();
        
        // Dosya yollarının başında 'data/' olduğundan emin oluyoruz
        allDaysFiles = (data.files || data).map(file => {
            return file.startsWith('data/') ? file : `data/${file}`;
        });

        // Arka planda tüm JSON'ları tarayıp global haritayı çıkaralım
        await buildGlobalWordMap(allDaysFiles);

        // Arayüze gün butonlarını basalım
        renderDaySelector(allDaysFiles);

        // İlk günü otomatik yükle
        if (allDaysFiles.length > 0) {
            loadDayData(allDaysFiles[0]);
        }
    } catch (error) {
        console.error("Detaylı Başlangıç Hatası:", error);
        const container = document.getElementById('cardsContainer');
        if (container) {
            container.innerHTML = `
                <div style="color:red; text-align:center; grid-column:1/-1; padding: 20px; background: #fee2e2; border-radius: 8px; border: 1px solid #fecaca;">
                    <strong>Veriler yüklenemedi!</strong><br>
                    <small>Hata Detayı: ${error.message}</small><br><br>
                    <span style="font-size: 0.85rem; color: #374151;">
                        Kontrol Etmeni Önerdiklerimiz:<br>
                        1. GitHub deposunda <b>data</b> klasörünün ve içinde <b>days.json</b> dosyasının olduğundan emin ol.<br>
                        2. Dosya adlarında büyük/küçük harf duyarlılığına dikkat et (örn. Days.json olmasın).<br>
                        3. GitHub Pages'in son yaptığın değişiklikleri canlıya yansıtması 1-2 dakika sürebilir.
                    </span>
                </div>`;
        }
    }
}

// 2. Global Kelime Haritasını Oluşturan Fonksiyon
async function buildGlobalWordMap(files) {
    globalWordMap = {};

    for (const file of files) {
        try {
            const res = await fetch(file);
            if (!res.ok) throw new Error(`${file} yüklenemedi`);
            
            const dayData = await res.json();
            const wordsList = dayData.words || dayData;

            wordsList.forEach(item => {
                const wordKey = (item.word || item.term || "").trim().toLowerCase();
                if (!wordKey) return;

                if (!globalWordMap[wordKey]) {
                    globalWordMap[wordKey] = [];
                }
                if (!globalWordMap[wordKey].includes(file)) {
                    globalWordMap[wordKey].push(file);
                }
            });
        } catch (err) {
            console.error(err);
        }
    }
}

// 3. Gün Seçim Butonlarını Oluşturma
function renderDaySelector(files) {
    const selector = document.getElementById('daySelector');
    if (!selector) return;
    selector.innerHTML = '';

    files.forEach((file, index) => {
        const btn = document.createElement('button');
        btn.className = `day-btn ${index === 0 ? 'active' : ''}`;
        btn.textContent = `Gün ${index + 1}`;
        btn.onclick = () => {
            document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadDayData(file);
        };
        selector.appendChild(btn);
    });
}

// 4. Seçilen Günün Verilerini Yükleme
async function loadDayData(file) {
    const container = document.getElementById('cardsContainer');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align:center; grid-column:1/-1; color:#6b7280;">Yükleniyor...</p>';

    try {
        const res = await fetch(file);
        if (!res.ok) throw new Error(`${file} yüklenemedi`);

        const dayData = await res.json();
        const wordsList = dayData.words || dayData;

        container.innerHTML = '';

        wordsList.forEach(item => {
            const card = createVocabCard(item, file);
            container.appendChild(card);
        });
    } catch (err) {
        console.error(`${file} yüklenemedi:`, err);
        container.innerHTML = `<p style="color:red; text-align:center; grid-column:1/-1;">Gün verileri yüklenirken hata oluştu.</p>`;
    }
}

// 5. Kart Oluşturucu ve Mükerrer (Duplicate) Kontrolü
function createVocabCard(item, currentFile) {
    const wordKey = (item.word || item.term || "").trim().toLowerCase();
    const appearances = globalWordMap[wordKey] || [];
    
    // Eğer kelime 1'den fazla dosyada/günde geçiyorsa true olur
    const isDuplicate = appearances.length > 1;

    const cardDiv = document.createElement('div');
    cardDiv.className = `vocab-card ${isDuplicate ? 'is-duplicate' : ''}`;

    const wordText = item.word || item.term || '';
    const translationText = item.translation || item.meaning || '';

    cardDiv.innerHTML = `
        <div class="word-title">${wordText}</div>
        <div class="word-translation">${translationText}</div>
        <div class="word-meta">
            Geçtiği Dosyalar: ${appearances.length > 0 ? appearances.join(', ') : currentFile}
        </div>
    `;

    return cardDiv;
}

// Sayfa yüklendiğinde uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});
