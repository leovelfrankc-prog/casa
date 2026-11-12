import {
    Vista,
    Formulario,
    InputArchivo
    
} from "../REGISTRO.js";
export class VistaPrueba extends Vista {
    inicializar() {
        // Configuración de la vista principal con clases de diseño
        this.aplicarConfiguracion({
            className: "container vh-100 d-flex flex-column justify-content-center align-items-center gap-4"
        });

        // Crear instancia del input de archivo
        const inputArchivo = new InputArchivo({
            obligatorio: true,
            className: "form-control"
        });

        // Crear instancia del formulario con su callback onSubmit
        const formulario = new Formulario({
            textoBoton: "Ver contenido del archivo",
            className: "card p-4 shadow-sm w-50 d-flex flex-column gap-3",
            onSubmit: (datos) => {
                const base64 = datos.archivo;

                if (!base64) {
                    alert("No se ha seleccionado ningún archivo.");
                    return;
                }

                // Alerta con el contenido en Base64 almacenado en inputArchivo
                alert(`Contenido almacenado (Base64):\n\n${base64.substring(0, 100)}...`);
                console.log("Contenido completo:", base64);
            }
        });

        // Registrar el input dentro del formulario con la clave "archivo"
        formulario.registrar("archivo", inputArchivo);

        // Agregar el formulario directamente a la vista
        this.agregar(formulario);
    }
}
