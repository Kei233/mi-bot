const fs = require('fs');
const path = require('path');
const {cargarRegistros, guardarRegistros} = require('../registro');
const { cargarHechizos } = require('./hechizos');
const { Mundo } = require('../Mundo.js'); 
const { generarLoot } = require('./loot.js'); 
const { leerHabilidades } = require('./habilidades.js');
const { guardarObjetivo } = require('./combate.cjs');

// Ruta al archivo JSON de criaturas
const filePathCriaturas = path.join(__dirname, 'criaturas.json');
const filePathRecompensas = path.join(__dirname, 'dropeos.json');
const hechizosG = cargarHechizos();

// Cargar criaturas existentes
function cargarCriaturas() {
    if (!fs.existsSync(filePathCriaturas)) {
        fs.writeFileSync(filePathCriaturas, JSON.stringify([]));
    }
    const data = fs.readFileSync(filePathCriaturas, 'utf-8');
    return JSON.parse(data);
}

// Guardar criaturas
function guardarCriaturas(criaturas) {
    fs.writeFileSync(filePathCriaturas, JSON.stringify(criaturas, null, 2));
}

function generarEstadisticas(rango) {
    const rangos = {
        E: { vida: [1000, 1200], mana: [0, 0], fuerza: [120, 270], agilidad: [100, 200], magia: [0, 0], armadura: [15, 25] },
        D: { vida: [2000, 3000], mana: [100, 200], fuerza: [300, 550], agilidad: [250, 500], magia: [1, 200], armadura: [40, 100] },
        C: { vida: [4000, 5000], mana: [200, 300], fuerza: [900, 1500], agilidad: [700, 1000], magia: [400, 1000], armadura: [200, 400] },
        B: { vida: [6000, 8000], mana: [300, 400], fuerza: [500, 750], agilidad: [1200, 1600], magia: [1500, 2200], armadura: [400, 500] },
        A: { vida: [10000, 12000], mana: [400, 500], fuerza: [800, 1200], agilidad: [1900, 2100], magia: [4000, 5000], armadura: [800, 1000] },
        S: { vida: [16000, 20000], mana: [1000, 1800], fuerza: [1500, 3000], agilidad: [2500, 3000],  magia: [6000, 7000], armadura: [1500, 2000] },
        SS: { vida: [25000, 30000], mana: [2000, 4000], fuerza: [4000, 7000], agilidad: [3000, 6000], magia: [7000,8000], armadura: [3000, 4000] }
    };

    const stats = rangos[rango];
    if (!stats) throw new Error('Rango inválido. Usa: E, D, C, B, A, S o SS.');

    function generarValor(min, max) {
        let valor;
        do {
            valor = Math.floor(Math.random() * (max - min + 1)) + min;
        } while (valor % 5 !== 0);
        return valor;
    }

    const vida = generarValor(stats.vida[0], stats.vida[1]);
    const mana = generarValor(stats.mana[0], stats.mana[1]);
    const fuerza = generarValor(stats.fuerza[0], stats.fuerza[1]);
    const agilidad = generarValor(stats.agilidad[0], stats.agilidad[1]);
    const armadura = generarValor(stats.armadura[0], stats.armadura[1]);
    const crit = 2 + (Math.floor(fuerza / 100));

    if(Mundo.evento === 'luna Roja'){
        vida *= 1.5;
        fuerza *= 2;
        mana *= 2;
        agilidad *= 1.5;
        armadura *= 1.2;
        magia *= 2;
    }

    const experiencia = Math.round((vida * 0.12 + fuerza * 0.29 + agilidad * 0.25));

    const vidaMax = vida;
    const manaMax = mana;

    return {
        vida,
        mana,
        fuerza,
        agilidad,
        vidaMax,
        manaMax,
        armadura,
        experiencia,
        crit,
        efectos: [],
        isJefe: false,
        autoCombat: true
    };
}

function crearCriatura(nombre, rango) {
    if (typeof nombre !== 'string' || nombre.trim() === '') {
        throw new Error('El nombre de la criatura debe ser un texto válido.');
    }

    let idRango;
    let hechizos = new Set();

    // Asignar idRango basado en el rango
    switch (rango) {
        case 'E': idRango = 0; break;
        case 'C': idRango = 1; break;
        case 'D': idRango = 2; break;
        case 'B': idRango = 3; break;
        case 'A': idRango = 4; break;
        case 'S': idRango = 5; break;
        case 'SS': idRango = 6; break;
        default: idRango = -1; 
    }

    // Asignar hechizos si idRango es mayor o igual a 3
    if (idRango >= 1) {
        while (hechizos.size < idRango - 1) {
            const hrandom = Math.floor(Math.random() * hechizosG.length);
            hechizos.add(hechizosG[hrandom].id); // Añadir al Set
        }
    }

    hechizos = Array.from(hechizos);

    const estadisticas = generarEstadisticas(rango);
    const criatura = { 
        nombre, 
        rango, 
        estadisticas, 
        hechizos, 
        idRango, 
        criatura: true, 
        armaPrincipal: null,
        adjudicada: false,
        huida: false, 
        modificadoresTemp: [],
        habilidades: [],
        estados: []
    };
        

    const criaturas = cargarCriaturas();

    // Comprobar si ya existe una criatura con el mismo nombre
    const existe = criaturas.find(r => r.nombre === nombre);
    if (existe) {
        return 'existe';
    }

    // Agregar la nueva criatura a la lista y guardar
    criaturas.push(criatura);
    guardarCriaturas(criaturas);

    console.log(`Criatura ${nombre} de rango ${rango} creada exitosamente.`);
    return criatura;
}


function mostrarEstadisticasCriatura(criatura) {
    const stats = criatura.estadisticas;

    const mensaje = `
*${criatura.nombre} - Rango ${criatura.rango}*
-----------------------------------
*Vida*: ${stats.vida} HP
*Maná*: ${stats.mana} MP
*Fuerza*: ${stats.fuerza}
*Agilidad*: ${stats.agilidad}
*Armadura*: ${stats.armadura}
*Experiencia*: ${stats.experiencia}
*TotalHechizos*: ${criatura.hechizos.length}
*Arma*: ${criatura?.armaPrincipal?.nombre || '*Sin un arma equipada*'}
-----------------------------------
`;

    return mensaje;
}


function procesarSubditos(atacante, objetivo) {
    let mensajeSubditos = '';
  
    // Verificar que el objetivo tenga un arreglo de subditos
    if (!objetivo.subditos || !Array.isArray(objetivo.subditos)) {
      return mensajeSubditos;
    }
  
    // Se crea una copia del arreglo para iterar (evitamos problemas al modificar el array original)
    const subditosCopia = [...objetivo.subditos];
  
    subditosCopia.forEach(subditoNombre => {
      // Buscar la criatura correspondiente al subdito (el arreglo contiene nombres que son claves)
      const subdito = buscarObjetivo([subditoNombre]);
  
      // Si la criatura no se encuentra o ya está "muerta" (por ejemplo, vida <= 0), se elimina del arreglo
      if (!subdito || !subdito.datos || (subdito.estadisticas && subdito.estadisticas.vida <= 0)) {
        objetivo.subditos = objetivo.subditos.filter(nombre => nombre !== subditoNombre);
        return; // Continuar con el siguiente subdito
      }
  
      // Determinar la cantidad de ataques según su id.Rango (si es 0 se define en 1)
      let numAtaques = (subdito.id && subdito.id.Rango && subdito.id.Rango > 0) ? subdito.id.Rango : 1;
      // La cantidad de ataques se asume que está entre 0 y 6 (según lo indicado)
      // Probabilidad inicial para atacar es del 80%
      let probabilidad = 80;
  
      let ataquesExitosos = 0;
      let dañoTotal = 0;
  
      // Realizar hasta numAtaques intentos
      for (let i = 0; i < numAtaques; i++) {
        // Se genera un número aleatorio y se compara con la probabilidad actual
        if (Math.random() * 100 < probabilidad) {
          // Si el subdito ataca, se simula el ataque (subdito ataca al atacante)
          const resultado = realizarAtaque(subdito, atacante);
          ataquesExitosos++;
          dañoTotal += resultado.dañoTotal || 0;
          // Al atacar exitosamente, la probabilidad para el siguiente intento se reduce en 10%
          probabilidad = Math.max(probabilidad - 10, 0);
        }
        // Si el ataque falla, la probabilidad se mantiene para el siguiente intento
      }
  
      // Acumular el mensaje con los resultados del subdito
      if (ataquesExitosos > 0) {
        mensajeSubditos += `_💥 El subdito ${subditoNombre} realizó ${ataquesExitosos} ataque(s), causando un total de ${dañoTotal} de daño._\n`;
      } else {
        mensajeSubditos += `_💥 El subdito ${subditoNombre} no logró atacar._\n`;
      }
    });
  
    return mensajeSubditos;
  }
  

async function dropeo(atacante, objetivo) {
    try{
    let subirnivel = false;
    const criaturas = cargarCriaturas();
    const registros = cargarRegistros();
    console.log("El atacante se encuentra correctamente: ", atacante);

    if (!atacante) {
        throw new Error('No se encontró al atacante en el archivo de usuarios.');
    }

    // Determinar la criatura objetivo
    let criatura;
    if (objetivo === null) {
        // Buscar la primera criatura derrotada
        criatura = criaturas.find(criatura => criatura.estadisticas.vida <= 0);
        if (!criatura) {
            console.log("No hay criaturas derrotadas para dropear recompensas.");
            return null;
        }
    } else {
        // Verificar que el objetivo proporcionado es una criatura válida y derrotada
        if (objetivo.estadisticas.vida > 0) {
            console.log("El objetivo que se paso: ", objetivo);
            throw new Error("El objetivo proporcionado no está derrotado.");
        }
        criatura = objetivo;
    }

    const { rango, estadisticas } = criatura;

    // **Reemplazo de cargarRecompensas() con generarLoot()**
    const loot = generarLoot(objetivo, atacante);

    // Extraer datos del loot
    const dinero = loot.dinero;
    const objetosGanados = loot.objetos;
    console.log(objetosGanados);

    // **Lógica del drop de arma (si la criatura tenía arma)**
    if (objetivo?.armaPrincipal) {
        // Calcular la probabilidad basada en idRango (de 0 a 6)
        const probabilidadArma = Math.max(10, 100 - objetivo.idRango * 15); // Máximo 100%, mínimo 10%
        if (Math.random() * 100 < probabilidadArma) {
            objetosGanados.push({
                nombre: objetivo.armaPrincipal.nombre,
                tipo: "arma",
                daño: objetivo.armaPrincipal.daño,
                efectos: objetivo.armaPrincipal.efectos || null
            });
            console.log(`El arma ${objetivo.armaPrincipal.nombre} fue obtenida por el jugador con una probabilidad del ${probabilidadArma}%.`);
        } else {
            console.log(`El arma ${objetivo.armaPrincipal.nombre} no fue obtenida. Probabilidad del dropeo: ${probabilidadArma}%.`);
        }
    }

    // **Añadir experiencia y calcular nivel**
    const experienciaGanada = estadisticas.experiencia;
    atacante.experiencia += experienciaGanada;

    let experienciaRequerida = atacante.nivel * 100;
    while (atacante.experiencia >= experienciaRequerida) {
        subirnivel = true;
        atacante.experiencia -= experienciaRequerida;
        atacante.nivel += 1;
        atacante.puntosPorDistribuir += 250 + (Math.floor(atacante.nivel / 10) * 100);
        atacante.estadisticas.vidaMax += 500;
        atacante.estadisticas.vida += 500;
        experienciaRequerida = atacante.nivel * 100; // Recalcular experiencia requerida
    }

    // **Actualizar dinero del atacante**
    atacante.dinero += dinero;

    if (!atacante.inventario) {
        atacante.inventario = [];
    }

    if(atacante?.contadorSpawn && atacante.contadorSpawn > 0){
        atacante.contadorSpawn--;
    }

    // **Agregar objetos al inventario**
    if (objetosGanados.length > 0) {
        objetosGanados.forEach(objeto => {
            const existente = atacante.inventario.find(item => item.nombre === objeto.nombre);
            
            if (objeto.tipo === 'generarArma') {
                const armaNueva = generarArmaAleatoria(criatura.idRango, rango);
                atacante.inventario.push(armaNueva);
            } else {
                if (existente) {
                    existente.cantidad += 1;
                } else {
                    atacante.inventario.push({
                        nombre: objeto.nombre,
                        tipo: objeto.tipo,
                        efectos: objeto.efectos,
                        cantidad: 1
                    });
                }
            }
        });
    }

    if(criatura?.adjudicada){
        registros.forEach(registro => {
            if (Array.isArray(registro.adjudicados)) {
                registro.adjudicados = registro.adjudicados.filter(c => c.nombre !== criatura.nombre);
            }
        });
    }

    const criaturaIndex = criaturas.indexOf(criatura);

    if (criaturaIndex !== -1) {
        criaturas.splice(criaturaIndex, 1);

    }

    const criaturasFin = criaturas.filter(c => c.estadisticas.vida > 0);

    try {
        await eliminarCriatura(objetivo);
        console.log("Guardando información en dropeo...");
    } catch (error) {
        console.error('Error al guardar los datos:', error.message, error.stack);
        throw new Error('Hubo un problema al guardar los datos. Verifica los permisos de los archivos.');
    }

    return {
        dinero,
        objetos: objetosGanados,
        experiencia: experienciaGanada,
        subirnivel,
        puntosPorDistribuir: atacante.puntosPorDistribuir,
        nombre: atacante.nombre
    };
}catch(error){
    console.log("Hubo un error en dropeo: ", error, error.stack);
}

}

async function eliminarCriatura(criatura) {
    // Cargar el arreglo de criaturas
    const criaturas = cargarCriaturas();
    
    // Buscar el índice de la criatura en el arreglo (se asume que se identifica por 'nombre')
    const indice = criaturas.findIndex(obj => obj.nombre === criatura.nombre);
    
    if (indice !== -1) {
        // Eliminar la criatura del arreglo
        criaturas.splice(indice, 1);
        
        // Guardar el arreglo actualizado de criaturas
        guardarCriaturas(criaturas);
    }
}

module.exports = { crearCriatura, cargarCriaturas, guardarCriaturas, mostrarEstadisticasCriatura, dropeo, procesarSubditos };