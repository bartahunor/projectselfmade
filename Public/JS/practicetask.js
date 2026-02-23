const API_URL = 'http://localhost:3000';
let feladatok = null;
let currentIndex = 0;

async function loadFeladatok() {
    const res = await fetch(`${API_URL}/api/feladatok/utolso`)
    const result = await res.json()

    feladatok = result.data;
    renderFeladat(currentIndex);
}

function renderFeladat(index) {
    const feladat = feladatok[index];

    document.getElementById('question-text').innerText = feladat.kerdes;
    document.getElementById('question-num').innerText = `${index + 1}/${feladatok.length}`;
}

document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentIndex < feladatok.length - 1) {
        currentIndex++;
        renderFeladat(currentIndex);
    }
});

document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        renderFeladat(currentIndex);
    }
});

loadFeladatok();

