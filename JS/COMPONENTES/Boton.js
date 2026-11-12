import { Componente } from "./Componente.js";

export class Boton extends Componente {

    constructor(config = {}) {

        super("button");

        this.elemento.type = "button";

        this.aplicarConfiguracion(config);

        if (config.texto) {
            this.establecerTexto(config.texto);
        }
    }

    establecerTexto(texto) {

        this.elemento.textContent = texto;

        this.guardarMemoria({
            texto
        });

        return this;
    }

    obtenerTexto() {
        return this.elemento.textContent;
    }

}
