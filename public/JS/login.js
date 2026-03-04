const switchLink = document.getElementById('switch-link');
const formTitle = document.getElementById('form-title');
const formSubtitle = document.getElementById('form-subtitle');
const usernameContainer = document.getElementById('username-container');
const rememberContainer = document.getElementById('remember-container');
const submitButton = document.getElementById('submit-btn');
const switchText = document.getElementById('switch-text');
const authForm = document.getElementById('auth-form');
const emailInput = authForm.email;
const passwordInput = authForm.password;

let isLogin = true;

// Form váltás (Bejelentkezés <-> Regisztráció)
switchLink.addEventListener('click', (e) => {
    e.preventDefault();
    isLogin = !isLogin;

    if (isLogin) {
        formTitle.textContent = 'Bejelentkezés';
        formSubtitle.textContent = 'Add meg az adataidat a továbblépéshez';
        usernameContainer.classList.add('hidden');
        rememberContainer.classList.remove('hidden');
        submitButton.textContent = 'Bejelentkezés';
    } else {
        formTitle.textContent = 'Regisztráció';
        formSubtitle.textContent = 'Hozd létre fiókod, hogy hozzáférj minden tananyaghoz';
        usernameContainer.classList.remove('hidden');
        rememberContainer.classList.add('hidden');
        submitButton.textContent = 'Regisztrálok';
    }

    switchText.innerHTML = isLogin ? 
        'Még nincs fiókod? <a href="#" id="switch-link" class="text-primary font-bold hover:underline ml-1">Regisztrálj!</a>' :
        'Már van fiókod? <a href="#" id="switch-link" class="text-primary font-bold hover:underline ml-1">Jelentkezz be!</a>';

    document.getElementById('switch-link').addEventListener('click', switchLinkClick);
});

function switchLinkClick(e) {
    e.preventDefault();
    switchLink.click();
}

// **Bejelentkezés gomb működés**
// Form submit
const API_URL = 'http://localhost:3000';
authForm.addEventListener('submit', async function(e){
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if(email === "" || password === ""){
        alert("Kérlek töltsd ki az email és jelszó mezőket!");
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Betöltés...';

    try {
        if(isLogin) {
            // ===== BEJELENTKEZÉS =====
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email: email, 
                    password: password 
                })
            });

            const data = await response.json();

            if(data.success) {
                // Felhasználó adatok mentése
                localStorage.setItem('user', JSON.stringify(data.user));
                alert('Sikeres bejelentkezés!');
                // Átirányítás
                window.location.href = 'Profil.html';
            } else {
                alert(data.message);
            }

        } else {
            // ===== REGISZTRÁCIÓ =====
            const username = document.querySelector('input[name="username"]').value.trim();
            
            if(username === "") {
                alert("Kérlek add meg a felhasználónevet!");
                submitButton.disabled = false;
                submitButton.textContent = 'Regisztrálok';
                return;
            }

            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    username: username,
                    email: email, 
                    password: password 
                })
            });

            const data = await response.json();

            if(data.success) {
                alert('Sikeres regisztráció! Most bejelentkezhetsz.');
                // Váltás bejelentkezési módba
                switchLink.click();
                // Form törlése
                authForm.reset();
            } else {
                alert(data.message);
            }
        }

    } catch(error) {
        console.error('Hiba:', error);
        alert('Hálózati hiba! Ellenőrizd, hogy a szerver fut-e (http://localhost:3000)');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = isLogin ? 'Bejelentkezés' : 'Regisztrálok';
    }
});