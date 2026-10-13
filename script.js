const API = "https://dummyjson.com/"
const usuario = document.querySelector('#usuario');
const contrasenia = document.querySelector('#contrasenia')
const btnSesion = document.querySelector('#btnSesion');
const errorSesion = document.querySelector('#msjError');

// Inicio de Sesion
async function iniciarSesion(evento) {
    evento.preventDefault();
    btnSesion.disabled = true;
    btnSesion.textContent = "Entrando ..."
    try {
        const res = await fetch(`${API}auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: usuario.value,
                password: contrasenia.value
            }),
            credentials: 'include'
        })
            .then(res => res.json())
            .then(console.log);
        localStorage.setItem("sesion", res.accessToken);
        cargarPerfil();
    } catch (error) {
        errorSesion.textContent = "Error con la conexion";
    } finally {
        btnSesion.disabled = false;
        btnSesion.textContent = "Iniciar Sesion";
    }
}

function cerrarSesion() {
    localStorage.removeItem("sesion");
}

async function pedirPerfil() {
    try {
        const res = await fetch(`${API}auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer',
            },
            credentials: 'include'
        })
            .then(res => res.json())
            .then(console.log);
    } catch (error) {

    } finally {

    }
}


loginForm.addEventListener("submit", iniciarSesion);