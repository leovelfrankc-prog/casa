export class Componente {

    constructor(tag) {

        if (!tag) {
            throw new Error(
                "Debe especificarse una etiqueta HTML."
            );
        }

        this.tag = tag;
        this.elemento = document.createElement(tag);
        this.memoria = {};
    }

    aplicarConfiguracion(config = {}) {

        const {
            id,
            nombre,
            className,
            atributos,
            eventos,
            oculto,
            deshabilitado
        } = config;

        if (id) {
            this.elemento.id = id;
        }

        if (nombre) {
            this.elemento.name = nombre;
        }

        if (className) {
            this.elemento.className = className;
        }

        if (atributos) {

            for (const [clave, valor] of Object.entries(atributos)) {

                this.elemento.setAttribute(
                    clave,
                    valor
                );

            }

        }

        if (eventos) {

            for (const [evento, handler] of Object.entries(eventos)) {

                if (typeof handler === "function") {

                    this.elemento.addEventListener(
                        evento,
                        handler
                    );

                }

            }

        }

        if (oculto) {
            this.ocultar();
        }

        if (deshabilitado) {
            this.deshabilitar();
        }

        return this;
    }

    guardarMemoria(datos = {}) {

        Object.assign(
            this.memoria,
            datos
        );

        return this;
    }

    obtenerMemoria() {

        return {
            ...this.memoria
        };

    }

    obtenerElemento() {
        return this.elemento;
    }

    habilitar() {

        if ("disabled" in this.elemento) {

            this.elemento.disabled = false;

            this.guardarMemoria({
                deshabilitado: false
            });

        }

        return this;
    }

    deshabilitar() {

        if ("disabled" in this.elemento) {

            this.elemento.disabled = true;

            this.guardarMemoria({
                deshabilitado: true
            });

        }

        return this;
    }

    mostrar() {

        this.elemento.hidden = false;

        this.guardarMemoria({
            oculto: false
        });

        return this;
    }

    ocultar() {

        this.elemento.hidden = true;

        this.guardarMemoria({
            oculto: true
        });

        return this;
    }

    destruir() {

        this.elemento.remove();

        this.memoria = {};

        return null;
    }

}
