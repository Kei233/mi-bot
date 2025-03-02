function handleAutoCombat(datos, tipo) {

    if(!datos || !datos.jugador || !datos.criatura){
        return `_¡No se encontraron los datos!_`;
    }
    let jugador = datos.jugador;
    let criatura = datos.criatura;
    let mensajeRol = '';
    let fallosU = datos.fallos ?? 0;
    let exitoU = datos.ataquesExitosos || datos.hechizosExitosos;
    let dañoU = datos.dañoTotal ?? 0;
    let vidaRC = datos.vidaRestante ?? 0;
    let intentos = datos.intentos ?? 0;
    let Cderrotada = datos.derrotado || datos.muerta;
    let contraataques = null;

    if(tipo === 'usuario' || tipo !== 'criatura'){
        return;
    }

    if(intentos === 0){
        return ''; 
    }

        mensajeRol += `*${criatura.nombre}*\n\n`;

        if(exitoU === intentos && intentos > 0){

            if(intentos >= 3){

            mensajeRol += `_*¡Con una gran agilidad y destreza ${jugador.nombre} impacta todos los golpes sobre el enemigo. ${criatura.nombre} sufre un total de ${dañoU} puntos de daño!*_ \n`
            }else{
                if(intentos === 2){
                    mensajeRol += `_*¡${jugador.nombre} da un par de golpes que dan justo en el blanco!!*_`
                }else{
                    if(intentos === 1){
                        mensajeRol += `_*${jugador.nombre} ataca una unica vez a su contrincante, y da con gran presición sobre este! ¿Fue solamente suerte, o una muestra de la gran agilidad del jugador!?*_`
                    }
                }
            } 
            mensajeRol += (Cderrotada ? ` _*¡${criatura.nombre} finalmente cae derrotado/a ¡Tú vences!*_` : ` _*Pero pese a todo, ${criatura.nombre} se mantiene en la pelea!*_\n`);
        }
        
        if(fallosU === intentos){
            if(fallosU >= 3){
            mensajeRol += `_*Pese a sus intentos, ${jugador.nombre} termino fallando cada uno de sus ataques! La criatura simplemente esquiva cada uno de ellos!, conciente de su superioridad en velocidad.*_`
            }else{
                if(fallosU === 2){
                mensajeRol += `_*${jugador.nombre} da un par de golpes que fallan en su intento por darle a su objetivo!*_`;
                }else{
                    if(fallosU === 1){
                        mensajeRol += `_*¡El/la jugador/a realiza un unico ataque, el cual falla totalmente! ¡${criatura.nombre} sale sin rasguño pese a que ${jugador.nombre} atacó con toda su velocidad!*_`;
                    }
                }
            }
        }

        if(fallosU > 0 && exitoU > 0 && intentos > 0){

                if(exitoU === intentos-1 && intentos >= 3){
                mensajeRol += `_*La agilidad del jugador es grandiosa, más sin embargo la criatura ${criatura.nombre} fue lo suficientemente rapida como para esquivar el ultimo ataque!*_` +
                ` _*Sin embargo, los golpes acestados no pierden su efectividad ¡la criatura ha recibido un total de ${dañoU} puntos de daño!*_\n` + (Cderrotada ? `\n\n_*La criatura no lo resiste, y cae derrotada ¡Tú vences!*_\n\n` : ``)
            }else{
                if(exitoU >= 3 && exitoU < intentos-1){
                    mensajeRol += `_*${jugador.nombre} logra impactar varios golpes, pese que falla ${fallosU} de ellos no logran impactar a ${criatura.nombre} ¡La velocidad de ambas es pareja*_` +
                    (jugador.estadisticas.agilidad > criatura.estadisticas.agilidad ? `_*Sin embargo, la agilidad de ${jugador.nombre} es superior!*_` : `_*Sin embargo, la velocidad de ${criatura.nombre} es superior!*_`) +
                    (Cderrotada ? `\n_*Aun asi... ¡La criatura cae rendida!! ${jugador.nombre} se alza con la victoria!*_` : ``); 
                }else{
                    if(exitoU === 1 && fallosU === intentos-1){
                        mensajeRol += `_*¡${criatura.nombre} se mueve agilmente esquivando los ataques de su enemigo, no parecia haber oportunidad de acertar... ¡Pero ${jugador.nombre} no creia tal cosa! ¡Tras varios intentos ${jugador.nombre} acesta un unico golpe!*_` +
                        (Cderrotada ? `\n _*Pero... ¿¡Que está pasando!? ¡LA CRIATURA CAE AL SUELO, DERROTADA POR AQUEL ATAQUE QUE LO DECIDIO TODO! ¡ERES EL VENCEDOR!*_` : ``);
                    }
                }
            } 
        }

        if(datos.contraataques || !Cderrotada){
            contraataques = datos.contraataques;
        }else{
            if(!Cderrotada && criatura.huida){
                mensajeRol += `_*La criatura huye, no puede contraatacar mientras lo hace!*_`;
            }else{
                if(!Cderrotada){
                mensajeRol += `_*La criatura, por alguna razón, no ataca!*_`
                }
            }
            
            return mensajeRol.trim();
        }
    
        if(contraataques){
    
            const dañoTotalC = contraataques.dañoTotal;
            const exitoC = contraataques.ataquesExitosos;
            const fallosC = contraataques.fallos;
            const intentosC = contraataques.intentos;
            
            if(intentosC > 0){
            mensajeRol += `\n`;
            }

            if(fallosC === 1 && exitoC === 0){
                mensajeRol += `_*${criatura.nombre} devuelve un golpe, pero falla en el intento de acertar a su oponente!*_`
            }

            if(intentosC === exitoC){
            if(contraataques.intentos >= 3){
                mensajeRol += `_*${criatura.nombre} ataca con gran velocidad, superando a ${jugador.nombre} en sus ataques! ¡Cada uno de ellos da justo en el blanco!*_`;
            }else{
                if(intentosC === 2){
                    mensajeRol += `_*${criatura.nombre} ataca con gran velocidad, superando a ${jugador.nombre} en sus ataques! ¡Ambos ataques dan justo en su contrincante! ${jugador.nombre} recibe -${dañoTotalC} puntos de daño!*_`;
                }else{
                    if(contraataques.intentos === 1){
                        mensajeRol += `_*${criatura.nombre} lanza un unico golpe que acesta sin dudarlo! El jugador ${jugador.nombre} recibe ${contraataques.dañoTotal} puntos de daño!*_`
                    }
                }
            }
        }
    
        if(fallosC === intentosC){
            if(contraataques.intentos >= 3){
                mensajeRol += `_*La criatura lanza un total de (${contraataques.intentos}) ataque(s) pero cada uno falla por completo! ¡La velocidad de ${jugador.nombre} es claramente superior!*_`;
            }else{
                if(contraataques.intentos === 2){
                    `_*La criatura lanza un par de golpes, pero falla totalmente en su intento por golpear a ${jugador.nombre}! ¡La agilidad es una clara determinante en está pelea!*_`
                }else{
                    if(contraataques.intentos === 1 && fallosC === 1){
                        `_*La criatura lanza un unico golpe contra su enemigo, el cual... ¡Falla! ¡${jugador.nombre} logra esquivar aquel ataque que la criatura lanzo sin temor alguno!*_`;
                    }
                }
            }
        }

        if(intentosC > 0 && fallosC > 0 && exitoC > 0){

            if(fallosC === intentosC-1 && exitoC === 1 && intentosC >= 3){
                mensajeRol += `_*${criatura.nombre} ataca varias veces al jugador, pero cada uno de sus ataques falla por completo... ¡Menos uno! el jugador es alcanzado por la ultima arremetida de la criatura! el jugador recibe ${dañoTotalC} puntos de daño!*_`;
            }else if(fallosC === intentosC-1 && exitoC === 1 && intentosC === 2){
                mensajeRol += `_*${criatura.nombre} ataca un par veces al jugador antes de detenerse, uno de sus ataques falla, pero el otro logra alcanzar a ${jugador.nombre}! el jugador recibe ${dañoTotalC} puntos de daño!*_`
            }

            if(exitoC === intentosC-1 && fallosC === 1 && intentosC >= 3){
                
                mensajeRol += `_*Los ataques de ${criatura.nombre} fueron lanzados a su maxima velocidad, y aunque casi todos ellos terminaron logrando su cometido, el ultimo de ellos fue esquivado por ${jugador.nombre}! Pese a eso, ${jugador.nombre} recibe ${dañoTotalC} puntos de daño!*_`;
            }else{
                if(exitoC === intentosC-1 && fallosC === 1 && intentosC === 2){
                    mensajeRol +=  `_*Un par de ataques fueron lanzados por ${criatura.nombre}, y aunque el primero de ellos acesto correctamente, el ultimo de ellos fue esquivado por ${jugador.nombre}! Aun asi, el jugador recibe ${dañoTotalC} puntos de daño!*_`;
                }
            }
        
        }
    
    }
        if(contraataques){
    
            if(contraataques?.vidaRestanteAtacante < (jugador.estadisticas.vidaMax / 4)){
    
            if(contraataques.vidaRestanteAtacante <= (jugador.estadisticas.vidaMax / 10)){
                mensajeRol += `\n\n_*ADVERTENCIA:* El/la jugador/a ${jugador.nombre} tiene *menos del 10%* de su vida total. Considere huir del combate o usar items/hechizos de curación_`;
            }else{
    
            mensajeRol += `\n\n_*ADVERTENCIA:* El/la jugador/a ${jugador.nombre} tiene menos del 25% de su vida total. Considere usar items/hechizos de curación_`;
            }}}
    
    
    mensajeRol += `\n\n*Vida restante de ${criatura.nombre}: ${vidaRC}*\n` + `*Vida restante del jugador:* ` + (contraataques ? `*${contraataques.vidaRestanteAtacante}*` : `*${jugador.estadisticas.vida}*`);
    
        return mensajeRol.trim();
}

   

module.exports = { handleAutoCombat };