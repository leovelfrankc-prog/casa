import { Componente } from "./Componente.js";

export class InputTexto extends Componente {

    constructor(config = {}) {

        super("input");

        this.elemento.type = "text";

        this.obligatorio = Boolean(config.obligatorio);

        if (this.obligatorio) {
            this.elemento.required = true;
        }

        this.aplicarConfiguracion(config);

        this.elemento.addEventListener("input", () => {

            this.guardarMemoria({
                valor: this.obtenerValor()
            });

        });
    }

    obtenerValor() {
        return this.elemento.value;
    }

    establecerValor(valor = "") {

        this.elemento.value = valor;

        this.guardarMemoria({
            valor
        });

        return this;
    }

    limpiar() {
        return this.establecerValor("");
    }

    esValido() {

        if (!this.obligatorio) {
            return true;
        }

        return this.obtenerValor().trim() !== "";
    }

}
