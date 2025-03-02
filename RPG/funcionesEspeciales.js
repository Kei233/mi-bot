const { mostrarEstadisticasCriatura, crearCriatura, cargarCriaturas } = require("./criaturas");
const { mostrarEstadisticasPersonaje } = require('../hCommands.js');
const { cargarModificadoresEfectos } = require('./combate.cjs');
const { cargarRegistros } = require("../registro.js");

async function handleEspeciales(hechizo, objetivo, atacante) {
    
    console.log("Hechizo entrando en funciones especiales");

    if(!hechizo || !objetivo || !atacante){
        console.log("Parametros en funciones especiales recibidos erroneamente.");
        return null;
    }

    let mensajeFinal = '';
    let modificador = {};
    let adjudicado = {};
    
    if (!Array.isArray(hechizo?.Especial)) {
        hechizo.Especial = [];
        return null;
    }
    if (hechizo?.Especial && Array.isArray(hechizo.Especial)) {
        hechizo.Especial.forEach((nombre) => {
            switch (nombre) {
                case 'verificar':
                    mensajeFinal += `Funciones especiales en operación.`
                break;
                case 'Curar':
                atacante.estadisticas.vida += hechizo.intensidad + (Math.round(atacante.estadisticas.magia / 6));
                if(atacante.estadisticas.vida > atacante.estadisticas.vidaMax){
                    atacante.estadisticas.vida = atacante.estadisticas.vidaMax;
                mensajeFinal += `¡${atacante.nombre} ahora tiene toda su vida!`
                }else{
                mensajeFinal += `_¡${atacante.nombre} curado! (+${hechizo.intensidad})_\n`;
                }    
                break;
                case 'mejorarFuerza':
                    atacante.estadisticas.fuerza += hechizo.intensidad;
                modificador = {
                    estadistica: "fuerza",
                    intensidad: hechizo.intensidad + (Math.round(atacante.estadisticas.magia / 6)),
                    duracion: hechizo.duracion,
                    buff: true
                }
                atacante.modificadoresTemp.push(modificador);
                mensajeFinal += `_¡Fuerza aumentada en ${hechizo.intensidad}. Ahora tienes: ${atacante.estadisticas.fuerza}_`
                break;
                case 'mejorarEstadisticas':
                const nuevaIntensidad = hechizo.intensidad + (Math.floor(atacante.estadisticas.magia / 10));
                atacante.estadisticas.fuerza += nuevaIntensidad;
                atacante.estadisticas.agilidad += nuevaIntensidad;
                if(nuevaIntensidad > hechizo.costo){
                    atacante.estadisticas.mana -= nuevaIntensidad;
                }else{
                atacante.estadisticas.mana += nuevaIntensidad;
                }
                atacante.estadisticas.magia += nuevaIntensidad;

                modificador = {
                estadistica: "todas",
                intensidad: nuevaIntensidad,
                duracion: hechizo.duracion,
                buff: true
                }
                atacante.modificadoresTemp.push(modificador);
                mensajeFinal += `_Todas tus estadisticas han sido aumentadas en ${nuevaIntensidad}_`;
                break;
                case 'MejorarMagia':
                atacante.estadisticas.magia += hechizo.intensidad + (Math.round(atacante.estadisticas.magia / 8));
                modificador = {
                    estadistica: "magia",
                    intensidad: hechizo.intensidad + (Math.round(atacante.estadisticas.magia / 8)),
                    duracion: hechizo.duracion,
                    buff: true   
                }
                mensajeFinal += `_Tú magia ha sido mejorada en ${intensidad.hechizo + Math.round(atacante.estadisticas.magia / 8)} puntos!_`
                break;
                case 'Absorber':
                if(atacante.nombre === objetivo.nombre){
                    mensajeFinal += '_¡No puedes absorber vida de ti mismo!_';
                    break;
                }
                objetivo.estadisticas.vida -= hechizo.intensidad + Math.round(atacante.estadisticas.magia / 6);
                atacante.estadisticas.vida += hechizo.intensidad + Math.round(atacante.estadisticas.magia / 6);
                mensajeFinal += `_Has absorvido ${Math.round(atacante.estadisticas.magia / 6)} puntos de vida a ${objetivo.nombre}_`;
                break;
                case 'AdjudicarBajo':
                if(objetivo?.criatura && atacante.nivel > (objetivo?.idRango * 5) && objetivo.idRango < 3){
                    adjudicado = {
                        nombre: objetivo.nombre,
                        duración: hechizo.duracion,
                    };
                    objetivo.estadisticas.autoCombat = false;

                if(!atacante.adjudicados){
                    atacante.adjudicados = []; 
                }
                atacante.adjudicados.push(adjudicado);
                }else{
                    mensajeFinal += '_¡No puedes adjudicar a otro jugador o a una criatura de un nivel tan alto!_';
                }
                break;
                case 'Detección':
                    if(atacante.nivel / 10 < (objetivo.idRango || objetivo?.nivel)){
                        mensajeFinal += `_Detección ha fallado porque el rango del enemigo es demasiado alto!_`
                        break;
                    }
                    mensajeFinal += `_Información del objetivo:_\n\n`;
                    if(objetivo.criatura){
                    mensajeFinal += mostrarEstadisticasCriatura(objetivo);
                    }else{
                        if(objetivo.nivel > atacante.nivel){
                            mensajeFinal += `_¡Este hechizo no puede ver las estadisticas de un jugador de mayor nivel que tú!_`
                        }else{
                            mensajeFinal += `_Estadisticas del jugador:_\n\n`;
                            mensajeFinal +=  mostrarEstadisticasPersonaje(objetivo);
                        }
                    }
                break;
                case 'MejoraArma':
                    if(!atacante.armaPrincipal || !atacante.armaPrincipal?.rango){
                        mensajeFinal += `_¡No tienes un arma equipada la cual mejorar de estadisticas!_`
                        break;
                    }
                    if(atacante.armaPrincipal?.mejorada){
                        mensajeFinal += `_¡Esta arma ya fue mejorada!_`
                        break;
                    }

                   let RangoArma =  atacante.armaPrincipal.rango;
                   let arma = atacante.armaPrincipal;
                   if(RangoArma === 'SS'){
                    mensajeFinal += `_*¡Nivel maximo!*_`
                    break;
                   }
                   if(RangoArma){
                    const rangos = ["E", "D", "C", "B", "A", "S", "SS"];
                    const rangoAnterior = rangos.findIndex(r => r === RangoArma);

                    RangoArma = rangos[rangoAnterior +1];
                   }
                   let armaNueva = arma;
                   armaNueva.daño *= 1.5;
                   const { modificadores, efectos } = cargarModificadoresEfectos();
  
                   if(armaNueva?.modificadores && rangoAnterior > 1){
                    const modificadorAleatorio = modificadores[Math.floor(Math.random() * modificadores.length)];
                    armaNueva.modificadores.push(modificadorAleatorio);
                   }
                   if(armaNueva?.efectos && rangoAnterior > 1){
                    const efectoAleatorio = efectos[Math.floor(Math.random() * efectos.length)];
                    armaNueva.efectos.push(efectoAleatorio);
                   }

                   armaNueva.mejorada = true;
                   armaNueva.duracion = hechizo.duracion;
                   armaNueva.armaAnterior = { ...arma };

                   mensajeFinal += `_¡¡El arma ${arma.nombre} ha sido mejorada!!_`;
                break;
                case 'GolpealAlza':
                const probabilidad = Math.random() * 100;
                const golpe = atacante.estadisticas.fuerza * 2;  
                if(probabilidad > 50){
                atacante.estadisticas.vida = Math.max(0, atacante.estadisticas.vida - golpe);
                }else{
                objetivo.estadisticas.vida = Math.max(0, objetivo.estadisticas.vida - golpe);
                }
                mensajeFinal += `_El ataque al alza ha salido exitoso...` + `${probabilidad > 50 ? `¡Tú has resultado herido!_` : `¡${objetivo.nombre} ha resultado herido!_`}`;
                break;
                case 'invocarBajo':
                let rango = Math.min(Math.floor(atacante.estadisticas.magia / 1000), 6);
                switch(rango){
                    case 0: rango = 'E'; break;
                    case 1: rango = 'D'; break;
                    case 2: rango = 'C'; break;
                    case 3: rango = 'B'; break;
                    case 4: rango = 'A'; break;
                    case 5: rango = 'S'; break;
                    case 6: rango = 'SS'; break;
                }
                const criatura = crearCriatura("Subdito", rango);
                
                if(!criatura){
                    console.log("Algo salio mal con el hechizo de invocar.");
                    break;
                } 
                criatura.estadisticas.autoCombat = false;
                criatura.invocada = true;

                if(atacante.adjudicados.find(c => c === criatura.nombre)){
                   mensajeFinal += `_¡Ya tienes una criatura invocada!_`;
                }else{
                    atacante.adjudicados.push(criatura.nombre);
                    mensajeFinal += `_Un subdito ha sido invocado!_`
                };
                break;
                // case 'BombaEfectos':
                // if(objetivo.distancia){
                //     if(!objetivo?.distancia){
                //         objetivo.distancia = [];
                //     }
                //     if(objetivo.distancia.length > 0){
                //         objetivo.distancia.forEach(obj =>{
                //             if(obj.distancia < hechizo.intensidad){
                //             const nuevoObjetivo = registros.find(r => r.nombre === obj.nombre) || criaturas.find(c => c.nombre === obj.nombre); 
                //             const efectosAplicados = aplicarEfectos(hechizo.efectos, nuevoObjetivo);
                //             if(efectosAplicados.length > 0){
                //             efectosAplicados.forEach(efecto => {
                //                 mensajeFinal += `_${nuevoObjetivo.nombre} sufre del efecto: ${efecto}_`
                //             })}else{
                //                 mensajeFinal += `_${nuevoObjetivo.nombre} no ha sufrido efectos!_`
                //             }
                //             }
                //         });
                //     }
                // }

                // break; 
                default:
                    mensajeFinal += `_Función desconocida: ${nombre}.\n_`;
                break;
            }
        });
    } else{
        mensajeFinal += `_No se encontraron hechizos especiales o la propiedad no es un array.\n_`;
    }

    return mensajeFinal;
}

function aplicarEfectos(efectos, objetivo){

    if(!efectos || !Array.isArray(efectos) || !objetivo || !objetivo?.estadisticas?.efectos){   
        console.log("Parametros pasados de forma incorrecta en funciones especiales.", efectos, objetivo );
    }
    if(efectos.length <= 0){
    return;
    }  

    console.log("Punto de control en aplicarEfectos.");

    let efectosAplicados = [];

    efectos.forEach(efecto => {
        const probabilidad = Math.random() * 100;

        // Verificar si el efecto se aplica según la probabilidad
        if (probabilidad <= efecto.probabilidad) {
            const efectoAplicado = {
                nombre: efecto.nombre,
                duracion: efecto.duracion,
                intensidad: efecto.intensidad
            };

            // Asegurarnos de que stats.efectos sea un array
            stats.efectos = stats.efectos || [];

            // Solo agregar el efecto si no existe ya en stats.efectos
            if (!stats.efectos.some(e => e.nombre === efecto.nombre)) {
                stats.efectos.push(efectoAplicado);
            }
            efectosAplicados.push(efectoAplicado.nombre);

            // Si el efecto tiene modificadores, aplicarlos al objetivo
            if (efecto?.modificadores) {
                // Asegurarnos de que objetivo.modificadoresTemp sea un array
                objetivo.modificadoresTemp = objetivo.modificadoresTemp || [];

                // Añadir los modificadores del efecto
                efecto.modificadores.forEach(modificador => {
                    // Verificar si el modificador ya está aplicado
                    if (!objetivo.modificadoresTemp.some(m => m.estadistica === modificador.estadistica && m.fuente === modificador.fuente)) {
                        objetivo.modificadoresTemp.push(modificador);
                    }
                });
            }
        }
    });

    return efectosAplicados;
}

module.exports = { handleEspeciales };
