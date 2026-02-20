const subjectBtns = document.querySelectorAll(".subjectBtn");
const levelBtns = document.querySelectorAll(".levelBtn");
const startBtn = document.getElementById("startBtn");

let subject = null;
let level = null;
let selectedYear = null;
let selectedTopic = null;

const API_URL = 'http://localhost:3000';
async function loadTantargyak() {
  const res = await fetch(`${API_URL}/api/tantargyak`)
  const data = await res.json()

  const ul = document.getElementById('subject-list')

  data.forEach(t => {
    const subjectIcons = new Map([
    ["Történelem", "history_edu"],
    ["Matematika", "calculate"],
    ["Irodalom", "menu_book"],
    ["Fizika", "science"],
    ["Földrajz", "public"],
    ["Informatika", "computer"]
    ]);

    const sub_button = document.createElement('button')
    sub_button.classList.add(
        "subjectBtn",
        "p-6",
        "bg-white",
        "dark:bg-primaryDark",
        "border-2",
        "border-transparent",
        "rounded-2xl",
        "transition-all"
    );
    sub_button.dataset.subject = `${t.nev}`
    sub_button.dataset.id = `${t.id}`
    sub_button.innerHTML = `<span class="material-icons text-primary text-4xl mb-3">${subjectIcons.get(t.nev)}</span>
                        <p class="font-semibold">${t.nev}</p>`
    ul.appendChild(sub_button)
  })
}
loadTantargyak();

async function loadTemakorok(tantargy_id) {
  const res = await fetch(`${API_URL}/api/temakorok?tantargy_id=${tantargy_id}`)
  const data = await res.json()

  const ul = document.getElementById('topicSelect')

  ul.innerHTML = '<option value="">-- Válassz témakört --</option>' 

  data.forEach(t => {

    const top_opt = document.createElement('option')
    top_opt.value = `${t.nev}`
    top_opt.innerText = `${t.nev}`
    ul.appendChild(top_opt)
  })
}

async function loadEvek() {
    const res = await fetch(`${API_URL}/api/ev`)
    const data = await res.json()

    const ul = document.getElementById('yearSelect')

    ul.innerHTML = '<option value="">-- Válassz évszámot --</option>' 
    data.forEach(e => {

    const year_opt = document.createElement('option')
    year_opt.value = `${e.ev}`
    year_opt.innerText = `${e.ev}`
    ul.appendChild(year_opt)
  })

}
loadEvek();
// Tantárgy választás
document.getElementById('subject-list').addEventListener('click', (e) => {
    // Megkeressük a legközelebbi .subjectBtn elemet
    const btn = e.target.closest('.subjectBtn');
    if (!btn) return; // Ha nem gombra kattintottunk, kilépünk

    // Összes gomb kijelölésének törlése
    document.querySelectorAll('.subjectBtn').forEach(b => {
        b.classList.remove("border-primary", "bg-primary/10", "shadow-lg", "shadow-primary/20");
    });

    // Aktuális gomb kijelölése
    btn.classList.add("border-primary", "bg-primary/10", "shadow-lg", "shadow-primary/20");
    subject = btn.dataset.subject;

    // Témakör lista ürítése és újratöltése
    const topicSelect = document.getElementById('topicSelect');
    topicSelect.innerHTML = '<option value="">-- Válassz témakört --</option>';
    loadTemakorok(btn.dataset.id);

    checkReady();
});

// Szint választás
levelBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        levelBtns.forEach(b => b.classList.remove("border-primary", "bg-primary/10", "shadow-lg", "shadow-primary/20"));
        btn.classList.add("border-primary", "bg-primary/10", "shadow-lg", "shadow-primary/20");
        level = btn.dataset.level;
        checkReady();
    });
});



// Ellenőrzés
const yearSelect = document.getElementById("yearSelect");
const topicSelect = document.getElementById("topicSelect");

yearSelect.addEventListener("change", () => {
    if (yearSelect.value) {
        // Ha évszámot választottunk, töröljük a témakör választást
        topicSelect.value = "";
        selectedYear = yearSelect.value;
        selectedTopic = null;
    } else {
        selectedYear = null;
    }
    checkReady();
});



topicSelect.addEventListener("change", () => {
    if (topicSelect.value) {
        // Ha témakört választottunk, töröljük az évszám választást
        yearSelect.value = "";
        selectedTopic = topicSelect.value;
        selectedYear = null;
    } else {
        selectedTopic = null;
    }
    checkReady();
});



function checkReady() {
    const isReady = subject && level && (selectedYear || selectedTopic);

    if (isReady) {
        startBtn.disabled = false;
        startBtn.classList.remove("opacity-50", "cursor-not-allowed");
        startBtn.classList.add("hover:scale-105", "hover:shadow-primary/50");
    } else {
        startBtn.disabled = true;
        startBtn.classList.add("opacity-50", "cursor-not-allowed");
        startBtn.classList.remove("hover:scale-105", "hover:shadow-primary/50");
    }
}

// Start gomb kattintás
startBtn.addEventListener("click", () => {
    if (startBtn.disabled) return; 

    let choiceText = selectedYear ? `Évszám: ${selectedYear}` : `Témakör: ${selectedTopic}`;
    
    console.log('Kiválasztott adatok:', {
        subject,
        level,
        year: selectedYear,
        topic: selectedTopic
    });

    alert(`Kiválasztva:\n\nTantárgy: ${subject}\nSzint: ${level}\n${choiceText}`);
    
    // Itt később átirányíthatsz a feladatok oldalára:
    // window.location.href = `feladatok.html?subject=${subject}&level=${level}&year=${selectedYear || ''}&topic=${selectedTopic || ''}`;
});