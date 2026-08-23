// Seviyelere göre dosya listelerini tanımlayalım
const datasetMap = {
    "a1": ["data/a100.json", "data/a101.json", "data/a102.json", "data/a103.json", "data/a104.json", "data/a105.json", "data/a106.json"],
    "a2": [], // Eğer varsa ekleyebilirsin
    "b1": [],
    "b2": [],
    "c1": [],
    "c2": []
};

// Sayfa yüklendiğinde ilk seviyenin seçeneklerini oluştur
document.addEventListener("DOMContentLoaded", () => {
    generateDayOptions();
});

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
        document.getElementById("content").innerHTML = `<p style="text-align:center; color:#64748b; grid-column: 1/-1;">Bu seviyeye ait veri bulunamadı.</p>`;
        document.getElementById("sceneBanner").innerHTML = `<h3>Veri Yok</h3>`;
        return;
    }

    files.forEach((file, index) => {
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
        if (!response.ok) throw new Error("Dosya yüklenemedi");

        const data = await response.json();
        
        // Başlık veya tema bilgisini güncelle (varsa)
        if (sceneBanner) {
            sceneBanner.innerHTML = `<h3>${data.title || filePath.split('/').pop().toUpperCase()}</h3>`;
        }

        contentDiv.innerHTML = "";
        const wordsList = data.words || data;

        if (!Array.isArray(wordsList)) {
            throw new Error("Geçersiz veri formatı");
        }

        wordsList.forEach(item => {
            const card = document.createElement("div");
            card.className = "word-card"; // style.css'deki kart sınıfın
            
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
        contentDiv.innerHTML = `<p style="color: red; text-align: center; grid-column: 1/-1;">Veriler yüklenirken bir hata oluştu.</p>`;
    }
}
