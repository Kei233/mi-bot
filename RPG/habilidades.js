const fs = require('fs');
const path = require('path');

// Definimos la ruta absoluta del archivo "habilidades.json"
// Ajusta esta ruta según la ubicación real de tu archivo.
const habilidadesPath = path.resolve(__dirname, 'habilidades.json');

function generarObjetoHabilidad(jugador, id) {
  // Leer el arreglo de habilidades disponibles
  const habilidades = leerHabilidades();
  if (!habilidades || !Array.isArray(habilidades)) {
    return new Error("Error: No se pudieron leer las habilidades.");
  }

  if(!jugador){
      console.log("hubo un error al recibir al jugador en generarObjetoHabilidad: ", jugador);
      return;
      }

  if(!jugador.habilidadesAprendidas || !Array.isArray(jugador.habilidadesAprendidas)){
    jugador.habilidadesAprendidas = [];
  }

  let habilidadSeleccionada;

  if (typeof id !== 'undefined') {
    // Validar que el id sea un número
    if (typeof id !== 'number') {
      return new Error("Error: El id de la habilidad debe ser un número.");
    }
    // Buscar la habilidad con el id pasado
    habilidadSeleccionada = habilidades.find(hab => hab.id === id);
    if (!habilidadSeleccionada) {
      return new Error("Error: La habilidad no existe en el archivo de habilidades.");
    }
    // Comprobar si el jugador ya conoce esta habilidad
    if (jugador.habilidadesAprendidas.includes(id)) {
      return new Error("Error: La habilidad ya ha sido aprendida.");
    }
  } else {
    // No se proporcionó un id, se debe escoger uno aleatorio entre las que el jugador aún no conoce
    const habilidadesNoConocidas = habilidades.filter(hab => !jugador.habilidadesAprendidas.includes(hab.id));
    if (habilidadesNoConocidas.length === 0) {
      return new Error("Error: El jugador ya conoce todas las habilidades disponibles.");
    }
    const randomIndex = Math.floor(Math.random() * habilidadesNoConocidas.length);
    habilidadSeleccionada = habilidadesNoConocidas[randomIndex];
  }

  // Crear y retornar el objeto de habilidad
  const objetoHabilidad = {
    nombre: `Amuleto de ${habilidadSeleccionada.nombre}`,
    tipo: 'habilidad',
    idHabilidad: habilidadSeleccionada.id,
    cantidad: 1
  };

  return objetoHabilidad;
}


function leerHabilidades() {
  try {
    const data = fs.readFileSync(habilidadesPath, 'utf8');
    const habilidades = JSON.parse(data);
    return habilidades;
  } catch (error) {
    console.error("Error al leer el archivo de habilidades:", error);
    return null;
  }
}

function aprenderHabilidad(jugador, idHabilidad) {
  // 1. Validar parámetros
  if (!jugador || typeof jugador !== 'object') {
    return "Error: El jugador no es un objeto válido.";
  }
  if (typeof idHabilidad !== 'number') {
    return "Error: El id de la habilidad debe ser un número.";
  }

  // 2. Inicializar el arreglo de habilidades aprendidas si no existe
  if (!Array.isArray(jugador.habilidadesAprendidas)) {
    jugador.habilidadesAprendidas = [];
  }

  // 3. Verificar si la habilidad ya ha sido aprendida
  if (jugador.habilidadesAprendidas.includes(idHabilidad)) {
    return "Error: La habilidad ya ha sido aprendida.";
  }

  // 4. Leer las habilidades desde el archivo JSON
  const habilidadesJSON = leerHabilidades();
  if (!habilidadesJSON) {
    return "Error: No se pudieron leer las habilidades desde el archivo.";
  }

  // 5. Buscar la habilidad en el JSON usando el id
  const habilidadEncontrada = habilidadesJSON.find(hab => hab.id === idHabilidad);
  if (!habilidadEncontrada) {
    return "Error: La habilidad no existe en el archivo de habilidades.";
  }

  // 6. Agregar el id de la habilidad al arreglo de habilidades aprendidas del jugador
  jugador.habilidadesAprendidas.push(idHabilidad);

  return `La habilidad '${habilidadEncontrada.nombre}' ha sido aprendida por el jugador.`;
}

// Exportar la función para usarla en otros módulos
module.exports = {
  // ...otras funciones,
  aprenderHabilidad,
};


function usarHabilidad(entidad, idHabilidad) {
  // 1. Validar parámetros y datos
  if (!entidad || typeof entidad !== 'object') {
    return "Error: La entidad no es válida.";
  }
  if (typeof idHabilidad !== 'number') {
    return "Error: El id de la habilidad debe ser un número.";
  }
  if (!Array.isArray(entidad.habilidadesAprendidas)) {
    return "Error: La entidad no tiene un arreglo de 'habilidadesAprendidas'.";
  }
  if (!entidad.habilidadesAprendidas.includes(idHabilidad)) {
    return "Error: La habilidad no se encuentra entre las habilidades aprendidas de la entidad.";
  }

  // 2. Leer las habilidades del archivo JSON
  const habilidadesJSON = leerHabilidades();
  if (!habilidadesJSON) {
    return "Error: No se pudieron leer las habilidades desde el archivo.";
  }

  // 3. Buscar la habilidad en el JSON usando el id
  const habilidadEncontrada = habilidadesJSON.find(hab => hab.id === idHabilidad);
  if (!habilidadEncontrada) {
    return "Error: La habilidad no existe en el archivo JSON.";
  }

  // 4. Verificar que la habilidad no esté ya activa en la entidad
  if (!Array.isArray(entidad.habilidades)) {
    entidad.habilidades = [];
  }
  const yaActiva = entidad.habilidades.find(hab => hab.id === idHabilidad);
  if (yaActiva) {
    return "Error: La habilidad ya está activa para la entidad.";
  }

  // 5. Hacer una copia profunda del objeto encontrado para no modificar el original.
  let copiaHabilidad = JSON.parse(JSON.stringify(habilidadEncontrada));

  // 6. Actualizar la copia según el tipo de la habilidad
  // Se asume que copiaHabilidad.tipo es "fisico" o "magica"
  if (copiaHabilidad.tipo === "fisico") {
    // Para habilidades físicas, aumentar en un 10% la intensidad de "fuerza" y "agilidad"
    if (Array.isArray(copiaHabilidad.efectos)) {
      copiaHabilidad.efectos = copiaHabilidad.efectos.map(effect => {
        if (effect.estadistica === "fuerza" || effect.estadistica === "agilidad") {
          return {
            ...effect,
            intensidad: Math.round(effect.intensidad * 1.10)
          };
        }
        return effect;
      });
    }
  } else if (copiaHabilidad.tipo === "magica") {
    // Para habilidades mágicas, aumentar en un 15% la intensidad de "magia" y en un 10% la de "manaMax"
    if (Array.isArray(copiaHabilidad.efectos)) {
      copiaHabilidad.efectos = copiaHabilidad.efectos.map(effect => {
        if (effect.estadistica === "magia") {
          return {
            ...effect,
            intensidad: Math.round(effect.intensidad * 1.15)
          };
        } else if (effect.estadistica === "manaMax") {
          return {
            ...effect,
            intensidad: Math.round(effect.intensidad * 1.10)
          };
        }
        return effect;
      });
    }
  }

  if (copiaHabilidad.costo && copiaHabilidad.costo.estadistica && typeof copiaHabilidad.costo.costo === 'number') {
    const statCosto = copiaHabilidad.costo.estadistica;
    if (entidad.estadisticas && typeof entidad.estadisticas[statCosto] === 'number') {
      entidad.estadisticas[statCosto] -= copiaHabilidad.costo.costo;
    } else {
      return `Error: La entidad no tiene la estadística '${statCosto}' para aplicar el costo.`;
    }
  }

  if (copiaHabilidad.activa === true && Array.isArray(copiaHabilidad.efectos)) {
    copiaHabilidad.efectos.forEach(effect => {
      const stat = effect.estadistica;
      if (entidad.estadisticas && typeof entidad.estadisticas[stat] === 'number') {

        if (effect.buff) {
          entidad.estadisticas[stat] += effect.intensidad;
        } else {
          entidad.estadisticas[stat] -= effect.intensidad;
        }
      } else {
        console.warn(`Advertencia: La entidad no tiene la estadística '${stat}'.`);
      }
    });
  }
  entidad.habilidades.push(copiaHabilidad);

  return `La habilidad '${copiaHabilidad.nombre}' ha sido activada para la entidad.`;
}


function actualizarHabilidadesActivas(entidad) {
  if (!entidad?.entidades || !Array.isArray(entidad.habilidades)) {
    return;
  }
  // Iteramos de atrás hacia adelante para poder eliminar elementos sin afectar el índice.
  for (let i = entidad.habilidades.length - 1; i >= 0; i--) {
    const habilidad = entidad.habilidades[i];
    let resultado = '';

    if(habilidad.pasiva){
      resultado = gestorHabilidadesPasivas(entidad, habilidad);
    }

    // Verificar que la habilidad esté activa
    if (!habilidad.activa) {
      continue;
    }
    // Si la habilidad tiene una propiedad "duracion"
    if (typeof habilidad.duracion === 'number') {
      if (habilidad.duracion > 0) {
        // Disminuir la duración en 1
        habilidad.duracion--;

      } else if (habilidad.duracion <= 0) {
        // Revertir los efectos aplicados
        if (Array.isArray(habilidad.efectos)) {
          habilidad.efectos.forEach(effect => {
            const stat = effect.estadistica;
            if (entidad.estadisticas && typeof entidad.estadisticas[stat] === 'number') {
              // Si se sumó (buff true) se resta; si se restó (buff false) se suma.
              if (effect.buff) {
                entidad.estadisticas[stat] -= effect.intensidad;
              } else {
                entidad.estadisticas[stat] += effect.intensidad;
              }
            } else {
              console.warn(`Advertencia: La entidad no tiene la estadística '${stat}' para revertir la habilidad.`);
            }
          });
        }

        if(habilidad?.debilitador){
          let contador = 0;
          entidad?.modificadoresTemp.forEach(mod => {
            if(mod.estadistica == 'todas' && !mod.buff){
              contador++;
            }
          })

          contador >= 1 ? contador = contador : contador = 1;
          const nuevaIntensidad = (effect.intensidad / 10) * contador;
          const debilitador = {
            estadistica: "todas",
            intensidad: nuevaIntensidad,
            duracion: (habilidad.duracion / 2) + contador,
            buff: false
          }
          entidad.modificadoresTemp.push(debilitador);
          entidad.estadisticas.fuerza -= nuevaIntensidad;
          entidad.estadisticas.agilidad -= nuevaIntensidad;
          entidad.estadisticas.mana -= nuevaIntensidad;
          entidad.estadisticas.magia -= nuevaIntensidad;
        }
        
        entidad.habilidades.splice(i, 1);
      }
    }
  }
}

function gestorHabilidadesPasivas(entidad, habilidad){
  try{
  if(!entidad || !habilidad){
    console.log("Hubo un error en el gestor de habilidades pasivas.");
    return;
  }

  const condicion = habilidad.pasiva.nombre;

  if(!condicion){
    console.log("error al obtener la condición de la habilidad pasiva.");
    return;
  }

  let mensajeFinal = '';
  let modificador = {};

  switch(condicion){

    case 'perseverancia':

    const nuevaIntensidad = Math.round(entidad.estadisticas.magia / 10) + Math.round(entidad.estadisticas.fuerza / 10) + 100 + habilidad.pasiva.intensidad;

    if(habilidad.tipo === 'fisico'){
      entidad.estadistica.fuerza += nuevaIntensidad;
    }else if(habilidad.tipo === 'magico'){
      entidad.estadistica.magia += nuevaIntensidad;
    }
    modificador = {
      estadistica: `${habilidad.tipo === 'fisico' ? "fuerza" : "magia"}`,
      intensidad: nuevaIntensidad,
      duracion: habilidad.duracion,
      buff: true
      }
      
      entidad.modificadoresTemp.push(modificador);

    mensajeFinal += `_*¡${entidad.nombre} ha recibido demasiado daño, pero su habilidad perseverancia lo mantiene en el juego. ¡Estadisticas aumentadas en ${nuevaIntensidad}`
    break;


    default: 
    mensajeFinal += "_No se encontro la condición!_";
    break;
  }

  return mensajeFinal;

}catch(err){
  console.log("Hubo un error en el gestor de habilidades pasivas: ", err, err.stack);
}
}

module.exports = {
  leerHabilidades,
  usarHabilidad,
  actualizarHabilidadesActivas,
  generarObjetoHabilidad,
  aprenderHabilidad
};
