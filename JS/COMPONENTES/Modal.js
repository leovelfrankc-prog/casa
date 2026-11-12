import { Componente } from "./Componente.js";
import { Contenedor } from "./Contenedor.js";
import { Boton } from "./Boton.js";

export class Modal extends Contenedor {
    constructor(config = {}) {
        super("div", {
            className: "modal fade",
            atributos: {
                tabindex: "-1",
                "aria-hidden": "true",
                role: "dialog"
            },
            ...config
        });

        this.estaAbierto = false;
        this.cerrarAlClickFuera = config.cerrarAlClickFuera !== false;
        this.cerrarConEscape = config.cerrarConEscape !== false;

        // Estructura Bootstrap
        this.dialogo = new Contenedor("div", {
            className: "modal-dialog modal-dialog-centered"
        });

        this.contenido = new Contenedor("div", {
            className: "modal-content"
        });

        this.cabecera = new Contenedor("div", {
            className: "modal-header"
        });

        this.titulo = new Componente("h5");
        this.titulo.elemento.className = "modal-title";
        this.titulo.elemento.textContent = config.titulo || "";

        this.botonCerrar = new Boton({
            className: "btn-close",
            atributos: {
                "aria-label": "Cerrar"
            }
        });

        this.cuerpo = new Contenedor("div", {
            className: "modal-body"
        });

        this.pie = new Contenedor("div", {
            className: "modal-footer"
        });

        // Armar estructura
        this.cabecera
            .agregar(this.titulo)
            .agregar(this.botonCerrar);

        this.contenido
            .agregar(this.cabecera)
            .agregar(this.cuerpo)
            .agregar(this.pie);

        this.dialogo.agregar(this.contenido);
        this.agregar(this.dialogo);

        // Eventos
        this.botonCerrar.elemento.addEventListener("click", () => this.cerrar());

        this.elemento.addEventListener("click", (e) => {
            if (this.cerrarAlClickFuera && e.target === this.elemento) {
                this.cerrar();
            }
        });

        this._manejarEscape = (e) => {
            if (e.key === "Escape" && this.estaAbierto && this.cerrarConEscape) {
                this.cerrar();
            }
        };

        // Estado inicial (no usamos hidden de Componente para evitar conflictos)
        this.elemento.style.display = "none";
        this.guardarMemoria({ estaAbierto: false });
    }

    establecerTitulo(texto = "") {
        this.titulo.elemento.textContent = texto;
        return this;
    }

    establecerCuerpo(componenteOElemento) {
        this.cuerpo.vaciar();

        if (componenteOElemento instanceof Componente) {
            this.cuerpo.agregar(componenteOElemento);
        } else if (componenteOElemento instanceof HTMLElement) {
            this.cuerpo.elemento.append(componenteOElemento);
        }

        return this;
    }

    agregarAlCuerpo(componente) {
        this.cuerpo.agregar(componente);
        return this;
    }

    establecerPie(componenteOElemento) {
        this.pie.vaciar();

        if (componenteOElemento instanceof Componente) {
            this.pie.agregar(componenteOElemento);
        } else if (componenteOElemento instanceof HTMLElement) {
            this.pie.elemento.append(componenteOElemento);
        }

        return this;
    }

    agregarAlPie(componente) {
        this.pie.agregar(componente);
        return this;
    }

    agregarBotones(...botones) {
        botones.forEach(boton => {
            if (boton instanceof Componente) {
                this.pie.agregar(boton);
            }
        });
        return this;
    }

    agregarBotonesAceptarCancelar(opciones = {}) {
        // Limpiamos el footer antes de agregar los botones
        this.pie.vaciar();

        const {
            textoAceptar = "Aceptar",
            textoCancelar = "Cancelar",
            claseAceptar = "btn btn-primary",
            claseCancelar = "btn btn-secondary",
            onAceptar = null,
            onCancelar = null,
            cerrarAlAceptar = true,
            cerrarAlCancelar = true
        } = opciones;

        const btnCancelar = new Boton({
            texto: textoCancelar,
            className: claseCancelar
        });

        const btnAceptar = new Boton({
            texto: textoAceptar,
            className: claseAceptar
        });

        btnCancelar.elemento.addEventListener("click", () => {
            if (typeof onCancelar === "function") onCancelar();
            if (cerrarAlCancelar) this.cerrar();
        });

        btnAceptar.elemento.addEventListener("click", () => {
            if (typeof onAceptar === "function") onAceptar();
            if (cerrarAlAceptar) this.cerrar();
        });

        this.agregarBotones(btnCancelar, btnAceptar);

        this.botonCancelar = btnCancelar;
        this.botonAceptar = btnAceptar;

        return this;
    }

    establecerTamaño(tamaño = null) {
        this.dialogo.elemento.classList.remove("modal-sm", "modal-lg", "modal-xl");

        if (tamaño) {
            this.dialogo.elemento.classList.add(`modal-${tamaño}`);
        }
        return this;
    }

    abrir() {
    if (this.estaAbierto) return this;

    console.log("1. Entrando a abrir()");

    if (!document.body.contains(this.elemento)) {
        document.body.appendChild(this.elemento);
        console.log("2. Modal añadido al body");
    }

    this.elemento.style.display = "block";
    this.elemento.style.zIndex = "1055"; // forzar z-index
    this.elemento.removeAttribute("aria-hidden");
    this.elemento.setAttribute("aria-modal", "true");

    // Forzar reflow
    this.elemento.offsetHeight;

    this.elemento.classList.add("show");

    console.log("3. Clases del modal:", this.elemento.className);
    console.log("4. Display:", this.elemento.style.display);
    console.log("5. Modal en el DOM:", document.body.contains(this.elemento));

    this._crearBackdrop();

    document.body.classList.add("modal-open");
    document.body.style.overflow = "hidden";

    this.estaAbierto = true;
    this.guardarMemoria({ estaAbierto: true });

    document.addEventListener("keydown", this._manejarEscape);

    return this;
}
    cerrar() {
        if (!this.estaAbierto) return this;

        this.elemento.classList.remove("show");

        // Esperamos a que termine la transición (opcional pero más limpio)
        const alTerminar = () => {
            this.elemento.style.display = "none";
            this.elemento.setAttribute("aria-hidden", "true");
            this.elemento.removeAttribute("aria-modal");
            this.elemento.removeEventListener("transitionend", alTerminar);
        };

        this.elemento.addEventListener("transitionend", alTerminar);

        // Por si no hay transición
        setTimeout(() => {
            if (this.elemento.style.display !== "none") {
                alTerminar();
            }
        }, 200);

        this._eliminarBackdrop();

        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";

        this.estaAbierto = false;
        this.guardarMemoria({ estaAbierto: false });

        document.removeEventListener("keydown", this._manejarEscape);

        return this;
    }

    alternar() {
        return this.estaAbierto ? this.cerrar() : this.abrir();
    }

    estaVisible() {
        return this.estaAbierto;
    }

    _crearBackdrop() {
        // Evitar varios backdrops
        if (document.querySelector(".modal-backdrop")) return;

        this._backdrop = document.createElement("div");
        this._backdrop.className = "modal-backdrop fade show";
        document.body.appendChild(this._backdrop);
    }

    _eliminarBackdrop() {
        document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
        this._backdrop = null;
    }
}
