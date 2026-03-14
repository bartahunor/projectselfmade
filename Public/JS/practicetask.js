const API_URL = 'http://localhost:3000';
let feladatok = null;
let currentIndex = 0;
const SUPABASE_URL = 'https://rbjynupbmxbfncqbfpxw.supabase.co';
const BUCKET_NAME = 'forras-kepek'; // a bucket neve
let tasks = new Map();

function getSupabaseImageUrl(fileName) {
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`;
}

async function loadFeladatok() {
    const res = await fetch(`${API_URL}/api/feladatok/utolso`)
    const result = await res.json()

    feladatok = result.data;
    renderFeladat(currentIndex);
}

/**
 * Kiolvassa az aktuális feladat mezőjének értékét a típus alapján.
 * @returns {string|null} A megadott válasz, vagy null ha nincs kitöltve.
 */
function getCurrentAnswer(tasktype) {
    const taskContainer = document.getElementById('tasktype');

    switch (tasktype) {
        case 'rovid_valasz':
        case 'hosszu_valasz':
        case 'szamossag': {
            const input = taskContainer.querySelector('input, textarea');
            return input ? input.value.trim() || null : null;
        }
        case 'harom_opcio': 
        case 'feleletvalasztos': {
            const checked = taskContainer.querySelector('input[type="radio"]:checked');
            return checked ? checked.value : null;
        }
        case 'tobb_valasz': {
            const checked = taskContainer.querySelectorAll('input[type="checkbox"]:checked');
            if (checked.length === 0) return null;
            return [...checked].map(el => el.value);
        }
        case 'igaz_hamis': {
            // A gombokhoz data-value attribútumot használunk (ld. taskInteractionField)
            const selected = taskContainer.querySelector('button[data-selected="true"]');
            return selected ? selected.dataset.value : null;
        }
        case 'parosito': {
            const selects = taskContainer.querySelectorAll('select');
            const result = {};
            selects.forEach((select, index) => {
                result[`${index + 1}`] = select.value || null;
            });
            return result;
        }
        case 'tablazatos_feladat': {
            const inputs = taskContainer.querySelectorAll('input[data-oszlop]');
            const result = {};
            inputs.forEach(input => {
                const key = `${input.dataset.sor}_${input.dataset.oszlop}`;
                result[key] = input.value.trim() || null;
            });
            return Object.keys(result).length > 0 ? result : null;
        }
        default:
            return null;
    }
}

function taskInteractionField(tasktype, feladat = null) {
    const taskContainer = document.getElementById('tasktype');
    taskContainer.innerHTML = ''; // Előző tartalom törlése
    
    const focusClasses = [
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-[#351F5B]',
        'focus:ring-offset-2',
        'focus:ring-offset-white',
        'dark:focus:ring-offset-[#191022]',
    ];

    switch(tasktype) {
        case 'rovid_valasz':
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Írd be a válaszod...';
            input.classList.add(
                'w-full',
                'px-4',
                'py-3',
                'border',
                'border-slate-300',
                'dark:border-slate-600',
                'rounded-lg',
                ...focusClasses,
                'dark:bg-slate-800',
                'dark:text-white',
                'text-base',
                'transition-all'
            );
            taskContainer.appendChild(input);
            break;
            
        case 'hosszu_valasz':
            const textarea = document.createElement('textarea');
            textarea.placeholder = 'Írd ki a válaszod...';
            textarea.rows = 6;
            textarea.classList.add(
                'w-full',
                'px-4',
                'py-3',
                'border',
                'border-slate-300',
                'dark:border-slate-600',
                'rounded-lg',
                ...focusClasses,
                'dark:bg-slate-800',
                'dark:text-white',
                'text-base',
                'resize-y',
                'transition-all'
            );
            taskContainer.appendChild(textarea);
            break;
            
        case 'feleletvalasztos':
            const options = ['A', 'B', 'C', 'D'];
            const optionsDiv = document.createElement('div');
            optionsDiv.classList.add('space-y-3');
            
            options.forEach((option) => {
                const label = document.createElement('label');
                label.classList.add(
                    'flex',
                    'items-center',
                    'p-3',
                    'border',
                    'border-slate-200',
                    'dark:border-slate-700',
                    'rounded-lg',
                    'cursor-pointer',
                    'hover:bg-slate-50',
                    'dark:hover:bg-slate-800',
                    'transition-colors',
                    'focus-within:ring-2',
                    'focus-within:ring-[#351F5B]',
                    'focus-within:ring-offset-2',
                    'focus-within:ring-offset-white',
                    'dark:focus-within:ring-offset-[#191022]',
                    'rounded-lg'
                );
                
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'question-option';
                radio.value = option;
                radio.classList.add(
                    'w-4',
                    'h-4',
                    'text-[#351F5B]',
                    'focus:ring-[#351F5B]',
                    'focus:ring-2',
                    'focus:ring-offset-1',
                    'dark:bg-slate-800'
                );
                
                const span = document.createElement('span');
                span.classList.add('ml-3', 'text-slate-700', 'dark:text-slate-300');
                span.textContent = `${option}. lehetőség`;
                
                label.appendChild(radio);
                label.appendChild(span);
                optionsDiv.appendChild(label);
            });
            
            taskContainer.appendChild(optionsDiv);
            break;
        
        case 'harom_opcio':
            const numsDiv = document.createElement('div');
            numsDiv.classList.add('space-y-3');
            
            const valaszok = feladat?.valaszok ?? [];
            
            valaszok.forEach((valasz, index) => {
                const optionValue = String(index + 1);
                
                const label = document.createElement('label');
                label.classList.add(
                    'flex', 'items-center', 'p-3', 'border',
                    'border-slate-200', 'dark:border-slate-700', 'rounded-lg',
                    'cursor-pointer', 'hover:bg-slate-50', 'dark:hover:bg-slate-800',
                    'transition-colors', 'focus-within:ring-2',
                    'focus-within:ring-[#351F5B]', 'focus-within:ring-offset-2',
                    'focus-within:ring-offset-white', 'dark:focus-within:ring-offset-[#191022]'
                );
                
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'question-option';
                radio.value = optionValue;
                radio.classList.add(
                    'w-4', 'h-4', 'text-[#351F5B]',
                    'focus:ring-[#351F5B]', 'focus:ring-2',
                    'focus:ring-offset-1', 'dark:bg-slate-800'
                );
                
                const span = document.createElement('span');
                span.classList.add('ml-3', 'text-slate-700', 'dark:text-slate-300');
                span.textContent = `${optionValue}. ${valasz}`;
                
                label.appendChild(radio);
                label.appendChild(span);
                numsDiv.appendChild(label);
            });
            
            taskContainer.appendChild(numsDiv);
            break;

        case 'tobb_valasz':
            const multiDiv = document.createElement('div');
            multiDiv.classList.add('space-y-3');
            
            const multiValaszok = feladat?.valaszok ?? [];
            
            multiValaszok.forEach((valasz, index) => {
                const optionValue = String(index + 1);
                
                const label = document.createElement('label');
                label.classList.add(
                    'flex', 'items-center', 'p-3', 'border',
                    'border-slate-200', 'dark:border-slate-700', 'rounded-lg',
                    'cursor-pointer', 'hover:bg-slate-50', 'dark:hover:bg-slate-800',
                    'transition-colors', 'focus-within:ring-2',
                    'focus-within:ring-[#351F5B]', 'focus-within:ring-offset-2',
                    'focus-within:ring-offset-white', 'dark:focus-within:ring-offset-[#191022]'
                );
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.name = 'question-option';
                checkbox.value = optionValue;
                checkbox.classList.add(
                    'w-4', 'h-4', 'text-[#351F5B]',
                    'focus:ring-[#351F5B]', 'focus:ring-2',
                    'focus:ring-offset-1', 'dark:bg-slate-800',
                    'rounded'  // checkbox-hoz kerekített sarok
                );
                
                const span = document.createElement('span');
                span.classList.add('ml-3', 'text-slate-700', 'dark:text-slate-300');
                span.textContent = `${optionValue}. ${valasz}`;
                
                label.appendChild(checkbox);
                label.appendChild(span);
                multiDiv.appendChild(label);
            });
            
            taskContainer.appendChild(multiDiv);
            break;

        case 'igaz_hamis':
            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('flex', 'gap-4');
            
            const trueBtn = document.createElement('button');
            trueBtn.textContent = 'Igaz';
            trueBtn.dataset.value = 'igaz';
            trueBtn.classList.add(
                'flex-1',
                'py-3',
                'px-4',
                'border',
                'border-green-500',
                'text-green-600',
                'dark:text-green-400',
                'rounded-lg',
                'hover:bg-green-50',
                'dark:hover:bg-green-900/20',
                ...focusClasses,
                'transition-all',
                'font-medium'
            );
            
            const falseBtn = document.createElement('button');
            falseBtn.textContent = 'Hamis';
            falseBtn.dataset.value = 'hamis';
            falseBtn.classList.add(
                'flex-1',
                'py-3',
                'px-4',
                'border',
                'border-red-500',
                'text-red-600',
                'dark:text-red-400',
                'rounded-lg',
                'hover:bg-red-50',
                'dark:hover:bg-red-900/20',
                ...focusClasses,
                'transition-all',
                'font-medium'
            );

            // Kijelölés kezelése – toggle data-selected
            [trueBtn, falseBtn].forEach(btn => {
                btn.addEventListener('click', () => {
                    [trueBtn, falseBtn].forEach(b => b.dataset.selected = 'false');
                    btn.dataset.selected = 'true';
                });
            });
            
            buttonContainer.appendChild(trueBtn);
            buttonContainer.appendChild(falseBtn);
            taskContainer.appendChild(buttonContainer);
            break;
            
        case 'parosito':
            const pairs = ['A', 'B', 'C'];
            const pairsContainer = document.createElement('div');
            pairsContainer.classList.add('space-y-4');
            
            pairs.forEach((item, index) => {
                const pairDiv = document.createElement('div');
                pairDiv.classList.add(
                    'flex',
                    'items-center',
                    'gap-4',
                    'p-3',
                    'bg-slate-50',
                    'dark:bg-slate-800',
                    'rounded-lg'
                );
                
                const leftItem = document.createElement('span');
                leftItem.classList.add('flex-1', 'font-medium');
                leftItem.textContent = `${index + 1}. elem`;
                
                const select = document.createElement('select');
                select.classList.add(
                    'flex-1',
                    'p-2',
                    'border',
                    'border-slate-300',
                    'dark:border-slate-600',
                    'rounded-lg',
                    'dark:bg-slate-700',
                    'dark:text-white',
                    ...focusClasses,
                    'transition-all'
                );
                
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Válassz párt...';
                defaultOption.disabled = true;
                defaultOption.selected = true;
                select.appendChild(defaultOption);
                
                ['Pár 1', 'Pár 2', 'Pár 3'].forEach(pair => {
                    const option = document.createElement('option');
                    option.value = pair;
                    option.textContent = pair;
                    select.appendChild(option);
                });
                
                pairDiv.appendChild(leftItem);
                pairDiv.appendChild(select);
                pairsContainer.appendChild(pairDiv);
            });
            
            taskContainer.appendChild(pairsContainer);
            break;
            
        case 'szamossag':
            const numberContainer = document.createElement('div');
            numberContainer.classList.add('flex', 'items-center', 'gap-3');
            
            const numberInput = document.createElement('input');
            numberInput.type = 'number';
            numberInput.min = '0';
            numberInput.step = '1';
            numberInput.value = '0';
            numberInput.classList.add(
                'w-32',
                'px-4',
                'py-3',
                'border',
                'border-slate-300',
                'dark:border-slate-600',
                'rounded-lg',
                ...focusClasses,
                'dark:bg-slate-800',
                'dark:text-white',
                'transition-all'
            );
            
            const unit = document.createElement('span');
            unit.classList.add('text-slate-600', 'dark:text-slate-400');
            unit.textContent = 'db';
            
            numberContainer.appendChild(numberInput);
            numberContainer.appendChild(unit);
            taskContainer.appendChild(numberContainer);
            break;
        case 'tablazatos_feladat': {
            const sorok = feladat?.tablazatos_sorok ?? [];
            if (sorok.length === 0) break;

            // Oszlopfejlécek az első sorból
            const elsoSor = sorok[0];
            const oszlopok = ['oszlop1', 'oszlop2', 'oszlop3', 'oszlop4', 'oszlop5']
                .filter(o => elsoSor[`${o}_nev`] != null);

            const table = document.createElement('table');
            table.classList.add('w-full', 'border-collapse', 'text-sm');

            // Fejléc sor
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            oszlopok.forEach(o => {
                const th = document.createElement('th');
                th.textContent = elsoSor[`${o}_nev`];
                th.classList.add(
                    'px-4', 'py-2', 'text-left', 'font-medium',
                    'border', 'border-slate-300', 'dark:border-slate-600',
                    'bg-slate-100', 'dark:bg-slate-700',
                    'text-slate-700', 'dark:text-slate-200'
                );
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            // Adatsorok
            const tbody = document.createElement('tbody');
            sorok.forEach((sor, sorIndex) => {
                const tr = document.createElement('tr');
                tr.classList.add(
                    sorIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50',
                    'dark:' + (sorIndex % 2 === 0 ? 'bg-slate-800' : 'bg-slate-750')
                );

                oszlopok.forEach(o => {
                    const td = document.createElement('td');
                    td.classList.add(
                        'px-4', 'py-2',
                        'border', 'border-slate-300', 'dark:border-slate-600'
                    );

                    const ertek = sor[`${o}_ertek`];
                    const kitoltendo = ertek?.startsWith('§');

                    if (kitoltendo) {
                        // Üres cella → input mező
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.placeholder = '...';
                        input.dataset.sor = sor.id;
                        input.dataset.oszlop = o;
                        input.dataset.helyes = ertek.slice(1); // § levágva, ellenőrzéshez
                        input.classList.add(
                            'w-full', 'px-2', 'py-1',
                            'border', 'border-slate-300', 'dark:border-slate-500',
                            'rounded', 'dark:bg-slate-700', 'dark:text-white',
                            'focus:outline-none', 'focus:ring-2', 'focus:ring-[#351F5B]'
                        );
                        td.appendChild(input);
                    } else {
                        // Előre kitöltött → sima szöveg
                        td.textContent = ertek ?? '';
                        td.classList.add('text-slate-700', 'dark:text-slate-300');
                    }

                    tr.appendChild(td);
                });

                tbody.appendChild(tr);
            });

            table.appendChild(tbody);
            taskContainer.appendChild(table);
            break;
        }
        default:
            const placeholder = document.createElement('div');
            placeholder.classList.add(
                'p-6',
                'text-center',
                'text-slate-500',
                'dark:text-slate-400',
                'border-2',
                'border-dashed',
                'border-slate-300',
                'dark:border-slate-700',
                'rounded-lg'
            );
            placeholder.innerHTML = `
                <span class="material-icons text-4xl mb-2">edit_note</span>
                <p>Ismeretlen feladattípus: ${tasktype}</p>
                <p class="text-sm">A feladat megjelenítése nem lehetséges</p>
            `;
            taskContainer.appendChild(placeholder);
    }
}

function renderFeladat(index) {
    const feladat = feladatok[index];

    document.getElementById('question-text').innerText = feladat.kerdes;
    document.getElementById('question-num').innerText = `${index + 1}/${feladatok.length}`;


    const srcContainer = document.getElementById('source-material');

    if (feladat.forras_kep != null) {
        const img = document.createElement('img');
        img.src = getSupabaseImageUrl(feladat.forras_kep);
        img.id = 'source-image';
        img.style.display = 'block';
        img.classList.add(
            "w-full",
            "h-full",
            "object-contain"
        );
        srcContainer.innerHTML = '';
        srcContainer.appendChild(img);
    } else if (feladat.forras_kep == null) {
        const src_text = document.createElement('p');
        src_text.id = 'source-text';
        src_text.innerText = feladat.forras_szoveg;
        src_text.classList.add(
            "w-full",
            "h-full",
            "p-6",
            "overflow-y-auto",
            "text-sm",
            "text-slate-700",
            "dark:text-slate-300",
            "leading-relaxed"
        );
        srcContainer.innerHTML = '';
        srcContainer.appendChild(src_text);
    } else {
        const placeholder = document.createElement('div');
        placeholder.classList.add(
            "w-full",
            "h-full",
            "flex",
            "items-center",
            "justify-center",
            "text-slate-300",
            "dark:text-slate-600",
            "flex-col",
            "gap-3"
        )
        placeholder.id = 'placeholder';
        placeholder.innerHTML = `<span class="material-icons text-5xl">image_not_supported</span>
            <span class="text-sm">Nincs forrásanyag</span>`;
        srcContainer.innerHTML = '';
        srcContainer.appendChild(placeholder);
    }
        
    taskInteractionField(feladat.tipus, feladat);

    const nextBtn = document.getElementById('nextBtn')
    const finishBtn = document.getElementById('finishBtn')

    if (index === feladatok.length - 1) {
        nextBtn.textContent = 'Vizsga befejezése'
        finishBtn.classList.add('hidden')
    } else {
        nextBtn.textContent = 'Következő'
        finishBtn.classList.remove('hidden')
    }
}

document.getElementById('nextBtn').addEventListener('click', async () => {
    const feladat = feladatok[currentIndex];
    const valasz = getCurrentAnswer(feladat.tipus);
    tasks.set(feladat.id, { feladat, valasz });

    // Ha utolsó kérdés → ugyanaz mint a finishBtn
    if (currentIndex === feladatok.length - 1) {
        const tasksArray = Array.from(tasks.values());
        try {
            const response = await fetch('/api/eredmenyek', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tasks: tasksArray })
            });
            const data = await response.json();
            console.log('✅ Válaszok megérkeztek:', data);
            window.location.href = 'Result.html';
        } catch (error) {
            console.error('❌ Hiba:', error);
        }
        return
    }

    // Egyébként következő kérdés
    currentIndex++;
    renderFeladat(currentIndex);
});

document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        renderFeladat(currentIndex);
    }
});
loadFeladatok();

document.getElementById('finishBtn').addEventListener('click', async () => {
    const feladat = feladatok[currentIndex];
    const valasz = getCurrentAnswer(feladat.tipus);

    tasks.set(feladat.id, { feladat, valasz });

    const tasksArray = Array.from(tasks.values());

    try {
        const response = await fetch('/api/eredmenyek', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tasks: tasksArray })
        });

        const data = await response.json();
        console.log('✅ Válaszok megérkeztek a szerverre:', data);
        window.location.href = 'Result.html';

    } catch (error) {
        console.error('❌ Hiba:', error);
    }
});