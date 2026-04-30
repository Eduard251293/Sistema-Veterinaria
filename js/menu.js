/**
 * main.js - Orquestador del Dashboard Huellitas Vet
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Referencias a elementos del DOM
    const contentArea = document.getElementById("content");
    const navLinks = document.querySelectorAll(".nav-link-custom");
    const btnLogout = document.getElementById("btnLogout"); // Asegúrate de tener este ID en tu botón de salir

    /**
     * 2. Función Principal: Carga Dinámica de Módulos (HTML Fragmentos)
     */
    window.loadModule = async (moduleName) => {
        try {
            // Mostramos un spinner o mensaje de carga mientras llega la respuesta
            contentArea.innerHTML = `
                <div class="text-center mt-5">
                    <div class="spinner-border text-success" role="status"></div>
                    <p class="mt-2 text-muted">Conectando con el servicio de ${moduleName}...</p>
                </div>`;

            // Petición para obtener el fragmento HTML del módulo
            const response = await fetch(`${moduleName}.html`);
            
            if (!response.ok) throw new Error(`No se pudo encontrar el módulo ${moduleName}`);

            const html = await response.text();
            contentArea.innerHTML = html;

            // --- ORQUESTACIÓN DE SERVICIOS ---
            // Aquí disparamos la lógica específica según el módulo cargado
            switch (moduleName) {
                case 'inventario':
                    cargarProductos(); // La función que ya tienes para el API 8080
                    break;
                case 'admision':
                    // initAdmisionLogic(); // Aquí podrías poner validaciones de formulario
                    break;
                case 'agendamiento':
                    console.log("Cargando citas...");
                    break;
                case 'propietarios':
                    initPropietarios();
                    break;
            }

        } catch (error) {
            contentArea.innerHTML = `
                <div class="alert alert-danger m-3">
                    <i class="fas fa-exclamation-triangle"></i> Error de Arquitectura: ${error.message}
                </div>`;
        }
    };

    /**
     * 3. Manejo de Eventos de Navegación
     */
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();

            // Gestionar estado visual del menú
            navLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");

            // Cargar módulo según el atributo data-module
            const module = link.getAttribute("data-module");
            if (module) {
                loadModule(module);
            }
        });
    });

    /**
     * 4. Seguridad y Control de Sesión
     */
    const checkAuth = () => {
        const token = sessionStorage.getItem('token');
        // Si no hay token, redirigir al login (descomentar al terminar pruebas)
        /* if (!token) {
            window.location.href = "index.html";
        } */
    };

    // Logout
    if (btnLogout) {
        btnLogout.addEventListener("click", async(e) => {
            e.preventDefault();

            // Recuperamos el token almacenado (asumiendo que se guarda en sessionStorage)
            const token = sessionStorage.getItem('token');

            try {
                const response = await fetch('http://veterinaria.test/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 200 || response.status === 401) {
                    // Si es 200 (éxito) o 401 (ya expiró), procedemos a limpiar el cliente
                    sessionStorage.clear(); // Elimina tokens y datos de sesión
                    localStorage.removeItem('user_data'); // Limpia datos persistentes si existen
                    
                    window.location.replace("index.html"); // Redirección final
                } else {
                    console.error("Error inesperado en el servidor");
                    alert("Ocurrió un error al intentar cerrar la sesión.");
                }

            } catch (error) {
                console.error("Error de conexión con el servicio de autenticación:", error);
                // En caso de error de red, igual limpiamos localmente por seguridad
                sessionStorage.clear();
                window.location.href = "index.html";
            }
        });
    }

    /**
     * 5. Inicialización
     */
    checkAuth();
    loadModule("resumen"); // Carga el dashboard inicial por defecto
});

/**
 * 6. Funciones de Integración con Microservicios (Ejemplo Inventario)
 * (Aquí pegas la versión optimizada de cargarProductos que vimos antes)
 */
async function cargarProductos() {
    const token = sessionStorage.getItem('token');
    const tabla = document.getElementById('listaProductos');

    if (!tabla) return; // Evita errores si el elemento no existe en el DOM actual

    try {
        const response = await fetch("http://127.0.0.1:8080/productos", {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const productos = await response.json();
            tabla.innerHTML = productos.map(prod => `
                <tr>
                    <td><strong>#${prod.id}</strong></td>
                    <td>${prod.nombre}</td>
                    <td>S/ ${prod.precio.toFixed(2)}</td>
                    <td>
                        <span class="badge ${prod.stock < 5 ? 'bg-danger' : 'bg-primary'}">
                            ${prod.stock} unidades
                        </span>
                    </td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-secondary"><i class="fas fa-edit"></i></button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        tabla.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Servicio de inventario no disponible.</td></tr>`;
    }
}

/**
 * Inicializa la lógica del formulario de propietarios
 */
function initPropietarios() {
    const formProp = document.getElementById('formPropietarios');
    if (!formProp) return;

    formProp.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Mapeo exacto al JSON que requiere tu API http://veterinaria.test/api/propietarios
        const dataPropietario = {
            tipo_doc: document.getElementById('tipoDocProp').value,
            nro_doc: parseInt(document.getElementById('nroDocProp').value),
            nombre: document.getElementById('nombresProp').value,
            paterno: document.getElementById('apePaternoProp').value,
            materno: document.getElementById('apeMaternoProp').value,
            email: document.getElementById('emailProp').value,
            celular: parseInt(document.getElementById('celularProp').value),
            nro_emergencia: parseInt(document.getElementById('emergenciaProp').value)
        };

        await registrarPropietario(dataPropietario, formProp);
    });
}

/**
 * Envío de datos al Microservicio de Propietarios
 */
async function registrarPropietario(data, form) {
    const token = sessionStorage.getItem('token');
    
    try {
        const response = await fetch('http://veterinaria.test/api/propietarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            alert("¡Éxito! Propietario registrado en el sistema.");
            form.reset();
            // Si deseas ir directo a registrar la mascota:
            // loadModule('mascotas'); 
        } else {
            console.error("Error de validación:", result.errors);
            alert("Error: " + (result.message || "No se pudo completar el registro."));
        }
    } catch (error) {
        console.error("Error de conexión con el servicio:", error);
        alert("El servicio de propietarios no responde. Intente más tarde.");
    }
}