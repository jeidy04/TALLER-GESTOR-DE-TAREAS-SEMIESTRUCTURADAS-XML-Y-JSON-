// =======================================================
// 1. REFERENCIAS AL DOM (Modelo de Objetos del Documento)
// =======================================================
const formularioTareas = document.getElementById('formulario-tareas');
const tituloTarea = document.getElementById('titulo-tarea');
const descripcionTarea = document.getElementById('descripcion-tarea');
const listaTareas = document.getElementById('lista-tareas');
const btnExportarJson = document.getElementById('btn-exportar-json');
const btnExportarXml = document.getElementById('btn-exportar-xml');

// =======================================================
// 2. ESTADO DE LA APLICACIÓN
// =======================================================
// Carga las tareas guardadas previamente en LocalStorage, o inicializa un arreglo vacío.
let coleccionTareas = JSON.parse(localStorage.getItem('tareasGuardadas')) || [];

// =======================================================
// 3. FUNCIÓN PARA REDIBUJAR LA INTERFAZ
// =======================================================
function redibujarInterfaz() {
    listaTareas.innerHTML = ''; // Vaciar el contenedor antes de actualizar
    
    coleccionTareas.forEach((tarea, indice) => {
        const elementoLista = document.createElement('li');
        elementoLista.className = 'elemento-tarea';
        
        // Inyección dinámica de contenido HTML para cada tarea
        elementoLista.innerHTML = `
            <div>
                <h3>${tarea.titulo}</h3>
                <p>${tarea.descripcion}</p>
                <small style="color: #94a3b8;">Código: ${tarea.codigo} | Registro: ${tarea.fecha}</small>
            </div>
            <button class="btn-eliminar" onclick="removerTarea(${indice})">Eliminar</button>
        `;
        listaTareas.appendChild(elementoLista);
    });
}

// =======================================================
// 4. PERSISTENCIA DE DATOS (LOCALSTORAGE)
// =======================================================
function actualizarAlmacenamientoLocal() {
    // Convierte el arreglo de objetos a una cadena de texto JSON y lo guarda
    localStorage.setItem('tareasGuardadas', JSON.stringify(coleccionTareas));
}

// =======================================================
// 5. CAPTURA DE EVENTOS Y GESTIÓN DE TAREAS
// =======================================================
formularioTareas.addEventListener('submit', (evento) => {
    evento.preventDefault(); // Evita que la página se recargue por defecto

    // Creación de la nueva estructura de objeto con claves descriptivas
    const nuevaTarea = {
        codigo: Date.now().toString(),
        titulo: tituloTarea.value,
        descripcion: descripcionTarea.value,
        fecha: new Date().toLocaleDateString()
    };

    coleccionTareas.push(nuevaTarea);
    actualizarAlmacenamientoLocal();
    redibujarInterfaz();
    formularioTareas.reset(); // Limpia los campos del formulario
});

// Función global para eliminar una tarea según su posición (índice)
window.removerTarea = function(indice) {
    coleccionTareas.splice(indice, 1);
    actualizarAlmacenamientoLocal();
    redibujarInterfaz();
};

// =======================================================
// 6. PROCESAMIENTO DE FORMATOS SEMIESTRUCTURADOS (JSON y XML)
// =======================================================

// Exportación a formato JSON
btnExportarJson.addEventListener('click', () => {
    if (coleccionTareas.length === 0) return alert('No existen tareas para exportar.');

    // Serialización: de objeto JavaScript en memoria a cadena estructurada JSON (con indentación)
    const textoJson = JSON.stringify(coleccionTareas, null, 2);
    
    console.log("--- FLUJO DE DATOS: JSON GENERADO ---");
    console.log(textoJson);
    
    generarDescarga(textoJson, 'tareas_academicas.json', 'application/json');
});

// Exportación a formato XML mediante construcción manual y anidamiento de nodos
btnExportarXml.addEventListener('click', () => {
    if (coleccionTareas.length === 0) return alert('No existen tareas para exportar.');

    // Declaración de cabecera XML y nodo raíz
    let textoXml = '<?xml version="1.0" encoding="UTF-8"?>\n<tareas>\n';

    // Iteración para construir las etiquetas secundarias de cada tarea
    coleccionTareas.forEach(tarea => {
        textoXml += `  <tarea codigo="${tarea.codigo}">\n`;
        textoXml += `    <titulo>${sanitizarTextoXml(tarea.titulo)}</titulo>\n`;
        textoXml += `    <descripcion>${sanitizarTextoXml(tarea.descripcion)}</descripcion>\n`;
        textoXml += `    <fecha>${tarea.fecha}</fecha>\n`;
        textoXml += `  </tarea>\n`;
    });

    textoXml += '</tareas>'; // Cierre del nodo raíz

    console.log("--- FLUJO DE DATOS: XML GENERADO ---");
    console.log(textoXml);

    generarDescarga(textoXml, 'tareas_academicas.xml', 'application/xml');
});

// =======================================================
// 7. FUNCIONES UTILITARIAS (Descarga y Sanitización)
// =======================================================

// Función para disparar la descarga de archivos generados en el cliente
function generarDescarga(contenidoTexto, nombreArchivo, tipoMime) {
    const bloqueDatos = new Blob([contenidoTexto], { type: tipoMime });
    const urlDescarga = URL.createObjectURL(bloqueDatos);
    
    const enlaceDescarga = document.createElement('a');
    enlaceDescarga.href = urlDescarga;
    enlaceDescarga.download = nombreArchivo;
    enlaceDescarga.click();
    
    URL.revokeObjectURL(urlDescarga); // Libera memoria del navegador
}

// Función para sanitizar caracteres reservados de XML y evitar errores de parsing
function sanitizarTextoXml(textoInseguro) {
    return textoInseguro.replace(/[<>&'"]/g, (caracter) => {
        switch (caracter) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case "'": return '&apos;';
            case '"': return '&quot;';
        }
    });
}

// =======================================================
// 8. RENDERIZADO INICIAL
// =======================================================
// Dibuja las tareas guardadas al cargar la ventana por primera vez
redibujarInterfaz();
