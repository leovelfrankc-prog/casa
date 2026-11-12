import { Componente } from "./Componente.js";

export class InputPassword extends Componente {
    constructor(config = {}) {
        super("input");
        this.elemento.type = "password";
        this.obligatorio = Boolean(config.obligatorio);
        this.valor = "";

        if (this.obligatorio) {
            this.elemento.required = true;
        }

        this.aplicarConfiguracion(config);

        this.elemento.addEventListener("input", () => {
            this.valor = this.elemento.value;
            this.guardarMemoria({
                longitud: this.valor.length,
                tieneValor: this.valor.length > 0
            });
        });
    }

    obtenerValor() {
        return this.valor;
    }

    establecerValor(valor = "") {
        this.valor = String(valor);
        this.elemento.value = this.valor;
        this.guardarMemoria({
            longitud: this.valor.length,
            tieneValor: this.valor.length > 0
        });
        return this;
    }

    limpiar() {
        return this.establecerValor("");
    }

    esValido() {
        const valor = this.obtenerValor();
        if (this.obligatorio && valor.trim() === "") {
            return false;
        }
        return true;
    }
}
