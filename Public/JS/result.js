const API_URL = 'http://localhost:3000';

let results = null;
async function loadResults() {
    const res = await fetch(`${API_URL}/api/eredmenyek`)
    const data = await res.json()

    console.log(data)
    results = data;
}
loadResults();
