import { Componente } from "./Componente.js";
import { Contenedor } from "./Contenedor.js";

export class Card extends Contenedor {
    constructor(config = {}) {
        super("div", {
            className: "card",
            ...config
        });

        this.cabecera = new Contenedor("div", { className: "card-header" });
        this.cuerpo = new Contenedor("div", { className: "card-body" });
        this.pie = new Contenedor("div", { className: "card-footer" });

        this.titulo = new Componente("h5");
        this.titulo.elemento.className = "card-title mb-0";

        this.cabecera.agregar(this.titulo);

        // Por defecto solo mostramos el body. Header y footer se agregan si se usan.
        this.agregar(this.cuerpo);

        this._tieneCabecera = false;
        this._tienePie = false;

        if (config.titulo) {
            this.establecerTitulo(config.titulo);
        }
    }

    establecerTitulo(texto = "") {
        this.titulo.elemento.textContent = texto;

        if (!this._tieneCabecera) {
            this.elemento.insertBefore(this.cabecera.obtenerElemento(), this.cuerpo.obtenerElemento());
            this._tieneCabecera = true;
        }
        return this;
    }

    establecerCuerpo(contenido) {
        this.cuerpo.vaciar();

        if (contenido instanceof Componente) {
            this.cuerpo.agregar(contenido);
        } else if (contenido instanceof HTMLElement) {
            this.cuerpo.elemento.append(contenido);
        } else if (typeof contenido === "string") {
            this.cuerpo.elemento.innerHTML = contenido;
        }
        return this;
    }

    agregarAlCuerpo(componente) {
        this.cuerpo.agregar(componente);
        return this;
    }

    establecerPie(contenido) {
        this.pie.vaciar();

        if (contenido instanceof Componente) {
            this.pie.agregar(contenido);
        } else if (contenido instanceof HTMLElement) {
            this.pie.elemento.append(contenido);
        } else if (typeof contenido === "string") {
            this.pie.elemento.innerHTML = contenido;
        }

        if (!this._tienePie) {
            this.agregar(this.pie);
            this._tienePie = true;
        }
        return this;
    }

    agregarAlPie(componente) {
        if (!this._tienePie) {
            this.agregar(this.pie);
            this._tienePie = true;
        }
        this.pie.agregar(componente);
        return this;
    }
}
