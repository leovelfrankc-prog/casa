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

    _datosMockDesarrollo() {
        return [
            {
                idFactura: "FAC-1042",
                tipo: "Víveres",
                items: [
                    { producto: "Leche entera (2L)", cantidad: 2, precio: 2.40, importe: 4.80, participa: true },
                    { producto: "Café molido", cantidad: 1, precio: 7.50, importe: 7.50, participa: true },
                    { producto: "Cerveza pack x6", cantidad: 1, precio: 9.00, importe: 9.00, participa: false }
                ]
            },
            {
                idFactura: "FAC-1043",
                tipo: "Limpieza",
                items: [
                    { producto: "Detergente líquido", cantidad: 1, precio: 11.00, importe: 11.00, participa: true },
                    { producto: "Bolsas de basura", cantidad: 2, precio: 3.25, importe: 6.50, participa: true }
                ]
            },
            {
                idFactura: "FAC-1044",
                tipo: "Servicios",
                items: [
                    { producto: "Internet fibra mensual", cantidad: 1, precio: 40.00, importe: 40.00, participa: true },
                    { producto: "Agua potable", cantidad: 1, precio: 18.00, importe: 18.00, participa: true }
                ]
            }
        ];
    }

    inicializar() {
        this.usuarioActual = this.usuarioActual || "Sujeto 1";
        this.tablaFacturas = null;
        this.tablaDetalle = null;
        this.modalRevision = null;
        this.facturaActiva = null;

        // Datos mock disponibles antes de renderizar la tabla
        this.facturasPendientes = this._datosMockDesarrollo();

        this.aplicarConfiguracion({
            className: "container py-4"
        });

        const card = new Contenedor("div", {
            className: "card shadow-sm p-4 bg-white rounded"
        });

        const encabezado = new Contenedor("div", {
            className: "d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4"
        });

        const titulo = new Componente("h2");
        titulo.elemento.className = "mb-0 text-primary fw-bold";
        titulo.elemento.textContent = "🏠 Inicio — Facturas por Revisar";

        const badgeUsuario = new Componente("span");
        badgeUsuario.elemento.className = "badge bg-dark fs-6";
        badgeUsuario.elemento.textContent = `Sesión: ${this.usuarioActual}`;

        encabezado.agregar(titulo).agregar(badgeUsuario);

        const wrapperTabla = new Contenedor("div", {
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

        wrapperTabla.agregar(this.tablaFacturas);
        card.agregar(encabezado).agregar(wrapperTabla);
        this.agregar(card);

        this._construirModalRevision();
        this.renderizarFacturas();
    }

    cargarFacturas(facturas = []) {
        this.facturasPendientes = Array.isArray(facturas) ? facturas : [];
        this.renderizarFacturas();
    }

    renderizarFacturas() {
        this.tablaFacturas.limpiarCuerpo();

        if (!Array.isArray(this.facturasPendientes) || !this.facturasPendientes.length) {
            this.tablaFacturas.agregarFila([
                "—",
                "Sin facturas pendientes de revisión",
                ""
            ]);
            return;
        }

        this.facturasPendientes.forEach((factura) => {
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
        const factura = this.facturasPendientes.find(f => f.idFactura === idFactura);
        if (!factura) return;

        this.facturaActiva = factura;
        this.modalRevision.establecerTitulo(`Factura ${factura.idFactura} — ${factura.tipo}`);
        this._renderizarDetalleFactura();
        this.modalRevision.abrir();
    }

    _renderizarDetalleFactura() {
        this.tablaDetalle.limpiarCuerpo();
        if (!this.facturaActiva || !Array.isArray(this.facturaActiva.items)) return;

        this.facturaActiva.items.forEach((item, index) => {
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
        if (!this.facturaActiva || !this.facturaActiva.items[index]) return;

        const item = this.facturaActiva.items[index];
        item.participa = !item.participa;
        this._renderizarDetalleFactura();
    }

    async completarRevision() {
        if (!this.facturaActiva) return;

        const resultadoRevision = {
            accion: "completarRevisionFactura",
            usuario: this.usuarioActual,
            idFactura: this.facturaActiva.idFactura,
            tipo: this.facturaActiva.tipo,
            items: this.facturaActiva.items
        };

        console.log("Revisión completada (modo desarrollo):", resultadoRevision);

        this.facturasPendientes = this.facturasPendientes.filter(
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
