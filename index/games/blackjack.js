const fs = require('fs');
const path = require('path');

const cardsFilePath = path.join(__dirname, 'cards.json');
const barajasFilePath = path.join(__dirname, 'barajas.json'); 
const manosFilePath = path.join(__dirname, 'manos.json'); 

function barajarBaraja(baraja) {
    for (let i = baraja.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [baraja[i], baraja[j]] = [baraja[j], baraja[i]]; 
    }
}

function verificarYEliminarBarajasVacias() {
    let barajas = leerBarajas();

    const barajasNoVacias = barajas.filter(baraja => baraja.cartas.length > 0);

    if (barajas.length !== barajasNoVacias.length) {
        guardarBarajas(barajasNoVacias);
    }
}

// Función para crear una baraja a partir del archivo JSON
async function crearBaraja(id) {
    try {
        // Parsear el id a número
        const idNumerico = parseInt(id, 10);

        if(idNumerico === 122){ return null; }

        const data = fs.readFileSync(cardsFilePath, 'utf8');
        const cartas = JSON.parse(data);

        // Leer el archivo de barajas creadas
        let barajas = [];
        if (fs.existsSync(barajasFilePath)) {
            const barajasData = fs.readFileSync(barajasFilePath, 'utf8');
            barajas = JSON.parse(barajasData);
        }

        // Verificar si ya existe una baraja con ese ID
        const barajaExistente = barajas.find(baraja => baraja.id === idNumerico);
        if (barajaExistente) {
            console.log('Baraja ya existente');
            return 'existe'; 
        }

        const nuevaBaraja = {
            id: idNumerico,
            cartas: cartas.slice() 
        };

        // Barajar la nueva baraja
        barajarBaraja(nuevaBaraja.cartas);

        // Añadir la nueva baraja al listado de barajas
        barajas.push(nuevaBaraja);
        fs.writeFileSync(barajasFilePath, JSON.stringify(barajas, null, 2), 'utf8'); // Guardar las barajas

        return nuevaBaraja.cartas; // Retornar solo el arreglo de cartas
    } catch (error) {
        console.error('Error al crear la baraja:', error.message);
        return undefined;
    }
}

// Función para borrar una baraja por su ID
function borrarBaraja(id) {
    // Parsear el id a número
    const idNumerico = parseInt(id, 10);

    let barajas = leerBarajas();

    // Buscar la baraja por su ID
    const index = barajas.findIndex(baraja => baraja.id === idNumerico);

    if (index === -1) {
        throw new Error('Baraja no encontrada');
    }

    // Eliminar la baraja
    barajas.splice(index, 1);

    // Guardar las barajas actualizadas en el archivo
    guardarBarajas(barajas);

    verificarYEliminarBarajasVacias(); // Verificar después de borrar
}

function borrarArchivo() {
    if (fs.existsSync(barajasFilePath)) {
        try {
            fs.unlinkSync(barajasFilePath); // Eliminar el archivo
            console.log('Archivo de barajas eliminado correctamente.');
        } catch (error) {
            console.error('Error al borrar el archivo de barajas:', error.message);
        }
    } else {
        return 'No existe.';
    }
}

// Función para leer las barajas del archivo
function leerBarajas() {
    if (fs.existsSync(barajasFilePath)) {
        const barajasData = fs.readFileSync(barajasFilePath, 'utf8');
        return JSON.parse(barajasData);
    }
    return [];
}

// Función para guardar las barajas en el archivo
function guardarBarajas(barajas) {
    fs.writeFileSync(barajasFilePath, JSON.stringify(barajas, null, 2), 'utf8');
}

// Función para pedir una carta para un jugador específico
async function pedirCarta(idBaraja, jugador, cantidadCartas = 1) {
    try {
        // Parsear el id de la baraja a número
        const idBarajaNumerico = parseInt(idBaraja, 10);

        const cartasTotales = Math.floor(cantidadCartas);
        let barajas = leerBarajas();
        const baraja = barajas.find(baraja => baraja.id === idBarajaNumerico);

        if (!baraja) {
            return 'Baraja inexistente';
        }

        // Leer las manos existentes
        let manos = [];
        if (fs.existsSync(manosFilePath)) {
            const manosData = fs.readFileSync(manosFilePath, 'utf8');
            manos = JSON.parse(manosData);
        }

        let manoJugador = manos.find(mano => mano.jugador === jugador);

        if (!manoJugador) {
            manoJugador = { jugador: jugador, cartas: [] };
            manos.push(manoJugador);
        }

        const cartasObtenidas = [];
        for (let i = 0; i < cartasTotales; i++) {
            if (baraja.cartas.length === 0) {
                break; // No hay más cartas
            }
            const carta = baraja.cartas.pop();  // Saca la carta de la baraja
            manoJugador.cartas.push(carta);     // Añade la carta a la mano del jugador
            cartasObtenidas.push(carta);        // Guarda la carta obtenida
        }

        // Guardar las manos y barajas actualizadas en el archivo
        fs.writeFileSync(manosFilePath, JSON.stringify(manos, null, 2), 'utf8');
        fs.writeFileSync(barajasFilePath, JSON.stringify(barajas, null, 2), 'utf8');

        verificarYEliminarBarajasVacias();

        await obtenerMano(jugador, idBarajaNumerico);

        if (cartasObtenidas.length === 0) {
            return 'No quedan cartas en la baraja.';
        }

        const resultado = cartasObtenidas
            .map(carta => `_${carta.valor} de ${carta.palo}_`)
            .join('\n');

        return `${resultado}`;
    } catch (error) {
        console.error('Error al pedir una carta:', error.message);
        return '_Hubo un error al pedir la carta._';
    }
}

async function obtenerMano(jugador, idBaraja) {
    try {
        let manos = [];
      
        // Leer las manos existentes
        if (fs.existsSync(manosFilePath)) {
            const manosData = fs.readFileSync(manosFilePath, 'utf8');
            manos = JSON.parse(manosData);
        }

        // Buscar la mano del jugador
        let manoJugador = manos.find(mano => mano.jugador === jugador);

        // Si no existe la mano, crearla
        if (!manoJugador) {
            manoJugador = { jugador: jugador, cartas: [], idBaraja: idBaraja }; // Asignar idBaraja al jugador
            manos.push(manoJugador);
        } else {
            // Verificar si el id de la nueva baraja es diferente al de la mano anterior
            if (manoJugador.idBaraja !== idBaraja) {
                // Borrar las cartas si la baraja ha cambiado
                manoJugador.cartas = [];
                manoJugador.idBaraja = idBaraja;  // Actualizar el id de la baraja
            }
        }

        if (manoJugador.cartas.length === 0) {
            return `_No tienes cartas. Usa #pedircarta para añadirlas._`;
        }

        const cartasJugador = manoJugador.cartas.map(carta => `_${carta.valor} de ${carta.palo}_`).join('\n');
        const puntos = calcularPuntos(manoJugador.cartas);
        const cantidadCartas = manoJugador.cartas.length;

        return `_Tus cartas son:_\n ${cartasJugador}\n_*Tus puntos:* ${puntos}_\n_Cantidad total de cartas: ${cantidadCartas}_`;

    } catch (error) {
        console.error('Error al obtener la mano:', error.message);
        return '_Hubo un error al obtener la mano del jugador._';
    }
}

function calcularPuntos(mano) {
    let puntos = 0;

    mano.forEach(carta => {
        if (['J', 'Q', 'K', 'A'].includes(carta.valor)){
            puntos += 10;
        } else{
            puntos += parseInt(carta.valor); // Los números tienen su valor
        }
    });
    return puntos;
}

async function borrarCartasDeJugador(jugador) {
    try {
        // Leer las manos existentes
        let manos = [];
        if (fs.existsSync(manosFilePath)) {
            const manosData = fs.readFileSync(manosFilePath, 'utf8');
            manos = JSON.parse(manosData);
        }

        // Buscar la mano del jugador
        let manoJugador = manos.find(mano => mano.jugador === jugador);

        // Si no se encuentra la mano del jugador
        if (!manoJugador) {
            return `_No tienes cartas. Usa #pedircarta para añadirlas._`;
        }

        // Borrar las cartas del jugador
        manoJugador.cartas = [];

        // Guardar las manos actualizadas en el archivo
        fs.writeFileSync(manosFilePath, JSON.stringify(manos, null, 2), 'utf8');

        return `_Las cartas del jugador ${jugador} han sido borradas._`;
    } catch (error) {
        console.error('Error al borrar las cartas del jugador:', error.message);
        return '_Hubo un error al borrar las cartas._';
    }
}

async function barajaSimplificada(id, paloDeseado) {
    try {
        // Parsear el ID a número (en caso de ser necesario)
        const idNumerico = parseInt(id, 10);

        // Leer el archivo de cartas
        const data = fs.readFileSync(cardsFilePath, 'utf8');
        const cartas = JSON.parse(data);

        // Leer las barajas existentes
        let barajas = leerBarajas();

        // Verificar si ya existe una baraja con ese ID
        const barajaExistente = barajas.find(baraja => baraja.id === idNumerico);
        if (barajaExistente) {
            console.log(`Una baraja con el ID ${idNumerico} ya existe.`);
            return 'existe';
        }

        // Filtrar las cartas del palo deseado
        const cartasFiltradas = cartas.filter(carta => carta.palo.toLowerCase() === paloDeseado.toLowerCase());

        if (cartasFiltradas.length !== 11) {
            throw new Error(`El palo ${paloDeseado} no tiene exactamente 11 cartas disponibles.`);
        }

        // Crear la nueva baraja
        const nuevaBaraja = {
            id: idNumerico,
            cartas: cartasFiltradas
        };

        // Barajar la nueva baraja
        barajarBaraja(nuevaBaraja.cartas);

        // Agregar la baraja al archivo
        barajas.push(nuevaBaraja);
        guardarBarajas(barajas);

        console.log(`Baraja simplificada creada con éxito. ID: ${idNumerico}`);
        return idNumerico; // Retornar el ID de la baraja creada
    } catch (error) {
        console.error('Error al crear la baraja simplificada:', error.message);
        return undefined;
    }
}


module.exports = {
    crearBaraja,
    guardarBarajas,
    borrarBaraja,
    pedirCarta,
    obtenerMano,
    borrarArchivo,
    borrarCartasDeJugador,
    barajaSimplificada
};
