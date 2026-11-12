import { Componente } from "./Componente.js";
import { Contenedor } from "./Contenedor.js";
import { Boton } from "./Boton.js";

export class Toast extends Contenedor {
    constructor(config = {}) {
        super("div", {
            className: "toast",
            atributos: {
                role: "alert",
                "aria-live": "assertive",
                "aria-atomic": "true"
            },
            ...config
        });

        this.elemento.style.zIndex = "1090";

        this.cabecera = new Contenedor("div", { className: "toast-header" });
        this.cuerpo = new Contenedor("div", { className: "toast-body" });

        this.titulo = new Componente("strong");
        this.titulo.elemento.className = "me-auto";

        this.botonCerrar = new Boton({
            className: "btn-close",
            atributos: { "data-bs-dismiss": "toast", "aria-label": "Cerrar" }
        });

        this.cabecera.agregar(this.titulo).agregar(this.botonCerrar);
        this.agregar(this.cabecera).agregar(this.cuerpo);

        this.botonCerrar.elemento.addEventListener("click", () => this.cerrar());

        this.duracion = config.duracion ?? 4000; // ms
        this._timeout = null;

        if (config.titulo) this.establecerTitulo(config.titulo);
        if (config.mensaje) this.establecerMensaje(config.mensaje);
        if (config.tipo) this.establecerTipo(config.tipo);
    }

    establecerTitulo(texto = "") {
        this.titulo.elemento.textContent = texto;
        return this;
    }

    establecerMensaje(texto = "") {
        this.cuerpo.elemento.textContent = texto;
        return this;
    }

    /**
     * @param {"success"|"danger"|"warning"|"info"|"primary"} tipo
     */
    establecerTipo(tipo = "info") {
        // Limpiar clases de color anteriores
        this.elemento.classList.remove(
            "text-bg-success", "text-bg-danger", "text-bg-warning",
            "text-bg-info", "text-bg-primary", "text-bg-secondary"
        );

        this.elemento.classList.add(`text-bg-${tipo}`);
        return this;
    }

    mostrar(contenedor = document.body) {
        if (!this.elemento.isConnected) {
            // Contenedor de toasts (esquina superior derecha)
            let wrapper = document.getElementById("toast-container");
            if (!wrapper) {
                wrapper = document.createElement("div");
                wrapper.id = "toast-container";
                wrapper.className = "toast-container position-fixed top-0 end-0 p-3";
                wrapper.style.zIndex = "1090";
                document.body.appendChild(wrapper);
            }
            wrapper.appendChild(this.elemento);
        }

        this.elemento.classList.add("show");

        if (this.duracion > 0) {
            clearTimeout(this._timeout);
            this._timeout = setTimeout(() => this.cerrar(), this.duracion);
        }
        return this;
    }

    cerrar() {
        this.elemento.classList.remove("show");
        clearTimeout(this._timeout);

        setTimeout(() => {
            this.elemento.remove();
        }, 300);

        return this;
    }
}
