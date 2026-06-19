let datos = [];

// =====================
// CARGAR DATOS
// =====================

fetch("/data/data.json")
    .then(response => response.json())
    .then(json => {

        datos = json;

        console.log(`✅ Registros cargados: ${datos.length}`);

    })
    .catch(error => {

        console.error("Error cargando JSON:", error);

    });

// =====================
// BOTÓN CONSULTAR
// =====================

document
    .getElementById("btnConsultar")
    .addEventListener("click", buscarCCT);

// =====================
// ENTER
// =====================

document
    .getElementById("cct")
    .addEventListener("keypress", function(event) {

        if (event.key === "Enter") {
            buscarCCT();
        }

    });

// =====================
// MAYÚSCULAS
// =====================

document
    .getElementById("cct")
    .addEventListener("input", function() {

        this.value = this.value.toUpperCase();

    });

// =====================
// FORMATEAR FECHA
// =====================

function parseFechaTexto(valor) {

    const texto = String(valor).trim();

    const partes = texto.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);

    if (partes) {
        let [, parte1, parte2, anio] = partes;

        if (anio.length === 2) {
            anio = `20${anio}`;
        }

        const num1 = Number(parte1);
        const num2 = Number(parte2);
        let dia;
        let mes;

        if (num1 > 12 && num2 <= 12) {
            dia = num1;
            mes = num2;
        } else if (num2 > 12 && num1 <= 12) {
            dia = num2;
            mes = num1;
        } else {
            // Si ambos son válidos como mes y día, asumimos formato mm/dd y lo convertimos a dd/mm.
            dia = num2;
            mes = num1;
        }

        if (mes >= 1 && mes <= 12 && dia >= 1 && dia <= 31) {
            return `${dia.toString().padStart(2, "0")}/${mes.toString().padStart(2, "0")}/${anio}`;
        }
    }

    const isoPartes = texto.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (isoPartes) {
        let [, anio, mes, dia] = isoPartes;
        return `${dia.padStart(2, "0")}/${mes.padStart(2, "0")}/${anio}`;
    }

    const fecha = new Date(texto);

    if (!isNaN(fecha)) {
        return fecha.toLocaleDateString(
            "es-MX",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );
    }

    return null;
}

function formatearFecha(valor) {

    if (!valor && valor !== 0) return "No disponible";

    let fecha = null;

    if (typeof valor === "number" && !isNaN(valor)) {
        fecha = new Date((valor - 25569) * 86400 * 1000);
    } else {
        fecha = parseFechaDate(valor);
    }

    if (!fecha || isNaN(fecha)) {
        const fechaFormateada = parseFechaTexto(valor);
        return fechaFormateada || "No disponible";
    }

    return fecha.toLocaleDateString(
        "es-MX",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}

// =====================
// FORMATEAR HORA
// =====================

function formatearHora(valor) {

    if (!valor && valor !== 0) return null;

    if (typeof valor === "number" && !isNaN(valor)) {

        const totalSegundos =
            Math.round(valor * 86400);

        const horas =
            Math.floor(totalSegundos / 3600);

        const minutos =
            Math.floor(
                (totalSegundos % 3600) / 60
            );

        return `${horas.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")}`;
    }

    const texto = String(valor).trim();
    if (texto === "") return null;

    const fecha = new Date(`1970-01-01 ${texto}`);

    if (!isNaN(fecha)) {
        const horas = fecha.getHours().toString().padStart(2, "0");
        const minutos = fecha.getMinutes().toString().padStart(2, "0");
        return `${horas}:${minutos}`;
    }

    const coincidencia = texto.match(/(\d{1,2}):(\d{2})/);
    if (coincidencia) {
        return `${coincidencia[1].padStart(2, "0")}:${coincidencia[2]}`;
    }

    return texto;
}

function formatTelefono(valor) {
    const texto = String(valor || "").trim();
    const numeros = texto.replace(/\D/g, "");

    if (numeros.length === 10) {
        return `${numeros.slice(0, 3)} ${numeros.slice(3, 6)} ${numeros.slice(6)}`;
    }

    if (numeros.length >= 7) {
        return numeros.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
    }

    return texto || "No disponible";
}

function parseFechaDate(valor) {
    if (!valor && valor !== 0) return null;

    if (typeof valor === "number" && !isNaN(valor)) {
        return new Date((valor - 25569) * 86400 * 1000);
    }

    const texto = String(valor).trim();
    if (texto === "") return null;

    const isoPartes = texto.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (isoPartes) {
        let [, anio, mes, dia] = isoPartes;
        return new Date(Number(anio), Number(mes) - 1, Number(dia));
    }

    const partes = texto.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (partes) {
        let [, parte1, parte2, anio] = partes;
        if (anio.length === 2) {
            anio = `20${anio}`;
        }

        const num1 = Number(parte1);
        const num2 = Number(parte2);
        let dia;
        let mes;

        if (num1 > 12 && num2 <= 12) {
            dia = num1;
            mes = num2;
        } else if (num2 > 12 && num1 <= 12) {
            dia = num2;
            mes = num1;
        } else {
            dia = num2;
            mes = num1;
        }

        return new Date(Number(anio), Number(mes) - 1, Number(dia));
    }

    const fecha = new Date(texto);
    return isNaN(fecha) ? null : fecha;
}

function fechaPasada(valor) {
    const fecha = parseFechaDate(valor);
    if (!fecha) return false;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fecha.setHours(0, 0, 0, 0);

    return fecha < hoy;
}

function normalizeKey(key) {
    return String(key)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
}

function getVal(obj, ...keys) {
    const normalized = {};
    for (const key of Object.keys(obj)) {
        normalized[normalizeKey(key)] = obj[key];
    }

    for (const k of keys) {
        if (!k) continue;
        const normalizedKey = normalizeKey(k);
        if (Object.prototype.hasOwnProperty.call(normalized, normalizedKey) && normalized[normalizedKey] !== null && normalized[normalizedKey] !== undefined && String(normalized[normalizedKey]).trim() !== "") {
            return normalized[normalizedKey];
        }
    }
    return null;
}

function logConsultaServidor(registro) {
    if (!registro || !registro.cct) return;

    const payload = {
        cct: registro.cct,
        escuela: registro.escuela || registro.nombre || "Sin nombre",
        sare: registro.SARE || registro.sare || "No disponible",
        municipio: registro.municipio || "No disponible",
        localidad: registro.localidad || "No disponible"
    };

    fetch("/api/log-query", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            console.warn("No se pudo registrar la consulta en el servidor.");
        }
    })
    .catch(error => {
        console.warn("Error de red al registrar la consulta:", error);
    });
}

function obtenerHorario(registro) {
    const inicio = formatearHora(registro.hora_inicio || registro.horaInicio || registro["Hora Inicio"] || registro["hora inicio"] || registro.hora_atencion);
    const fin = formatearHora(registro.hora_final || registro.hora_fin || registro.horaFinal || registro["Hora Final"] || registro["hora fin"] || registro.hora_atencion);

    if (inicio && fin) {
        if (inicio === fin) {
            return inicio;
        }
        return `${inicio} - ${fin}`;
    }

    return inicio || fin || "No disponible";
}

// =====================
// BUSCAR CCT
// =====================

function buscarCCT() {

    const cct = document
        .getElementById("cct")
        .value
        .trim()
        .toUpperCase();

    const resultado =
        document.getElementById("resultado");

    if (cct === "") {

        resultado.innerHTML = `

        <div class="mensaje-advertencia">
            ⚠️ Ingrese una Clave de Centro de Trabajo.
        </div>

        `;

        return;
    }

    const registro = datos.find(item =>
        item.cct &&
        item.cct.toUpperCase() === cct
    );

    if (!registro) {

        resultado.innerHTML = `

        <div class="mensaje-error">
            ⚠️ No existe información para el CCT:
            <strong>${cct}</strong>
        </div>

        `;

        return;
    }

    logConsultaServidor(registro);

    const fi = getVal(registro, 'fecha_inicio', 'fecha_inicio_excel', 'fechaInicio', 'fecha inicio', 'fecha de inicio', 'fecha_atencion');
    const ff = getVal(registro, 'fecha_final', 'fechaFinal', 'fecha_fin', 'fecha fin', 'fecha de fin', 'fecha_atencion');
    const hi = getVal(registro, 'hora_inicio', 'horaInicio', 'hora de inicio', 'hora de incio', 'HORA DE INCIO');
    const hf = getVal(registro, 'hora_final', 'horaFinal', 'hora de final', 'HORA FINAL');

    const alertaFecha = fechaPasada(ff || fi)
        ? `
        <div class="mensaje-advertencia">
            <strong>⚠️ Fecha de atención vencida</strong>
            <p>Tu fecha de atención ya pasó. Pronto publicaremos una nueva fecha para atender rezagos.</p>
            <p>Estate al pendiente de las actualizaciones.</p>
        </div>
        `
        : "";

    const programa = getVal(registro, 'programa', 'Programa') || 'No disponible';
    const sede = getVal(registro, 'sede', 'Sede') || 'No disponible';
    const sare = getVal(registro, 'sare', 'SARE') || 'No disponible';
    const municipio = getVal(registro, 'municipio', 'Municipio') || 'No disponible';
    const localidad = getVal(registro, 'localidad', 'Localidad') || 'No disponible';
    const telefono = getVal(registro, 'telefono', 'tel', 'telefono_contacto', 'telefono_de_contacto', 'telefono de contacto', 'telefono_contacto_escuela', 'celular') || 'No disponible';
    const telefonoFormateado = formatTelefono(telefono);

    let fechaDisplay = 'No disponible';
    if (fi && ff) {
        fechaDisplay = `Del ${formatDateLongES(fi)} al ${formatDateLongES(ff)}`;
    } else if (fi) {
        fechaDisplay = `Del ${formatDateLongES(fi)}`;
    } else if (ff) {
        fechaDisplay = `Hasta ${formatDateLongES(ff)}`;
    }

    let horario = 'No disponible';
    const horaInicio = formatearHora(hi);
    const horaFin = formatearHora(hf);
    if (horaInicio && horaFin) {
        horario = `${horaInicio} a ${horaFin} hrs`;
    } else if (horaInicio) {
        horario = `${horaInicio} hrs`;
    } else if (horaFin) {
        horario = `${horaFin} hrs`;
    }

    const comite = getVal(registro, 'estatus_comite', 'comite', 'Comité') || 'No disponible';
    const referencia = getVal(registro, 'referencia', 'referencia_direccion') || 'No disponible';

    const lat = getVal(registro, 'lat', 'LAT', 'latitud');
    const lon = getVal(registro, 'lon', 'LON', 'longitud');

    const mapaHtml = (lat && lon)
        ? `<a class="btn-mapa" href="https://www.google.com/maps?q=${lat},${lon}" target="_blank" rel="noopener">📍 VER UBICACIÓN EN GOOGLE MAPS</a>`
        : `<span class="btn-mapa" aria-disabled="true" style="opacity:.7;cursor:default;">📍 UBICACIÓN NO DISPONIBLE</span>`;

    resultado.innerHTML = `

    <div class="tarjeta-resultado">

        <div class="tarjeta-header">

            <h2>${registro.escuela || registro.nombre || 'Sin nombre'}</h2>

            <div>${registro.cct}</div>

        </div>

        <div class="mensaje-exito" style="margin: 0 0 16px; padding: 12px; border-radius: 8px; background: #e8f6ec; color: #1d6f3f; border: 1px solid #cce8d6;">
            ✅ Consulta registrada correctamente.
        </div>

        ${alertaFecha}

        <div class="tarjeta-cuerpo">

            <div class="campo">
                <span class="etiqueta">Programa</span>
                <span class="valor">${programa}</span>
            </div>

            <div class="campo">
                <span class="etiqueta">SARE</span>
                <span class="valor">${sare}</span>
            </div>

            <div class="campo">
                <span class="etiqueta">📍 Sede de Atención</span>
                <span class="valor">${sede}</span>
            </div>

            <div class="campo">
                <span class="etiqueta">Municipio</span>
                <span class="valor">${municipio}</span>
            </div>

            <div class="campo">
                <span class="etiqueta">Localidad</span>
                <span class="valor">${localidad}</span>
            </div>

            <div class="campo">
                <span class="etiqueta">📞 Teléfono de contacto</span>
                <span class="valor">${telefonoFormateado}</span>
            </div>

            <div class="campo">
                <span class="etiqueta">📅 Periodo de atención</span>
                <span class="valor">${fechaDisplay}</span>
            </div>

            <div class="campo">
                <span class="etiqueta">🕒 Horario de atención</span>
                <span class="valor">${horario}</span>
            </div>

            <div class="campo">
                <span class="etiqueta">Comité de Contraloría Social</span>
                <span class="valor">${comite}</span>
            </div>

            <div class="campo">
                <span class="etiqueta">Referencia</span>
                <span class="valor">${referencia}</span>
            </div>

            ${mapaHtml}

        </div>

    </div>

    `;

    resultado.scrollIntoView({ behavior: "smooth", block: "start" });
}

function formatDateLongES(valor){
    // Return long spanish date or range; handles Excel serials, ISO and dd/mm/yyyy
    if (valor === null || valor === undefined || valor === "") return "No disponible";

    // Range handling if value contains a separator
    if (typeof valor === 'string' && valor.includes(' - ')){
        const parts = valor.split(' - ').map(p=>p.trim());
        return `Del ${formatDateLongES(parts[0])} al ${formatDateLongES(parts[1])}`;
    }

    let fecha = null;
    if (typeof valor === 'number' && !isNaN(valor)) {
        fecha = new Date((valor - 25569) * 86400 * 1000);
    } else {
        fecha = parseFechaDate(valor);
    }

    if (!fecha || isNaN(fecha)) return (typeof valor === 'string') ? valor : 'No disponible';

    const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
    return fecha.toLocaleDateString('es-MX', opciones);
}
