import { Componente } from "./Componente.js";

export class Select extends Componente {

    constructor(config = {}) {

        super("select");

        this.obligatorio = Boolean(config.obligatorio);

        if (this.obligatorio) {
            this.elemento.required = true;
        }

        this.aplicarConfiguracion(config);

        this.elemento.addEventListener("change", () => {

            this.guardarMemoria({
                valor: this.obtenerValor()
            });

        });
    }

    agregarOpcion(valor, texto) {

        const opcion = document.createElement("option");

        opcion.value = valor;
        opcion.textContent = texto;

        this.elemento.append(opcion);

        return this;
    }

    obtenerValor() {
        return this.elemento.value;
    }

    establecerValor(valor) {

        this.elemento.value = valor;

        this.guardarMemoria({
            valor
        });

        return this;
    }

    limpiar() {

        this.elemento.selectedIndex = 0;

        return this;
    }

    esValido() {

        if (!this.obligatorio) {
            return true;
        }

        return this.obtenerValor() !== "";
    }

}
