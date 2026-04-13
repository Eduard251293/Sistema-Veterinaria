const API_URL = "http://127.0.0.1:8000/productos/"; // Asegúrate que este sea tu endpoint de C# o FastAPI

async function cargarProductos() {
    // 1. Verificar si hay un token (Seguridad básica)
    const token = sessionStorage.getItem('token');
    if (!token) {
        window.location.href = "index.html";
        return;
    }

    try {
        // 2. Consumir el servicio
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                //'Authorization': `Bearer ${token}`, // Si tu API pide token
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const productos = await response.json();
            const tabla = document.getElementById('listaProductos');
            tabla.innerHTML = ""; // Limpiar tabla

            // 3. Renderizar los datos
            productos.forEach(prod => {
                const fila = `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 15px;">${prod.id}</td>
                        <td style="padding: 15px;">${prod.nombre}</td>
                        <td style="padding: 15px;">S/ ${prod.precio}</td>
                        <td style="padding: 15px;">${prod.stock}</td>
                    </tr>
                `;
                tabla.innerHTML += fila;
            });
        } else {
            console.error("Error al obtener productos");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

function logout() {
    sessionStorage.clear();
    window.location.href = "index.html";
}

// Ejecutar al cargar la página
window.onload = cargarProductos;