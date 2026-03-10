const API_URL = 'http://localhost:3000';

window.addEventListener("DOMContentLoaded", async () => {
  await includeHTML("header", "/Pieces/header.html");
  await includeHTML("footer", "/Pieces/footer.html");
  renderAuthButton();

  await loadPoints()
  pointsP = document.getElementById('points')
  pointsTodayP = document.getElementById('points-today')
  pointsP.innerText = `${points} pont`;
  pointsTodayP.innerText = `+${points_today} ma`;

  await loadRanking()
  rankP = document.getElementById('rank')
  rankP.innerText = `${rank}. hely`;

  await loadTests()
  let testsTable = document.getElementById('previous-tests')
  testsTable.innerHTML = ''
  prevTests.forEach(t => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
            <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">${t.nev}</td>
            <td class="px-6 py-4 text-sm text-slate-500">${t.datum.split('T')[0]}</td>
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <div class="h-2 w-24 rounded-full bg-slate-200 dark:bg-slate-700">
                        <div class="h-full rounded-full bg-primary" style="width: ${Math.round(t.osszpont / t.maxpont * 100)}%"></div>
                    </div>
                    <span class="text-sm font-bold text-primary">${Math.round(t.osszpont / t.maxpont * 100)}%</span>
                </div>
            </td>`;
    tr.classList.add('hover:bg-primary/5', 'transition-colors');
    testsTable.appendChild(tr)
  });

  await loadAktivNapok()
  
  const userP = document.getElementById('user')
  const emailP = document.getElementById('user-email')
  emailP.innerText = getEmailFromToken();
  userP.innerText = getUserFromToken();
});

let points = 0;
let points_today = 0;
let rank = 0;
let prevTests = null;

async function includeHTML(id, file) {  
  const response = await fetch(file);
  if (response.ok) {
    document.getElementById(id).innerHTML = await response.text();
  } else {
    console.error(`Nem sikerült betölteni: ${file}`);
  }
};

async function loadPoints() {
    const token = localStorage.getItem('token')
    if (!token) return

    const res = await fetch(`${API_URL}/api/tesztek/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })

    const data = await res.json()
    if (!data.success) return

    points = data.osszes.pont
    points_today = data.mai.pont
}

async function loadRanking() {
  const token = localStorage.getItem('token')
  if (!token) return

  const res = await fetch(`${API_URL}/api/tesztek/ranglista`, {
      headers: { 'Authorization': `Bearer ${token}` }
  })

  const data = await res.json()
  if (!data.success) return

  rank = data.helyezes
}

async function loadTests() {
  const token = localStorage.getItem('token')
  if (!token) return

  const res = await fetch(`${API_URL}/api/tesztek/elozmenyek`, {
      headers: { 'Authorization': `Bearer ${token}` }
  })

  const data = await res.json()
  if (!data.success) return

  prevTests = data.tesztek
}

function getEmailFromToken() {
    const token = localStorage.getItem('token')
    if (!token) return null
    
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.email
}

function getUserFromToken() {
  const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user'))

    if (token && user) {
        return user.username
    }
    return null
}


let aktivNapok = new Set()
let currentCalendarDate = new Date()

async function loadAktivNapok() {
    const token = localStorage.getItem('token')
    if (!token) return

    const res = await fetch(`${API_URL}/api/tesztek/aktivnapok`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })

    const data = await res.json()
    if (!data.success) return

    // Set-be rakjuk a gyors kereséshez
    aktivNapok = new Set(data.napok.map(n => n.toString().split('T')[0]))

    const szam = document.getElementById('aktiv-napok-szam')
    if (szam) szam.innerText = `${aktivNapok.size} aktív nap összesen`

    renderCalendar()
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid')
    const title = document.getElementById('month-title')
    if (!grid || !title) return

    const ev = currentCalendarDate.getFullYear()
    const honap = currentCalendarDate.getMonth()

    const honapNevek = ['Január','Február','Március','Április','Május','Június',
                        'Július','Augusztus','Szeptember','Október','November','December']
    title.textContent = `${ev}. ${honapNevek[honap]}`

    grid.innerHTML = ''

    const elsoNap = new Date(ev, honap, 1)
    const utolsoNap = new Date(ev, honap + 1, 0)

    // Hétfőtől kezdjük (0=H, 6=V)
    let elsoHetNap = elsoNap.getDay() - 1
    if (elsoHetNap === -1) elsoHetNap = 6

    // Üres cellák a hónap eleje előtt
    for (let i = 0; i < elsoHetNap; i++) {
        const empty = document.createElement('div')
        grid.appendChild(empty)
    }

    const ma = new Date().toISOString().split('T')[0]

    // Napok
    for (let nap = 1; nap <= utolsoNap.getDate(); nap++) {
        const datum = `${ev}-${String(honap + 1).padStart(2, '0')}-${String(nap).padStart(2, '0')}`
        const aktiv = aktivNapok.has(datum)
        const maVan = datum === ma

        const cell = document.createElement('div')
        cell.textContent = nap
        cell.classList.add(
            'text-center', 'text-xs', 'py-1.5', 'rounded-lg', 'font-medium', 'transition-all'
        )

        if (aktiv) {
            cell.classList.add('bg-primary', 'text-white', 'shadow-sm', 'shadow-primary/30')
        } else if (maVan) {
            cell.classList.add('border-2', 'border-primary', 'text-primary')
        } else {
            cell.classList.add('text-slate-500', 'hover:bg-primary/5')
        }

        grid.appendChild(cell)
    }
}

// Navigáció
document.addEventListener('click', (e) => {
    if (e.target.closest('#prev-month')) {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1)
        renderCalendar()
    }
    if (e.target.closest('#next-month')) {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1)
        renderCalendar()
    }
})