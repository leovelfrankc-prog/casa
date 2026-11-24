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
        this.btnAnalizar = null;
        this.tablaResultados = null;
        this.modal = null;
        this.datosTicket = [];
        this.metadatosFactura = {};
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

        this.inputFecha.establecerValor(new Date().toISOString().split("T")[0]);

        colFecha.agregar(labelFecha).agregar(this.inputFecha);

        // ===== CÁMARA / ARCHIVO =====
        const colArchivo = new Contenedor("div", {
            className: "mb-4"
        });

        const labelArchivo = new Componente("label");
        labelArchivo.elemento.className = "form-label fw-bold";
        labelArchivo.elemento.textContent = "Comprobante / Ticket";

        this.inputArchivo = new InputArchivo({
            obligatorio: true,
            autoIniciar: true,
            facingMode: "environment"
        });

        colArchivo.agregar(labelArchivo).agregar(this.inputArchivo);

        // ===== BOTÓN =====
        this.btnAnalizar = new Boton({
            texto: "🤖 Analizar Ticket",
            className: "btn btn-dark w-100 py-2 fw-bold"
        });

        this.btnAnalizar.elemento.addEventListener("click", () => {
            this.analizarTicket();
        });

        card
            .agregar(titulo)
            .agregar(colFecha)
            .agregar(colArchivo)
            .agregar(this.btnAnalizar);

        this.agregar(card);

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

    /**
     * Obtiene el contenido en Base64 desde InputArchivo (o leyendo el File si hace falta).
     */
    async obtenerImagenBase64() {
        if (!this.inputArchivo) return "";

        if (typeof this.inputArchivo.obtenerBase64 === "function") {
            const actual = this.inputArchivo.obtenerBase64();
            if (actual) return actual;
        }

        const archivo =
            (typeof this.inputArchivo.obtenerArchivo === "function" &&
                this.inputArchivo.obtenerArchivo()) ||
            this.inputArchivo.elemento?.files?.[0] ||
            null;

        if (!archivo) return "";

        return await new Promise((resolve, reject) => {
            const lector = new FileReader();
            lector.onload = () => resolve(String(lector.result || ""));
            lector.onerror = () => reject(new Error("No se pudo convertir la imagen a Base64."));
            lector.readAsDataURL(archivo);
        });
    }

    /**
     * Normaliza la respuesta JSON que devuelva el backend/IA a un arreglo de ítems
     * { producto, cantidad, precio, importe }.
     */
    normalizarItemsFactura(respuesta) {
        let data = respuesta;

        if (typeof data === "string") {
            const limpio = data.replace(/```json|```/gi, "").trim();
            data = JSON.parse(limpio);
        }

        const rawItems = Array.isArray(data)
            ? data
            : Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.productos)
            ? data.productos
            : Array.isArray(data?.detalle)
            ? data.detalle
            : [];

        if (data && typeof data === "object" && !Array.isArray(data)) {
            const { items, productos, detalle, ...resto } = data;
            this.metadatosFactura = resto;
        } else {
            this.metadatosFactura = {};
        }

        return rawItems.map(item => {
            const cantidad = Number(item.cantidad ?? 1) || 1;
            const precio = Number(item.precio ?? item.precioUnitario ?? 0) || 0;
            const importeCalculado =
                item.importe !== undefined && item.importe !== null
                    ? Number(item.importe)
                    : cantidad * precio;

            return {
                producto: String(item.producto ?? item.nombre ?? item.descripcion ?? "").trim(),
                cantidad,
                precio,
                importe: Math.round(importeCalculado * 100) / 100
            };
        });
    }

    async analizarTicket() {
        const fechaCompra = this.inputFecha.obtenerValor
            ? this.inputFecha.obtenerValor()
            : this.inputFecha.elemento.value;

        const nombreArchivo =
            typeof this.inputArchivo.obtenerNombre === "function"
                ? this.inputArchivo.obtenerNombre()
                : this.inputArchivo.elemento?.files?.[0]?.name || "ticket.jpg";

        let imagenBase64 = "";
        try {
            imagenBase64 = await this.obtenerImagenBase64();
        } catch (err) {
            alert(err.message);
            return;
        }

        if (!imagenBase64) {
            alert("Captura una foto del ticket o selecciona un archivo antes de analizar.");
            return;
        }

        if (!window.motor || typeof window.motor.enviarAccion !== "function") {
            alert("No se encontró window.motor.enviarAccion para comunicarse con el backend.");
            return;
        }

        if (!this.tablaResultados) {
            this.crearModalConTabla();
        }

        const textoOriginalBtn = this.btnAnalizar.elemento.textContent;
        this.btnAnalizar.elemento.disabled = true;
        this.btnAnalizar.elemento.textContent = "⏳ Analizando con IA...";

        try {
            const respuestaIA = await window.motor.enviarAccion("analizarTicket", {
                fecha: fechaCompra,
                nombreArchivo,
                imagenBase64
            });

            this.datosTicket = this.normalizarItemsFactura(respuestaIA);

            if (!this.datosTicket.length) {
                alert("La IA no devolvió productos en el ticket. Revisa la imagen o inténtalo de nuevo.");
                return;
            }

            this.poblarTabla();
            this.modal.abrir();
        } catch (error) {
            console.error("Error al analizar ticket:", error);
            alert(`Error al analizar el ticket: ${error.message || error}`);
        } finally {
            this.btnAnalizar.elemento.disabled = false;
            this.btnAnalizar.elemento.textContent = textoOriginalBtn;
        }
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

        const cantidadNum = Number(nuevaCantidad);
        const precioNum = Number(nuevoPrecio);

        item.producto = nuevoProducto.trim();
        item.cantidad = Number.isFinite(cantidadNum) ? cantidadNum : item.cantidad;
        item.precio = Number.isFinite(precioNum) ? precioNum : item.precio;
        item.importe = Math.round(item.cantidad * item.precio * 100) / 100;

        this.poblarTabla();
    }

    async guardarGastos() {
        if (!this.datosTicket.length) {
            alert("No hay gastos para guardar.");
            return;
        }

        const fechaCompra = this.inputFecha.obtenerValor
            ? this.inputFecha.obtenerValor()
            : this.inputFecha.elemento.value;

        const totalCalculado =
            Math.round(
                this.datosTicket.reduce((acc, item) => acc + (Number(item.importe) || 0), 0) * 100
            ) / 100;

        const cargaGuardado = {
            fecha: fechaCompra,
            importeTotal: totalCalculado,
            metadatos: this.metadatosFactura,
            items: this.datosTicket
        };

        try {
            if (window.motor && typeof window.motor.enviarAccion === "function") {
                await window.motor.enviarAccion("guardarCompraValidada", cargaGuardado);
            }

            console.log("Gastos guardados:", cargaGuardado);
            alert("Gastos guardados correctamente.");
            this.datosTicket = [];
            this.metadatosFactura = {};
            this.inputArchivo.limpiar();
            this.modal.cerrar();
        } catch (error) {
            console.error("Error al guardar gastos:", error);
            alert(`No se pudieron guardar los gastos: ${error.message || error}`);
        }
    }

    destruir() {
        if (this.inputArchivo) {
            this.inputArchivo.destruir();
            this.inputArchivo = null;
        }
        return super.destruir();
    }
}
