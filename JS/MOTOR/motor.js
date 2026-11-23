// ============================================
// MOTOR
// Administra las instancias de las vistas y la
// comunicación con Google Apps Script
// ============================================

import { construirModuloVista } from "../VISTAS/construirModuloVista.js";

const URL_API_APPS_SCRIPT =
    "https://script.google.com/macros/s/AKfycby7iaBBROOoevvatzpYaOY9ObDXVRr8E_2_-Y2amx7w3Le0w0AdzZDzEJzojZ-MLSBdyg/exec";

export class Motor {

    constructor(urlApi = URL_API_APPS_SCRIPT) {

        this.urlApi = urlApi;
        this.instancias = new Map();

        console.log("Motor creado");
    }

    /**
     * Envía una acción y sus datos mediante POST a Google Apps Script
     * y devuelve el campo `resultado` de la respuesta JSON.
     */
    async enviarAccion(accion, datos = {}, token = null) {

        if (!accion || !String(accion).trim()) {
            throw new Error("enviarAccion: debes indicar una 'accion'.");
        }

        const cuerpo = {
            accion: String(accion).trim(),
            datos,
            ...(token ? { token } : {})
        };

        const respuesta = await fetch(this.urlApi, {
            method: "POST",
            redirect: "follow",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(cuerpo)
        });

        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status} al comunicarse con Apps Script.`);
        }

        const json = await respuesta.json();

        if (!json.ok) {
            throw new Error(json.error || "Error devuelto por Google Apps Script.");
        }

        return json.resultado;
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

motor.guardarVista("Inicio");

motor.cambiarVista("Inicio");

window.motor = motor;
