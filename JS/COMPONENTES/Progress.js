import { Componente } from "./Componente.js";
import { Contenedor } from "./Contenedor.js";

export class Progress extends Contenedor {
    constructor(config = {}) {
        super("div", {
            className: "progress",
            ...config
        });

        this.barra = new Componente("div");
        this.barra.elemento.className = "progress-bar";
        this.barra.elemento.setAttribute("role", "progressbar");
        this.barra.elemento.style.width = "0%";

        this.agregar(this.barra);

        this.valor = 0;

        if (config.valor != null) this.establecerValor(config.valor);
        if (config.texto) this.establecerTexto(config.texto);
        if (config.color) this.establecerColor(config.color);
        if (config.striped) this.barra.elemento.classList.add("progress-bar-striped");
        if (config.animado) this.barra.elemento.classList.add("progress-bar-animated");
        if (config.altura) this.elemento.style.height = config.altura;
    }

    /**
     * @param {number} porcentaje - Valor entre 0 y 100
     */
    establecerValor(porcentaje = 0) {
        const valor = Math.max(0, Math.min(100, Number(porcentaje)));
        this.valor = valor;

        this.barra.elemento.style.width = `${valor}%`;
        this.barra.elemento.setAttribute("aria-valuenow", valor);
        this.barra.elemento.setAttribute("aria-valuemin", 0);
        this.barra.elemento.setAttribute("aria-valuemax", 100);

        return this;
    }

    establecerTexto(texto = "") {
        this.barra.elemento.textContent = texto;
        return this;
    }

    /**
     * @param {"success"|"info"|"warning"|"danger"|"primary"|"secondary"} color
     */
    establecerColor(color = "primary") {
        this.barra.elemento.classList.remove(
            "bg-success", "bg-info", "bg-warning", "bg-danger",
            "bg-primary", "bg-secondary", "bg-dark"
        );
        this.barra.elemento.classList.add(`bg-${color}`);
        return this;
    }

    incrementar(cantidad = 10) {
        return this.establecerValor(this.valor + cantidad);
    }

    reiniciar() {
        return this.establecerValor(0);
    }
}
