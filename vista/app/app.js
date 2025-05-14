document.addEventListener('DOMContentLoaded', function () {
    cargarTodosLosDocumentos();

    document.getElementById('consultarBtn').addEventListener('click', buscarDocumento);
    document.getElementById('abrirInsertar').addEventListener('click', () => abrirPopup('popupInsertar'));

    document.getElementById('insertarForm').addEventListener('submit', insertarDocumento);
    document.getElementById('actualizarForm').addEventListener('submit', actualizarDocumento);
    document.getElementById('confirmarEliminarBtn').addEventListener('click', eliminarDocumento);

    // Manejo de carga de CSV
    document.getElementById('cargarCSVBtn').addEventListener('click', () => {
        document.getElementById('csvFileInput').click(); 
    });

    document.getElementById('csvFileInput').addEventListener('change', async function () { 
        const file = this.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('csv', file); 

        try {
            const response = await fetch('http://localhost:3001/api/insertar/csv', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Error al cargar el archivo');
            const result = await response.json();
            alert(result.mensaje || 'Archivo CSV cargado correctamente');
            cargarTodosLosDocumentos(); // Recargar vista
        } catch (error) {
            alert('Error al procesar el archivo CSV');
            console.error(error);
        }
    });

    // Cerrar popups
    document.querySelectorAll('.popup .close').forEach(button => {
        button.addEventListener('click', () => cerrarPopup(button.closest('.popup')));
    });

    // Validación de longitud en inputs
    document.querySelectorAll('input[maxlength]').forEach(input => {
        input.addEventListener('keydown', function (event) {
            if (this.value.length >= this.maxLength && event.key !== "Backspace") {
                event.preventDefault();
            }
        });
    });
});

// ===================== CONSULTA =====================
async function cargarTodosLosDocumentos() {
    try {
        const response = await fetch('http://localhost:3002/api/consultar');
        if (!response.ok) throw new Error('Error al cargar los documentos');
        const data = await response.json();
        mostrarResultadoConsulta(data);
    } catch (error) {
        mostrarErrorConsulta('Error al cargar los documentos.');
    }
}

async function buscarDocumento() {
    const filtro = document.getElementById('filtroConsulta').value.trim();

    if (filtro === "") {
        cargarTodosLosDocumentos();
        return;
    }

    try {
        const response = await fetch(`http://localhost:3002/api/consultar/${filtro}`);
        if (!response.ok) throw new Error('Error en la búsqueda');
        const data = await response.json();

        if (data) {
            if (Array.isArray(data) && data.length > 0) {
                mostrarResultadoConsulta([data[0]]);
            } else if (typeof data === 'object' && Object.keys(data).length > 0) {
                mostrarResultadoConsulta([data]);
            } else {
                mostrarErrorConsulta('Documento no encontrado.');
            }
        } else {
            mostrarErrorConsulta('Documento no encontrado.');
        }
    } catch (error) {
        mostrarErrorConsulta('Error al buscar el documento.');
    }
}

function mostrarResultadoConsulta(data) {
    const resultadoDiv = document.getElementById('resultadoConsulta');
    resultadoDiv.innerHTML = `
        <div class="column">
            <h3>Documento</h3>
            ${data.map(doc => `<p>${doc.Documento}</p>`).join('')}
        </div>
        <div class="column">
            <h3>Nombre</h3>
            ${data.map(doc => `<p>${doc.Nombre1} ${doc.Nombre2}</p>`).join('')}
        </div>
        <div class="column">
            <h3>Apellido</h3>
            ${data.map(doc => `<p>${doc.Apellido1} ${doc.Apellido2}</p>`).join('')}
        </div>
        <div class="column">
            <h3>Correo</h3>
            ${data.map(doc => `<p>${doc.Correo}</p>`).join('')}
        </div>
        <div class="column">
            <h3>Teléfono</h3>
            ${data.map(doc => `<p>${doc.Telefono}</p>`).join('')}
        </div>
        <div class="actions-column">
            <h3>Acciones</h3>
            ${data.map(doc => `
                <div>
                    <button onclick="abrirPopupActualizar('${doc.Documento}')">
                        <i class="fas fa-edit"></i>
                        <span class="tooltip">Actualizar</span>
                    </button>
                    <button class="delete" onclick="abrirPopupEliminar('${doc.Documento}')">
                        <i class="fas fa-trash"></i>
                        <span class="tooltip">Eliminar</span>
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

function mostrarErrorConsulta(mensaje) {
    const resultadoDiv = document.getElementById('resultadoConsulta');
    resultadoDiv.innerHTML = `<p style="color: red;">${mensaje}</p>`;
}

// ===================== POPUPS =====================
function abrirPopup(idPopup) {
    document.getElementById(idPopup).style.display = 'flex';
}

function cerrarPopup(popup) {
    popup.style.display = 'none';
}

async function abrirPopupActualizar(documento) {
    try {
        const response = await fetch(`http://localhost:3002/api/consultar/${documento}`);
        if (!response.ok) throw new Error('Error al obtener los datos');
        
        const data = await response.json();

        document.getElementById('documentoActualizar').value = data.Documento;
        document.getElementById('nuevoNombre1').value = data.Nombre1;
        document.getElementById('nuevoNombre2').value = data.Nombre2;
        document.getElementById('nuevoApellido1').value = data.Apellido1;
        document.getElementById('nuevoApellido2').value = data.Apellido2;
        document.getElementById('nuevoCorreo').value = data.Correo;
        document.getElementById('nuevoTelefono').value = data.Telefono;

        abrirPopup('popupActualizar');
    } catch (error) {
        console.error('Error al cargar los datos del estudiante:', error);
        alert('No se pudieron cargar los datos para actualizar.');
    }
}

function abrirPopupEliminar(documento) {
    document.getElementById('documentoEliminarTexto').textContent = documento;
    abrirPopup('popupEliminar');
}

// ===================== CRUD =====================
async function insertarDocumento(event) {
    event.preventDefault();
    const userData = {
        Documento: document.getElementById('documento').value,
        Nombre1: document.getElementById('nombre1').value,
        Nombre2: document.getElementById('nombre2').value,
        Apellido1: document.getElementById('apellido1').value,
        Apellido2: document.getElementById('apellido2').value,
        Correo: document.getElementById('correo').value,
        Telefono: document.getElementById('telefono').value
    };
    
    try {
        const response = await fetch('http://localhost:3001/api/insertar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) throw new Error('Error en la solicitud');
        const responseData = await response.json();
        document.getElementById('resultadoInsercion').textContent = `Estudiante Guardado Correctamente.`;
        cargarTodosLosDocumentos();
    } catch (error) {
        document.getElementById('resultadoInsercion').textContent = 'Error al guardar.';
    }
}

async function actualizarDocumento(event) {
    event.preventDefault();
    const userData = {
        Documento: document.getElementById('documentoActualizar').value,
        Nombre1: document.getElementById('nuevoNombre1').value,
        Nombre2: document.getElementById('nuevoNombre2').value,
        Apellido1: document.getElementById('nuevoApellido1').value,
        Apellido2: document.getElementById('nuevoApellido2').value,
        Correo: document.getElementById('nuevoCorreo').value,
        Telefono: document.getElementById('nuevoTelefono').value
    };
    
    try {
        const response = await fetch('http://localhost:3004/api/actualizar', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) throw new Error('Error en la solicitud');
        document.getElementById('resultadoActualizacion').textContent = `Documento actualizado correctamente.`;
        cargarTodosLosDocumentos();
    } catch (error) {
        document.getElementById('resultadoActualizacion').textContent = 'Error al actualizar el documento.';
    }
}

async function eliminarDocumento() {
    const documento = document.getElementById('documentoEliminarTexto').textContent;
    
    try {
        const response = await fetch(`http://localhost:3003/api/eliminar/${documento}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Error en la solicitud');
        document.getElementById('resultadoEliminacion').textContent = `Documento eliminado correctamente.`;
        cargarTodosLosDocumentos();
    } catch (error) {
        document.getElementById('resultadoEliminacion').textContent = 'Error al eliminar el documento.';
    }
}
