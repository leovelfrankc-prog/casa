// ============================================
// MOTOR
// Administra las instancias de las vistas
// ============================================

import { construirModuloVista } from "../VISTAS/construirModuloVista.js";

export class Motor {

    constructor() {

        this.instancias = new Map();

        console.log("Motor creado");
    }

    /**
     * Construye y almacena una vista
     */
    guardarVista(nombre) {

        if (!nombre) {

            console.error(
                "guardarVista: debes indicar un nombre"
            );

            return;
        }

        if (this.instancias.has(nombre)) {

            console.warn(
                `La vista "${nombre}" ya está guardada`
            );

            return this.instancias.get(nombre);
        }

        const vista =
            construirModuloVista(nombre);

        if (!vista) {

            console.error(
                `No se pudo construir la vista "${nombre}"`
            );

            return;
        }

        this.instancias.set(
            nombre,
            vista
        );

        console.log(
            `Vista "${nombre}" guardada`
        );

        return vista;
    }

    /**
     * Devuelve una vista almacenada
     */
    obtenerVista(nombre) {

        return this.instancias.get(nombre);

    }

    /**
     * Cambia la vista mostrada
     */
    cambiarVista(nombre) {

        const vista =
            this.instancias.get(nombre);

        if (!vista) {

            console.error(
                `No existe la vista "${nombre}"`
            );

            return;
        }

        const app =
            document.getElementById("app");

        if (!app) {

            console.error(
                "No existe el contenedor #app"
            );

            return;
        }

        app.replaceChildren(
            vista.obtenerElemento()
        );

        console.log(
            `Vista activa: "${nombre}"`
        );
    }

    listarVistas() {

        console.log(
            "Vistas en memoria:",
            [...this.instancias.keys()]
        );

    }

}
// ============================================
// ARRANQUE
// ============================================

const motor = new Motor();

motor.guardarVista("Compras");

motor.cambiarVista("Compras");

window.motor = motor;
