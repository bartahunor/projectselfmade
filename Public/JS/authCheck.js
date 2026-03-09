async function checkAuth() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'register.html';
        return;
    }

    // Szerver ellenőrzi hogy a token még érvényes-e
    const response = await fetch('http://localhost:3000/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    
    if (!data.valid) {
        localStorage.removeItem('token');
        window.location.href = 'register.html';
    }
}

checkAuth();