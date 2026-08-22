// Global Kelime Haritası ve Dosya Listesi
let globalWordMap = {};
let allDaysFiles = [];

// 1. Uygulama Başlangıcı
async function initApp() {
    try {
        const response = await fetch('data/days.json');
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
        console.error("Başlangıç hatası:", error);
        const container = document.getElementById('cardsContainer');
        if (container) {
            container.innerHTML = `<p style="color:red; text-align:center; grid-column:1/-1;">Veriler yüklenemedi. Lütfen data/days.json dosyanızı kontrol edin.</p>`;
        }
    }
}

// 2. Global Kelime Haritasını Oluşturan Fonksiyon
async function buildGlobalWordMap(files) {
    globalWordMap = {};

    for (const file of files) {
        try {
            const res = await fetch(file);
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
            console.error(`${file} taranamadı:`, err);
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
