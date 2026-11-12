import { Componente } from "./Componente.js";

export class InputEmail extends Componente {

    constructor(config = {}) {

        super("input");

        this.elemento.type = "email";

        this.obligatorio = Boolean(
            config.obligatorio
        );

        if (this.obligatorio) {
            this.elemento.required = true;
        }

        this.aplicarConfiguracion(config);

        this.elemento.addEventListener(
            "input",
            () => {

                this.guardarMemoria({
                    valor: this.obtenerValor()
                });

            }
        );

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

    esEmailValido(email) {

        const patron =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return patron.test(email);

    }

    esValido() {

        const valor =
            this.obtenerValor().trim();

        if (!this.obligatorio && valor === "") {
            return true;
        }

        if (this.obligatorio && valor === "") {
            return false;
        }

        return this.esEmailValido(valor);
    }

}
