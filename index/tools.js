const fs = require('fs');
const path = require('path');

function calcular(num1, num2) {
    return num1 * num2;  
}

function moneda(){

    let mensaje = Math.floor(Math.random() * (100 - 50) + 50);

    while(mensaje === 50){ mensaje = Math.floor(Math.random() * (100 - 50) + 50); };

    return (mensaje > 50) ? "Cara" : "Cruz";
}



// Ruta al archivo cards.json
const cardsFilePath = path.join(__dirname, 'games', 'cards.json');

function cartaAleatoria() {
    try {
        // Leer las cartas desde el archivo JSON
        const data = fs.readFileSync(cardsFilePath, 'utf8');
        const cartas = JSON.parse(data);

        if (!cartas.length) {
            throw new Error('No hay cartas en la baraja.');
        }

        // Seleccionar una carta al azar
        const cartaAleatoria = cartas[Math.floor(Math.random() * cartas.length)];
        return `${cartaAleatoria.valor} de ${cartaAleatoria.palo}`;
    } catch (error) {
        console.error('Error al seleccionar una carta aleatoria:', error.message);
        return 'Hubo un error al seleccionar una carta.';
    }
}


module.exports = { calcular, moneda, cartaAleatoria};