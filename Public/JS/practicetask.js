const API_URL = 'http://localhost:3000';
let feladatok = null;
let currentIndex = 0;
const SUPABASE_URL = 'https://rbjynupbmxbfncqbfpxw.supabase.co';
const BUCKET_NAME = 'forras-kepek'; // a bucket neve

function getSupabaseImageUrl(fileName) {
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`;
}

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





