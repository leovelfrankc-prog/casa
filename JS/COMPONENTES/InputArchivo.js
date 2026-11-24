import { Componente } from "./Componente.js";

export class InputArchivo extends Componente {

    constructor(config = {}) {
        // Contenedor raíz para albergar <video>, <canvas>, vista previa y controles
        super("div");

        this.obligatorio = Boolean(config.obligatorio);
        this.autoIniciar = config.autoIniciar !== false; // Activa la cámara al montarse si está disponible
        this.facingMode = config.facingMode || "environment"; // Cámara trasera por defecto
        this.accept = config.accept || "image/*";
        this.maxSize = config.maxSize || 5 * 1024 * 1024;

        this.archivo = null;
        this.base64 = null;
        this.stream = null;

        this.aplicarConfiguracion({
            className: "d-flex flex-column align-items-center gap-2 w-100",
            ...config
        });

        this._construirUI();

        if (this.autoIniciar) {
            requestAnimationFrame(() => this.iniciarCamara());
        } else {
            this.btnCapturar.classList.add("d-none");
            this.video.classList.add("d-none");
        }
    }

    _construirUI() {
        const wrapper = document.createElement("div");
        wrapper.className = "position-relative w-100 rounded overflow-hidden bg-dark";
        wrapper.style.minHeight = "120px";
        wrapper.style.maxHeight = "360px";

        this.video = document.createElement("video");
        this.video.className = "w-100 h-100 object-fit-cover d-block";
        this.video.setAttribute("playsinline", "true");
        this.video.setAttribute("autoplay", "true");
        this.video.muted = true;

        this.previewImg = document.createElement("img");
        this.previewImg.className = "w-100 h-100 object-fit-contain d-none";
        this.previewImg.style.maxHeight = "360px";
        this.previewImg.alt = "Vista previa del comprobante";

        this.canvas = document.createElement("canvas");
        this.canvas.className = "d-none";

        // Input oculto para galería / archivo (sin 'capture' para permitir elegir de la galería)
        this.inputFallback = document.createElement("input");
        this.inputFallback.type = "file";
        this.inputFallback.accept = this.accept;
        this.inputFallback.className = "d-none";

        this.inputFallback.addEventListener("change", async () => {
            const file = this.inputFallback.files?.[0] || null;
            if (!file) return;

            await this._procesarBlobOArchivo(file);

            if (this.base64) {
                this._mostrarVistaPrevia(this.base64);
            }
        });

        wrapper.append(this.video, this.previewImg, this.canvas, this.inputFallback);

        // Barra de acciones (Capturar / Tomar otra / Galería o Archivo)
        const controles = document.createElement("div");
        controles.className = "d-flex gap-2 w-100 justify-content-center flex-wrap";

        this.btnCapturar = document.createElement("button");
        this.btnCapturar.type = "button";
        this.btnCapturar.className = "btn btn-primary fw-bold px-4";
        this.btnCapturar.textContent = "📸 Capturar foto";
        this.btnCapturar.addEventListener("click", () => this.capturarFoto());

        this.btnRepetir = document.createElement("button");
        this.btnRepetir.type = "button";
        this.btnRepetir.className = "btn btn-outline-secondary d-none";
        this.btnRepetir.textContent = "🔄 Tomar otra";
        this.btnRepetir.addEventListener("click", () => this.repetirFoto());

        this.btnArchivo = document.createElement("button");
        this.btnArchivo.type = "button";
        this.btnArchivo.className = "btn btn-outline-dark btn-sm";
        this.btnArchivo.textContent = "📁 Galería / Archivo";
        this.btnArchivo.addEventListener("click", () => {
            this.inputFallback.value = "";
            this.inputFallback.click();
        });

        controles.append(this.btnCapturar, this.btnRepetir, this.btnArchivo);

        this.elemento.append(wrapper, controles);
    }

    _mostrarVistaPrevia(src) {
        this.detenerCamara();
        this.previewImg.src = src;
        this.previewImg.classList.remove("d-none");
        this.video.classList.add("d-none");
        this.btnCapturar.classList.add("d-none");
        this.btnRepetir.classList.remove("d-none");
    }

    async iniciarCamara() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.video.classList.add("d-none");
            this.btnCapturar.classList.add("d-none");
            return;
        }

        try {
            this.detenerCamara();

            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: this.facingMode },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });

            this.video.srcObject = this.stream;
            this.video.classList.remove("d-none");
            this.previewImg.classList.add("d-none");
            this.btnCapturar.classList.remove("d-none");
            this.btnRepetir.classList.add("d-none");

            await this.video.play();
        } catch (error) {
            console.warn("No se pudo abrir la cámara en vivo, se mantiene selección de archivo:", error);
            this.video.classList.add("d-none");
            this.btnCapturar.classList.add("d-none");
        }
    }

    capturarFoto() {
        if (!this.video || !this.video.videoWidth || !this.video.videoHeight) {
            return;
        }

        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;

        const ctx = this.canvas.getContext("2d");
        ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

        this.canvas.toBlob(async (blob) => {
            if (!blob) return;

            const archivoCapturado = new File(
                [blob],
                `comprobante_${Date.now()}.jpg`,
                { type: "image/jpeg" }
            );

            await this._procesarBlobOArchivo(archivoCapturado);

            if (this.base64) {
                this._mostrarVistaPrevia(this.base64);
            }
        }, "image/jpeg", 0.85);
    }

    async repetirFoto() {
        this.inputFallback.value = "";
        this.archivo = null;
        this.base64 = null;
        this.previewImg.src = "";
        this.previewImg.classList.add("d-none");

        if (this.autoIniciar) {
            await this.iniciarCamara();
        } else {
            this.btnRepetir.classList.add("d-none");
        }
    }

    detenerCamara() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.video) {
            this.video.srcObject = null;
        }
    }

    async _procesarBlobOArchivo(archivo) {
        if (!archivo) {
            this.archivo = null;
            this.base64 = null;
            return;
        }

        if (archivo.size > this.maxSize) {
            alert("El archivo es demasiado grande. Selecciona uno menor a 5MB.");
            this.limpiar();
            return;
        }

        this.archivo = archivo;
        this.base64 = await this.convertirABase64(archivo);

        if (typeof this.guardarMemoria === "function") {
            this.guardarMemoria({
                nombre: this.archivo.name,
                tipo: this.archivo.type,
                tamano: this.archivo.size,
                base64: this.base64
            });
        }

        this.elemento.dispatchEvent(new Event("change", { bubbles: true }));
    }

    convertirABase64(archivo) {
        return new Promise((resolve, reject) => {
            const lector = new FileReader();
            lector.onload = () => resolve(lector.result);
            lector.onerror = reject;

            setTimeout(() => {
                lector.readAsDataURL(archivo);
            }, 0);
        });
    }

    obtenerArchivo() {
        return this.archivo;
    }

    obtenerBase64() {
        return this.base64;
    }

    obtenerNombre() {
        return this.archivo ? this.archivo.name : null;
    }

    obtenerTipo() {
        return this.archivo ? this.archivo.type : null;
    }

    obtenerTamano() {
        return this.archivo ? this.archivo.size : null;
    }

    obtenerValor() {
        return this.base64;
    }

    limpiar() {
        this.inputFallback.value = "";
        this.archivo = null;
        this.base64 = null;
        this.previewImg.src = "";
        this.previewImg.classList.add("d-none");
        this.btnRepetir.classList.add("d-none");

        if (this.autoIniciar) {
            this.iniciarCamara();
        }

        return this;
    }

    esValido() {
        if (!this.obligatorio) {
            return true;
        }
        return this.archivo !== null;
    }

    destruir() {
        this.detenerCamara();
        return super.destruir();
    }
}
