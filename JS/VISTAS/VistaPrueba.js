import { Vista } from "../REGISTRO.js";

export class VistaPrueba extends Vista {
    inicializar() {
        this.aplicarConfiguracion({
            className: "container vh-100 d-flex flex-column justify-content-center align-items-center gap-3"
        });

        const botonPrueba = document.createElement("button");
        botonPrueba.type = "button";
        botonPrueba.className = "btn btn-primary";
        botonPrueba.textContent = "Probar fetch";

        const salida = document.createElement("pre");
        salida.className = "bg-light border rounded p-3 w-75 overflow-auto";
        salida.style.maxHeight = "300px";
        salida.textContent = "Listo para probar...";

        botonPrueba.addEventListener("click", async () => {
            if (!window.motor || typeof window.motor.enviarAccion !== "function") {
                const msg = "No se encontró window.motor.enviarAccion";
                console.error(msg);
                salida.textContent = msg;
                return;
            }

            botonPrueba.disabled = true;
            salida.textContent = "Consultando Apps Script...";

            try {
                const resultado = await window.motor.enviarAccion(
                    "facturasPendientesUsuario",
                    { idUsuario: "USR-0001" }
                );

                console.log("Respuesta de Apps Script:", resultado);
                salida.textContent = JSON.stringify(resultado, null, 2);
            } catch (error) {
                console.error("Error en fetch de prueba:", error);
                salida.textContent = `Error: ${error.message || error}`;
            } finally {
                botonPrueba.disabled = false;
            }
        });

        this.elemento.appendChild(botonPrueba);
        this.elemento.appendChild(salida);
    }
}
