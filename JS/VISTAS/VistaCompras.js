import {
    Vista,
    Contenedor,
    Componente,
    Boton,
    Tabla,
    Modal,
    InputArchivo,
    InputFecha
} from "../REGISTRO.js";

export class VistaCompras extends Vista {
    constructor() {
        super();
        this.inputArchivo = null;
        this.inputFecha = null;
        this.tablaResultados = null;
        this.modal = null;

        // Datos estáticos de prueba (simulando respuesta de la IA)
        this.datosTicket = [
            { producto: "Aceite de Oliva", cantidad: 1, precio: 8.50, importe: 8.50 },
            { producto: "Arroz (Bolsa 1kg)", cantidad: 2, precio: 2.00, importe: 4.00 },
            { producto: "Leche Entera", cantidad: 3, precio: 1.20, importe: 3.60 }
        ];
    }

    inicializar() {
        this.aplicarConfiguracion({
            className: "container py-4"
        });

        // ===== TARJETA PRINCIPAL =====
        const card = new Contenedor("div", {
            className: "card shadow-sm p-4 bg-white rounded"
        });

        const titulo = new Componente("h2");
        titulo.elemento.className = "mb-4 text-primary fw-bold";
        titulo.elemento.textContent = "🛒 Registrar Nueva Compra";

        // ===== FECHA =====
        const colFecha = new Contenedor("div", {
            className: "mb-3"
        });

        const labelFecha = new Componente("label");
        labelFecha.elemento.className = "form-label fw-bold";
        labelFecha.elemento.textContent = "Fecha";

        this.inputFecha = new InputFecha({
            className: "form-control",
            obligatorio: true
        });

        // Fecha de hoy por defecto
        this.inputFecha.establecerValor(new Date().toISOString().split("T")[0]);

        colFecha.agregar(labelFecha).agregar(this.inputFecha);

        // ===== ARCHIVO =====
        const colArchivo = new Contenedor("div", {
            className: "mb-4"
        });

        const labelArchivo = new Componente("label");
        labelArchivo.elemento.className = "form-label fw-bold";
        labelArchivo.elemento.textContent = "Foto del Comprobante / Ticket";

        this.inputArchivo = new InputArchivo({
            className: "form-control"
        });

        colArchivo.agregar(labelArchivo).agregar(this.inputArchivo);

        // ===== BOTÓN =====
        const btnAnalizar = new Boton({
            texto: "🤖 Analizar Ticket",
            className: "btn btn-dark w-100 py-2 fw-bold"
        });

        btnAnalizar.elemento.addEventListener("click", () => {
            this.analizarTicket();
        });

        // Armar tarjeta
        card
            .agregar(titulo)
            .agregar(colFecha)
            .agregar(colArchivo)
            .agregar(btnAnalizar);

        this.agregar(card);

        // Crear modal + tabla
        this.crearModalConTabla();
    }

    crearModalConTabla() {
    try {
        this.tablaResultados = new Tabla({
            bordered: true,
            small: true,
            hover: true
        });

        this.tablaResultados.establecerEncabezados([
            "Producto",
            "Cantidad",
            "Precio",
            "Importe",
            "Acciones"
        ]);

        this.modal = new Modal({
            titulo: "✨ Validación de Gastos Extraídos"
        });

        this.modal.establecerTamaño("lg");
        this.modal.establecerCuerpo(this.tablaResultados);

        this.modal.agregarBotonesAceptarCancelar({
            textoAceptar: "💾 Guardar",
            textoCancelar: "Cancelar",
            onAceptar: () => {
                this.guardarGastos();
            }
        });

        console.log("Modal y Tabla creados correctamente");
    } catch (error) {
        console.error("Error al crear Modal/Tabla:", error);
    }
}

analizarTicket() {
    if (!this.tablaResultados) {
        console.error("La tabla no está creada. Llamando a crearModalConTabla...");
        this.crearModalConTabla();
    }

    if (!this.tablaResultados) {
        alert("No se pudo crear la tabla. Revisa la consola.");
        return;
    }

    this.poblarTabla();
    this.modal.abrir();
}
    poblarTabla() {
        this.tablaResultados.limpiarCuerpo();

        this.datosTicket.forEach((item, index) => {
            const btnEditar = new Boton({
                texto: "✏️",
                className: "btn btn-outline-primary btn-sm me-1"
            });

            const btnEliminar = new Boton({
                texto: "🗑️",
                className: "btn btn-outline-danger btn-sm"
            });

            btnEditar.elemento.addEventListener("click", () => {
                this.editarFila(index);
            });

            btnEliminar.elemento.addEventListener("click", () => {
                this.datosTicket.splice(index, 1);
                this.poblarTabla();
            });

            // Contenedor de botones
            const acciones = new Contenedor("div", {
                className: "d-flex gap-1"
            });
            acciones.agregar(btnEditar).agregar(btnEliminar);

            this.tablaResultados.agregarFila([
                item.producto,
                item.cantidad,
                item.precio.toFixed(2),
                item.importe.toFixed(2),
                acciones
            ]);
        });
    }

    editarFila(index) {
        const item = this.datosTicket[index];

        const nuevoProducto = prompt("Producto:", item.producto);
        if (nuevoProducto === null) return;

        const nuevaCantidad = prompt("Cantidad:", item.cantidad);
        if (nuevaCantidad === null) return;

        const nuevoPrecio = prompt("Precio:", item.precio);
        if (nuevoPrecio === null) return;

        // Actualizar datos
        item.producto = nuevoProducto;
        item.cantidad = Number(nuevaCantidad);
        item.precio = Number(nuevoPrecio);
        item.importe = item.cantidad * item.precio;

        // Volver a pintar la tabla
        this.poblarTabla();
    }

    guardarGastos() {
        console.log("Datos a guardar:", this.datosTicket);
        alert("Gastos guardados correctamente (simulado)");
        this.modal.cerrar();
    }
}
