document.addEventListener('DOMContentLoaded', function () {
    cargarTodosLosDocumentos();

    document.getElementById('consultarBtn').addEventListener('click', buscarDocumento);
    document.getElementById('abrirInsertar').addEventListener('click', () => abrirPopup('popupInsertar'));
    document.getElementById('insertarForm').addEventListener('submit', insertarDocumento);

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
            cargarTodosLosDocumentos();
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

// ===================== INSERCIÓN =====================
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