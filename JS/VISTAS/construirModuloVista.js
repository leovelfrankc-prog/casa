import { VistaPrueba } from "./VistaPrueba.js";
import { VistaCompras } from "./VistaCompras.js";

const registroVistas = new Map([
  ["Prueba", VistaPrueba],
  ["Compras", VistaCompras]
]);

export function construirModuloVista(nombre) {
  if (!nombre) {
    console.error("construirModuloVista: falta el nombre");
    return null;
  }

  const ClaseVista = registroVistas.get(nombre);

  if (ClaseVista) {
    console.log(`Construyendo vista: "${nombre}"`);
    return new ClaseVista();
  }

  console.warn(`Vista "${nombre}" no registrada. Usando mock.`);
  return {
    render(contenedor) {
      contenedor.innerHTML = `<h2>Vista mock: ${nombre}</h2>`;
    }
  };
}
