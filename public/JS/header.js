async function validateToken() {
    const token = localStorage.getItem('token')
    if (!token) return false

    try {
        const res = await fetch('http://localhost:3000/api/auth/verify', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()

        if (!data.valid) {
            // Lejárt vagy érvénytelen → töröljük
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            return false
        }
        return true
    } catch (err) {
        // Ha a szerver nem elérhető, ne töröljük a tokent
        return false
    }
}

async function renderAuthButton() {
    const authBtn = document.getElementById('auth-btn')
    if (!authBtn) return

    const isValid = await validateToken()
    const user = JSON.parse(localStorage.getItem('user'))

    if (isValid && user) {
        authBtn.textContent = user.username
        authBtn.onclick = () => window.location.href = 'Profil.html'
    } else {
        authBtn.textContent = 'Belépés'
        authBtn.onclick = () => pageRouter('profile')
    }
}

async function pageRouter(destination) {
    const isValid = await validateToken()

    if (destination === 'profile') {
        if (isValid) {
            window.location.href = 'Profil.html'
        } else {
            sessionStorage.setItem('redirectAfterLogin', 'Profil.html')
            window.location.href = 'register.html'
        }
    } else if (destination === 'tasks') {
        if (isValid) {
            window.location.href = 'Tasktype.html'
        } else {
            sessionStorage.setItem('redirectAfterLogin', 'Tasktype.html')
            window.location.href = 'register.html'
        }
    }
}