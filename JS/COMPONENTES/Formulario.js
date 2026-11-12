import { Contenedor } from "./Contenedor.js";
import { Boton } from "./Boton.js";

export class Formulario extends Contenedor {

    constructor(config = {}) {

        super("form", config);

        this.controles = {};

        this.onSubmit = config.onSubmit || null;

        this.boton = new Boton({
            texto: config.textoBoton || "Aceptar",
            className:
                config.classNameBoton ||
                "btn btn-primary w-100"
        });

        this.boton.deshabilitar();

        this.boton
            .obtenerElemento()
            .addEventListener(
                "click",
                (e) => {

                    e.preventDefault();

                    if (!this.esValido()) {
                        return;
                    }

                    if (typeof this.onSubmit === "function") {

                        this.onSubmit(
                            this.obtenerDatos()
                        );

                    }

                }
            );

        this.agregar(this.boton);
    }

    registrar(nombre, control) {

        this.controles[nombre] = control;

        const boton = this.boton;

        // Insertar antes del botón
        this.hijos.unshift(control);

        this.elemento.insertBefore(
            control.obtenerElemento(),
            boton.obtenerElemento()
        );

        const elemento =
            control.obtenerElemento();

        elemento.addEventListener(
            "input",
            () => this.evaluarBoton()
        );

        elemento.addEventListener(
            "change",
            () => this.evaluarBoton()
        );

        this.evaluarBoton();

        return this;
    }

    obtenerControl(nombre) {

        return this.controles[nombre];

    }

    obtenerDatos() {

        const datos = {};

        for (const [nombre, control] of Object.entries(this.controles)) {

            if (
                typeof control.obtenerValor === "function"
            ) {

                datos[nombre] =
                    control.obtenerValor();

            }

        }

        return datos;
    }

    obligatoriosCompletos() {

        const obligatorios = Object.values(
            this.controles
        ).filter(
            control => control.obligatorio
        );

        return obligatorios.every(
            control => control.esValido()
        );
    }

    hayInformacion() {

        return Object.values(
            this.controles
        ).some(control => {

            if (
                typeof control.obtenerValor !== "function"
            ) {
                return false;
            }

            const valor =
                control.obtenerValor();

            if (
                valor === null ||
                valor === undefined
            ) {
                return false;
            }

            if (
                typeof valor === "string"
            ) {
                return valor.trim() !== "";
            }

            return true;

        });

    }

    evaluarBoton() {

        const habilitar =
            this.obligatoriosCompletos() &&
            this.hayInformacion();

        if (habilitar) {

            this.boton.habilitar();

        } else {

            this.boton.deshabilitar();

        }

        return habilitar;
    }

    esValido() {

        return Object.values(
            this.controles
        ).every(control => {

            if (
                typeof control.esValido === "function"
            ) {
                return control.esValido();
            }

            return true;

        });

    }

    limpiar() {

        Object.values(
            this.controles
        ).forEach(control => {

            if (
                typeof control.limpiar === "function"
            ) {

                control.limpiar();

            }

        });

        this.boton.deshabilitar();

        return this;
    }

}
