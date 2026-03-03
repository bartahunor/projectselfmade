const API_URL = 'http://localhost:3000';

let results = null;
async function loadResults() {
    const res = await fetch(`${API_URL}/api/eredmenyek`)
    const data = await res.json()

    console.log(data)
    results = data.eredmenyek;
    renderResults();
}
loadResults();

function renderResults() {
    const quest_container = document.getElementById('question-results');
    quest_container.innerHTML = '';

    let question_number = 1;
    results.forEach(result => {
        const question_div = document.createElement('div');
        question_div.classList.add('bg-white', 'dark:bg-slate-800', 'rounded-xl', 'border', 'border-slate-200', 'dark:border-slate-700', 'overflow-hidden', 'shadow-sm');
        
        switch(result.ertek) {
            case "helyes":
                question_div.innerHTML = `
                    <div class="p-6 border-l-4 border-emerald-500">
                    <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-3">
                    <span class="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold px-2.5 py-1 rounded text-xs uppercase tracking-wider">Helyes</span>
                    <h3 class="font-bold text-lg">${question_number}. Feladat: ${result.temakor}</h3>
                    </div>
                    <span class="text-slate-400 font-medium">${result.pont}/${result.max_pont} pont</span>
                    </div>
                    <p class="text-slate-600 dark:text-slate-400 mb-4">${result.kerdes}</p>
                    <div class="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                    <p class="text-sm font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                    <span class="material-symbols-outlined text-sm">check_circle</span>
                                                            Te válaszod: ${result.valasz}
                                                        </p>
                    </div>
                    </div>
                `;
                question_number++;
                break;
        }

        quest_container.appendChild(question_div);
    });
}
