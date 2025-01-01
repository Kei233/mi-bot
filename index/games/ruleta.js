const arregloRuleta = [
    { numero: 0, color: 'verde' },
    { numero: 32, color: 'rojo' },
    { numero: 15, color: 'negro' },
    { numero: 19, color: 'rojo' },
    { numero: 4, color: 'negro' },
    { numero: 21, color: 'rojo' },
    { numero: 2, color: 'negro' },
    { numero: 25, color: 'rojo' },
    { numero: 17, color: 'negro' },
    { numero: 34, color: 'rojo' },
    { numero: 6, color: 'negro' },
    { numero: 27, color: 'rojo' },
    { numero: 13, color: 'negro' },
    { numero: 36, color: 'rojo' },
    { numero: 11, color: 'negro' },
    { numero: 30, color: 'rojo' },
    { numero: 8, color: 'negro' },
    { numero: 23, color: 'rojo' },
    { numero: 10, color: 'negro' },
    { numero: 5, color: 'rojo' },
    { numero: 24, color: 'negro' },
    { numero: 16, color: 'rojo' },
    { numero: 33, color: 'negro' },
    { numero: 1, color: 'rojo' },
    { numero: 20, color: 'negro' },
    { numero: 14, color: 'rojo' },
    { numero: 31, color: 'negro' },
    { numero: 9, color: 'rojo' },
    { numero: 22, color: 'negro' },
    { numero: 18, color: 'rojo' },
    { numero: 29, color: 'negro' },
    { numero: 7, color: 'rojo' },
    { numero: 28, color: 'negro' },
    { numero: 12, color: 'rojo' },
    { numero: 35, color: 'negro' },
    { numero: 3, color: 'rojo' },
    { numero: 26, color: 'negro' },
];

ruleta(arregloRuleta);

function ruleta() {
    const indiceAleatorio = Math.floor(Math.random() * arregloRuleta.length);
    return arregloRuleta[indiceAleatorio];  // Retorna el objeto con número y color
}

module.exports = {ruleta};