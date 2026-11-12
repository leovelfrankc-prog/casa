import { Componente } from "./Componente.js";

export class InputArchivo extends Componente {
  /**
   * @param {object} [config={}]
   * @param {string} [config.accept="image/*"] - Formatos permitidos
   * @param {boolean} [config.obligatorio=false] - Si es obligatorio adjuntar archivo
   * @param {number} [config.tamanioMaxMB=5] - Tamaño máximo permitido en MB
   */
  constructor(config = {}) {
    super("input", config);

    this.obligatorio = config.obligatorio || false;
    this.tamanioMaxMB = config.tamanioMaxMB || 5;

    // Configurar atributos por defecto
    this.elemento.setAttribute("type", "file");
    this.elemento.setAttribute("accept", config.accept || "image/*");

    if (this.obligatorio) {
      this.elemento.setAttribute("required", "true");
    }

    // Escuchar el cambio para actualizar la memoria con el archivo
    this.elemento.addEventListener("change", (e) => {
      const archivo = e.target.files[0] || null;
      
      this.guardarMemoria({
        file: archivo,
        nombre: archivo ? archivo.name : null,
        valido: this.esValido()
      });
    });
  }

  /**
   * Devuelve el objeto File seleccionado
   */
  obtenerArchivo() {
    return this.elemento.files[0] || null;
  }

  /**
   * Genera una URL temporal para renderizar una vista previa
   */
  obtenerURLTemporal() {
    const archivo = this.obtenerArchivo();
    return archivo ? URL.createObjectURL(archivo) : null;
  }

  /**
   * Valida si el archivo cumple con las reglas (obligatorio y tamaño)
   */
  esValido() {
    const archivo = this.obtenerArchivo();

    // Si es obligatorio y no hay archivo -> inválido
    if (this.obligatorio && !archivo) {
      return false;
    }

    // Si hay archivo, validamos el tamaño máximo
    if (archivo) {
      const tamanioBytes = archivo.size;
      const bytesPermitidos = this.tamanioMaxMB * 1024 * 1024;
      
      if (tamanioBytes > bytesPermitidos) {
        return false; // Excede el límite de peso
      }
    }

    return true;
  }

  limpiar() {
    this.elemento.value = "";
    this.guardarMemoria({ file: null, nombre: null, valido: !this.obligatorio });
  }
}
