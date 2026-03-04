
const API_URL = 'http://localhost:3000';

let results = null;
let total_points = 0;
let total_max_points = 0;
window.addEventListener("DOMContentLoaded", async () => {
  await includeHTML("header", "/Pieces/header.html");
  await includeHTML("footer", "/Pieces/footer.html");

    loadResults();
});

async function includeHTML(id, file) {  
  const response = await fetch(file);
  if (response.ok) {
    document.getElementById(id).innerHTML = await response.text();
  } else {
    console.error(`Nem sikerült betölteni: ${file}`);
  }
};

async function loadResults() {
    const res = await fetch(`${API_URL}/api/eredmenyek`)
    const data = await res.json()

    console.log(data)
    results = data.eredmenyek;
    total_points = data.osszpont;
    total_max_points = data.maxpont;
    calculateStats()
    calculateTopicStats();
    renderResults();
}

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
            case "hibas":
                question_div.innerHTML = `
                    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                        <div class="p-6 border-l-4 border-red-500">
                            <div class="flex justify-between items-start mb-4">
                                <div class="flex items-center gap-3">
                                    <span class="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-bold px-2.5 py-1 rounded text-xs uppercase tracking-wider">Hibás</span>
                                    <h3 class="font-bold text-lg">${question_number}. Feladat: ${result.temakor}</h3>
                                </div>
                                <span class="text-red-400 font-medium">${result.pont}/${result.max_pont} pont</span>
                            </div>
                            <p class="text-slate-600 dark:text-slate-400 mb-4">${result.kerdes}</p>
                            <div class="flex flex-col gap-2">
                                <div class="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                                    <p class="text-sm font-semibold text-red-800 dark:text-red-400 flex items-center gap-2">
                                        <span class="material-symbols-outlined text-sm">cancel</span>
                                        Te válaszod: ${result.valasz}
                                    </p>
                                </div>
                                <div class="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                                    <p class="text-sm font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                                        <span class="material-symbols-outlined text-sm">verified</span>
                                        Helyes válasz: ${result.helyes_valasz}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                question_number++;
                break;
            case "reszben_helyes":
                question_div.innerHTML = `
                    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                        <div class="p-6 border-l-4 border-amber-500">
                            <div class="flex justify-between items-start mb-4">
                                <div class="flex items-center gap-3">
                                    <span class="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-bold px-2.5 py-1 rounded text-xs uppercase tracking-wider">Részben helyes</span>
                                    <h3 class="font-bold text-lg">${question_number}. Feladat: ${result.temakor}</h3>
                                </div>
                                <span class="text-amber-600 font-medium">${result.pont}/${result.max_pont} pont</span>
                            </div>
                            <p class="text-slate-600 dark:text-slate-400 mb-4">${result.kerdes}</p>
                            <div class="flex flex-col gap-2">
                                <div class="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30">
                                    <p class="text-sm font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2">
                                        <span class="material-symbols-outlined text-sm">warning</span>
                                        Te válaszod: ${result.valasz}
                                    </p>
                                </div>
                                <div class="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                                    <p class="text-sm font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                                        <span class="material-symbols-outlined text-sm">verified</span>
                                        Helyes válasz: ${result.helyes_valasz}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                question_number++;
                break;
        }

        quest_container.appendChild(question_div);
    });
}

function calculateStats() {
	const totalp = document.getElementById('your-points');
	const accbar = document.getElementById('accuracy-bar');
	const acctext = document.getElementById('accuracy-text');

	const percent = Math.round((total_points / total_max_points) * 100);

	totalp.innerText = `${total_points} pont`;
	accbar.style.width = `${percent}%`;
	acctext.innerText = `${percent}%`;
}

function calculateTopicStats() {
    let topic_stats = {};
    results.forEach(result => {
        if (!topic_stats[result.temakor]) {
            topic_stats[result.temakor] = { correct: 0, total: 0 };
        }
        if (result.ertek === "helyes") {
            topic_stats[result.temakor].correct += result.pont;
            topic_stats[result.temakor].total += result.max_pont;
        } else if (result.ertek === "reszben_helyes") {
            topic_stats[result.temakor].correct += result.pont;
            topic_stats[result.temakor].total += result.max_pont;
        } else {
            topic_stats[result.temakor].total += result.max_pont;
        }
    });

    const topic_table = document.getElementById('topic-table');
    topic_table.innerHTML = '';

    Object.entries(topic_stats).forEach(([temakor, stat]) => {
        const percent = Math.round((stat.correct / stat.total) * 100);

        let barColor;
        if (percent >= 90) {
            barColor = 'bg-emerald-600';
        } else if (percent >= 70) {
            barColor = 'bg-emerald-400';
        } else if (percent >= 50) {
            barColor = 'bg-amber-400';
        } else if (percent >= 30) {
            barColor = 'bg-orange-500';
        } else {
            barColor = 'bg-red-500';
        }

        let percentDisplay = percent;
        if (percent == 0)
            percentDisplay = 1; 

        const topic_div = document.createElement('div');
        topic_div.innerHTML = `
            <div class="flex justify-between mb-2">
                <span class="font-semibold">${temakor}</span>
                <span class="text-slate-500">${stat.correct}/${stat.total} (${percent}%)</span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                <div class="${barColor} h-full rounded-full chart-bar" style="width: ${percentDisplay}%"></div>
            </div>
        `;
        topic_table.appendChild(topic_div);
    });
}