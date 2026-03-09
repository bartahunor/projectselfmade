const API_URL = 'http://localhost:3000';

window.addEventListener("DOMContentLoaded", async () => {
  await includeHTML("header", "/Pieces/header.html");
  await includeHTML("footer", "/Pieces/footer.html");

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

  const userP = document.getElementById('user')
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

function getUserFromToken() {
    const token = localStorage.getItem('token')
    if (!token) return null
    
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.email
}