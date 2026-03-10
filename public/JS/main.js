const API_URL = 'http://localhost:3000';
async function includeHTML(id, file) {  
  const response = await fetch(file);
  if (response.ok) {
    document.getElementById(id).innerHTML = await response.text();
  } else {
    console.error(`Nem sikerült betölteni: ${file}`);
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  await includeHTML("header", "/Pieces/header.html");
  await includeHTML("footer", "/Pieces/footer.html");
  renderAuthButton();
  loadTantargyFeladatok();

});



async function loadTantargyFeladatok() {
    const resfel = await fetch(`${API_URL}/api/feladatok/szuro_tanfel`)
    const feladatok = await resfel.json()

    const restem = await fetch(`${API_URL}/api/temakorok/szuro_tantargyossz`)
    const temak = await restem.json()

    let infok = new Map()
    for (const feladat of feladatok) {
        infok.set(feladat.tantargy, {
            tantargy: feladat.tantargy,
            feladat_szam: feladat.darab,
            temakor_szam: temak.find(t => t.tantargy === feladat.tantargy)?.darab || 'N/A'
        })
    }

    for (const [tantargy, info] of infok) {
        switch (tantargy) {
            case 'Irodalom':
                const literatureStats = document.getElementById('literature-stats');
                if (literatureStats) {
                    literatureStats.innerHTML = `${info.temakor_szam} témakör • ${info.feladat_szam} feladat`;
                }
                break
            case 'Történelem':
                const historyStats = document.getElementById('history-stats');
                if (historyStats) {
                    historyStats.innerHTML = `${info.temakor_szam} témakör • ${info.feladat_szam} feladat`;
                }
                break
        }
    }
}

