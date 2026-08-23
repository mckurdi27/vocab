// Seviyelere göre dosya listelerini tanımlayalım
const datasetMap = {
    "a1": ["data/a100.json", "data/a101.json", "data/a102.json", "data/a103.json", "data/a104.json", "data/a105.json", "data/a106.json"],
    "a2": [],
    "b1": [],
    "b2": [],
    "c1": [],
    "c2": []
};

// Sayfanın yüklenme durumunu kontrol edip anında başlatalım
function initApp() {
    generateDayOptions();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp(); // Sayfa zaten yüklendiyse direkt çalıştır
}

// Seviye değiştiğinde gün/dosya seçeneklerini güncelle
function generateDayOptions() {
    const levelSelect = document.getElementById("levelSelect");
    const daySelect = document.getElementById("daySelect");
    
    if (!levelSelect || !daySelect) return;

    const selectedLevel = levelSelect.value;
    const files = datasetMap[selectedLevel] || [];

    daySelect.innerHTML = "";

    if (files.length === 0) {
        daySelect.innerHTML = `<option value="">Bu seviyede dosya yok</option>`;
        document.getElementById("content").innerHTML = `<p style="text-align:center; color:red; grid-column: 1/-1;">Bu seviyeye ait dosya tanımlanmamış!</p>`;
        if (document.getElementById("sceneBanner")) {
            document.getElementById("sceneBanner").innerHTML = `<h3>Seviye Boş</h3>`;
        }
        return;
    }

    files.forEach((file) => {
        const fileName = file.split('/').pop().replace('.json', '').toUpperCase();
        const option = document.createElement("option");
        option.value = file;
        option.textContent = `Liste ${fileName}`;
        daySelect.appendChild(option);
    });

    loadData();
}

// Seçilen JSON dosyasını yükle ve ekrana bas
async function loadData() {
    const daySelect = document.getElementById("daySelect");
    const contentDiv = document.getElementById("content");
    const sceneBanner = document.getElementById("sceneBanner");

    if (!daySelect || !daySelect.value) return;

    const filePath = daySelect.value;
    contentDiv.innerHTML = `<p style="text-align:center; color:#64748b; grid-column: 1/-1;">Yükleniyor...</p>`;

    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP Hata Kodu: ${response.status} (${filePath} bulunamadı)`);
        }

        const data = await response.json();
        
        if (sceneBanner) {
            sceneBanner.innerHTML = `<h3>${data.title || filePath.split('/').pop().toUpperCase()}</h3>`;
        }

        contentDiv.innerHTML = "";
        const wordsList = data.words || data;

        if (!Array.isArray(wordsList)) {
            throw new Error("JSON formatı dizi (array) veya 'words' içermiyor!");
        }

        wordsList.forEach(item => {
            const card = document.createElement("div");
            card.className = "vocab-card"; // style.css uyumlu kart sınıfı
            
            const word = item.word || item.term || "";
            const translation = item.translation || item.meaning || "";

            card.innerHTML = `
                <div style="font-size: 1.1rem; font-weight: bold; color: #0f172a; margin-bottom: 6px;">${word}</div>
                <div style="color: #475569; font-size: 0.95rem;">${translation}</div>
            `;
            contentDiv.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        contentDiv.innerHTML = `
            <div style="color: red; text-align: center; grid-column: 1/-1; background: #fee2e2; padding: 15px; border-radius: 8px;">
                <strong>Dosya Okunamadı!</strong><br>
                <small>${error.message}</small>
            </div>`;
    }
}
