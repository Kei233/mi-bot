const { generarArmaAleatoria } = require('./combate.cjs');
const { generarObjetoHabilidad } = require('./habilidades');

function generarDinero(rango) {
    const dineroPorRango = {
        "E": [10, 25],
        "D": [30, 80],
        "C": [100, 260],
        "B": [340, 500],
        "A": [700, 1500],
        "S": [2000, 5000],
        "SS": [8000, 10000]
    };

    if (!dineroPorRango[rango]) return 0;
    const [min, max] = dineroPorRango[rango];
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generarPocion(rango) {
    const pociones = {
        "E": { nombre: "Poción de vida básica", probabilidad: 15, efectos: { vida: 50 }, calidad: "E" },
        "D": { nombre: "Poción de vida pequeña", probabilidad: 20, efectos: { vida: 100 }, calidad: "D" },
        "C": { nombre: "Poción de vida mediana", probabilidad: 35, efectos: { vida: 600 }, calidad: "C" },
        "B": { nombre: "Poción de vida avanzada", probabilidad: 50, efectos: { vida: 1200 }, calidad: "B" },
        "A": { nombre: "Poción mágica", probabilidad: 30, efectos: { mana: 500 }, calidad: "A" },
        "S": { nombre: "Poción de vida grande", probabilidad: 30, efectos: { vida: 1400 }, calidad: "S" }
    };

    if (!pociones[rango]) return null;
    return Math.random() * 100 < pociones[rango].probabilidad ? { ...pociones[rango] } : null;
}

function generarPergamino(rango) {
    const pergaminos = {
        "E": { nombre: "Pergamino Débil", probabilidad: 10, calidad: "E" },
        "D": { nombre: "Pergamino Mágico", probabilidad: 20, calidad: "D" },
        "C": { nombre: "Pergamino de Encantamiento", probabilidad: 25, calidad: "C" },
        "B": { nombre: "Pergamino Arcano", probabilidad: 30, calidad: "B" },
        "A": { nombre: "Pergamino de Hechizo Mayor", probabilidad: 15, calidad: "A" }
    };

    if (!pergaminos[rango] || Math.random() * 100 >= pergaminos[rango].probabilidad) return null;
    
    return {
        nombre: pergaminos[rango].nombre,
        id: 0,
        rango: rango,
        tipo: "pergamino",
        calidad: pergaminos[rango].calidad
    };
}

function generarGrimorio(rango) {
    const grimorios = {
        "E": { nombre: "Grimorio de Novato", probabilidad: 5, calidad: "E" },
        "D": { nombre: "Grimorio Menor", probabilidad: 10, calidad: "D" },
        "C": { nombre: "Grimorio de Conjuros", probabilidad: 15, calidad: "C" },
        "B": { nombre: "Grimorio de Conjuros Avanzados", probabilidad: 10, calidad: "B" },
        "A": { nombre: "Grimorio Arcano", probabilidad: 8, calidad: "A" },
        "S": { nombre: "Grimorio Prohibido", probabilidad: 5, calidad: "S" }
    };

    if (!grimorios[rango] || Math.random() * 100 >= grimorios[rango].probabilidad) return null;
    
    return {
        nombre: grimorios[rango].nombre,
        rango: rango,
        tipo: "grimorio",
        calidad: grimorios[rango].calidad
    };
}

function generarLoot(criatura, jugador){
    let loot = {
        dinero: generarDinero(criatura.rango),
        objetos: []
    };

    // Probabilidad base: 10% por cada nivel de idRango (si es 0, se usa 15%)
    let probabilidad = criatura.idRango * 10;
    if (probabilidad === 0) {
        probabilidad = 15;
    }

    let repetirTirada;

    do {
        repetirTirada = false; // Reiniciar en cada iteración
        let contador = 0;
        let tempLoot = []; // Loot obtenido en esta tirada

        if (Math.random() * 100 < probabilidad) {
            let pocion = generarPocion(criatura.rango);
            if (pocion) {
                tempLoot.push(pocion);
                contador++;
            }
        }
        if (Math.random() * 100 < probabilidad) {
            let pergamino = generarPergamino(criatura.rango);
            if (pergamino) {
                tempLoot.push(pergamino);
                contador++;
            }
        }
        if (Math.random() * 100 < probabilidad) {
            let grimorio = generarGrimorio(criatura.rango);
            if (grimorio) {
                tempLoot.push(grimorio);
                contador++;
            }
        }
        if (Math.random() * 100 < probabilidad) {
            let arma = generarArmaAleatoria(criatura.idRango, criatura.rango, false, null, false);
            if (arma) {
                tempLoot.push(arma);
                contador++;
            }
        }
        if (Math.random() * 100 < probabilidad) {
            // Generar objeto de habilidad usando el jugador para comprobar habilidades ya aprendidas
            let objetoHabilidad = generarObjetoHabilidad(jugador);
            if (!(objetoHabilidad instanceof Error) && objetoHabilidad) {
                tempLoot.push(objetoHabilidad);
                contador++;
            }
        }

        // Se agregan los objetos obtenidos en esta tirada al loot final
        loot.objetos.push(...tempLoot);

        // Si se obtuvieron los 5 objetos, se realiza una nueva tirada
        if (contador === 5) {
            repetirTirada = true;
        }
    } while (repetirTirada);

    return loot;
}

module.exports = { generarLoot };
