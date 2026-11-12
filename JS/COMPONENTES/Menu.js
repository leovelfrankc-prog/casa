import { Componente } from "./Componente.js";
import { Contenedor } from "./Contenedor.js";

export class Menu extends Contenedor {
    constructor(config = {}) {
        const clases = ["nav"];

        if (config.pills) clases.push("nav-pills");
        if (config.tabs) clases.push("nav-tabs");
        if (config.vertical) clases.push("flex-column");
        if (config.fill) clases.push("nav-fill");

        super("ul", {
            className: clases.join(" "),
            ...config
        });

        this.items = [];
    }

    /**
     * Agrega un ítem al menú
     * @param {string} texto
     * @param {string} [href="#"]
     * @param {Object} [opciones]
     */
    agregarItem(texto, href = "#", opciones = {}) {
        const li = new Contenedor("li", {
            className: "nav-item"
        });

        const enlace = new Componente("a");
        enlace.elemento.className = "nav-link";
        enlace.elemento.href = href;
        enlace.elemento.textContent = texto;

        if (opciones.activo) {
            enlace.elemento.classList.add("active");
            enlace.elemento.setAttribute("aria-current", "page");
        }

        if (opciones.deshabilitado) {
            enlace.elemento.classList.add("disabled");
        }

        if (typeof opciones.onClick === "function") {
            enlace.elemento.addEventListener("click", (e) => {
                e.preventDefault();
                opciones.onClick(e);
            });
        }

        li.agregar(enlace);
        this.agregar(li);
        this.items.push({ li, enlace, texto });

        return this;
    }

    limpiar() {
        this.vaciar();
        this.items = [];
        return this;
    }

    marcarActivo(texto) {
        this.items.forEach(item => {
            if (item.texto === texto) {
                item.enlace.elemento.classList.add("active");
            } else {
                item.enlace.elemento.classList.remove("active");
            }
        });
        return this;
    }
}
