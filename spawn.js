const { crearCriatura, cargarCriaturas, guardarCriaturas } = require('./RPG/criaturas.js');
const { generarArmaAleatoria } = require('./RPG/combate.cjs');

// Define un valor de probabilidad inicial por defecto
const PROBABILIDAD_INICIAL = 45;

async function spawnC(usuario, chat, mundo) {

    // Inicializar el contador de spawn si no existe
    if (!usuario.contadorSpawn) {
        usuario.contadorSpawn = 0;
    }

    if(chat != '120363385970988223@g.us' || chat != '120363395447611444@g.us'){
        console.log("No es el grupo indicado.");
        return false;
    }

    const probabilidadReducida = PROBABILIDAD_INICIAL - (usuario.contadorSpawn * 5);
    const probabilidad = Math.floor(Math.random() * 100) - mundo.aumento;

    const rangos = {
        E: [
            "Limo", "Murciélago cavernario", "Rata gigante", "Escarabajo del pantano",
            "Araña gigante", "Cuervo sombrío", "León salvaje", "Pez mordedor",
            "Lagarto inofensivo", "Zombi lento", "Cadaver Putrefacto"
        ],
        C: [
            "Goblin saqueador", "Lobo gris", "Esqueleto guerrero", "Planta carnívora",
            "Orc lanza", "Gnomo vengativo", "Salamandra del fuego", "Mimic",
            "Kobold minero", "Ojo flotante"
        ],
        D: [
            "Troll de cueva", "Elemental menor de tierra", "Mantícora joven", "Ogro del pantano",
            "Dragón pseudo", "Lobo espectral", "Vampiro novato", "Bestia cristalina",
            "Hombre serpiente", "Escorpión gigante"
        ],
        B: [
            "Golem de piedra", "Elemental de fuego", "Minotauro de batalla", "Espectro vengativo",
            "Hidra de dos cabezas", "Águila de tormenta", "Dragón menor", "Licántropo alfa",
            "Jabalí demoníaco", "Arpía"
        ],
        A: [
            "Quimera", "Fénix menor", "Dragón anciano", "Demonio de sangre",
            "Gigante de guerra", "Serpiente marina", "Vampiro maestro", "Behemoth",
            "Ángel caído", "León celestial"
        ],
        S: [
            "Titán de la tormenta", "Dragón del apocalipsis", "Leviatán", "Fénix ancestral",
            "Lich eterno", "Kraken de las profundidades", "Devorador de mundos",
            "Dios de la muerte menor", "Avatar del caos", "Rey demonio"
        ],
        SS: [
            "Dragón celestial", "Ser infinito", "Dios dragón", "Entidad cósmica",
            "Ángel de la destrucción", "Titán primordial", "Emperador demoníaco",
            "Destructor de realidades", "Fénix cósmico", "Heraldo del fin"
        ]
    };

    // Definir rangos y sus probabilidades
    const rangosProbabilidad = [
        { rango: 'E', min: 0, max: 20 },
        { rango: 'C', min: 21, max: 30 },
        { rango: 'D', min: 31, max: 35 },
        { rango: 'B', min: 36, max: 38 },
        { rango: 'A', min: 39, max: 42 },
        { rango: 'S', min: 43, max: 44 },
        { rango: 'SS', min: 45, max: 45 } // Solo ocurre en una probabilidad exacta
    ];

    if ((usuario.spawn && probabilidad < probabilidadReducida) || probabilidad === 45) {
        // Determinar el rango según la probabilidad
        const rangoSeleccionado = rangosProbabilidad.find(rango => probabilidad >= rango.min && probabilidad <= rango.max);
        if (rangoSeleccionado) {
            const nombres = rangos[rangoSeleccionado.rango];
            const index = Math.floor(Math.random() * nombres.length);

            // Incrementar el contador del usuario
            if(!usuario.contadorSpawn){
                usuario.contadorSpawn = 0;
            }

            usuario.contadorSpawn++;

            // Crear la criatura con una propiedad boolean para identificar que está viva
            const criatura = crearCriatura(nombres[index], rangoSeleccionado.rango);
            if(!criatura.spawneada){
            criatura.spawneada = true;
            }

            if(!criatura.armaPrincipal){

                criatura.armaPrincipal = generarArmaAleatoria(criatura);
            }

            return criatura;
        }
    }

    return false;
}

async function generarMision(usuario, chat, mundo) {
    try {
      // Inicializamos el contador de spawn del usuario si no existe
      if (!usuario.contadorSpawn) {
        usuario.contadorSpawn = 0;
      }
  
      // Cargamos la lista actual de criaturas
      const criaturas = cargarCriaturas();
  
      // Definición de los rangos y sus respectivas criaturas
      const rangos = {
        E: [
          "Limo",
          "Murciélago cavernario",
          "Rata gigante",
          "Escarabajo del pantano",
          "Araña gigante",
          "Lodo animado", 
          "Ciempiés venenoso", 
          "Rana espinosa", 
          "Sapo aberrante", 
          "Escorpión monstruoso", 
          "Cucaracha colosal", 
          "Hormiga asesina", 
          "Topo sombrío", 
          "Gusano abisal", 
          "Caracol parasitario", 
          "Murciélago fétido", 
          "Centolla descomunal", 
          "Serpiente terrenal", 
          "Buitre necrófago",
           "Rata sombría"
        ],
        D: [
          "Goblin saqueador",
          "Lobo gris",
          "Esqueleto guerrero",
          "Planta carnívora",
          "Mimic"
        ],
        C: [
          "Troll de cueva",
          "Elemental menor de tierra",
          "Mantícora joven",
          "Ogro del pantano",
          "Lobo espectral"
        ],
        B: [
          "Golem de piedra",
          "Elemental de fuego",
          "Minotauro de batalla",
          "Espectro vengativo",
          "Hidra de dos cabezas"
        ]
      };
  
      // Seleccionamos aleatoriamente el rango principal entre "C" y "D"
      const rangosPrincipales = ["C", "D"];
      const rangoPrincipal =
        rangosPrincipales[Math.floor(Math.random() * rangosPrincipales.length)];
      const criaturaPrincipalNombre =
        rangos[rangoPrincipal][Math.floor(Math.random() * rangos[rangoPrincipal].length)];
      const idRango = rangoPrincipal === "C" ? 2 : 1;
  
      // Creamos la criatura principal
      const criaturaPrincipal = crearCriatura(criaturaPrincipalNombre, rangoPrincipal);
      criaturaPrincipal.spawneada = true;
      console.log("ID de la criatura principal:", criaturaPrincipal.idRango, idRango);
      criaturaPrincipal.armaPrincipal = generarArmaAleatoria(
        idRango,
        rangoPrincipal,
        false,
        null,
        false
      );
      criaturaPrincipal.subditos = [];
  
      console.log("Criatura principal creada.");

      const cantidadSecundarias = Math.floor(Math.random() * 3) + 1;
      const rangoSecundario = "E";
      const criaturasSecundarias = [];

      console.log("Punto de control 1.");
  
      // Creamos las criaturas secundarias
      for(let i = 0; i < cantidadSecundarias; i++) {
        console.log("Entrando al bucle...");
        const criaturaNombre = rangos[rangoSecundario][Math.floor(Math.random() * rangos[rangoSecundario].length)];
        const criatura = crearCriatura(criaturaNombre, rangoSecundario);
        if (criatura === "existe") {
          i--;
          continue;
        }
  
        console.log("Punto de control 2.");
  
        criatura.spawneada = true;
        criaturasSecundarias.push(criatura);
        criaturaPrincipal.subditos.push(criatura.nombre);
      }
  
      // Agregamos la criatura principal y sus subordinados a la lista
      criaturas.push(criaturaPrincipal, ...criaturasSecundarias);
      guardarCriaturas(criaturas);
  
      console.log("Punto de control antes de retornar.");
  
      // Construimos el mensaje de misión
      const mensaje = `_📜 *Misión Disponible* 📜_\n\n` +
        `_🎯 *Objetivo Principal:* ${criaturaPrincipalNombre} (${rangoPrincipal})_\n\n` +
        `⚔️ *Criaturas Subditos:* ${criaturasSecundarias
          .map(c => `_${c.nombre} (${c.rango})_`)
          .join(", ")}\n\n` +
        `_¡Prepárate para la batalla!_`;
  
      return {
        mensaje,
        criaturaPrincipal,
        criaturasSecundarias
      };
    } catch (error) {
      console.log("Error al generar misiones:", error.stack, error);
    }
  }
  

module.exports = { spawnC, generarMision };