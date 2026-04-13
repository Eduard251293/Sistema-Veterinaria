document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Capturamos los datos del formulario
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = document.querySelector('.btn-login');

    // Estado visual: Cargando
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
    btn.disabled = true;

    try {
        // CONSUMO DEL SERVICIO
        // Cambia la URL por la de tu microservicio (ej. http://localhost:8000/login)
        const response = await fetch('http://127.0.0.1:8000/productos/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                //email: email,
                //password: password
                id: 1,
                nombre: 'Producto 25',
                precio: 25.6,
                stock: 10
            })
        });

        const data = await response.json();

        if (response.ok) {
            // ÉXITO: Guardamos el token para futuros servicios (RF2/RF3)
            sessionStorage.setItem('token', data.access_token);
            alert("Acceso concedido. ¡Bienvenido, Doctor!");
            window.location.href = "dashboard.html";
        } else {
            // ERROR DEL SERVICIO
            alert("Error: " + (data.detail || "Credenciales inválidas"));
            resetButton(btn);
        }

    } catch (error) {
        console.error("Error de conexión:", error);
        alert("No se pudo conectar con el microservicio. ¿Está prendido Docker?");
        resetButton(btn);
    }
});

function resetButton(btn) {
    btn.innerHTML = 'Ingresar al Sistema';
    btn.disabled = false;
}