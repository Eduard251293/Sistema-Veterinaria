async function cargarProductos() {
    const token = sessionStorage.getItem('token');
    if (!token) {
        window.location.href = "index.html";
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:8080/productos", {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const productos = await response.json();
            const tabla = document.getElementById('listaProductos');
            tabla.innerHTML = ""; 

            productos.forEach(prod => {
                const fila = `
                    <tr>
                        <td><strong>#${prod.id}</strong></td>
                        <td>${prod.nombre}</td>
                        <td>S/ ${prod.precio.toFixed(2)}</td>
                        <td>
                            <span class="badge ${prod.stock < 5 ? 'bg-danger' : 'bg-primary'}">
                                ${prod.stock} unidades
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-outline-secondary"><i class="fas fa-edit"></i></button>
                        </td>
                    </tr>
                `;
                tabla.innerHTML += fila;
            });
        }
    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

function logout() {
    sessionStorage.clear();
    window.location.href = "index.html";
}

window.onload = cargarProductos;