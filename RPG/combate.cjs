const { cargarCriaturas, guardarCriaturas, dropeo } = require('./criaturas.js');
const { cargarRegistros, guardarRegistros } = require('../registro.js');
const fs = require('node:fs');
const path = require('node:path');

const filePath = path.join(__dirname, 'modificadores_efectos.json');

function buscarObjetivo(palabras) {
    // Cargar criaturas y registros
    const criaturas = cargarCriaturas();
    const registros = cargarRegistros();

    // Validar si palabras es un array
    if (!Array.isArray(palabras)) {
        if (typeof palabras === 'string') {

            palabras = palabras.split(/\s+/);
        } else {
            console.error("Error: El parámetro no es válido (se esperaba un string o array):", palabras);
            return { tipo: null, datos: null };
        }
    }

    palabras = palabras.filter(palabra => typeof palabra === 'string' && palabra.trim().length > 0 && palabra !== '_');

    // Buscar coincidencias exactas en criaturas
    for (const palabra of palabras) {
        const criatura = criaturas.find(cr => cr.nombre.toLowerCase() === palabra.toLowerCase());
        if (criatura) {
            console.log("Criatura encontrada (exacta): ", criatura);
            return { tipo: 'criatura', datos: criatura };
        }
    }

    // Buscar coincidencias exactas en registros
    for (const palabra of palabras) {
        const usuario = registros.find(reg => reg.nombre.toLowerCase() === palabra.toLowerCase());
        if (usuario) {
            console.log("Usuario encontrado (exacto): ", usuario);
            return { tipo: 'usuario', datos: usuario };
        }
    }

    for (const palabra of palabras) {
        const criaturaParcial = criaturas.find(cr => cr.nombre.toLowerCase().includes(palabra.toLowerCase()));
        if (criaturaParcial) {
            console.log("Criatura encontrada (parcial): ", criaturaParcial);
            return { tipo: 'criatura', datos: criaturaParcial };
        }
    }

    for (const palabra of palabras) {
        const usuarioParcial = registros.find(reg => reg.nombre.toLowerCase().includes(palabra.toLowerCase()));
        if (usuarioParcial) {
            console.log("Usuario encontrado (parcial): ", usuarioParcial);
            return { tipo: 'usuario', datos: usuarioParcial };
        }
    }

    console.log('El resultado de la búsqueda fue inefectivo. Revisa los parámetros a pasar: ', palabras);
    return { tipo: null, datos: null };
}

function realizarAtaque(atacante, objetivo) {

    const efectosAplicados = [];
    if(!atacante || !objetivo){
        console.log("Parametros no encontrados: ", atacante, objetivo);
        return;
    }

    if(!atacante.armaPrincipal){
        atacante.armaPrincipal = {};
    }

    if (atacante.armaPrincipal?.efectos && atacante.armaPrincipal.efectos.length > 0) {
        // Iterar sobre los efectos de la arma principal
        atacante.armaPrincipal.efectos.forEach(efecto => {
            const probabilidad = Math.random() * 100;
            const stats = objetivo.estadisticas;
    
            // Verificar si el efecto se aplica según la probabilidad
            if (probabilidad <= efecto.probabilidad) {
                // Efecto aplicado
                const efectoAplicado = {
                    nombre: efecto.nombre,
                    duracion: efecto.duracion,
                    intensidad: efecto.intensidad
                };
    
                // Asegurar que stats.efectos sea un array
                stats.efectos = stats.efectos || [];
    
                if (!stats.efectos.some(e => e.nombre === efecto.nombre)) {
                    stats.efectos.push(efectoAplicado);
                }
    
                // Si el efecto tiene modificadores, aplicarlos al objetivo
                if (efecto?.modificadores) {
                    // Asegurarnos de que objetivo.modificadoresTemp sea un array
                    objetivo.modificadoresTemp = objetivo.modificadoresTemp || [];
    
                    // Añadir todos los modificadores del efecto al objetivo
                    efecto.modificadores.forEach(modificador => {
                        // Verificar si el modificador ya fue aplicado
                        if (!objetivo.modificadoresTemp.some(m => m.estadistica === modificador.estadistica && m.fuente === modificador.fuente)) {
                            objetivo.modificadoresTemp.push(modificador);
                        }else{
                            const modificador = objetivo.modificadoresTemp.find(m => m.estadistica === modificador.estadistica && m.fuente === modificador.fuente);
                            modificador.duracion += 2;
                            modificador.intensidad += (atacante.estadisticas.magia / 8);
                        }
                    });
                }
            }
        });
    }

    let critico = false;
    let { fuerza } = atacante.estadisticas;
    let fuerzaArma = atacante.armaPrincipal.daño || 0;
    let Pcrit = atacante.estadisticas.crit || 0; 

    if(Pcrit){
        const probabilidad = Math.floor(Math.random() * 100) + 1;
        if(probabilidad < Pcrit){
            fuerza = Math.floor(fuerza * 1.5);
            critico = true;
        }
    }

    let dañoTotal = fuerza + fuerzaArma;
    let dañoSobrante = 0;
    let dañoArm = 0;

    // Si el objetivo tiene armadura
    if (objetivo.estadisticas.armadura && objetivo.estadisticas.armadura > 0) {
        if (dañoTotal > objetivo.estadisticas.armadura) {
            dañoArm = objetivo.estadisticas.armadura;
            objetivo.estadisticas.armadura = 0;
            dañoSobrante = dañoTotal - dañoArm;
        } else {
            dañoArm = dañoTotal;
            objetivo.estadisticas.armadura -= dañoTotal;
        }
    } else {
        // Si no tiene armadura, todo el daño va a la vida
        dañoSobrante = dañoTotal;
    }

    // Reducir la vida del objetivo
    objetivo.estadisticas.vida -= dañoSobrante;
    if (objetivo.estadisticas.vida <= 0) {
        objetivo.estadisticas.vida = 0;
        return {
            dañoTotal,
            dañoSobrante,
            dañoArm,
            vidaRestante: 0,
            efectosAplicados,
            critico,
            derrotado: true,
            huida: false
        };
    }

    if(objetivo?.criatura){

    let modificadorHuida = {};
    if((objetivo.estadisticas.vida < (objetivo.estadisticas.vidaMax / 2)) && !objetivo?.huida){

        const pHuida = Math.max(0, Math.random() * ((objetivo.estadisticas.vida / objetivo.estadisticas.vidaMax) * 100) - (objetivo.idRango * 15));
        const numeroR = Math.random() * 100;
        if(numeroR < pHuida){
            objetivo.huida = true;
            objetivo.estadisticas.autoCombat = false;

        modificadorHuida = {
            estadistica: "huida",
            intensidad: 0,
            duracion: 1,
            buff: false
        }}

        if(!objetivo.modificadoresTemp){
            objetivo.modificadoresTemp = [];
        }

        objetivo.modificadoresTemp.push(modificadorHuida);
    }}

    return {
        dañoTotal,
        dañoSobrante,
        dañoArm,
        vidaRestante: objetivo.estadisticas.vida,
        efectosAplicados,
        critico,
        derrotado: false,
        huida: objetivo.huida,
    };
}

async function guardarObjetivo(tipo, datos) {

    const cargaFunc = tipo === 'usuario' ? cargarRegistros : cargarCriaturas;
    const guardarFunc = tipo === 'usuario' ? guardarRegistros : guardarCriaturas;

    const objetivos = cargaFunc();
    const indice = objetivos.findIndex(obj => obj.nombre === datos.nombre);

    if (indice !== -1) {
        objetivos[indice] = datos;
        guardarFunc(objetivos);
    }
}

async function procesarTurno(entidad) {

    console.log("Codigo entrando correctamente en Procesar turno");

    if(!entidad){
        console.log("¡La entidad en procesar turnos no fue encontrada!");
        return;
    }

    if (entidad.inventario && entidad.inventario.length > 0) {

        const objetosEspecialesActivos = entidad.inventario.filter(item => item.tipo === 'Especial' && item.activa);
        
        if (objetosEspecialesActivos.length > 0) {

            await aplicarEfectosEspeciales(entidad, objetosEspecialesActivos);
        }
    }

    let efectos = entidad?.estadisticas?.efectos || []; 

    if ((!efectos || efectos.length === 0) && (!entidad.modificadoresTemp || entidad.modificadoresTemp.length <= 0)) 
    { 
      return; 
    };

    if(!entidad.modificadoresTemp){
        entidad.modificadoresTemp = [];
    }
    let dañoTotal = 0;

    for (let i = 0; i < entidad.estadisticas.efectos.length; i++) {
        const efecto = entidad.estadisticas.efectos[i];

        if(efecto.nombre === 'maldición'){
            efecto.intensidad *= efecto.duracion; 
        }

        if(efecto.nombre === 'congelación'){
            const modificador = {
                    estadistica: "agilidad",
                    intensidad: efecto.intensidad,
                    duracion: efecto.duracion,
                    buff: false
            }
            if(!entidad.modificadoresTemp.some(mod => mod.estadistica === modificador.estadistica)){
            entidad.modificadoresTemp.push(modificador);
            }else{
               const probabilidad = Math.random() * 100;

            entidad.modificadoresTemp.forEach(mod => {
                if(mod.estadistica === modificador.estadistica && probabilidad < 20){
                    mod.duracion += Math.round(modificador.duracion / 2);
                    mod.intensidad += Math.round(modificador.duracion / 4);
                }
            });
        }

        entidad.estadisticas.vida += efecto.intensidad;

        // Reducir la duración del efecto
        efecto.duracion -= 1;

        if (efecto.duracion <= 0) {
            console.log(`Efecto "${efecto.nombre}" eliminado de la entidad.`);
            entidad.estadisticas.efectos.splice(i, 1); // Eliminar efecto
            i--; 
        }
    }}

    await actualizarModificadoresTemporales(entidad);

    const entidadMuerta = entidad.estadisticas.vida <= 0;

    if(entidad.criatura){
      const criaturas = cargarCriaturas();
      guardarCriaturas(criaturas);
    }else{
      const registros = cargarRegistros();
      guardarRegistros(registros);
    }

    return {
        entidadMuerta,
        dañoTotal,
        mensaje: `Efectos de ${entidad.nombre} aplicados correctamente!`,
    };
}

async function actualizarModificadoresTemporales(objetivo) {
    try {
      console.log("Codigo entrando correctamente en actualizarModificadores.");
      // Validación inicial
      if (!objetivo || !objetivo.estadisticas) {
        console.error("El objetivo o sus estadísticas no son válidos.");
        return;
      }

      if(!objetivo.modificadoresTemp){
        objetivo.modificadoresTemp = [];
        return;
      }

      if(objetivo.modificadoresTemp.length <= 0){
        console.log("No hay modificadores que procesar.");
        return;
      }
  
      // Asegurarse de que los arrays de modificadores y adjudicados sean válidos
      if (!Array.isArray(objetivo.modificadoresTemp)) {
        console.warn("El objetivo no tiene un array válido de modificadores temporales. Se inicializa uno vacío.");
        objetivo.modificadoresTemp = [];
      }
      if (objetivo.adjudicados && !Array.isArray(objetivo.adjudicados)) {
        console.warn("Los adjudicados del objetivo no son un array. Se inicializa uno vacío.");
        objetivo.adjudicados = [];
      }
  
      // Cargar criaturas globales (se asume que esta función devuelve un array)
      let criaturas = cargarCriaturas();
  
      // Determinar el arma equipada (si existe)
      const armaEquipada = objetivo.armaPrincipal?.nombre || null;

      const procesarModificador = (mod) => {
        // Validar la estructura del modificador
        if (!mod.estadistica || typeof mod.intensidad !== "number" || typeof mod.duracion !== "number") {
          console.warn("Modificador inválido:", mod);
          return false;
        }
  
        // Caso especial para el modificador de 'huida'
        if (mod.estadistica === 'huida' && objetivo.estadisticas.vida > 0) {
          if (mod.duracion > 0) {
            mod.duracion--;
            return true;
          } else {
            // Buscar y eliminar la criatura correspondiente de la lista global
            const indice = criaturas.findIndex(cr => cr.nombre === objetivo.nombre);
            if (indice !== -1) {
              criaturas.splice(indice, 1);
              guardarCriaturas(criaturas);
            }
            return false;
          }
        }
  
        // Mantener el modificador si proviene del arma equipada
        if (mod.fuente && mod.fuente === armaEquipada || mod.fuente === 'arma'){
          console.log(`El modificador de ${mod.estadistica} de ${armaEquipada} se mantiene al estar asociado al arma equipada.`);
          return true;
        }

        if (mod.duracion > 0) {
          mod.duracion--;
          return true;
        } else {
          // El modificador expira y se revierten los cambios en las estadísticas
          if (mod.estadistica === "todas") {
            ["fuerza", "agilidad", "mana", "magia"].forEach(key => {
              if (typeof objetivo.estadisticas[key] !== "undefined") {
                // Si es buff se resta la intensidad, si no se suma para revertir el efecto
                objetivo.estadisticas[key] -= mod.buff ? mod.intensidad : -mod.intensidad;
                if (objetivo.estadisticas[key] <= 0) {
                  objetivo.estadisticas[key] = 1;
                }
              }
            });
          } else if (typeof objetivo.estadisticas[mod.estadistica] !== "undefined") {
            objetivo.estadisticas[mod.estadistica] -= mod.buff ? mod.intensidad : -mod.intensidad;
          } else {
            console.warn(`La estadística "${mod.estadistica}" no existe en el objetivo.`);
          }
          console.log(`Modificador de ${mod.intensidad} a ${mod.estadistica} ha expirado o fue removido.`);
          return false;
        }
      };
  
      // Actualizar y filtrar los modificadores temporales usando la función auxiliar
      objetivo.modificadoresTemp = objetivo.modificadoresTemp.filter(procesarModificador);

      if (Array.isArray(objetivo.adjudicados) && objetivo.adjudicados.length > 0) {
        objetivo.adjudicados = objetivo.adjudicados.filter(criatura => {
          if (typeof criatura.duracion !== "number") {
            console.warn("El adjudicado no tiene una duración válida:", criatura);
            return false;
          }
          if (criatura.duracion > 0) {
            criatura.duracion--;
            return true;
          }
          // Buscar la criatura en la lista global y actualizarla
          const criaturaGlobal = criaturas.find(c => c.nombre === criatura.nombre);
          if (criaturaGlobal) {
            if (!criaturaGlobal.estadisticas?.autoCombat) {
              criaturaGlobal.estadisticas.autoCombat = true;
            }
          }
          return false;
        });
      }
      
      if (objetivo.armaPrincipal?.mejorada) {
        if (typeof objetivo.armaPrincipal.duracion !== "number") {
          console.warn("El arma principal no tiene una duración válida:", objetivo.armaPrincipal);
        } else if (objetivo.armaPrincipal.duracion > 0) {
          objetivo.armaPrincipal.duracion--;
        } else {
          objetivo.armaPrincipal = objetivo.armaPrincipal.armaAnterior || null;
        }
      }
  
      console.log("Modificadores activos tras actualización:", objetivo.modificadoresTemp);
      console.log("Efectos actualizados:", objetivo.estadisticas.efectos);

      if(objetivo.criatura){
        const criaturas = cargarCriaturas();
        guardarCriaturas(criaturas);
      }else{
        const registros = cargarRegistros();
        guardarRegistros(registros);
      }

    } catch (error) {
      console.error("Error al actualizar los modificadores temporales:", error);
    }
  }
  
function cargarModificadoresEfectos() {
    // Verifica si el archivo existe
    if (!fs.existsSync(filePath)) {
        console.error('El archivo no existe, creando archivo predeterminado en:', filePath);

        const defaultData = {
            modificadoresArmas: [],
            efectosArmas: []
        };
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2)); // Escribe con formato bonito
        return defaultData; // Devuelve los datos predeterminados
    } else {
        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            console.log("Datos cargados correctamente:", data);
            return data; // Devuelve los datos del archivo
        } catch (error) {
            console.error("Error al leer o parsear el archivo JSON:", error.message);
            return { modificadoresArmas: [], efectosArmas: [] }; // Devuelve un objeto vacío en caso de error
        }
    }
}

function generarArmaAleatoria(numero, rangoForzado, indicador, tipoArma, adminArma) {

    if (isNaN(numero)) {
        console.log("El número no llegó correctamente.");
        return null;
    }

  numero < 1 ? numero = 1 : numero = numero;

    console.log("El numero que se está pasando: ", numero);
    console.log("El rango que se está pasando: ", rangoForzado);

    if (numero < 0 || numero > 6) {
        console.error("Número fuera del rango esperado (0-6).");
        return null;
    }

    let probabilidad = Math.random() * (numero * 10);
    let dañoBase = 0;
    let rango;
    let tirada = Math.random() * 100;
    let distancia = 0;

    // Si se pasa un rango forzado, calcular el daño en base a límites definidos para cada rango.
    if (rangoForzado) {
        // Definir límites para cada rango (incluyendo "E" debajo de "D")
        const limitesPorRango = {
            "E":  { min: 1,  max: 9 },
            "D":  { min: 10, max: 29 },
            "C":  { min: 30, max: 59 },
            "B":  { min: 60, max: 89 },
            "A":  { min: 90, max: 119 },
            "S":  { min: 120, max: 149 },
            "SS": { min: 150, max: 200 } 
        };

        const limites = limitesPorRango[rangoForzado];
        if (!limites) {
            console.warn("Rango forzado no reconocido, usando fórmula por defecto para el daño.");
            dañoBase = numero * 10 + (Math.floor(Math.random() * 50) + 1) * (numero * 2);
        } else {
            dañoBase = Math.floor(Math.random() * (limites.max - limites.min + 1)) + limites.min;
        }
        rango = rangoForzado;
    } else {
        // Calcular el daño usando la fórmula original
        dañoBase = numero * 10 + (Math.floor(Math.random() * 50) + 1) * (numero * 2);

        if(dañoBase === 0){
          dañoBase = 5;
        }
        // Determinar el rango según el daño calculado
        if (dañoBase >= 5000) {
            rango = "SS";
        } else if (dañoBase >= 6000) {
            rango = "S";
        } else if (dañoBase >= 4000) {
            rango = "A";
        } else if (dañoBase >= 2000) {
            rango = "B";
        } else if (dañoBase >= 1000) {
            rango = "C";
        } else if (dañoBase >= 500) {
            rango = "D";
        } else {
            rango = "E";
        }
    }

    const tiposArma = ["Lanza", "Espada", "Hacha", "Arco", "Bastón", "Bola de cristal"];

    const tipoArmaElegido = (typeof tipoArma === 'string' && tiposArma.includes(tipoArma))
    ? tipoArma 
    : tiposArma[Math.floor(Math.random() * tiposArma.length)];

    if(tipoArmaElegido === 'Arco'){
        distancia = Math.floor(dañoBase / 100) + 10;
        tipoAtaque = 'distancia'
    }else{
        distancia = 0;
        tipoAtaque = 'melee'
    }

    let arma = {
        nombre: `${tipoArmaElegido} ${rango}`,
        rango: rango,
        cantidad: 1,
        tipo: "arma",
        distancia: distancia,
        tipoAtaque,
        daño: dañoBase,
        equipada: false,
        modificadores: [],
        efectos: [],
        modificadoresArma: []
    };

    // Cargar los modificadores y efectos desde el archivo JSON o fuente externa
    const { modificadores, efectos } = cargarModificadoresEfectos();

    // Si el rango es mayor a "D" (o forzado y no es "D" ni "E"), se asigna al menos un modificador específico según el tipo de arma.
    if (rango !== "D" && rango !== "E") {
        switch (tipoArmaElegido) {
            case "Lanza":
                // Buff de agilidad
                arma.modificadores.push({
                    estadistica: "agilidad",
                    intensidad: 5,
                    duracion: 5,
                    buff: true,
                    fuente: arma.nombre
                });
                break;
            case "Hacha":
                // Buff de fuerza
                arma.modificadores.push({
                    estadistica: "fuerza",
                    intensidad: 5,
                    duracion: 5,
                    buff: true,
                    fuente: arma.nombre
                });
                break;
            case "Espada":
                // Buff de fuerza y velocidad (con intensidades menores)
                arma.modificadores.push({
                    estadistica: "fuerza",
                    intensidad: 3,
                    duracion: 5,
                    buff: true,
                    fuente: arma.nombre
                });
                arma.modificadores.push({
                    estadistica: "velocidad",
                    intensidad: 3,
                    duracion: 5,
                    buff: true,
                    fuente: arma.nombre
                });
                break;
            case "Bastón":
                // Buff de magia
                arma.modificadores.push({
                    estadistica: "magia",
                    intensidad: 5,
                    duracion: 5,
                    buff: true,
                    fuente: arma.nombre
                });
                break;
            case "Bola de cristal":
                // Buff de maná
                arma.modificadores.push({
                    estadistica: "mana",
                    intensidad: 5,
                    duracion: 5,
                    buff: true,
                    fuente: arma.nombre
                });
                break;
            case "Arco":
                // Modificador único que aumenta la estadística "Precision"
                arma.modificadores.push({
                    estadistica: "Precision",
                    intensidad: 5,
                    duracion: 5,
                    buff: true,
                    fuente: arma.nombre
                });
                break;
        }

        // Calcular la probabilidad de obtener modificadores adicionales según el rango
        // Por ejemplo: SS: 50%, S: 40%, A: 30%, B: 20%, C: 10%
        let probExtra;
        switch (rango) {
            case "SS": probExtra = 0.5; break;
            case "S":  probExtra = 0.4; break;
            case "A":  probExtra = 0.3; break;
            case "B":  probExtra = 0.2; break;
            case "C":  probExtra = 0.1; break;
            default:   probExtra = 0;
        }

        // Con la probabilidad calculada, agregar un modificador adicional (si se cumple)
        if (Math.random() < probExtra && modificadores.length > 0) {
            const modExtra = modificadores[Math.floor(Math.random() * modificadores.length)];
            // Clonar el modificador para no alterar el original
            let modExtraClone = Object.assign({}, modExtra);
            modExtraClone.fuente = arma.nombre;
            arma.modificadores.push(modExtraClone);
        }
    }

    // Agregar un efecto si el rango es mayor a "C" (B, A, S, SS)
    if (["B", "A", "S", "SS"].includes(rango) && efectos.length > 0) {
        const efectoAleatorio = efectos[Math.floor(Math.random() * efectos.length)];
        arma.efectos.push(efectoAleatorio);
    }

    if(((tirada < probabilidad) && !indicador && ["A", "S", "SS"].includes(rango)) || adminArma){
        arma = armaTransformableInicial(arma);
        }

    console.log("Punto de control antes de retornar arma Aleatoria.");

    return arma;
}

function armaTransformableInicial(arma) {
    // Si el arma no tiene la propiedad transformable, o si no se ha definido la fase 1,
    // entonces se define el arma original como la fase 1.
    if (
      !arma.transformable ||
      typeof arma.transformable !== 'object' ||
      !arma.transformable.fases ||
      !arma.transformable.fases[1]
    ) {
      // Se clona el arma original y se elimina la propiedad transformable
      let armaOriginal = JSON.parse(JSON.stringify(arma));
      delete armaOriginal.transformable;
      delete armaOriginal.cantidad;
      
      arma.transformable = {
        totalFases: 1, // Se cuenta la fase original (fase 1)
        fase: 1,
        fases: {
          1: armaOriginal
        }
      };
    }

    return armaTransformable(arma);
  }

function armaTransformable(arma) {
    // 1. Inicializar (o actualizar) la propiedad transformable en el arma
    if (!arma.transformable || typeof arma.transformable !== 'object') {
      // Si no existe transformable, se crea desde cero
      arma.transformable = {
        totalFases: 2,                           // Se inicia en 2 fases
        fase: 1,                                 // Fase actual
        fases: {}                                // Objeto para almacenar fases
      };
    } else {
      // Si transformable existe, aseguramos que totalFases y fases estén definidas
      if (arma.transformable.totalFases === undefined || isNaN(arma.transformable.totalFases)) {
        arma.transformable.totalFases = 2;
      } else {
        arma.transformable.totalFases += 1;
      }
      if (!arma.transformable.fases || typeof arma.transformable.fases !== 'object') {
        arma.transformable.fases = {};
      }
    }
    
    // Asignar el número de la nueva fase
    const nuevaFaseNumero = arma.transformable.totalFases;
    
    // 2. Clonar el arma original para crear la nueva fase
    let nuevaFase = JSON.parse(JSON.stringify(arma));
    delete nuevaFase.transformable;
    
    // 2.1 Incrementar el daño entre un 15% y un 30%
    const incremento = Math.random() * (0.30 - 0.15) + 0.15; // Valor aleatorio entre 0.15 y 0.30
    nuevaFase.daño = Math.round(nuevaFase.daño * (1 + incremento));
    
    // 3. Trabajar con los modificadores: generar tantos modificadores como tiene el arma original
    const originalModifiers = arma.modificadores || [];
    
    // Recopilar las 'estadistica' de los modificadores usados en fases anteriores
    const modificadoresUsados = [];
    for (const key in arma.transformable.fases) {
      const fasePrevia = arma.transformable.fases[key];
      if (Array.isArray(fasePrevia.modificadores)) {
        fasePrevia.modificadores.forEach(mod => {
          if (mod && mod.estadistica) {
            modificadoresUsados.push(mod.estadistica);
          }
        });
      }
    }
    
    // Generar la lista de nuevos modificadores (la misma cantidad que en el arma original)
    const nuevosModificadores = originalModifiers.map(mod => {
      let nuevoMod = JSON.parse(JSON.stringify(mod));
      // Si este modificador ya se usó en fases anteriores, generamos una variante:
      if (modificadoresUsados.includes(mod.estadistica)) {
        // Por ejemplo, aumentar la intensidad entre un 5% y 20%
        const factor = 1 + (Math.random() * 0.15 + 0.05);
        nuevoMod.intensidad = Math.round(nuevoMod.intensidad * factor);
        // Se agrega un sufijo para diferenciarlo
      }
      // Actualizar la fuente al nombre del arma
      nuevoMod.fuente = arma.nombre;
      return nuevoMod;
    });
    
    // Asignar los nuevos modificadores a la nueva fase
    nuevaFase.modificadores = nuevosModificadores;
    
    // 4. Trabajar con los efectos
    let efectosUsados = [];
    for (const key in arma.transformable.fases) {
      const fasePrevia = arma.transformable.fases[key];
      if (Array.isArray(fasePrevia.efectos)) {
        fasePrevia.efectos.forEach(ef => efectosUsados.push(ef));
      }
    }
    
    if (Array.isArray(nuevaFase.efectos)) {
      nuevaFase.efectos = nuevaFase.efectos.filter(ef => !efectosUsados.includes(ef));
    } else {
      nuevaFase.efectos = [];
    }
    
    // Agregar un efecto adicional si el rango es mayor a "C"
    if (["B", "A", "S", "SS"].includes(nuevaFase.rango) && nuevaFase.efectos.length > 0) {
      const efectoAleatorio = nuevaFase.efectos[Math.floor(Math.random() * nuevaFase.efectos.length)];
      nuevaFase.efectos.push(efectoAleatorio);
    }
    
    // 5. Guardar la nueva fase en la propiedad transformables
    arma.transformable.fases[nuevaFaseNumero] = nuevaFase;
    arma.transformable.fase = nuevaFaseNumero;
    
    return arma;
  }
  
  function cambiarFaseArma(jugador, arma) {
    // 1. Verificar si el arma es transformable
    if (!arma.transformable) {
      return `_¡No cuentas con un arma transformable o no está equipada!_`;
    }
  
    // 3. Actualizar la fase activa: avanzar a la siguiente fase o volver a la primera si es la última
    const totalFases = arma.transformable.totalFases;
    let faseActual = arma.transformable.fase;
    let nuevaFase;
    if (faseActual >= totalFases) {
      nuevaFase = 1;
    } else {
      nuevaFase = faseActual + 1;
    }
  
    // 3.1 Revertir efectos de los modificadores de la fase anterior
    const faseAnteriorObj = arma.transformable.fases[faseActual];
    if (faseAnteriorObj && Array.isArray(faseAnteriorObj.modificadores)) {
      faseAnteriorObj.modificadores.forEach(mod => {
        // Validar estructura del modificador
        if (!mod.estadistica || typeof mod.intensidad !== "number" || typeof mod.duracion !== "number") {
          console.warn("Modificador inválido:", mod);
          return; // Se omite este modificador
        }
        // Revertir el efecto: si es buff se le resta la intensidad (pues previamente se había sumado) y viceversa
        if (mod.estadistica === "todas") {
          ["fuerza", "agilidad", "mana", "magia"].forEach(key => {
            if (jugador.estadisticas[key] !== undefined) {
              jugador.estadisticas[key] -= mod.buff ? mod.intensidad : -mod.intensidad;
              // Se asegura que la estadística no caiga a cero o en negativo
              if (jugador.estadisticas[key] <= 0) {
                jugador.estadisticas[key] = 1;
              }
            }
          });
        } else if (jugador.estadisticas[mod.estadistica] !== undefined) {
          jugador.estadisticas[mod.estadistica] -= mod.buff ? mod.intensidad : -mod.intensidad;
        } else {
          console.warn(`La estadística "${mod.estadistica}" no existe en el jugador.`);
        }
      });
    }
  
    // 3.2 Actualizar la fase activa en la propiedad transformable
    arma.transformable.fase = nuevaFase;
  
    // 4. Actualizar el arma con las propiedades de la nueva fase
    // Se asume que cada fase se guarda en arma.transformable.fases con la clave numérica correspondiente
    const nuevaFaseObjeto = arma.transformable.fases[nuevaFase];
    if (!nuevaFaseObjeto) {
      return `La fase ${nuevaFase} no existe en el arma transformable.`;
    }
  
    // Actualizamos las propiedades principales del arma, dejando intacta la propiedad "transformable"
    arma.nombre = nuevaFaseObjeto.nombre;
    arma.rango = nuevaFaseObjeto.rango;
    arma.cantidad = nuevaFaseObjeto.cantidad;
    arma.tipo = nuevaFaseObjeto.tipo;
    arma.daño = nuevaFaseObjeto.daño;
    arma.equipada = nuevaFaseObjeto.equipada;
    arma.modificadores = nuevaFaseObjeto.modificadores;
    arma.efectos = nuevaFaseObjeto.efectos;
  
    // 5. Aplicar los nuevos modificadores de la nueva fase de forma inmediata
    if (nuevaFaseObjeto && Array.isArray(nuevaFaseObjeto.modificadores)) {
      nuevaFaseObjeto.modificadores.forEach(mod => {
        // Validar estructura del modificador
        if (!mod.estadistica || typeof mod.intensidad !== "number" || typeof mod.duracion !== "number") {
          console.warn("Modificador inválido:", mod);
          return; // Se omite este modificador
        }
        // Aplicar el efecto: si es buff se suma la intensidad; si es debuff se resta la intensidad
        if (mod.estadistica === "todas") {
          ["fuerza", "agilidad", "mana", "magia"].forEach(key => {
            if (jugador.estadisticas[key] !== undefined) {
              jugador.estadisticas[key] += mod.buff ? mod.intensidad : -mod.intensidad;
            }
          });
        } else if (jugador.estadisticas[mod.estadistica] !== undefined) {
          jugador.estadisticas[mod.estadistica] += mod.buff ? mod.intensidad : -mod.intensidad;
        } else {
          console.warn(`La estadística "${mod.estadistica}" no existe en el jugador.`);
        }
      });
    }
  
    // 6. Retornar el arma actualizada
    return arma;
  }

function calcularDistancia(atacante, objetivo, desplazamiento){

    if (objetivo.estadisticas.vida <= 0) {
      atacante.Distancia = atacante.Distancia.filter(
        (item) => item.nombre !== objetivo.nombre
      );
      return;
    }

    if(objetivo.nombre === atacante.nombre){
      return;
    }
  
    // Buscamos (o creamos si no existe) el objeto de distancia del objetivo en el atacante.
    let objDistObjetivo = atacante.Distancia.find(
      (item) => item.nombre === objetivo.nombre
    );
    if (!objDistObjetivo) {
      objDistObjetivo = { nombre: objetivo.nombre, distancia: 0 };
      atacante.distancia.push(objDistObjetivo);
    }
  
    // De igual forma, buscamos (o creamos si no existe) el objeto de distancia del atacante en el objetivo.
    let objDistAtacante = objetivo.distancia.find(
      (item) => item.nombre === atacante.nombre
    );
    if (!objDistAtacante) {
      objDistAtacante = { nombre: atacante.nombre, distancia: 0 };
      objetivo.Distancia.push(objDistAtacante);
    }
  
    // Paso de seguridad: Verificamos que ambos objetos (el del atacante para el objetivo 
    // y el del objetivo para el atacante) tengan la misma distancia. 
    // Si no coinciden, igualamos el valor (en este ejemplo se iguala el del atacante).
    if (objDistObjetivo.distancia !== objDistAtacante.distancia) {
      objDistAtacante.distancia = objDistObjetivo.distancia;
    }
  
    // Calculamos la nueva distancia sumando (o restando, si el valor es negativo) el desplazamiento.
    const nuevaDistancia = objDistObjetivo.distancia + desplazamiento;
  
    // Actualizamos ambos objetos con la nueva distancia.
    objDistObjetivo.distancia = nuevaDistancia;
    objDistAtacante.distancia = nuevaDistancia;
  }

  function mostrarEstadisticasArma(arma) {
    if (!arma) return "Arma no válida.";
  
    let mensaje = `*Información del Arma: ${arma.nombre}*\n`;
    mensaje   += `-----------------------------------\n`;
    mensaje   += `*Nombre:* ${arma.nombre}\n`;
    mensaje   += `*Rango:* ${arma.rango}\n`;
    mensaje   += `*Daño:* ${arma.daño}\n`;
    mensaje   += `*Distancia Efectiva:* ${arma.distancia || 0}\n`;
  
    // Mostrar modificadores (si existen)
    if (arma.modificadores && arma.modificadores.length > 0) {
      mensaje += `\n_*Modificadores:*_\n`;
      arma.modificadores.forEach(mod => {
        mensaje += `- ${mod.estadistica}: Intensidad ${mod.intensidad}, Duración ${mod.duracion}\n`;
      });
    }
  
    // Mostrar efectos (si existen)
    if (arma.efectos && arma.efectos.length > 0) {
      mensaje += `\n_*Efectos:*_\n`;
      arma.efectos.forEach(efecto => {
        mensaje += `- ${efecto.nombre}: Intensidad ${efecto.intensidad}, Duración ${efecto.duracion}, Probabilidad ${efecto.probabilidad}%\n`;
      });
    }
  
    // Si el arma es transformable y tiene fases, se muestra la información de cada fase.
    if (arma.transformable && arma.transformable.fases) {
      mensaje += `\n*Fases de Transformación:*\n`;
      // Obtener las fases ordenadas numéricamente (las claves son strings)
      const fasesKeys = Object.keys(arma.transformable.fases).sort((a, b) => a - b);
      fasesKeys.forEach(faseKey => {
        const fase = arma.transformable.fases[faseKey];
        mensaje += `\n*Fase ${faseKey}:*\n`;
        mensaje   += `-----------------------------------\n`;
        mensaje   += `_*Nombre:* ${fase.nombre}_\n`;
        mensaje   += `_*Rango:* ${fase.rango}_\n`;
        mensaje   += `_*Daño:* ${fase.daño}_\n`;
        mensaje   += `_*Distancia Efectiva:* ${fase.distancia || 0}\n`;
  
        if (fase.modificadores && fase.modificadores.length > 0) {
          mensaje += `\n  _*Modificadores:*_\n`;
          fase.modificadores.forEach(mod => {
            mensaje += `  - ${mod.estadistica}: Intensidad ${mod.intensidad}, Duración ${mod.duracion}\n`;
          });
        }
  
        if (fase.efectos && fase.efectos.length > 0) {
          mensaje += `\n  _*Efectos:*_\n`;
          fase.efectos.forEach(efecto => {
            mensaje += `  - ${efecto.nombre}: Intensidad ${efecto.intensidad}, Duración ${efecto.duracion}, Probabilidad ${efecto.probabilidad}%\n`;
          });
        }
      });
    }
  
    return mensaje.trim();
  }

async function mensajeDropeo(atacante, objetivo) {
    
    if(!atacante) { return `atacante no encontrado.`; }
    console.log("Atacante desde mensajeDropeo: ", atacante);

    const drop = await dropeo(atacante, objetivo);
    console.log("Funcion mensajeDropeo: ", drop);

    // Agregar "_" al inicio y final de cada objeto
    const objetos = drop.objetos.length > 0 
        ? drop.objetos.map(objeto => `_${objeto.nombre}_`).join(', ') 
        : '_Ningún objeto ha sido dropeado._';
    
    // Construir mensaje de dropeo
    let mensajeDropeo = 
    `*Recompensas del Combate ( ${drop.nombre} )*  
    -----------------------------------  
    💰 *Dinero obtenido*: ${drop.dinero} monedas  
    ✨ *Experiencia ganada*: ${drop.experiencia} XP  
    📦 *Objetos obtenidos*:  
    ${objetos}  
    -----------------------------------`;
    
    if (drop.subirnivel) {
        mensajeDropeo += `\n🎉 *¡Has subido de nivel!*\n` +
                         `🔧 *Puntos para distribuir*: ${drop.puntosPorDistribuir}`;
    }
    try{
    await guardarObjetivo('usuario', atacante);
    }catch(err){
      console.log("Hubo un error al momento de guardar los dropeos: ", err, err.stack);
    }

    return mensajeDropeo.trim();
}


module.exports = { buscarObjetivo, realizarAtaque, guardarObjetivo, procesarTurno, actualizarModificadoresTemporales, mensajeDropeo, generarArmaAleatoria, cargarModificadoresEfectos, calcularDistancia, cambiarFaseArma, mostrarEstadisticasArma}
