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

    _obtenerFacturasDesarrollo() {
        return [
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
            },
            {
                idFactura: "FAC-2026-03",
                tipo: "Servicios",
                items: [
                    { producto: "Internet hogar", cantidad: 1, precio: 40.00, importe: 40.00, participa: true },
                    { producto: "Gas cocina", cantidad: 1, precio: 24.00, importe: 24.00, participa: true }
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
        this.facturasPendientes = this._obtenerFacturasDesarrollo();

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
        badgeUsuario.elemento.textContent = `Sesión: ${this.usuarioActual} (Dev)`;

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
        this.facturasPendientes = Array.isArray(facturas) && facturas.length
            ? facturas
            : this._obtenerFacturasDesarrollo();
        this.renderizarFacturas();
    }

    renderizarFacturas() {
        if (!this.tablaFacturas) return;

        // Respaldo de desarrollo: nunca dejar facturasPendientes como undefined
        if (!Array.isArray(this.facturasPendientes) || this.facturasPendientes.length === 0) {
            this.facturasPendientes = this._obtenerFacturasDesarrollo();
        }

        this.tablaFacturas.limpiarCuerpo();

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
