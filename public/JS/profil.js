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
