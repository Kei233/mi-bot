const fs = require('node:fs');
const path = require('node:path');

const filePath = path.join(__dirname, 'modificadores_efectos.json');

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
    if (["S", "SS"].includes(rango) && efectos.length > 0) {
        const efectoAleatorio = efectos[Math.floor(Math.random() * efectos.length)];
        arma.efectos.push(efectoAleatorio);
    }

    if(((tirada < probabilidad) && !indicador && ["A", "S", "SS"].includes(rango)) || adminArma){
        arma = armaTransformableInicial(arma);
        }

    console.log("Punto de control antes de retornar arma Aleatoria. El arma en cuestión:", arma);

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

    return arma;
  }

module.exports = { generarArmaAleatoria, cambiarFaseArma, armaTransformable };