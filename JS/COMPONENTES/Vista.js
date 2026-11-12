import { Contenedor } from "./Contenedor.js";

export class Vista extends Contenedor {

    constructor(config = {}) {

        super("div", config);

        this.inicializar();
    }

    inicializar() {
        // Sobrescribir en las vistas hijas
    }

}
