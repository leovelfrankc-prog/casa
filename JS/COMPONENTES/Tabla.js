import { Componente } from "./Componente.js";
import { Contenedor } from "./Contenedor.js";
import { Boton } from "./Boton.js";

export class Tabla extends Contenedor {
    constructor(config = {}) {
        const clases = ["table"];

        if (config.striped !== false) clases.push("table-striped");
        if (config.hover !== false) clases.push("table-hover");
        if (config.bordered) clases.push("table-bordered");
        if (config.borderless) clases.push("table-borderless");
        if (config.small) clases.push("table-sm");
        if (config.dark) clases.push("table-dark");

        super("table", {
            className: clases.join(" "),
            ...config
        });

        this.encabezado = new Contenedor("thead");
        this.cuerpo = new Contenedor("tbody");
        this.pie = new Contenedor("tfoot");

        this.agregar(this.encabezado);
        this.agregar(this.cuerpo);

        if (config.conPie) {
            this.agregar(this.pie);
        }

        this.columnas = [];
    }

    /**
     * Establece los encabezados
     * @param {string[]} encabezados
     */
    establecerEncabezados(encabezados = []) {
        this.encabezado.vaciar();
        this.columnas = encabezados;

        const fila = new Contenedor("tr");

        encabezados.forEach(texto => {
            const th = new Componente("th");
            th.elemento.textContent = texto;
            th.elemento.scope = "col";
            fila.agregar(th);
        });

        this.encabezado.agregar(fila);
        return this;
    }

    /**
     * Agrega una fila. Acepta strings, números, Componentes o HTMLElements
     * @param {Array<string|number|Componente|HTMLElement>} celdas
     */
    agregarFila(celdas = []) {
        const fila = new Contenedor("tr");

        celdas.forEach(celda => {
            const td = new Componente("td");

            if (typeof celda === "string" || typeof celda === "number") {
                td.elemento.textContent = String(celda);
            } else if (celda instanceof Componente) {
                td.elemento.append(celda.obtenerElemento());
            } else if (celda instanceof HTMLElement) {
                td.elemento.append(celda);
            } else if (celda != null) {
                td.elemento.textContent = String(celda);
            }

            fila.agregar(td);
        });

        this.cuerpo.agregar(fila);
        return this;
    }

    /**
     * Agrega varias filas
     * @param {Array<Array>} filas
     */
    agregarFilas(filas = []) {
        filas.forEach(fila => this.agregarFila(fila));
        return this;
    }

    /**
     * Carga datos fácilmente desde un array de objetos
     * @param {Object[]} datos - Array de objetos
     * @param {string[]} claves - Claves de las columnas (en el mismo orden que los encabezados)
     * @param {Function} [crearAcciones] - Función opcional que recibe el registro y debe devolver un Componente o HTMLElement (normalmente botones)
     */
    cargarDatos(datos = [], claves = [], crearAcciones = null) {
        this.limpiarCuerpo();

        datos.forEach(registro => {
            const celdas = claves.map(clave => registro[clave] ?? "");

            // Si nos pasan una función para crear botones/acciones
            if (typeof crearAcciones === "function") {
                const acciones = crearAcciones(registro);
                celdas.push(acciones);
            }

            this.agregarFila(celdas);
        });

        return this;
    }

    /**
     * Limpia solo el cuerpo
     */
    limpiarCuerpo() {
        this.cuerpo.vaciar();
        return this;
    }

    /**
     * Limpia toda la tabla
     */
    limpiar() {
        this.encabezado.vaciar();
        this.cuerpo.vaciar();
        this.pie.vaciar();
        this.columnas = [];
        return this;
    }

    obtenerCantidadFilas() {
        return this.cuerpo.obtenerHijos().length;
    }

    agregarFilaPie(celdas = []) {
        const fila = new Contenedor("tr");

        celdas.forEach(celda => {
            const td = new Componente("td");

            if (typeof celda === "string" || typeof celda === "number") {
                td.elemento.textContent = String(celda);
            } else if (celda instanceof Componente) {
                td.elemento.append(celda.obtenerElemento());
            } else if (celda instanceof HTMLElement) {
                td.elemento.append(celda);
            }

            fila.agregar(td);
        });

        this.pie.agregar(fila);
        return this;
    }
}
