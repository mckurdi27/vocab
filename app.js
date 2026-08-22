// Global Kelime Haritası ve Dosya Listesi (Doğrudan klasöründeki dosyalara göre ayarlandı)
let globalWordMap = {};
let allDaysFiles = [
    'data/a100.json',
    'data/a101.json',
    'data/a102.json',
    'data/a103.json',
    'data/a104.json',
    'data/a105.json',
    'data/a106.json'
];

// 1. Uygulama Başlangıcı
async function initApp() {
    try {
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
            container.innerHTML = `
                <div style="color:red; text-align:center; grid-column:1/-1; padding: 20px; background: #fee2e2; border-radius: 8px;">
                    <strong>Veriler yüklenemedi!</strong><br>
                    <small>Hata: ${error.message}</small>
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
        // Dosya adından (örn: a100.json) buton ismi türetelim
        const fileName = file.split('/').pop().replace('.json', '');
        
        const btn = document.createElement('button');
        btn.className = `day-btn ${index === 0 ? 'active' : ''}`;
        btn.textContent = `Liste ${fileName.toUpperCase()}`;
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
        container.innerHTML = `<p style="color:red; text-align:center; grid-column:1/-1;">Dosya verileri yüklenirken hata oluştu.</p>`;
    }
}

// 5. Kart Oluşturucu ve Mükerrer (Duplicate) Kontrolü
function createVocabCard(item, currentFile) {
    const wordKey = (item.word || item.term || "").trim().toLowerCase();
    const appearances = globalWordMap[wordKey] || [];
    
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
