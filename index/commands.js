const { tirarDados, tirarDados2 } = require('./games/tirardados');
const { calcular, moneda, cartaAleatoria } = require('./tools.js');
const { crearBaraja, borrarBaraja, pedirCarta, obtenerMano, borrarArchivo, borrarCartasDeJugador, barajaSimplificada } = require('./games/blackjack');
const { ruleta } = require('./games/ruleta.js');
const { jalarpalanca, jalarpalanca2, simbolos, simbolos2 } = require('./games/tragamonedas.js');
const fs = require('node:fs');
const path = require('node:path');
const { registrarPersona, agregarCrupier, cargarRegistros, guardarRegistros, eliminarCrupier, eliminarRegistro, esCrupier } = require('./registro.js');
const { mostrarCartasComunitarias } = require('./games/poker.js')
const { exec } = require('child_process');
const { ruletaRusa, girarBarril } = require('./games/ruletaRusa.js');

async function handleCommands(message, client, admin, participantes) {
    try {
        const content = message.body.trim().toLowerCase(); // Contenido del mensaje
        const numero = message.author;

        if(content.includes('#restart') || content.includes('#reset')) {

            if(!admin){ await message.reply('No tienes permisos y no deberias usar este comando.'); return;}
            if(admin){ await message.reply('_Reiniciando..._');}
            
            exec('pm2 restart mi-bot', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error al reiniciar el bot: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.log("Bot reiniciado con éxito");
        });
    }

    if (content.includes('@everyone') || content.includes('#all')) {
        try {
    
            // Obtén los participantes del grupo
            const participants = participantes;
    
            const mentions = participants.map(participant => participant.id._serialized);
    
            // Define el mensaje para mencionar
            const mentionMessage = '@.';

            await message.reply(mentionMessage, undefined, {
                mentions: mentions,
            });
    
            console.log('Etiquetado exitoso.');
        } catch (error) {
            console.error('Error al etiquetar a todos:', error);
            message.reply('_Algo salió mal al etiquetar a todos._');
        }
    }

        if(content.includes('#ficha')){
            try {
                const filePath = path.join(__dirname, 'texto3.txt');
                const texto = fs.readFileSync(filePath, 'utf8');
                await message.reply(texto);
            } catch (error) {
                console.error('Error al leer el archivo de texto:', error.message);
                await message.reply('_Hubo un error al cargar los comandos._');
            }
        }
    

        if(content.includes('#init')){
            message.reply("Lectura de comandos correcta.");
            console.log("info:", message);
        } //check

        if(content.includes('#callatehades')){

            message.reply('Si, callate hades.');
        }

        if (content.includes('#listacomandos')) {
            try {
                const filePath = path.join(__dirname, 'texto.txt');
                const texto = fs.readFileSync(filePath, 'utf8');
                await message.reply(texto);
            } catch (error) {
                console.error('Error al leer el archivo de texto:', error.message);
                await message.reply('_Hubo un error al cargar los comandos._');
            }
        } //check

        if (content.includes('#registrar')) {
            try {
                const args = content.split(' ');
                const indice = args.indexOf('#registrar');
                if (args.length < 3) {
                    await message.reply('_Uso incorrecto. El formato es: #registrar nombre dinero_');
                    return;
                }

                const nombre = args[indice+1] 
                const dinero = parseFloat(args[indice+2]);

                if (isNaN(dinero) || dinero < 1000 || dinero > 15000) {
                    await message.reply('_Por favor, proporciona una cantidad válida de dinero. (1000 a 15000)_');
                    return;
                } 

                registrarPersona(numero, nombre, dinero);

                await message.reply(`_*Registro exitoso.* Nombre: ${nombre}, Dinero: ${dinero}._`);
            } catch (error) {
                await message.reply(`_Error al registrar: ${error.message}_`);
            }
        } //check

        if(content.includes('#deletepersona')){
        const args = content.split(' ');
        const indice = args.indexOf('#deletepersona');
        const nombrepersona = args[indice+1];
        const registros = cargarRegistros();
        const nombre = registros.find(r => r.nombre === jugador);
    
            if(!nombrepersona || !nombre)
                { message.reply('Por favor, proporcione el nombre correcto de la persona.');}

            if (!admin) {
                    await message.reply('_No tienes permiso para agregar crupieres._');
                    return;
            }
            
            const resultado = await eliminarRegistro(nombrepersona);
            await message.reply(`${resultado}`);
            }

            
        if (content.includes('#addcrupier')) {
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

        if(content.includes('#deletecrupier')){
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

        if(content.includes('#RuletaRusa')){



        }
        
        if (content.includes('#tirardados')) {
            if (!await esCrupier(message.author, admin)) {
                await message.reply('_No tienes permiso para ejecutar este comando._');
                return;
            }  

            const simbolos = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"]; // Los símbolos del 1 al 6
            const {dado1, dado2 } = tirarDados();
            if(content === '#tirardados6') 
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

        if (content.includes('#calcular')) {
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

        if (content.includes('#21') || content.includes('#blackjack')) {

            if (!await esCrupier(message.author, admin)) {
                await message.reply('_No tienes permiso para ejecutar este comando._');
                return;
            }

            let idBaraja = Math.floor(parseInt(content.split(' ')[1]));

            if (idBaraja) {

                if (!await esCrupier(message.author, admin)) {
                    await message.reply('_No tienes permiso para ejecutar este comando._');
                    return;
                }
                try {
                        const baraja = await crearBaraja(idBaraja);

                    if (Array.isArray(baraja) && !(baraja === 'existe')) {
                        await message.reply(`_Blackjack iniciado correctamente._\n\n _Tu carta es:_ ${resultado2}`);
                        const resultado1 = await pedirCarta(idBaraja, message.author, 1);
                        const resultado2 = await pedirCarta(idBaraja, message.author, 1);

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
            const id = parseInt(args[1]);
            
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
        } //check

        if (content.includes('#pedircarta')) {
            const args = content.split(' ');
            const idBaraja = Math.floor(parseInt(args[1]));
            const cantidadCartas = Math.floor(parseInt(args[2])) || 1;
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

                if(content === '#pedircartaSS'){

                    const resultado2 = await pedirCarta(idBaraja, jugador, cantidadCartas);
                    if(resultado2 === 'Baraja inexistente')
                        { await message.reply('_El juego no existe._'); return };   

                    await client.sendMessage(jugador, `_Cartas:_ \n\n${resultado2}`); 
                    return;
                }

                const resultado = await pedirCarta(idBaraja, jugador, cantidadCartas);
                
                if(resultado === 'Baraja inexistente')
                { await message.reply('_El juego no existe._'); return };   
                
            
                { await message.reply(`_Cartas:_ \n\n${resultado}`); }
                
            } catch (error) {
                await message.reply('_Hubo un error al pedir la carta._');
            }
        } //check

        if (content.includes('#mostrarmano') || content.includes('#mostrarcartas') ) {
            const jugador = message.author;
            try {
                const resultado = await obtenerMano(jugador);
                await message.reply(`${resultado}`);
            } catch (error) {
                await message.reply('_Hubo un error al mostrar la mano del jugador._');
            }
        } //check

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
            const idBaraja = args[1];

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

        if(content.includes('#cartaspoker')){
            try{
                const args = content.split(' ');
                const indice = args.indexOf('#cartaspoker');
                const id = Math.floor(parseInt(args[1]));

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


    if (content.includes('#cobrar') || content.includes('#quitar')) {
        if (!await esCrupier(message.author,admin)) {
            await message.reply('_No tienes permiso para ejecutar este comando._');
            return;
        }
        let jugador;
        let cantidad;
        const args = content.split(' ');
        const indice = args.indexOf('#cobrar') || args.indexOf('#quitar');

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
    if (content.includes('#pagar') ||content.includes('#sumar')) {

        if (!await esCrupier(message.author,admin)) {
            await message.reply('_No tienes permiso para ejecutar este comando._');
            return;
        }
        let jugador;
        let cantidad;
        const args = content.split(' ');
        const indice = args.indexOf('#pagar') || args.indexOf('#sumar');

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
    if (content.includes('#vermidinero')) {
        try {
            const registros = cargarRegistros();
            const numero = message.author;
            const registro = registros.find(r => r.numero === numero);

            if (!registro) {
                throw new Error('_No estás registrado en el sistema._');
            }

            await message.reply(`_Dinero actual: *$${registro.dinero}*_`);
        } catch (error) {
            await message.reply(`_Error: ${error.message}_`);
        }
    } //check

    if (content.includes('#ruleta')) {
            if (!await esCrupier(message.author,admin)) {
                await message.reply('_No tienes permiso para ejecutar este comando._');
                return;
            }
            const resultado = ruleta();
            
            if(resultado.color === 'rojo')
            { await message.reply(`_*${resultado.numero}*_ , 🟥 `); }
            else {await message.reply(`_*${resultado.numero}*_ , ⬛ `);}
        

            
        } //check

        if(content.includes('#moneda')) {
            const resultado = moneda(); 
            await message.reply(resultado);
        } //check

        if(content.includes('#cartarandom')) {
            await message.reply(cartaAleatoria());
        } //check

        if(content.includes('#infobot')) {
            try {
                const filePath = path.join(__dirname, 'texto2.txt');
                const texto = fs.readFileSync(filePath, 'utf8');
                await message.reply(texto);
            } catch (error) {
                console.error('Error al leer el archivo de texto:', error.message);
                await message.reply('_Hubo un error al cargar los comandos._');
            }
        } //check
        

        if(content.includes('#tragamonedas')) {
            
            try {

                if(content.includes('#tragamonedas5')){ 
                    
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

module.exports = { handleCommands };
