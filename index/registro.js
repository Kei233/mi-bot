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
async function registrarPersona(numero, nombre, dinero) {
    if (typeof numero !== 'string' || typeof nombre !== 'string' || typeof dinero !== 'number') {
        throw new Error('Parámetros inválidos. Asegúrate de pasar un número, nombre y cantidad de dinero correctos.');
    }

    const registros = cargarRegistros();
    const existente = registros.find(registro => registro.numero === numero);

    if (existente) {
        throw new Error(`El usuario con el número ${numero} ya está registrado.`);
    }

    const nuevoRegistro = { numero, nombre, dinero };
    registros.push(nuevoRegistro);
    guardarRegistros(registros);

    console.log(`Usuario ${nombre} registrado exitosamente.`);
}

// Función para agregar un crupier (solo el administrador puede hacerlo)
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

function eliminarRegistro(nombre) {
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
