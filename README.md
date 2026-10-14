# Panel_DummyJSON

Página en la que un usuario inicia sesión, ve su información y administra sus tareas usando la API de DummyJSON.

## Métodos de arreglo usados

### `filter`
Se usa para quedarse solo con las tareas que cumplen una condición.
- En `pedirTareas`: separa las completadas de las pendientes para los contadores.
- En `pintarTareas`: elige qué tareas mostrar según el filtro (todas, pendientes o completadas) y aplica el buscador por texto.
- En `eliminarTarea`: quita del arreglo la tarea que se acaba de borrar.

### `map`
Se usa para transformar cada tarea en un elemento de la lista.
- En `pintarTareas`: recorre las tareas filtradas y crea un `<li>` por cada una, con su texto y sus dos botones (alternar y eliminar).

### `reduce`
Se usa para sacar un solo valor a partir de todo el arreglo.
- En `pintarTareas`: cuenta cuántas tareas están completadas. El total de pendientes sale de restar ese número al total de tareas.

### `find`
Se usa para encontrar un elemento específico dentro del arreglo.
- En `alternarTarea`: busca la tarea por su `id` para saber si está completada o pendiente antes de cambiarle el estado.

### `sort`
Se usa para ordenar el arreglo.
- En `pintarTareas`: ordena las tareas alfabéticamente por su texto antes de mostrarlas.

### `forEach`
Solo se usa para recorrer los radios del filtro y agregarles un listener. No se usa para pintar ni para contar.

## Flujo de la página

1. **Login**: el usuario escribe su usuario y contraseña, y se guarda el token.
2. **Perfil**: se muestra la foto, el nombre, el correo, el usuario y el género.
3. **Tareas**: se cargan las tareas del usuario y se muestran en una lista.
4. **Agregar**: se puede añadir una tarea nueva.
5. **Alternar**: se puede marcar como completada o volver a pendiente.
6. **Eliminar**: se puede borrar una tarea.

DummyJSON simula los cambios: las tareas agregadas, modificadas o eliminadas solo se ven reflejadas en la página mientras no se recargue.