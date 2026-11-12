import { Componente } from "./Componente.js";

export class Contenedor extends Componente {

    constructor(tag = "div", config = {}) {

        super(tag);

        this.hijos = [];

        this.aplicarConfiguracion(config);
    }

    agregar(componente) {

        if (!(componente instanceof Componente)) {
            throw new Error(
                "Solo pueden agregarse instancias de Componente."
            );
        }

        this.hijos.push(componente);

        this.elemento.append(
            componente.obtenerElemento()
        );

        return this;
    }

    eliminar(componente) {

        const indice = this.hijos.indexOf(componente);

        if (indice !== -1) {

            this.hijos.splice(
                indice,
                1
            );

            componente
                .obtenerElemento()
                .remove();
        }

        return this;
    }

    vaciar() {

        this.hijos = [];

        this.elemento.replaceChildren();

        return this;
    }

    obtenerHijos() {

        return [
            ...this.hijos
        ];

    }

}
