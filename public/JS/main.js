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
  
  setActiveMenuItem();
  // Várunk egy kicsit, hogy a HTML elemek tényleg betöltődjenek

});

function setActiveMenuItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'kezdooldal.html';
    const menuLinks = document.querySelectorAll('.alap-right .item a');
    console.log('Aktuális oldal:', currentPage);
    console.log('Talált linkek:', menuLinks.length);

    menuLinks.forEach(link => {
        const href = link.getAttribute('href');
        console.log('Ellenőrzés:', href, '===', currentPage);
        if (href === currentPage || (currentPage === '' && href === 'kezdooldal.html')) {
            link.classList.add('active');
            console.log('✅ Aktív link beállítva:', href);
        }
    });
}

function toggleMenu() {
    const menu = document.querySelector('.alap-right');
    const toggle = document.querySelector('.menu-toggle');
    menu.classList.toggle('active');
    toggle.classList.toggle('active');
}

// Bezárja a menüt, ha linkre kattintunk
document.querySelectorAll('.alap-right a').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.alap-right').classList.remove('active');
    });
});

async function loadTantargyFeladatok() {
    const res = await fetch(`${API_URL}/api/feladatok/szuro_tanfel`)
    const data = await res.json()

    data.forEach(n => {
      
    });
}