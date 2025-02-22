// Archivo: tienda.js

const fs = require('fs');
const path = './tienda.json';

costoReroll = 100;

const data = null;

function generarTienda(cantidad) {
  const tienda = [];

  for (let i = 0; i < cantidad; i++) {
    // Seleccionar un rango aleatorio basado en probabilidades
    const rangos = Object.keys(data);
    const rango = rangos[Math.floor(Math.random() * rangos.length)];

    // Obtener lista de objetos del rango
    const objetosRango = data[rango].objetos;

    if (objetosRango.length > 0) {
      // Elegir un objeto aleatorio basado en su probabilidad
      const objetoSeleccionado = elegirObjetoConProbabilidad(objetosRango);

      if (objetoSeleccionado) {
        // Limitar la cantidad para objetos de rango S y SS
        const cantidadMaxima = rango === 'S' || rango === 'SS' ? 1 : Math.floor(Math.random() * 5) + 1;

        // Calcular el precio del objeto
        const precio = calcularPrecio(objetoSeleccionado, rango, cantidadMaxima);

        // Agregar el objeto a la tienda
        tienda.push({
          ...objetoSeleccionado,
          cantidad: cantidadMaxima,
          precio
        });
      }
    }
  }
  if (!fs.existsSync(path)) {
    // Si no existe, se crea el archivo con la tienda generada
    fs.writeFileSync(path, JSON.stringify(tienda, null, 2), 'utf8');
  }

  return tienda;
}

function elegirObjetoConProbabilidad(objetos) {
  const totalProbabilidad = objetos.reduce((sum, obj) => sum + obj.probabilidad, 0);
  const random = Math.random() * totalProbabilidad;

  let acumulado = 0;
  for (const objeto of objetos) {
    acumulado += objeto.probabilidad;
    if (random <= acumulado) {
      return objeto;
    }
  }

  return null;
}


function calcularPrecio(objeto, rango, cantidad) {
  const valoresPorCalidad = {
    E: 10,
    D: 20,
    C: 50,
    B: 100,
    A: 200,
    S: 500,
    SS: 1000
  };

  const calidad = objeto.calidad || rango; // Usar calidad del objeto o el rango como fallback
  const basePrecio = valoresPorCalidad[calidad] || 10; // Precio base según calidad
  const multiplicador = 1.1 + parseInt(rango, 36) - 10; // Aumento del 10% más el número del rango

  return Math.ceil(basePrecio * cantidad * multiplicador);
}


function comprarObjeto(jugador, tienda, nombreObjeto, cantidadCompra) {
    // Buscar el objeto en la tienda por nombre
    const objetoTienda = tienda.find(obj => obj.nombre.toLowerCase() === nombreObjeto.toLowerCase());
  
    if (!objetoTienda) {
      return `El objeto "${nombreObjeto}" no está disponible en la tienda.`;
    }
  
    // Verificar si hay suficiente cantidad en la tienda
    if (cantidadCompra > objetoTienda.cantidad) {
      return `No hay suficiente cantidad de "${nombreObjeto}" en la tienda. Disponible: ${objetoTienda.cantidad}.`;
    }
  
    // Calcular el costo total de la compra
    const costoTotal = objetoTienda.precio * cantidadCompra;
  
    // Verificar si el jugador tiene suficiente dinero
    if (jugador.dinero < costoTotal) {
      return `No tienes suficiente dinero para comprar "${nombreObjeto}". Necesitas ${costoTotal} monedas, pero solo tienes ${jugador.dinero}.`;
    }
  
    // Realizar la compra
    jugador.dinero -= costoTotal;
  
    // Actualizar la tienda (reducir la cantidad o eliminar el objeto)
    if (objetoTienda.cantidad === cantidadCompra) {
      const index = tienda.indexOf(objetoTienda);
      tienda.splice(index, 1); // Eliminar el objeto si la cantidad llega a 0
    } else {
      objetoTienda.cantidad -= cantidadCompra;
    }
  
    // Agregar el objeto al inventario del jugador
    const objetoInventario = { ...objetoTienda, cantidad: cantidadCompra };
    delete objetoInventario.precio; // Eliminar el atributo precio en el inventario
    jugador.inventario.push(objetoInventario);
  
    return `Has comprado ${cantidadCompra} "${nombreObjeto}" por ${costoTotal} monedas. Te quedan ${jugador.dinero} monedas.`;
  }

  function rerollTienda(jugador, cantidad) {
    if (jugador.dinero < costoReroll) {
      return 'No tienes suficiente dinero para refrescar la tienda.';
    }
  
    jugador.dinero -= costoReroll;
    costoReroll *= 2;
  
    // Generar una nueva tienda
    const nuevaTienda = generarTienda(cantidad);

    fs.writeFileSync(path, JSON.stringify(nuevaTienda, null, 2), 'utf8');
  
    return nuevaTienda;
  }

function reiniciarTienda(cantidad) {
    // Genera una nueva tienda con la cantidad especificada
    const nuevaTienda = generarTienda(cantidad);
  
    // Guardar la nueva tienda en el archivo JSON
   
    fs.writeFileSync(path, JSON.stringify(nuevaTienda, null, 2), 'utf8');
  
    // Reiniciar el costo de reroll a su valor base
    costoReroll = 100; // O el valor que prefieras
  
    return nuevaTienda;
  }

function mostrarTienda(){

    tienda = leerTienda();

    if(tienda.length <= 0){
        return ('_La tienda esta vacia o no existe. Por favor, usa reroll o avisa a un administrador._');
    }
    
        let mensajeCompleto = '';
    
        tienda.forEach(objeto => {
            let mensaje = `_Nombre: *${objeto.nombre}*_\n_Cantidad: *${objeto.cantidad}*_\n_Precio: *${objeto.precio}*_`;
        
            if (objeto.descripcion) {
              mensaje += `\n_Descripción: *${objeto.descripcion}*_`;
            }
        
            mensajeCompleto += mensaje + '\n_----------- [ $ ] -----------_\n';
          });

        return mensajeCompleto.trim();
}

function leerTienda() {
    try {
        // Verificar si el archivo existe antes de intentar leerlo
        if (fs.existsSync(path)) {
            // Leer el archivo y parsear el contenido a objeto JSON
            const tiendaData = fs.readFileSync(path, 'utf8');
            return JSON.parse(tiendaData); // Retornar el contenido de la tienda como un arreglo u objeto
        } else {
            console.log('El archivo de la tienda no existe.');
            return []; // Retornar un arreglo vacío si el archivo no existe
        }
    } catch (error) {
        console.error('Error al leer el archivo de la tienda:', error);
        return []; // Retornar un arreglo vacío en caso de error
    }
}

module.exports = { comprarObjeto, rerollTienda, reiniciarTienda, leerTienda, mostrarTienda, calcularPrecio};
