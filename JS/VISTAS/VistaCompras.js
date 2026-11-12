import {
    Vista,
    Contenedor,
    Componente,
    Boton,
    Tabla,
    InputArchivo
    
} from "../REGISTRO.js";


export class VistaCompras extends Vista {
    constructor() {
        super();
        this.inputArchivo = null;
        this.tablaResultados = null;
        this.datosTicket = [];
    }

    inicializar() {
        this.aplicarConfiguracion({
            className: "container py-4"
        });

        // Contenedor principal tipo tarjeta
        const card = new Contenedor("div", { className: "card shadow-sm p-4 bg-white rounded" });
        
        const titulo = new Componente("h2");
        titulo.obtenerElemento().className = "mb-4 text-primary fw-bold";
        titulo.obtenerElemento().textContent = "🛒 Registrar Nueva Compra";

        // Formulario de entrada (Comprador, Fecha, Archivo)
        const formRow = new Contenedor("div", { className: "row g-3 mb-4" });

        // Comprador
        const colComprador = new Contenedor("div", { className: "col-md-6" });
        colComprador.obtenerElemento().innerHTML = `
            <label class="form-label fw-bold">Comprador</label>
            <select id="select-comprador" class="form-select">
                <option value="Sujeto 1">Sujeto 1</option>
                <option value="Sujeto 2">Sujeto 2</option>
                <option value="Sujeto 3">Sujeto 3</option>
                <option value="Sujeto 4">Sujeto 4</option>
            </select>
        `;

        // Fecha
        const colFecha = new Contenedor("div", { className: "col-md-6" });
        colFecha.obtenerElemento().innerHTML = `
            <label class="form-label fw-bold">Fecha</label>
            <input type="date" id="input-fecha" class="form-control" value="${new Date().toISOString().split('T')[0]}">
        `;

        // Archivo (Ticket)
        const colArchivo = new Contenedor("div", { className: "col-12" });
        colArchivo.obtenerElemento().innerHTML = `<label class="form-label fw-bold">Foto del Comprobante / Ticket</label>`;
        
        this.inputArchivo = new InputArchivo({
            className: "form-control"
        });
        colArchivo.agregar(this.inputArchivo);

        formRow.agregar(colComprador);
        formRow.agregar(colFecha);
        formRow.agregar(colArchivo);

        // Botón de Consulta a la IA usando tu clase Boton
        const btnConsultar = new Boton({
            texto: "🤖 Analizar Ticket con IA",
            className: "btn btn-dark w-100 py-2 fw-bold",
            eventos: {
                click: () => this.analizarTicketConIA()
            }
        });

        card.agregar(titulo);
        card.agregar(formRow);
        card.agregar(btnConsultar);

        this.agregar(card);

        // Construir el Modal con la Tabla integrada utilizando tu clase Tabla
        this.crearModalConTabla();
    }

    async analizarTicketConIA() {
        const base64 = this.inputArchivo.obtenerValor();
        if (!base64) {
            alert("Por favor, selecciona o captura una foto del ticket primero.");
            return;
        }

        const comprador = document.getElementById("select-comprador").value;
        const fecha = document.getElementById("input-fecha").value;

        // Simulación de consulta a IA (Reemplazar con tu fetch a Google Apps Script)
        try {
            // Mock de datos devueltos por la IA
            await new Promise(resolve => setTimeout(resolve, 1200));
            this.datosTicket = [
                { producto: "Aceite de Oliva", cantidad: 1, precio: 8.50, importe: 8.50 },
                { producto: "Arroz (Bolsa 1kg)", cantidad: 2, precio: 2.00, importe: 4.00 }
            ];

            this.poblarTablaModal(comprador, fecha);

            // Mostrar el Modal usando Bootstrap
            const modalElement = document.getElementById("modal-ticket");
            const modal = new bootstrap.Modal(modalElement);
            modal.show();

        } catch (error) {
            console.error("Error al procesar la IA:", error);
            alert("No se pudo analizar el ticket.");
        }
    }

    crearModalConTabla() {
        const modalContainer = document.createElement("div");
        modalContainer.innerHTML = `
            <div class="modal fade" id="modal-ticket" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-xl modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header bg-dark text-white">
                            <h5 class="modal-title">✨ Validación de Gastos Extraídos</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                        </div>
                        <div class="modal-body">
                            <div id="contenedor-tabla-modal" class="table-responsive"></div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-success fw-bold" id="btn-enviar-gastos">💾 Enviar a Google Sheets</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalContainer);

        // Instanciar la Tabla de tu framework dentro del modal
        this.tablaResultados = new Tabla({ bordered: true, small: true, hover: true });
        this.tablaResultados.establecerEncabezados([
            "Comprador", "Fecha", "Producto", "Cant.", "Precio", "Importe", 
            "Sujeto 1", "Sujeto 2", "Sujeto 3", "Sujeto 4", "Acción"
        ]);

        document.getElementById("contenedor-tabla-modal").appendChild(this.tablaResultados.obtenerElemento());

        // Evento del botón enviar finales
        document.getElementById("btn-enviar-gastos").addEventListener("click", () => {
            this.guardarGastosDefinitivos();
        });
    }

    poblarTablaModal(comprador, fecha) {
        this.tablaResultados.limpiarCuerpo();

        this.datosTicket.forEach((item, index) => {
            // Creamos componentes nativos de la tabla para asegurar encapsulamiento
            const inputProd = document.createElement("input");
            inputProd.type = "text";
            inputProd.className = "form-control form-control-sm";
            inputProd.value = item.producto;

            const inputCant = document.createElement("input");
            inputCant.type = "number";
            inputCant.className = "form-control form-control-sm text-center";
            inputCant.value = item.cantidad;

            const inputPrecio = document.createElement("input");
            inputPrecio.type = "number";
            inputPrecio.step = "0.01";
            inputPrecio.className = "form-control form-control-sm text-end";
            inputPrecio.value = item.precio;

            const tdImporte = document.createElement("span");
            tdImporte.className = "fw-bold";
            tdImporte.textContent = item.importe.toFixed(2);

            // Checkboxes para los 4 sujetos (por defecto marcados en true)
            const crearCheck = () => {
                const chk = document.createElement("input");
                chk.type = "checkbox";
                chk.className = "form-check-input";
                chk.checked = true;
                return chk;
            };

            // Botón de edición/eliminar fila usando tu clase Boton
            const btnEliminar = new Boton({
                texto: "🗑️",
                className: "btn btn-outline-danger btn-sm py-0 px-1",
                eventos: {
                    click: () => {
                        this.datosTicket.splice(index, 1);
                        this.poblarTablaModal(comprador, fecha);
                    }
                }
            });

            this.tablaResultados.agregarFila([
                comprador,
                fecha,
                inputProd,
                inputCant,
                inputPrecio,
                tdImporte,
                crearCheck(),
                crearCheck(),
                crearCheck(),
                crearCheck(),
                btnEliminar
            ]);
        });
    }

    guardarGastosDefinitivos() {
        alert("¡Datos de compras enviados correctamente al backend de Apps Script!");
        
        // Cerrar modal de Bootstrap
        const modalElement = document.getElementById("modal-ticket");
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
    }
}
