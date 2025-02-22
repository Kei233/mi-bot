const { tirarDados, tirarDados2 } = require('./games/tirardados.js');
const { calcular, moneda, cartaAleatoria } = require('./tools.js');
const { crearBaraja, borrarBaraja, pedirCarta, obtenerMano, borrarArchivo, borrarCartasDeJugador, barajaSimplificada } = require('./games/blackjack.js');
const { ruleta } = require('./games/ruleta.js');
const { jalarpalanca, jalarpalanca2, simbolos, simbolos2 } = require('./games/tragamonedas.js');
const fs = require('node:fs');
const path = require('node:path');
const { agregarCrupier, cargarRegistros, guardarRegistros, eliminarCrupier, eliminarRegistro, esCrupier } = require('../registro.js');
const { mostrarCartasComunitarias } = require('./games/poker.js');
const {  inicializarTambor, disparar } = require('./games/ruletaRusa.js');

async function casinoCommands(message, client, admin, participantes, chat) {
    try {
        const content = message.body.trim().toLowerCase();
        const numero = message.author;
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
       
        if (content.includes('addcrupier')) {
            const args = content.split(' ');
            const nombreCrupier = args.slice(1).join(' '); // El nombre puede ser compuesto
            
            // Verifica que se haya proporcionado un nombre
            if (!nombreCrupier) {
                await message.reply('_Por favor, proporciona el nombre de la persona que deseas agregar como crupier._');
                return;
            }
            
            if (!admin) {
                await message.reply('_No tienes permiso para agregar crupieres._');
                return;
            }
            
            try {
                // Cargar registros
                const registros = cargarRegistros();
        
                // Buscar la persona registrada por su nombre
                const persona = registros.find(registro => registro.nombre === nombreCrupier);
        
                if (!persona) {
                    await message.reply(`"${nombreCrupier}" no está registrada.`);
                    return;
                }

                await agregarCrupier(persona.numero, persona.nombre);
        
                await message.reply(`_"${nombreCrupier}" ha sido agregada como crupier exitosamente._`);
            } catch (error) {
                // Manejar cualquier error que ocurra
                await message.reply(`_Error al agregar crupier: ${error.message}_`);
            }
        }

        if(content.includes('deletecrupier')){
        const args = content.split(' ');
        const nombreCrupier = args.slice(1).join(' ');

        if(!nombreCrupier)
            { message.reply('Por favor, proporcione el nombre del crupier.');}


        if (!admin) {
                await message.reply('_No tienes permiso para agregar crupieres._');
                return;
        }
        
        const resultado = await eliminarCrupier(nombreCrupier);


        await message.reply(`${resultado}`);

        }

        if (content.includes('rrusa')) {
            try {
                const resultado = disparar(); // Dispara y avanza el tambor
                await delay(5000);
        
                if (resultado === '¡BANG!') {
                    message.reply(`_*click.*_\n_*Has muerto.*_`);
                } else {
                    message.reply(`_Has sobrevivido... Por ahora._`);
                }
            } catch (error) {
                message.reply('_El tambor no está inicializado. Usa #girarbarril para empezar._');
                console.error(error);
            }
        }
        
        if (content.includes('girarbarril')) {
            try {
                inicializarTambor(1, 6); // 1 bala en un tambor de 6 espacios
                message.reply('_El barril ha sido girado con éxito. El juego puede comenzar._');
            } catch (error) {
                message.reply('_Hubo un error al girar el barril._');
                console.error(error);
            }
        }
        
        if (content.includes('tirardados')) {
            if (!await esCrupier(message.author, admin)) {
                await message.reply('_No tienes permiso para ejecutar este comando._');
                return;
            }  

            const simbolos = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"]; 
            const {dado1, dado2 } = tirarDados();
            if(content.includes('tirardados6')) 
                { 
            const {dado1, dado2, dado3, dado4, dado5, dado6} = tirarDados2();
            
            const simboloDado1 = simbolos[dado1 - 1]; 
            const simboloDado2 = simbolos[dado2 - 1];
            const simboloDado3 = simbolos[dado3 - 1];
            const simboloDado4 = simbolos[dado4 - 1];
            const simboloDado5 = simbolos[dado5 - 1]; 
            const simboloDado6 = simbolos[dado6 - 1];
            
            await message.reply(
        `_${simboloDado1} , ${simboloDado2} , ${simboloDado3} , ${simboloDado4} , ${simboloDado5} , ${simboloDado6}_`);
            return;
        }
            
            const simboloDado1 = simbolos[dado1 - 1]; 
            const simboloDado2 = simbolos[dado2 - 1];

            await message.reply(`_${simboloDado1} , ${simboloDado2}_`);

        } //check

        if (content.includes('calcular')) {
            const args = content.split(' ');
            if (args.length === 3) {
                const num1 = parseFloat(args[1]);
                const num2 = parseFloat(args[2]);
                if (!isNaN(num1) && !isNaN(num2)) {
                    const resultado = calcular(num1, num2);
                    await message.reply(`_El resultado es: ${resultado}_`);
                } else {
                    await message.reply('_Por favor, ingresa dos números válidos._');
                }
            } else {
                await message.reply('_Uso correcto: #calcular numero1 numero2_');
            }
        } //check

        if (content.includes('blackjack')) {
            
            if (!await esCrupier(message.author, admin)) {
                await message.reply('_No tienes permiso para ejecutar este comando._');
                return;
            }
            const args = content.split(' ');
            const indice = args.indexOf('#blackjack'); 

            let idBaraja = Math.floor(parseInt(args[indice+1]));

            if (idBaraja) {

                try {
                        const baraja = await crearBaraja(idBaraja);

                    if (Array.isArray(baraja) && !(baraja === 'existe')) {
                        const resultado1 = await pedirCarta(idBaraja, message.author, 1);
                        const resultado2 = await pedirCarta(idBaraja, message.author, 1);
                        await message.reply(`_Blackjack iniciado correctamente._\n\n _Tu carta es:_${resultado2}`);
                    
                        await client.sendMessage(message.author, `_Tu carta boca abajo es:_ ${resultado1}`);

                    } else if (baraja === 'existe') {
                        await message.reply('_El juego ya existe._');
                    }
                } catch (error) {
                    console.error('Error al crear la baraja:', error.message);
                    await message.reply('_Hubo un error al crear el juego._');
                }
            } else {
                await message.reply('_Por favor, proporciona un identificador para el juego._');
            } 
        } //check

        if (content.includes('#borrar')) {
            const args = content.split(' ');
            const indice = args.indexOf('#borrar');
            const id = parseInt(args[indice+1]);
            
            if (!id) {
                await message.reply('_Por favor, proporciona el ID del juego a borrar._');
                return;
            }
            
            if (!await esCrupier(message.author,admin)) {
                await message.reply('_No tienes permiso para ejecutar este comando._');
                return;
            } 
        
            try {
               
                borrarBaraja(id);
                
                await message.reply(`_El juego ha sido eliminados._`);
            } catch (error) {
                await message.reply(`_Error al borrar: ${error.message}_`);
            }
        } //check


        if (content.includes('#adm-borrarall')) {
            
            if (!admin) {
                await message.reply('_No tienes permiso para ejecutar este comando._');
                return;
            }
        
            try {
                
                const borrador = borrarArchivo();

                if(borrador !== 'No existe.') {message.reply('_Archivo borrado exitosamente._'); }
                else {message.reply('_Archivo no existente._')}
                
            } catch (error) {
                await message.reply(`_Error al borrar las barajas: ${error.message}_`);
            }
        }
        
        if(content.includes('#sblackjack')){
            if (content.includes('#blackjack')) {
            
                if (!await esCrupier(message.author, admin)) {
                    await message.reply('_No tienes permiso para ejecutar este comando._');
                    return;
                }
                const args = content.split(' ');
                const indice = args.indexOf('#blackjack'); 
    
                let idBaraja = Math.floor(parseInt(args[indice+1]));
    
                if (idBaraja) {
                    
                    try {
                            const baraja = await barajaSimplificada(idBaraja, 'Diamantes');
    
                        if (Array.isArray(baraja) && !(baraja === 'existe')) {

                        const resultado1 = await pedirCarta(idBaraja, message.author, 1);
                        const resultado2 = await pedirCarta(idBaraja, message.author, 1);
                        await message.reply(`_Blackjack simplificado iniciado correctamente._\n\n _Tu carta boca arriba es:_${resultado2}`);
                        
                        await client.sendMessage(message.author, `_Tu carta boca abajo es:_ ${resultado1}`);
    
                        } else if (baraja === 'existe') {
                            await message.reply('_El juego ya existe._');
                        }
                    } catch (error) {
                        console.error('Error al crear la baraja:', error.message);
                        await message.reply('_Hubo un error al crear el juego._');
                    }
                } else {
                    await message.reply('_Por favor, proporciona un identificador para el juego._');
                } 
            } 
        }

        if (content.includes('#pedircarta')) {
            const args = content.split(' ');
            const indice = args.indexOf('#pedircarta');
            const idBaraja = Math.floor(parseInt(args[indice+1]));
            const cantidadCartas = Math.floor(parseInt(args[indice+2])) || 1;
            const jugador = message.author;

            if (!idBaraja) {
                await message.reply('_Por favor, proporciona el ID de la baraja._');
                return;
            }

            if (isNaN(cantidadCartas) || cantidadCartas <= 0 || cantidadCartas > 8) {
                await message.reply('_Por favor, proporciona un número válido de cartas._');
                return;
            }
            try {

                const resultado = await pedirCarta(idBaraja, jugador, cantidadCartas);
                
                if(resultado === 'Baraja inexistente')
                { await message.reply('_El juego no existe._'); return };   
                
                { await message.reply(`_Cartas:_ \n\n${resultado}`); }
                
            } catch (error) {
                await message.reply('_Hubo un error al pedir la carta._');
            }
        } 

        if(content.includes('#cartasecreta')){
            const args = content.split(' ');
            const indice = args.indexOf('#cartasecreta');
            const id = Math.floor(parseInt(args[indice+1]));
            const cantidad = Math.floor(parseInt(args[indice+2])) || 1;
            const resultado = pedirCarta(id, numero, cantidad);
            client.sendMessage(`_Tú(s) carta(s) boca abajo es/son:_ ${resultado}`);

        }

        if (content.includes('#mostrarmano') || content.includes('#mostrarcartas') ) {
            const jugador = message.author;
            try {
                const resultado = await obtenerMano(jugador);
                await message.reply(`${resultado}`);
            } catch (error) {
                await message.reply('_Hubo un error al mostrar la mano del jugador._');
            }
        } //check

        if(content.includes('#adm-eliminarmano')){
            const registro = cargarRegistros();

            const persona = registro.find(r => r.nombre === nombre);
            
            const numero2 = persona.numero;  
            const resultado = await borrarCartasDeJugador(numero2);
            
            await message.reply(resultado);

        }

        if(content.includes('#eliminarmano') || content.includes('#eliminarcartas')){

            try {
                const resultado = await borrarCartasDeJugador(numero);
                await message.reply(resultado);


            } catch (error) {
                await message.reply('_Hubo un error al borrar la mano del jugador._');
            }
        }

        if (content.includes('#cartascomun')){
            
            const args = content.split(' ');
            const indice = args.indexOf('#cartascomun');
            const idBaraja = args[indice+1];

            if (args.length < 2) {
                return message.reply('_Por favor, proporciona el ID de la baraja._');
            }

            if (!await esCrupier(message.author,admin)) {
                await message.reply('_No tienes permiso para ejecutar este comando._');
                return;
            }
            
            try {
                const cartas = await mostrarCartasComunitarias(idBaraja);

                const cartasFormateadas = cartas.map(carta => `_${carta.valor} de ${carta.palo}_`).join('\n');
                

                message.reply(`_Cartas comunitarias:_\n\n${cartasFormateadas}`);
            } catch (error) {
                console.error('Error al procesar el comando de cartas comunitarias:', error.message);
                message.reply('_Hubo un error al obtener las cartas comunitarias. Intenta nuevamente._');
            }
        } //check

        if(content.includes('cartaspoker')){
            try{
                const args = content.split(' ');
                const indice = args.indexOf('#cartaspoker');
                const id = Math.floor(parseInt(args[indice+1]));

                if (args.length < 2) {
                    return message.reply('_Por favor, proporciona el ID de la baraja._');
                }
                
                const resultado = await pedirCarta(id, message.author, 2);
                await client.sendMessage(message.author, `_Tus cartas son:_\n\n${resultado}`);

            } catch (error) {
                console.error('Error al procesar el comando:', error.message);
                message.reply('_Hubo un error._');
            }

        } //check    


    if (content.includes('cobrar') || content.includes('quitar')) {
        if (!await esCrupier(message.author,admin)) {
            await message.reply('_No tienes permiso para ejecutar este comando._');
            return;
        }
        let jugador;
        let cantidad;
        const args = content.split(' ');
        const indice = args.indexOf('cobrar') || args.indexOf('quitar');

        if(indice !== -1 && args.length >= indice + 2){

        jugador = args[indice+1];
        cantidad = parseFloat(args[indice+2]);
     }

        if (!jugador || isNaN(cantidad)) {
            await message.reply('_Uso incorrecto. Ejemplo: #cobrar NombreJugador 100_');
            return;
        }
        try {
            const registros = cargarRegistros();
            const registro = registros.find(r => r.nombre === jugador);

            if (!registro) {
                throw new Error(` _"${jugador}" no está registrado._`);
            }

            if ((registro.dinero + 5000) < cantidad) {
               throw new Error(` _*"${jugador}"* no tiene suficiente dinero._`);
            }

            registro.dinero -= cantidad;
            guardarRegistros(registros);
            await message.reply(`_Se han cobrado *$${cantidad}* de *${jugador}*._\n\n_Dinero restante: *$${registro.dinero}*_`);
            if(registro.dinero < 0)
                { message.reply(`_Estas en deuda con el casino. Si tú deuda es mayor a 5000 *Estas fuera*_`)};
        } catch (error) {
            await message.reply(`_Error: ${error.message}_`);
        } 
    } //check

    // Comando #pagar
    if (content.includes('pagar') ||content.includes('sumar')) {

        if (!await esCrupier(message.author,admin)) {
            await message.reply('_No tienes permiso para ejecutar este comando._');
            return;
        }
        let jugador;
        let cantidad;
        const args = content.split(' ');
        const indice = args.indexOf('pagar') || args.indexOf('sumar');

        if(indice !== -1 && content.length >= indice + 2){
        jugador = args[indice+1];
        cantidad = parseFloat(args[indice+2]);
        }

        if (!jugador || isNaN(cantidad)) {
            await message.reply('_Uso incorrecto. Ejemplo: #pagar NombreJugador 100_');
            return;
        }

        try {
            const registros = cargarRegistros();
            const registro = registros.find(r => r.nombre === jugador);

            if (!registro) {
                throw new Error(` _El jugador *"${jugador}"* no está registrado._`);
            }

            registro.dinero += cantidad;
            guardarRegistros(registros);
            await message.reply(`_Se han pagado *$${cantidad}* a *${jugador}*._\n\n_Dinero actual: *$${registro.dinero}*_`);
        } catch (error) {
            await message.reply(`_Error: ${error.message}_`);
        }
    }

    // Comando #vermidinero
    if (content.includes('vermidinero')) {
        try {
            const registros = cargarRegistros();
            const registro = registros.find(r => r.numero === numero);

            if (!registro) {
                throw new Error('_No estás registrado en el sistema._');
            }

            await message.reply(`_Dinero actual: *$${registro.dinero}*_`);
        } catch (error) {
            await message.reply(`_Error: ${error.message}_`);
        }
    } //check

    if (content.includes('ruleta')) {
            if (!await esCrupier(message.author,admin)) {
                await message.reply('_No tienes permiso para ejecutar este comando._');
                return;
            }
            const resultado = ruleta();
            
            if(resultado.color === 'rojo')
            { await message.reply(`_*${resultado.numero}*_ , 🟥 `); }
            else {await message.reply(`_*${resultado.numero}*_ , ⬛ `);}
        

            
        } //check

        if(content.includes('moneda')) {
            const resultado = moneda(); 
            await message.reply(resultado);
        } //check

        if(content.includes('cartarandom')) {
            await message.reply(cartaAleatoria());
        } //check
        

        if(content.includes('tragamonedas')) {
            try {

                if(content.includes('tragamonedas5')){ 
                    
                    const resultado = jalarpalanca2(simbolos2); 
                        
                    await message.reply(`${resultado.resultado.join(' | ')}`)
                        return;
                    }

                const resultado = jalarpalanca(simbolos);
                await message.reply(`${resultado.resultado.join(' | ')}`);
            } catch (error) {
                await message.reply('_Hubo un error al iniciar la tragamonedas._');
            }
        }
    } catch (error) {
        console.error('Error al manejar el comando:', error.message);
        await message.reply('_Hubo un error al procesar tu comando._');
    }
} //check

module.exports = { casinoCommands };