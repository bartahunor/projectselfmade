function renderAuthButton() {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user'))
    const authBtn = document.getElementById('auth-btn')

    if (!authBtn) return

    if (token && user) {
        authBtn.textContent = user.username
        authBtn.onclick = () => window.location.href = 'Profil.html'
    } else {
        authBtn.textContent = 'Belépés'
        authBtn.onclick = () => pageRouter('profile')
    }
}

function pageRouter(destination) {
    const token = localStorage.getItem('token')  // ← token alapján, nem loggedIn

    if (destination === 'profile') {
        if (token) {
            window.location.href = 'Profil.html'   // ← ha be van jelentkezve → profil
        } else {
            sessionStorage.setItem('redirectAfterLogin', 'Profil.html')
            window.location.href = 'register.html'  // ← ha nincs → login
        }

    } else if (destination === 'tasks') {
        if (token) {
            window.location.href = 'Tasktype.html'  // ← ha be van jelentkezve → feladatok
        } else {
            sessionStorage.setItem('redirectAfterLogin', 'Tasktype.html')
            window.location.href = 'register.html'
        }
    }
}