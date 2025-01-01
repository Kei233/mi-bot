const simbolos = ['🍒 ', '7️⃣  ', '🍋 ', '💎 ', '🐉 ', '🍇 ', '♦️'];
const simbolos2 = ['🍒 ', '7️⃣  ', '🍋 ', '💎 ', '🐉 ', '🍇 ', '♦️', '🐼 ', '🔥', '❤️', '🎈'];

resultado = jalarpalanca(simbolos)

resultado2 = jalarpalanca2(simbolos2)

function jalarpalanca(simbolos){

    const stock1 = Math.floor(Math.random() * simbolos.length);
    const stock2 = Math.floor(Math.random() * simbolos.length);
    const stock3 = Math.floor(Math.random() * simbolos.length);


    return {resultado: [simbolos[stock1], simbolos[stock2], simbolos[stock3]], };
}

function jalarpalanca2(){

    const stock1 = Math.floor(Math.random() * simbolos2.length);
    const stock2 = Math.floor(Math.random() * simbolos2.length);
    const stock3 = Math.floor(Math.random() * simbolos2.length);
    const stock4 = Math.floor(Math.random() * simbolos2.length);
    const stock5 = Math.floor(Math.random() * simbolos2.length);

    return {resultado: [simbolos2[stock1], simbolos2[stock2], simbolos2[stock3], simbolos2[stock4], simbolos2[stock5]], };
}

module.exports = {jalarpalanca, jalarpalanca2, simbolos, simbolos2};
