let currentSceneWords = [];

// Sayfa ilk açıldığında seviyeye göre dosya listesini oluştur ve yükle
document.addEventListener("DOMContentLoaded", () => {
    generateDayOptions();
});

// Seviye seçildiğinde (A1, A2, B1 vb.) dosya seçeneklerini oluşturan fonksiyon
function generateDayOptions() {
    const level = document.getElementById('levelSelect').value;
    const daySelect = document.getElementById('daySelect');
    if (!daySelect) return;
    
    daySelect.innerHTML = ""; 
    
    let maxFiles = 51; // Seviye başına dosya sayısı (ihtiyacına göre ayarlayabilirsin)
    
    for(let i = 1; i <= maxFiles; i++) {
        const num = i.toString().padStart(2, '0');
        const fileName = `${level}${num}`;
        const opt = document.createElement('option');
        opt.value = fileName;
        opt.innerHTML = `${level.toUpperCase()} - ${i}. Dosya (${fileName})`;
        daySelect.appendChild(opt);
    }
    
    // Listeyi oluşturduktan sonra ilk veriyi yükle
    loadData();
}

// Seçilen JSON dosyasını sunucudan (data klasöründen) yükleyen ana fonksiyon
async function loadData() {
    const daySelect = document.getElementById('daySelect');
    if (!daySelect) return;
    
    const fileName = daySelect.value;
    const content = document.getElementById('content');
    const sceneBanner = document.getElementById('sceneBanner');
    
    if (content) content.innerHTML = "<p>Veriler yükleniyor...</p>";
    if (sceneBanner) sceneBanner.innerHTML = `<h3>Yükleniyor...</h3>`;

    try {
        const filePath = `data/${fileName}.json`;
        const res = await fetch(filePath);
        
        if (!res.ok) {
            throw new Error(`Dosya bulunamadı (${filePath})`);
        }
        
        const data = await res.json();
        currentSceneWords = Array.isArray(data) ? data : (data.words || []);
        
        // Başlık alanını güncelle
        if (sceneBanner) {
            sceneBanner.innerHTML = `
                <div style="font-size: 0.9em; color: #64748b; margin-bottom: 4px;">Seviye: ${data.level || document.getElementById('levelSelect').value.toUpperCase()}</div>
                <h3 style="margin: 0; color: #0f172a; font-size: 1.25rem;">${data.scene_title || fileName.toUpperCase()}</h3>
                <div style="font-size: 0.85em; color: #475569; margin-top: 4px;">Toplam Kelime: ${currentSceneWords.length}</div>
            `;
        }
        
        if (currentSceneWords.length === 0) {
            if (content) content.innerHTML = "<p style='color: #e67e22; font-weight: bold;'>Bu dosya mevcut ancak içerisinde henüz kelime eklenmemiş.</p>";
            return;
        }
        
        // Kelime kartlarını ekrana bas
        if (content) {
            content.innerHTML = currentSceneWords.map((w, index) => `
                <div class="card" style="background:#fff; padding:16px; border-radius:12px; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span style="font-size:1.2rem; font-weight:bold; color:#2563eb;">${w.word || ''}</span>
                        <span style="font-size:0.75rem; background:#eff6ff; color:#1d4ed8; padding:2px 8px; border-radius:4px; font-weight:600;">${w.type || ''}</span>
                    </div>
                    <div style="font-size:1.05rem; color:#dc2626; font-weight:600; margin-bottom:10px;">${w.turkish || ''}</div>
                    <div style="background:#f8fafc; padding:8px 12px; border-radius:6px; font-size:0.85rem; color:#475569;">
                        <p style="margin:2px 0;"><strong>EN:</strong> ${w.example_en || ''}</p>
                        <p style="margin:2px 0;"><strong>TR:</strong> ${w.example_tr || ''}</p>
                    </div>
                </div>
            `).join('');
        }

    } catch (e) {
        if (sceneBanner) sceneBanner.innerHTML = `<h3 style="color: #dc2626;">Dosya Bulunamadı</h3>`;
        if (content) {
            content.innerHTML = `
                <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #fecaca; color: #dc2626; grid-column: 1 / -1;">
                    <p style='font-weight: bold; margin: 0 0 5px 0;'>⚠️ Seçilen JSON dosyası sunucuda mevcut değil.</p>
                    <p style='margin: 0; font-size: 0.9em; color: #64748b;'>Aranan yol: <code>data/${fileName}.json</code></p>
                </div>
            `;
        }
    }
}
