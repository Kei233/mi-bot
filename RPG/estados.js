const { guardarObjetivo } = require("./combate.cjs");

async function aplicarEstados(entidad, duracion, intensidad){
    let modEstado = {};
    let mensajeFinal = '';
    let prop = {
        ataques: true,
        hechizos: true,
        recibirDaño: true,
        inmunidades: [],
        limiteAtaques: 0,
        reduccionDaño: 0,
        aumentoDaño: 0
    };

    if(!intensidad || !duracion){
        intensidad ? intensidad = intensidad : 0;
        duracion ? duracion = duracion : 0;
    }

    if(!entidad || !entidad.estadisticas){
        console.error("Hubo un error al recibir el objeto del entidad/objetivo");
        return null;
    }

    if(!entidad.estados){
        entidad.estados = [];
        return;
    }

    if(!entidad?.efectosEstado){
        entidad.efectosEstado = [];
        return;
    }

    entidad.estados.forEach(estado => {

        switch(estado){
            case 'debilitado':
            modEstado = {
                    nombre: estado,
                    duracion: duracion,
                    intensidad: 0,
                    prop: {
                        ataques: false,
                        hechizos: false,
                        recibirDaño: true,
                        inmunidades: [],
                        limiteAtaques: 0,
                        reduccionDaño: 0,
                        aumentoDaño: 0
                    },
                }
            prop.ataques = false;
            prop.hechizos = false;
            entidad.efectosEstado.push(modEstado);
            mensajeFinal += `_*${entidad.nombre} ha sido debilitado/a!*_`
            break;
            case 'inmortal': 
            modEstado = {
                nombre: estado,
                duracion: duracion,
                intensidad: 0,
                prop: {
                    ataques: true,
                    hechizos: true,
                    recibirDaño: false,
                    inmunidades: [],
                    limiteAtaques: 0,
                    reduccionDaño: 0,
                    aumentoDaño: 0
                },
            }
            prop.recibirDaño = false;

            mensajeFinal += `_¡${entidad.nombre} ahora es inmortal!_`;
            break;
            case 'Silenciado':
                modEstado = {
                    nombre: estado,
                    duracion: duracion,
                    intensidad: 0,
                }
                prop.hechizos = false;
                mensajeFinal += `_${entidad.nombre} ha sido silenciado!_`;
            break;
            default:
            mensajeFinal += `_¡Estado no definido!_`;
        }});

        await guardarObjetivo(`${entidad?.criatura ? 'criatura' : 'usuario '}`, entidad);

        return { mensaje: mensajeFinal, propiedades: prop };
}

// if(typeof Estado !== 'Object' || !Estado.duracion ){
//     console.log("Estado corrupto. Removiendo...");
//     return false;
// }

module.exports = { aplicarEstados }