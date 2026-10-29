const API_URL = "http://universities.hipolabs.com/search?country=Romania";
const statusDiv = document.getElementById("status");
const tbody = document.getElementById("tbody");
const qInput = document.getElementById("q");
const exportBtn = document.getElementById("exportBtn");
let allUniversities = [];

function setStatus(text) {
    statusDiv.textContent = text;
}

function render(data) {
    tbody.innerHTML = data.map(u => {
        const site = u.web_pages?.[0] 
            ? `<a href="${u.web_pages[0]}" target="_blank">${u.web_pages[0]}</a>` 
            : "";
        return `
            <tr>
                <td>${u.name || ""}</td>
                <td>${u.country || ""}</td>
                <td>${site}</td>
            </tr>`;
    }).join("");
}

async function loadUniversities() {
    setStatus("Se încarcă...");
    tbody.innerHTML = "";
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        allUniversities = data;
        render(allUniversities);
        setStatus(`Încărcat (${allUniversities.length} rezultate).`);
    } catch (error) {
        setStatus("Eroare la încărcare. Încearcă din nou.");
    }
}

qInput.addEventListener("input", () => {
    const q = qInput.value.trim().toLowerCase();
    const filtered = q 
        ? allUniversities.filter(u => (u.name || "").toLowerCase().includes(q)) 
        : allUniversities;
    render(filtered);
    setStatus(`Filtrate: ${filtered.length} din ${allUniversities.length}.`);
});

function exportCSV(data) {
    if (!data.length) return alert("Nu există date de exportat.");
    const header = ["Nume", "Tara", "Site"];
    const rows = data.map(u => [
        u.name || "",
        u.country || "",
        (u.web_pages && u.web_pages[0]) || ""
    ]);
    
    const csvContent = [header, ...rows]
        .map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(","))
        .join("\n");
        
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "universitati_romania.csv";
    a.click();
    URL.revokeObjectURL(url);
}

exportBtn.addEventListener("click", () => {
    const q = qInput.value.trim().toLowerCase();
    const currentData = q 
        ? allUniversities.filter(u => (u.name || "").toLowerCase().includes(q)) 
        : allUniversities;
    exportCSV(currentData);
});

loadUniversities();