const fs = require('fs');
const path = require('path');

// Ruta para guardar el estado del tambor
const tamborPath = path.join(__dirname, 'tambor.json');

// Función para inicializar la ruleta rusa
function inicializarTambor(balas = 1, espacios = 6) {
    if (balas > espacios) {
        throw new Error('El número de balas no puede ser mayor que el número de espacios.');
    }

    const posiciones = Array(espacios).fill(false);
    for (let i = 0; i < balas; i++) {
        let posicion;
        do {
            posicion = Math.floor(Math.random() * espacios);
        } while (posiciones[posicion]);
        posiciones[posicion] = true;
    }

    const tambor = {
        posiciones,
        actual: 0, // Posición inicial del tambor
    };

    guardarTambor(tambor);
    return tambor;
}

// Función para disparar
function disparar() {
    const tambor = cargarTambor();
    const { posiciones, actual } = tambor;

    const resultado = posiciones[actual] ? '¡BANG!' : 'Click';

    // Avanza al siguiente espacio del tambor
    tambor.actual = (actual + 1) % posiciones.length;
    guardarTambor(tambor);

    return resultado;
}

// Función para cargar el estado del tambor
function cargarTambor() {
    if (!fs.existsSync(tamborPath)) {
        throw new Error('El tambor no está inicializado.');
    }
    return JSON.parse(fs.readFileSync(tamborPath, 'utf-8'));
}

// Función para guardar el estado del tambor
function guardarTambor(tambor) {
    fs.writeFileSync(tamborPath, JSON.stringify(tambor, null, 2));
}

module.exports = {
    inicializarTambor,
    disparar,
};