async function ruletaRusa(){
    const espacios = [1, 2, 3, 4, 5, 6];

    let cartucho = Math.floor((Math.random() * (6 - 1)) + 1);

    let bala = espacios[cartucho];
    let posicion = girarBarril(espacios);

    return [bala, posicion];
};

async function girarBarril(posicion){

    posicion =  Math.floor((Math.random() * (6 - 1)) + 1);

    return posicion;
}

module.exports = {ruletaRusa, girarBarril };