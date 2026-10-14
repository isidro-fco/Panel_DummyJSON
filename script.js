const API = "https://dummyjson.com/"
let usuario = null;
let tareas = [];
let filtroActual = 'todas';
let busquedaActual = '';
// Inicio de sesion
const loginForm = document.querySelector('#loginForm');
const inpUsuario = document.querySelector('#usuario');
const inpContrasenia = document.querySelector('#contrasenia')
const btnSesion = document.querySelector('#btnSesion');
const errorSesion = document.querySelector('#msjError');
// Perfil
const btnPerfil = document.querySelector('#verPerfil');
const fotoUser = document.querySelector('#fotoUser');
const usernameUser = document.querySelector('#usernameUser');
const nombreCompletoUser = document.querySelector('#nombreCompletoUser');
const correoUser = document.querySelector('#correoUser');
const sexoUser = document.querySelector('#sexoUser');
const btnRegresar = document.querySelector('#regresar');
const btnCerrarSesion = document.querySelector('#cerrarSesion');
// Panel
const tagTotal = document.querySelector('#tagTotal');
const tagCompletas = document.querySelector('#tagCompletas');
const tagPendientes = document.querySelector('#tagPendientes');
const tagPorcentaje = document.querySelector('#tagPorcentaje');
const buscador = document.querySelector('#buscador');
const lista = document.querySelector('#listaTareas');
const inpNuevaTarea = document.querySelector('#nuevaTarea');
const btnAgregar = document.querySelector('#btnAgregar');
// Secciones
const seccionInicioSesion = document.querySelector('#inicioSesion');
const seccionPerfil = document.querySelector('#perfil');
const seccionPanel = document.querySelector('#panel');

// Inicio de Sesion
async function iniciarSesion(evento) {
    evento.preventDefault();
    btnSesion.disabled = true;
    btnSesion.textContent = "Entrando ..."
    errorSesion.textContent = "";
    try {
        const res = await fetch(`${API}auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: inpUsuario.value,
                password: inpContrasenia.value
            }),
            credentials: 'include'
        });
        if (!res.ok) {
            errorSesion.textContent = "Usuario o contraseña incorrectos";
            return;
        }
        const data = await res.json();
        console.log("Datos recibidos:", data);
        localStorage.setItem("sesion", data.accessToken);
        await pedirPerfil();
        await pedirTareas();
        mostrarSeccion(seccionPanel);
    } catch (error) {
        console.error("Error al iniciar sesion:", error.message);
        errorSesion.textContent = "Error con la conexion";
    } finally {
        btnSesion.disabled = false;
        btnSesion.textContent = "Iniciar Sesion";
    }
}

async function pedirPerfil() {
    console.log("Pidendo perfil");
    try {
        const res = await fetch(`${API}auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("sesion")}`,
            },
            credentials: 'include'
        })
        if (res.status === 401) {
            cerrarSesion();
            return;
        }
        if (!res.ok)
            throw new Error(`El servidor respondio ${res.status}`);
        usuario = await res.json();
        console.log("Perfil obtenido");
        fotoUser.src = usuario.image;
        usernameUser.textContent = usuario.username;
        nombreCompletoUser.textContent = `${usuario.firstName} ${usuario.lastName}`;
        correoUser.textContent = usuario.email;
        sexoUser.textContent = usuario.gender;
    } catch (error) {
        console.error("Error al pedir el perfil:", error.message);
    }
}

async function pedirTareas() {
    if (!usuario)
        return;
    console.log("Pidiendo tareas");
    try {
        const res = await fetch(`${API}todos/user/${usuario.id}`)
        if (!res.ok)
            throw new Error(`El servidor respondio ${res.status}`);
        const data = await res.json();
        tareas = data.todos;
        pintarTareas();
    } catch (error) {
        console.error("Error al pedir tareas:", error.message);
    }
}

function pintarTareas() {
    const completas = tareas.filter(t => t.completed === true);
    const pendientes = tareas.filter(t => t.completed === false);
    const porcentaje = tareas.length > 0 ? ((completas.length / tareas.length) * 100).toFixed(1) : 0;
    tagTotal.textContent = `Total: ${tareas.length}`;
    tagCompletas.textContent = `Completas: ${completas.length}`;
    tagPendientes.textContent = `Pendientes: ${pendientes.length}`;
    tagPorcentaje.textContent = `Porcentaje: ${porcentaje}%`;
    let tareasFiltradas;
    if (filtroActual === 'completadas') {
        tareasFiltradas = completas;
    } else if (filtroActual === 'pendientes') {
        tareasFiltradas = pendientes;
    } else {
        tareasFiltradas = tareas;
    }
    if (busquedaActual) {
        tareasFiltradas = tareasFiltradas.filter(t =>
            t.todo.toLowerCase().includes(busquedaActual)
        );
    }
    tareasFiltradas = [...tareasFiltradas].sort((a, b) =>
        a.todo.localeCompare(b.todo)
    );
    lista.innerHTML = '';
    const elementos = tareasFiltradas.map(t => {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = t.todo;
        if (t.completed) {
            span.style.textDecoration = 'line-through';
            span.style.color = 'gray';
        }
        const btnAlternar = document.createElement('button');
        btnAlternar.type = 'button';
        btnAlternar.textContent = t.completed ? 'Marcar pendiente' : 'Marcar completo';
        btnAlternar.addEventListener('click', () => alternarTarea(t.id));
        const btnEliminar = document.createElement('button');
        btnEliminar.type = 'button';
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.addEventListener('click', () => eliminarTarea(t.id));
        li.appendChild(span);
        li.appendChild(btnAlternar);
        li.appendChild(btnEliminar);
        return li;
    });
    lista.append(...elementos);
}

async function agregarTarea() {
    const texto = inpNuevaTarea.value.trim();
    if (!texto) return;
    try {
        const res = await fetch(`${API}todos/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("sesion")}`
            },
            body: JSON.stringify({
                todo: texto,
                completed: false,
                userId: usuario.id
            })
        });
        if (!res.ok)
            throw new Error(`Error ${res.status}`);
        const nuevaTarea = await res.json();
        tareas.push(nuevaTarea);
        inpNuevaTarea.value = '';
        pintarTareas();
    } catch (error) {
        console.error("Error al agregar:", error.message);
    }
}

async function alternarTarea(id) {
    try {
        const tarea = tareas.find(t => t.id === id);
        if (!tarea) return;
        const res = await fetch(`${API}todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("sesion")}`
            },
            body: JSON.stringify({
                completed: !tarea.completed
            })
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        tarea.completed = !tarea.completed;
        pintarTareas();
    } catch (error) {
        console.error("Error al alternar:", error.message);
    }
}

async function eliminarTarea(id) {
    try {
        const res = await fetch(`${API}todos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("sesion")}`
            }
        });
        if (!res.ok)
            throw new Error(`Error ${res.status}`);
        tareas = tareas.filter(t => t.id !== id);
        pintarTareas();
    } catch (error) {
        console.error("Error al eliminar:", error.message);
    }
}


function cerrarSesion() {
    localStorage.removeItem('sesion');
    usuario = null;
    tareas = [];
    filtroActual = 'todas';
    busquedaActual = '';
    document.querySelector('#fTodas').checked = true;
    document.querySelector('#buscador').value = '';
    document.querySelector('#listaTareas').innerHTML = '';
    tagTotal.textContent = '';
    tagCompletas.textContent = '';
    tagPendientes.textContent = '';
    tagPorcentaje.textContent = '';
    mostrarSeccion(seccionInicioSesion);
}

function mostrarSeccion(seccion) {
    seccionInicioSesion.style.display = 'none';
    seccionPanel.style.display = 'none';
    seccionPerfil.style.display = 'none';
    seccion.style.display = 'block';
}

loginForm.addEventListener("submit", iniciarSesion);
btnPerfil.addEventListener("click", async () => {
    if (!usuario) await pedirPerfil();
    mostrarSeccion(seccionPerfil);
});
btnCerrarSesion.addEventListener("click", cerrarSesion);
btnRegresar.addEventListener("click", () => mostrarSeccion(seccionPanel));
document.querySelector('#filtroTareas').addEventListener('change', (evento) => {
    filtroActual = evento.target.value;
    pintarTareas();
});
buscador.addEventListener('input', (evento) => {
    busquedaActual = evento.target.value.toLowerCase();
    pintarTareas();
});
btnAgregar.addEventListener('click', agregarTarea);

window.addEventListener('DOMContentLoaded', async () => {
    if (localStorage.getItem("sesion")) {
        await pedirPerfil();
        if (!usuario)
            return;
        await pedirTareas();
        mostrarSeccion(seccionPanel);
    } else {
        mostrarSeccion(seccionInicioSesion);
    }
});