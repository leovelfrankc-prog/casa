import {
    Vista,
    Contenedor,
    Componente,
    Boton,
    Tabla,
    Modal
} from "../REGISTRO.js";

export class VistaInicio extends Vista {
    constructor(config = {}) {
        super(config);
    }

    _crearEstadoPrueba() {
        const usuarios = ["Sujeto 1", "Sujeto 2", "Sujeto 3", "Sujeto 4"];

        // Convención: matrizDeudas[deudor][acreedor] = monto que 'deudor' debe a 'acreedor'
        return {
            usuarioActual: this.usuarioActual || "Sujeto 1",
            usuarios,
            matrizDeudas: {
                "Sujeto 1": { "Sujeto 1": 0, "Sujeto 2": 14.50, "Sujeto 3": 0, "Sujeto 4": 6.00 },
                "Sujeto 2": { "Sujeto 1": 0, "Sujeto 2": 0, "Sujeto 3": 8.25, "Sujeto 4": 0 },
                "Sujeto 3": { "Sujeto 1": 5.00, "Sujeto 2": 0, "Sujeto 3": 0, "Sujeto 4": 11.20 },
                "Sujeto 4": { "Sujeto 1": 0, "Sujeto 2": 3.50, "Sujeto 3": 0, "Sujeto 4": 0 }
            },
            facturasPendientes: [
                {
                    idFactura: "FAC-2026-01",
                    tipo: "Víveres",
                    items: [
                        { producto: "Leche entera (2L)", cantidad: 2, precio: 2.50, importe: 5.00, participa: true },
                        { producto: "Huevos docena", cantidad: 1, precio: 4.20, importe: 4.20, participa: true },
                        { producto: "Refresco cola 2L", cantidad: 2, precio: 2.00, importe: 4.00, participa: false }
                    ]
                },
                {
                    idFactura: "FAC-2026-02",
                    tipo: "Limpieza",
                    items: [
                        { producto: "Jabón multiusos", cantidad: 1, precio: 6.00, importe: 6.00, participa: true },
                        { producto: "Esponjas pack x3", cantidad: 1, precio: 3.00, importe: 3.00, participa: true }
                    ]
                }
            ],
            pagosPendientes: [
                { idPago: "PAG-101", nombre: "Sujeto 2", hacia: "Sujeto 1", monto: 14.50 },
                { idPago: "PAG-102", nombre: "Sujeto 4", hacia: "Sujeto 3", monto: 6.00 },
                { idPago: "PAG-103", nombre: "Sujeto 1", hacia: "Sujeto 2", monto: 8.25 }
            ]
        };
    }

    inicializar() {
        this.usuarioActual = this.usuarioActual || "Sujeto 1";

        // Variable única que alimenta las tres tablas de la vista
        this.estadoVista = this._crearEstadoPrueba();

        this.tablaEstadoActual = null;
        this.tablaFacturas = null;
        this.tablaPagosPendientes = null;
        this.tablaDetalle = null;
        this.modalRevision = null;
        this.facturaActiva = null;

        this.aplicarConfiguracion({
            className: "container py-4 d-flex flex-column gap-4"
        });

        // Encabezado general de la vista
        const barraSuperior = new Contenedor("div", {
            className: "d-flex justify-content-between align-items-center flex-wrap gap-2"
        });

        const tituloGeneral = new Componente("h2");
        tituloGeneral.elemento.className = "mb-0 text-primary fw-bold";
        tituloGeneral.elemento.textContent = "🏠 Inicio — Resumen de Casa";

        const badgeUsuario = new Componente("span");
        badgeUsuario.elemento.className = "badge bg-dark fs-6";
        badgeUsuario.elemento.textContent = `Sesión: ${this.estadoVista.usuarioActual} (Dev)`;

        barraSuperior.agregar(tituloGeneral).agregar(badgeUsuario);
        this.agregar(barraSuperior);

        // 1. Contenedor: Estado actual (tabla de doble entrada)
        this._construirContenedorEstadoActual();

        // 2. Contenedor: Facturas por revisar
        this._construirContenedorFacturas();

        // 3. Contenedor: Pagos pendientes
        this._construirContenedorPagosPendientes();

        // Modal para revisar facturas
        this._construirModalRevision();

        // Render inicial de las 3 tablas desde this.estadoVista
        this.renderizarTodo();
    }

    _construirContenedorEstadoActual() {
        const card = new Contenedor("div", {
            className: "card shadow-sm p-4 bg-white rounded"
        });

        const titulo = new Componente("h4");
        titulo.elemento.className = "mb-1 fw-bold text-dark";
        titulo.elemento.textContent = "📊 Estado actual";

        const ayuda = new Componente("p");
        ayuda.elemento.className = "text-muted small mb-3";
        ayuda.elemento.textContent = "Lectura por fila: el monto indica cuánto debe la persona de la fila a la persona de la columna.";

        const wrapper = new Contenedor("div", {
            className: "table-responsive"
        });

        this.tablaEstadoActual = new Tabla({
            bordered: true,
            hover: true,
            striped: true
        });

        wrapper.agregar(this.tablaEstadoActual);
        card.agregar(titulo).agregar(ayuda).agregar(wrapper);
        this.agregar(card);
    }

    _construirContenedorFacturas() {
        const card = new Contenedor("div", {
            className: "card shadow-sm p-4 bg-white rounded"
        });

        const titulo = new Componente("h4");
        titulo.elemento.className = "mb-3 fw-bold text-dark";
        titulo.elemento.textContent = "🧾 Facturas por revisar";

        const wrapper = new Contenedor("div", {
            className: "table-responsive"
        });

        this.tablaFacturas = new Tabla({
            bordered: true,
            hover: true,
            striped: true
        });

        this.tablaFacturas.establecerEncabezados([
            "idFactura",
            "tipo",
            "Acción"
        ]);

        wrapper.agregar(this.tablaFacturas);
        card.agregar(titulo).agregar(wrapper);
        this.agregar(card);
    }

    _construirContenedorPagosPendientes() {
        const card = new Contenedor("div", {
            className: "card shadow-sm p-4 bg-white rounded"
        });

        const titulo = new Componente("h4");
        titulo.elemento.className = "mb-3 fw-bold text-dark";
        titulo.elemento.textContent = "💳 Pagos pendientes";

        const wrapper = new Contenedor("div", {
            className: "table-responsive"
        });

        this.tablaPagosPendientes = new Tabla({
            bordered: true,
            hover: true,
            striped: true
        });

        this.tablaPagosPendientes.establecerEncabezados([
            "idPago",
            "nombre",
            "Acción"
        ]);

        wrapper.agregar(this.tablaPagosPendientes);
        card.agregar(titulo).agregar(wrapper);
        this.agregar(card);
    }

    cargarEstado(nuevoEstado = {}) {
        const base = this._crearEstadoPrueba();
        this.estadoVista = {
            ...base,
            ...nuevoEstado,
            usuarios: Array.isArray(nuevoEstado.usuarios) && nuevoEstado.usuarios.length
                ? nuevoEstado.usuarios
                : base.usuarios,
            matrizDeudas: nuevoEstado.matrizDeudas || base.matrizDeudas,
            facturasPendientes: Array.isArray(nuevoEstado.facturasPendientes)
                ? nuevoEstado.facturasPendientes
                : base.facturasPendientes,
            pagosPendientes: Array.isArray(nuevoEstado.pagosPendientes)
                ? nuevoEstado.pagosPendientes
                : base.pagosPendientes
        };
        this.renderizarTodo();
    }

    renderizarTodo() {
        this.renderizarEstadoActual();
        this.renderizarFacturas();
        this.renderizarPagosPendientes();
    }

    renderizarEstadoActual() {
        if (!this.tablaEstadoActual || !this.estadoVista) return;

        const { usuarios, matrizDeudas } = this.estadoVista;
        this.tablaEstadoActual.establecerEncabezados(["Debe \\ A", ...usuarios]);
        this.tablaEstadoActual.limpiarCuerpo();

        usuarios.forEach((deudor) => {
            const filaDeudor = matrizDeudas[deudor] || {};
            const celdas = [deudor];

            usuarios.forEach((acreedor) => {
                if (deudor === acreedor) {
                    celdas.push("—");
                    return;
                }

                const monto = Number(filaDeudor[acreedor] || 0);
                const badge = new Componente("span");
                badge.elemento.className = monto > 0
                    ? "badge bg-danger"
                    : "badge bg-light text-dark border";
                badge.elemento.textContent = `$${monto.toFixed(2)}`;
                celdas.push(badge);
            });

            this.tablaEstadoActual.agregarFila(celdas);
        });
    }

    renderizarFacturas() {
        if (!this.tablaFacturas || !this.estadoVista) return;

        const facturas = Array.isArray(this.estadoVista.facturasPendientes)
            ? this.estadoVista.facturasPendientes
            : [];

        this.tablaFacturas.limpiarCuerpo();

        if (!facturas.length) {
            this.tablaFacturas.agregarFila([
                "—",
                "Sin facturas pendientes de revisión",
                ""
            ]);
            return;
        }

        facturas.forEach((factura) => {
            const btnRevisar = new Boton({
                texto: "Revisar",
                className: "btn btn-primary btn-sm fw-bold",
                eventos: {
                    click: () => this.abrirRevisionFactura(factura.idFactura)
                }
            });

            this.tablaFacturas.agregarFila([
                factura.idFactura,
                factura.tipo,
                btnRevisar
            ]);
        });
    }

    renderizarPagosPendientes() {
        if (!this.tablaPagosPendientes || !this.estadoVista) return;

        const pagos = Array.isArray(this.estadoVista.pagosPendientes)
            ? this.estadoVista.pagosPendientes
            : [];

        this.tablaPagosPendientes.limpiarCuerpo();

        if (!pagos.length) {
            this.tablaPagosPendientes.agregarFila([
                "—",
                "Sin pagos pendientes",
                ""
            ]);
            return;
        }

        pagos.forEach((pago) => {
            const btnRealizarPago = new Boton({
                texto: "Realizar pago",
                className: "btn btn-success btn-sm fw-bold",
                eventos: {
                    click: () => this.realizarPago(pago.idPago)
                }
            });

            this.tablaPagosPendientes.agregarFila([
                pago.idPago,
                pago.nombre,
                btnRealizarPago
            ]);
        });
    }

    realizarPago(idPago) {
        if (!this.estadoVista || !Array.isArray(this.estadoVista.pagosPendientes)) return;

        const indice = this.estadoVista.pagosPendientes.findIndex(p => p.idPago === idPago);
        if (indice === -1) return;

        const [pagoEjecutado] = this.estadoVista.pagosPendientes.splice(indice, 1);

        // Si el pago tiene 'hacia' y 'monto', actualiza la matriz de deudas en tiempo real
        if (
            pagoEjecutado.hacia &&
            typeof pagoEjecutado.monto === "number" &&
            this.estadoVista.matrizDeudas[pagoEjecutado.nombre]
        ) {
            const actual = Number(this.estadoVista.matrizDeudas[pagoEjecutado.nombre][pagoEjecutado.hacia] || 0);
            this.estadoVista.matrizDeudas[pagoEjecutado.nombre][pagoEjecutado.hacia] = Math.max(
                0,
                Number((actual - pagoEjecutado.monto).toFixed(2))
            );
        }

        console.log("Pago realizado (modo desarrollo):", pagoEjecutado);
        this.renderizarEstadoActual();
        this.renderizarPagosPendientes();
    }

    _construirModalRevision() {
        this.tablaDetalle = new Tabla({
            bordered: true,
            hover: true,
            small: true
        });

        this.tablaDetalle.establecerEncabezados([
            "Producto",
            "Cant.",
            "Precio",
            "Importe",
            "Participa",
            "Editar"
        ]);

        this.modalRevision = new Modal({
            titulo: "Revisión de factura"
        });

        this.modalRevision.establecerTamaño("xl");
        this.modalRevision.establecerCuerpo(this.tablaDetalle);

        const btnCompletarRevision = new Boton({
            texto: "✅ Completar revisión",
            className: "btn btn-success fw-bold",
            eventos: {
                click: () => this.completarRevision()
            }
        });

        const btnCerrar = new Boton({
            texto: "Cerrar",
            className: "btn btn-secondary",
            eventos: {
                click: () => this.modalRevision.cerrar()
            }
        });

        this.modalRevision.pie.vaciar();
        this.modalRevision.agregarBotones(btnCerrar, btnCompletarRevision);
    }

    abrirRevisionFactura(idFactura) {
        const factura = this.estadoVista.facturasPendientes.find(f => f.idFactura === idFactura);
        if (!factura) return;

        this.facturaActiva = factura;
        this.modalRevision.establecerTitulo(`Factura ${factura.idFactura} — ${factura.tipo}`);
        this._renderizarDetalleFactura();
        this.modalRevision.abrir();
    }

    _renderizarDetalleFactura() {
        if (!this.tablaDetalle || !this.facturaActiva) return;

        this.tablaDetalle.limpiarCuerpo();
        const items = Array.isArray(this.facturaActiva.items) ? this.facturaActiva.items : [];

        items.forEach((item, index) => {
            const badgeParticipacion = new Componente("span");
            badgeParticipacion.elemento.className = item.participa
                ? "badge bg-success"
                : "badge bg-secondary";
            badgeParticipacion.elemento.textContent = item.participa ? "Sí" : "No";

            const btnEditar = new Boton({
                texto: "Editar",
                className: "btn btn-outline-dark btn-sm",
                eventos: {
                    click: () => this.editarParticipacionItem(index)
                }
            });

            this.tablaDetalle.agregarFila([
                item.producto,
                item.cantidad,
                Number(item.precio).toFixed(2),
                Number(item.importe).toFixed(2),
                badgeParticipacion,
                btnEditar
            ]);
        });
    }

    editarParticipacionItem(index) {
        if (!this.facturaActiva || !Array.isArray(this.facturaActiva.items)) return;
        const item = this.facturaActiva.items[index];
        if (!item) return;

        item.participa = !item.participa;
        this._renderizarDetalleFactura();
    }

    async completarRevision() {
        if (!this.facturaActiva) return;

        const resultadoRevision = {
            accion: "completarRevisionFactura",
            usuario: this.estadoVista.usuarioActual,
            idFactura: this.facturaActiva.idFactura,
            tipo: this.facturaActiva.tipo,
            items: this.facturaActiva.items
        };

        console.log("Revisión completada (modo desarrollo):", resultadoRevision);

        this.estadoVista.facturasPendientes = this.estadoVista.facturasPendientes.filter(
            f => f.idFactura !== this.facturaActiva.idFactura
        );

        this.facturaActiva = null;
        this.renderizarFacturas();
        this.modalRevision.cerrar();
    }

    destruir() {
        if (this.modalRevision && this.modalRevision.estaVisible()) {
            this.modalRevision.cerrar();
        }
        return super.destruir();
    }
}
