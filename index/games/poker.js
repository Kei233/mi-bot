const { crearBaraja, guardarBarajas } = require('./blackjack'); // Importamos las funciones necesarias
const fs = require('fs');
const path = require('path');

const comunidadPath = path.join(__dirname, 'cartasComunitarias.json');
const barajasPath = path.join(__dirname, 'barajas.json'); // Archivo existente para las barajas

async function mostrarCartasComunitarias(idBaraja) {
    try {
        // Leer las cartas comunitarias almacenadas en el archivo
        let cartasComunitarias = {};
        if (fs.existsSync(comunidadPath)) {
            cartasComunitarias = JSON.parse(fs.readFileSync(comunidadPath, 'utf8'));
        }

        // Inicializamos las cartas comunitarias si no existen para este ID
        if (!cartasComunitarias[idBaraja]) {
            cartasComunitarias[idBaraja] = [];
        }
        const comunidad = cartasComunitarias[idBaraja];

        // Verificamos si ya se han mostrado todas las cartas comunitarias
        if (comunidad.length >= 5) {
            throw new Error('Ya se han mostrado todas las cartas comunitarias.');
        }

        // Leer la baraja asociada al ID desde el archivo existente
        let barajas = {};
        if (fs.existsSync(barajasPath)) {
            barajas = JSON.parse(fs.readFileSync(barajasPath, 'utf8'));
        }

        let baraja = barajas[idBaraja];
        if (!baraja) {
            // Si no existe una baraja para este ID, creamos una nueva y la guardamos
            baraja = await crearBaraja(idBaraja);
            barajas[idBaraja] = baraja;
        }

        if (!Array.isArray(baraja) || baraja.length === 0) {
            throw new Error('No hay más cartas disponibles en la baraja.');
        }

        // Determinamos cuántas cartas agregar (flop, turn o river)
        const cartasNecesarias = comunidad.length === 0 ? 3 : 1;

        // Sacamos las cartas de la baraja restante
        const nuevasCartas = baraja.splice(0, cartasNecesarias);

        if (nuevasCartas.length < cartasNecesarias) {
            throw new Error('No hay suficientes cartas disponibles en la baraja.');
        }

        // Agregamos las nuevas cartas a la comunidad
        comunidad.push(...nuevasCartas);

        // Actualizamos las cartas comunitarias y la baraja restante
        cartasComunitarias[idBaraja] = comunidad;
        barajas[idBaraja] = baraja;

        // Guardamos las cartas comunitarias en el archivo JSON
        fs.writeFileSync(comunidadPath, JSON.stringify(cartasComunitarias, null, 2));

        // Usamos la función importada para guardar las barajas actualizadas
        guardarBarajas(barajas);

        return comunidad;
    } catch (error) {
        console.error('Error al mostrar cartas comunitarias:', error.message);
        throw error;
    }
}

module.exports = { mostrarCartasComunitarias };
