const fs = require('fs');
const path = require('path');


// Ruta a los archivos JSON
const filePathRegistros = path.join(__dirname, 'registros.json');
const filePathCrupiers = path.join(__dirname, 'crupiers.json');

// Función para cargar los registros actuales
function cargarRegistros() {
    if (!fs.existsSync(filePathRegistros)) {
        fs.writeFileSync(filePathRegistros, JSON.stringify([]));
    }

    const data = fs.readFileSync(filePathRegistros, 'utf-8');
    return JSON.parse(data);
}

// Función para cargar los crupieres actuales
function cargarCrupiers() {
    if (!fs.existsSync(filePathCrupiers)) {
        fs.writeFileSync(filePathCrupiers, JSON.stringify({ crupiers: [] }));
    }
    const data = fs.readFileSync(filePathCrupiers, 'utf-8');
    return JSON.parse(data).crupiers;
}

// Función para guardar los registros
function guardarRegistros(registros) {

    fs.writeFileSync(filePathRegistros, JSON.stringify(registros, null, 2));
}

// Función para guardar los crupieres
function guardarCrupiers(crupiers) {
    fs.writeFileSync(filePathCrupiers, JSON.stringify({ crupiers }, null, 2));
}

// Función para registrar a una persona
async function registrarPersona(numero, nombre, dinero, fuerza, agilidad, vida, mana, magia, arma, talento){
    if (
        typeof numero !== 'string' || 
        typeof nombre !== 'string' || 
        typeof dinero !== 'number' || 
        typeof fuerza !== 'number' || 
        typeof agilidad !== 'number' || 
        typeof vida !== 'number' ||
        typeof mana !== 'number' ||
        typeof magia !== 'number' ||
        typeof arma !== 'string'
    ) {
        throw new Error('_Parámetros inválidos. Asegúrate de pasar un nombre y estadísticas correctos._');
    }

    fuerza ??= 0;
    agilidad ??= 0;
    mana ??= 0;
    magia ??= 0;

    const vidaMax = vida;
    const manaMax = mana;
    const velAt = 2 + Math.floor(agilidad / 250); 
    let crit = 10 + Math.floor(fuerza / 70);
    
    if(crit >= 60){
        crit = 60;
    }

    // const talentos = ["expsuperior", "afortunado", ""];
    // if(!talentos.includes(talento.toLowerCase())){
    //     return `_Talento no valido._`;
    // }
    const precision = 0;

    const registros = cargarRegistros();
    const existente = registros.find(registro => registro.numero === numero);

    if (existente && existente.nombre === nombre) {
        return `_El usuario ya está registrado._`;
    }

    let armaAEquipar = {};

    switch(arma){
        case 'espada':
        fuerza += 50;
        agilidad += 50;
        armaAEquipar = {
        nombre: "Espada generica",
        rango: "D",
        cantidad: 1,
        tipo: "arma",
        daño: 120,
        equipada: false,
        modificadores: [ 
        {
            estadistica: "agilidad",
            duracion: 0,
            intensidad: 50,
            buff: true,
            fuente: 'arma'
        },
        {
            estadistica: "fuerza",
            duracion: 0,
            intensidad: 50,
            buff: true,
            fuente: 'arma'
        }],
        efectos: []
        }
        break;
        case 'lanza':
            agilidad += 110;
            armaAEquipar = {
                nombre: "Lanza generica",
                rango: "D",
                cantidad: 1,
                tipo: "arma",
                daño: 100,
                equipada: false,
                modificadores: [ 
                {
                    estadistica: "agilidad",
                    duracion: 0,
                    intensidad: 110,
                    buff: true,
                    fuente: 'arma'
                }],
                efectos: []
            }
            break;
            case 'hacha':
                fuerza += 130;
                armaAEquipar = {
                    nombre: "Hacha generica",
                    probabilidad: 40,
                    rango: "D",
                    cantidad: 1,
                    tipo: "arma",
                    daño: 150,
                    equipada: false,
                    modificadores: [ 
                    {
                        estadistica: "fuerza",
                        duracion: 0,
                        intensidad: 130,
                        buff: true,
                        fuente: 'arma'
                    }],
                    efectos: []
                }
            break;
            case 'arco':
            precision += 60;
            armaAEquipar = {
                nombre: "Arco Generico",
                rango: "D",
                cantidad: 1,
                tipo: "arma",
                daño: 100,
                equipada: false,
                modificadores: [ 
                {
                    estadistica: "precisión",
                    duracion: 0,
                    intensidad: 60,
                    buff: true,
                    fuente: 'arma'
                }],
                efectos: []
            }
            break;
            case 'bastón':
                magia += 200;
                armaAEquipar = {
                    "nombre": "Bastón generico",
                    rango: "D",
                    cantidad: 1,
                    tipo: "arma",
                    daño: 10,
                    equipada: false,
                    modificadores: [ 
                    {
                        estadistica: "magia",
                        duracion: 0,
                        intensidad: 200,
                        buff: true,
                        fuente: 'arma'
                    }],
                    efectos: []
                }
            break;
            case 'bola':
                mana += 210;
                armaAEquipar = {
                    "nombre": "Bola de Cristal generica",
                    rango: "D",
                    cantidad: 1,
                    tipo: "arma",
                    daño: 10,
                    equipada: false,
                    modificadores: [ 
                    {
                        estadistica: "maná",
                        duracion: 0,
                        intensidad: 210,
                        buff: true,
                        fuente: 'arma'
                    }],
                    efectos: []
                }

    }

    const nuevoRegistro = { 
        numero, 
        nombre, 
        dinero, 
        estadisticas: { fuerza, agilidad, vida, mana, magia, vidaMax, manaMax, velAt, crit, precision, efectos: [] },
        armadura: 0,
        nivel: 1,
        experiencia: 0,
        estados: [],  
        casino: false,
        inventario: [],
        hechizos: [ 1, 2 ],
        armaPrincipal: armaAEquipar,
        reliquias: [], 
        talento: talento || '',
        modificadoresTemp: [],
        puntosPorDistribuir: 0,
        habilidades: [],
        talento: [],
        explicito: false,
        spawn: false,
        contadorSpawn: 0,
        adjudicados: []
    };

    console.log("Retornando nuevo registro.");
    return nuevoRegistro;
}

async function agregarCrupier(numero, nombre) {

    const registros = cargarRegistros();
    const registrado = registros.find(registro => registro.numero === numero);

    if (!registrado) {
        throw new Error('El usuario no está registrado.');
    }

    const crupiers = cargarCrupiers();
    const existente = crupiers.find(crupier => crupier.numero === numero);

    if (existente) {
        throw new Error('El crupier ya está registrado.');
    }

    const nuevoCrupier = { nombre, numero };
    crupiers.push(nuevoCrupier);
    guardarCrupiers(crupiers);

    console.log(`Crupier ${nombre} registrado exitosamente.`);
}

async function eliminarRegistro(nombre) {
    if (typeof nombre !== 'string') {
        throw new Error('El nombre no esta correctamente escrito.');
    }

    const registro = cargarRegistros();

    // Verificar si el crupier existe
    const registroIndex = registro.findIndex(registro => registro.nombre === nombre);

    if (registroIndex === -1) {
        throw new Error(`No se encontró el usuario con el nombre: ${nombre}`);
    }

    // Eliminar el crupier de la lista
    const registroEliminado = registro.splice(registroIndex, 1);

    guardarRegistros(registro);

    console.log(`Persona ${registroEliminado[0].nombre} eliminada exitosamente.`);

    return `_Persona *"${registroEliminado[0].nombre}"* eliminada exitosamente._`
}

function eliminarCrupier(nombre) {
    if (typeof nombre !== 'string') {
        throw new Error('El nombre no esta correctamente escrito.');
    }

    const crupiers = cargarCrupiers();

    // Verificar si el crupier existe
    const crupierIndex = crupiers.findIndex(crupier => crupier.nombre === nombre);

    if (crupierIndex === -1) {
        throw new Error(`No se encontró un crupier con el nombre: ${nombre}`);
    }

    // Eliminar el crupier de la lista
    const crupierEliminado = crupiers.splice(crupierIndex, 1);

    guardarCrupiers(crupiers);

    console.log(`Crupier ${crupierEliminado[0].nombre} eliminado exitosamente.`);

    return `_Crupier *"${crupierEliminado[0].nombre}"* eliminado exitosamente._`
}

function esCrupier(numero, admin) {
    const crupiers = cargarCrupiers();
    if(admin){return true}

    // Verifica si el número está en la lista de crupieres
    return crupiers.some(crupier => crupier.numero === numero);
}


module.exports = { registrarPersona, agregarCrupier, cargarRegistros, guardarRegistros, eliminarCrupier, eliminarRegistro, esCrupier };
