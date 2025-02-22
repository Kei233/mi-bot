const { casinoCommands } = require('./index/casinoCommands.js');
const fs = require('node:fs');
const path = require('node:path');
const { exec } = require('child_process');
const { registrarPersona, cargarRegistros, guardarRegistros, eliminarRegistro} = require('./registro.js');
const { buscarObjetivo, realizarAtaque, guardarObjetivo, procesarTurno, actualizarModificadoresTemporales, mensajeDropeo, generarArmaAleatoria, calcularDistancia, cambiarFaseArma, mostrarEstadisticasArma } = require('./RPG/combate.cjs');
const { crearCriatura, mostrarEstadisticasCriatura, cargarCriaturas, guardarCriaturas } = require('./RPG/criaturas.js');
const {aprenderHechizo, cargarHechizos, lanzarHechizo } = require('./RPG/hechizos.js');
// const { comprarObjeto, rerollTienda, reiniciarTienda, leerTienda, mostrarTienda, calcularPrecio} = require('./RPG/tienda&Venta.js');
const { handleAutoCombat } = require('./autoCombatRole.js');
const { spawnC, generarMision } = require('./spawn.js');
const { Mundo } = require('./Mundo.js');
const { leerHabilidades, usarHabilidad, actualizarHabilidadesActivas } = require('./RPG/habilidades.js');


async function handleCommands(message, client, admin, participantes, chat) {
    try{
        const content = message.body.trim().toLowerCase();
        const registrosG = cargarRegistros();
    // const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        const numero = message.author;
        let personajeNum = registrosG.find(r => r.numero === numero);
        const esAdmin = isAdmin(numero, admin, participantes);
        let pergamino;

    if(content.includes('#c-')){

        await casinoCommands(message, client, admin, participantes, chat);
    }
    
    if(content.includes('#init')){
        try{
        await message.reply("_Lectura de comandos correcta. Bot funcionando correctamente._");
        console.log("info:", message);
        console.log(message.notifyName);
        console.log("Info chat:", chat);
        console.log("info participantes: ", participantes);
        }catch(error){
            exec('pm2 restart mi-bot', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error al reiniciar el bot: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    return;
                }
        })
    }
}

    if(content.includes('#service') || content.includes('#servicio')){

        const usuario = registrosG.find(reg => reg.numero === numero);
        
        usuario.spawn ? usuario.spawn = false : usuario.spawn = true;
        const resultado = `_*El jugador ${usuario.nombre} ha` + `${usuario.spawn ? ' entrado en servicio*_' : ' salido del servicio.*_'}`;

        guardarRegistros(registrosG);
        await message.reply(resultado);
    }

    if(content.includes('#ficha')){
        try{
            if(chat === '120363214542344945@g.us' || chat === '120363380801529962@g.us' || chat === '120363364249888983@g.us'){
                const texto = await leerArchivos('index/ficha2.txt');
                message.reply(texto);
                return;
        }
            if(chat === '120363130633429484@g.us' || chat === '120363284130959525@g.us' || chat === '120363284119423138@g.us' 
                || chat ===  '120363131263183257@g.us'){
                const texto = await leerArchivos('index/ficha.txt');
                message.reply(texto);
                return;
            }
             const texto = await leerArchivos('index/texto3.txt');
            message.reply(texto);
        } catch (error) {
            console.error('Error al leer el archivo de texto:', error.message);
            await message.reply('_Hubo un error al cargar los comandos._');
        }
    }

    if (content.includes('@everyone') || content.includes('#all')) {
        try {
    
            // Obtén los participantes del grupo
            const participants = participantes;
    
            const mentions = participants.map(participant => participant.id._serialized);
    
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
    
    if(content.includes('#restart') || content.includes('#reset')) {

        if(!esAdmin){ await message.reply('No tienes permisos y no deberias usar este comando.'); return;}
        if(esAdmin){ await message.reply('_Reiniciando..._');}
        
        exec('pm2 restart mi-bot', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error al reiniciar el bot: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
    });
}

if (content.includes('#registrar')) {
    try {
        const lineas = content.split('\n');
        const primeraLinea = lineas[0].split(' ');

        const indice = primeraLinea.indexOf('#registrar');
        const nombre = primeraLinea[indice + 1];

        const arma = primeraLinea[indice + 2]?.toLowerCase();
        console.log("El arma antes de pasarse: ", arma);

        // Validar el armaf
        const armasPermitidas = ["hacha", "lanza", "arco", "espada", "bastón", "bola"];
        if (!arma || !armasPermitidas.includes(arma)) {
            await message.reply('_Por favor, proporciona un arma válida (hacha, lanza, arco, espada, bastón, bola)._');
            return;
        }

        const fuerzaLinea = lineas.find(linea => linea.toLowerCase().startsWith('fuerza:'));
        const agilidadLinea = lineas.find(linea => linea.toLowerCase().startsWith('agilidad:'));
        const manaLinea = lineas.find(linea => linea.toLowerCase().startsWith('maná:') || linea.toLowerCase().startsWith('mana:'));
        const magiaLinea = lineas.find(linea => linea.toLowerCase().startsWith('magia:'));
        // const talentoLinea = lineas.find(linea => linea.toLowerCase().startsWith('talento:'));

        // Extraer valores numéricos
        const fuerza = fuerzaLinea ? parseFloat(fuerzaLinea.split(':')[1].trim()) : NaN;
        const agilidad = agilidadLinea ? parseFloat(agilidadLinea.split(':')[1].trim()) : NaN;
        const mana = manaLinea ? parseFloat(manaLinea.split(':')[1].trim()) : NaN;
        const magia = magiaLinea ? parseFloat(magiaLinea.split(':')[1].trim()) : NaN;
        // const talento = talentoLinea ? (talentoLinea.split(':')[1].trim()) : null;

        if (!nombre) {
            await message.reply('_Por favor, proporciona un nombre para el registro._');
            return;
        }

        if (isNaN(fuerza) || isNaN(agilidad) || isNaN(mana) || isNaN(magia)) {
            await message.reply('_Por favor, proporciona valores válidos para fuerza, agilidad, maná y magia. Ejemplo:_\n\n(comando) Dani\n\nFuerza:\nAgilidad:\nManá:\nMagia:\n');
            return;
        }

        // if(!talento){
        //     await message.reply("_Por favor, proporcione un talento valido._\n\n_*Lista de talentos:*_\n\n_ExpSuperior, afortunado_");
        //     return;
        // }

        if(fuerza + agilidad + mana + magia > 1500){
            await message.reply('_Estadisticas demasiado altas. Tu total deben ser 1500 puntos._');
            return;
        }

        const personaje = await registrarPersona(numero, nombre, 1000, fuerza, agilidad, 2000, mana, magia, arma);

        
        if(personaje === `_El usuario ya está registrado._`){

            await message.reply(personaje);
            return;
        }

            if((magia + mana) >= 1000){

            let { mensajeH, hechizo } = aprenderHechizo(personaje);

            await message.reply(`_El/La jugador/a ${personaje.nombre} ha aprendido el hechizo: ${hechizo.nombre}_\n\n_${hechizo.descripcion}_`);

                if((hechizo && hechizo?.rango) && (hechizo.rango === 'S' || hechizo.rango === 'SS')){
                    
                    mensajeH += `_*¡Él/La jugador/a ${personaje.nombre} ha aprendido un hechizo de increible poder!!*_`

                }
            }

    registrosG.push(personaje);
    guardarRegistros(registrosG);

        const mensaje = mostrarEstadisticasPersonaje(personaje);

        await message.reply(`_*Registro exitoso de ${nombre} con las estadísticas proporcionadas.*_\n\n${mensaje}`);

    } catch (error) {
        console.log(`Error al registrar: ${error.stack} --> ${error}`);
    }
}

if (personajeNum) {
    try {
        let spawneo = await spawnC(personajeNum, chat, Mundo);
        console.log(`Intentando spawnear para el jugador: ${personajeNum.nombre || "Desconocido"}`);
        console.log(spawneo);
        if (spawneo) {
            const texto1 = `_*Criatura de rango ${spawneo.rango} ha spawneado cerca del jugador ${personajeNum.nombre}. La criatura es: ${spawneo.nombre}*_`;
            await message.reply(texto1);
        }else{
            if(content.includes('#rastrear')){
                spawneo = await spawnC(personajeNum, chat, Mundo);
                const texto2 = `_*Criatura de rango ${spawneo.rango} ha spawneado cerca del jugador ${personajeNum.nombre}. La criatura es: ${spawneo.nombre}*_`;
            await message.reply(texto2);
            }
        }
        guardarRegistros(registrosG);
    } catch (error) {
        console.error("Error al intentar spawnear una criatura:", error);
        console.log("Ocurrió un error al intentar generar una criatura. Por favor, inténtalo más tarde.");
    }
}

if(content.includes('#distribuir')){
    try{
    const registros = cargarRegistros();
    const usuario = registros.find(reg => reg.numero === numero);

    if (!usuario) {
        await message.reply('_No estás registrado. Por favor registrate para unirte al juego._');
        return;
    }
    
    const lineas = content.split('\n');
        // Buscar estadísticas en las líneas
        const fuerzaLinea = lineas.find(linea => linea.toLowerCase().startsWith('fuerza:'));
        const agilidadLinea = lineas.find(linea => linea.toLowerCase().startsWith('agilidad:'));
        const manaLinea = lineas.find(linea => linea.toLowerCase().startsWith('maná:'));
        const magiaLinea = lineas.find(linea => linea.toLowerCase().startsWith('magia:'));

        // Extraer valores numéricos
        const fuerza = fuerzaLinea ? parseFloat(fuerzaLinea.split(':')[1].trim()) : NaN;
        const agilidad = agilidadLinea ? parseFloat(agilidadLinea.split(':')[1].trim()) : NaN;
        const mana = manaLinea ? parseFloat(manaLinea.split(':')[1].trim()) : NaN;
        const magia = magiaLinea ? parseFloat(magiaLinea.split(':')[1].trim()) : NaN;

        if (isNaN(fuerza) || isNaN(agilidad) || isNaN(mana) || isNaN(magia)) {
            await message.reply('_Por favor, proporciona valores válidos para fuerza, agilidad, vida y maná._');
            return;
        }

        if(fuerza + agilidad + mana + magia > usuario.puntosPorDistribuir){
            message.reply(`_Puntos demasiado altos. Tienes: ${usuario.puntosPorDistribuir}_`);
            return;
        }

        const stats = usuario.estadisticas;

        stats.fuerza += fuerza;
        stats.agilidad += agilidad;
        stats.mana += mana;
        stats.manaMax += mana;
        stats.magia += magia;
        stats.velAt = 2 + Math.floor(stats.agilidad / 200);
        stats.crit = 5 + Math.floor((stats.fuerza / 75));

        if(stats.crit > 60){
            stats.crit = 60;
        }

        usuario.puntosPorDistribuir -= (fuerza + agilidad + mana + magia);

        await procesarTurno(usuario);
        guardarRegistros(registros);

        const mensaje = mostrarEstadisticasPersonaje(usuario);

       await message.reply(`_¡Estadisticas actualizadas! Te quedan *${usuario.puntosPorDistribuir}* puntos por distribuir!_\n\n ${mensaje.trim()}`);

    }catch(error){
        message.reply('_Hubo un error._');
        console.error('Hubo un error:', error.message);
    }
}

if (content.includes('#usaritem')) {
    try {
        // Dividir el mensaje en palabras
        const palabras = content.split(/\s+/); // Separar por espacios o saltos de línea
        const indice = palabras.indexOf('#usaritem');

        if (indice === -1 || indice === palabras.length - 1) {
            await message.reply('_Debes especificar el nombre del objeto después del comando._');
            return;
        }

        // Tomar el texto completo después de #usaritem
        let nombreItem = palabras.slice(indice + 1).join(' ');

        // Manejar casos con paréntesis
        if (nombreItem.includes('(') && nombreItem.includes(')')) {
            const inicio = nombreItem.indexOf('(') + 1 || indice + 1; // Índice después de "("
            const fin = nombreItem.indexOf(')'); // Índice de ")"
            nombreItem = nombreItem.slice(inicio, fin).trim(); // Extraer el contenido entre paréntesis
        } else {
            // Si no hay paréntesis, tomar el texto completo después de #usaritem
            nombreItem = nombreItem.split('\n')[0].trim(); // Cortar hasta el primer salto de línea
        }

        const registros = cargarRegistros();
        const usuario = registros.find(registro => registro.numero === numero);

        if (!usuario) {
            await message.reply('_No se encontró al usuario registrado._');
            return;
        }
        const item = usuario.inventario.find(item => item.nombre.toLowerCase() === nombreItem.toLowerCase());

        if (!item) {
            await message.reply('_No tienes un objeto con ese nombre en tu inventario._');
            return;
        }

        // Lógica para usar el objeto según su tipo
        switch (item.tipo) {
            case 'poción':
                for (const stat in item.efecto) {
                    if (usuario.estadisticas[stat] !== undefined) {
                        usuario.estadisticas[stat] += item.efecto[stat];
                    }
                }
                item.cantidad -= 1; // Reducir cantidad
                if (item.cantidad === 0) {
                    usuario.inventario = usuario.inventario.filter(i => i !== item); // Eliminar si no quedan
                }

                await procesarTurno(usuario);
                guardarRegistros(registros);
                await message.reply(`_Usaste la poción: ${item.nombre}. Efectos aplicados._`);
                break;

            case 'arma':
                await message.reply('_Debes usar el comando correspondiente para equipar un arma._');
                break;
            case 'pergamino':
                pergamino = item;
                break;
            case 'grimorio':
                const mensaje = aprenderHechizo(usuario);
                await message.reply(mensaje);
                guardarRegistros(registrosG);
                break;
            case 'Especial':
                if (!item.activo) {
                    item.activo = true; // Activar el objeto
                    guardarRegistros(registros);
                    procesarTurno(usuario); // Guardar cambios
                    await message.reply(`_El objeto ${item.nombre} ha sido activado. Sus efectos están ahora en uso._`);
                } else {
                    item.activo = false; // Desactivar el objeto
                    await procesarTurno(usuario);
                    guardarRegistros(registros); // Guardar cambios
                    await message.reply(`_El objeto ${item.nombre} ha sido desactivado. Sus efectos ya no están en uso._`);
                }
                break;

            default:
                await message.reply('_Este objeto no tiene un uso definido._');
        }
    } catch (error) {
        console.error('Error al usar el item:', error);
        await message.reply(`_Error al usar el item: ${error.message}_`);
    }
}

if(content.includes('#transformar')){

    const registros = cargarRegistros();
    const jugador = registros.find(r => r.numero === numero);

    if(!jugador || !jugador.armaPrincipal || !jugador.armaPrincipal.transformable){
        await message.reply("_No tienes un arma que puedas transformar._");
        return;
    }

    const nombreAnterior = jugador.armaPrincipal.nombre;

    const nuevoNombre = cambiarFaseArma(jugador, jugador.armaPrincipal).nombre;

    if(!nuevoNombre){
        if(typeof nuevoNombre === 'string'){
        await message.reply(nuevoNombre);
        return;
        }
        await message.reply(`_Hubo un error al cambiar de fase._`);
        console.log(nuevoNombre);
    return;
    }

    guardarRegistros(registros);

    await message.reply(`_El arma *${nombreAnterior}* ha cambiado a *${nuevoNombre}*_`);
}

if (content.includes('#acercarse')) {
    // Cargamos las entidades de jugadores y criaturas
    const registros = cargarRegistros();
    const criaturas = cargarCriaturas();
  
    // Obtenemos al jugador actual (el atacante)
    const jugador = registros.find(r => r.numero === numero); // O, alternativamente, podrías obtenerlo de "registros" según convenga
  
    // Separamos cada comando que siga a "#acercarse"
    const comandos = content.split('#acercarse').slice(1);
  
    const desplazamiento = jugador?.velocidad * -1;

    let registroFinal;
  
    // Recorremos cada comando encontrado
    for (const comando of comandos) {

      const partes = comando.trim().split(/\s+/);
      const nombreObjetivo = partes[1];
  
      // Si no se ha indicado un nombre, pasamos al siguiente comando.
      if (!nombreObjetivo) continue;

      let objetivo = criaturas.find(entidad => entidad.nombre === nombreObjetivo);
      if (!objetivo) {
        objetivo = registros.find(entidad => entidad.nombre === nombreObjetivo);
      }
  
      // Si el objetivo no se encuentra en ninguno de los dos, no hacemos nada.
      if (!objetivo) continue;
  
      // Llamamos a la función que actualiza la distancia entre el jugador y el objetivo.
      calcularDistancia(jugador, objetivo, desplazamiento);
  
      // Obtenemos el registro de distancia actualizado (desde el jugador) para el objetivo.
      const registroDistancia = jugador.distancia.find(item => item.nombre === objetivo.nombre);
      if (registroDistancia) {
        await message.reply(`_Te has acercado ${Math.abs(desplazamiento)} unidad(es). La nueva distancia a ${objetivo.nombre} es ${registroDistancia.distancia}._`);
  
        // Si la distancia ya es 0, salimos del ciclo inmediatamente.
        if(registroDistancia){
        registroFinal = registroDistancia;
        }

        if (registroDistancia.distancia === 0) {
          break;
        }
      }
    }

    if(registroFinal !== null){
        await message.reply(`_*La distancia actual entre ${jugador.nombre} y ${objetivo.nombre} es de: ${registroFinal.distancia}*_`);
    }

  }

if (content.includes('#atacar')) {
    try {
        const registros = cargarRegistros();
        let comandos = '';
        comandos = content.split('#atacar').slice(1);
        let resultadoContraataque; 
        let objetivos = {}; // Objeto para almacenar información consolidada de cada objetivo
        let atacanteG = {};
        let objetivo = {};  
        let tipo = '';
        let mensajeFinal = '';
        let mensajeSubditos = '';

        for (const comando of comandos) {
            const mensajeLimpio = comando.replace(/[^\w\sáéíóúüñ#]/gi, '').toLowerCase();
            const palabrasMensaje = mensajeLimpio.split(/\s+/).filter(palabra => palabra !== '_');
            const nombreC = palabrasMensaje[1]; // Objetivo explícito
            const atacante = registros.find(h => h.numero === numero);
            atacanteG = atacante;

            let entidad = buscarObjetivo([nombreC]) || null;


            if (!entidad || !entidad.datos || !entidad.tipo) {
                const quotedMessage = message.hasQuotedMsg ? await message.getQuotedMessage() : null;

                if (!quotedMessage) {
                    await message.reply('_Debes responder a un mensaje del objetivo para atacarlo._');
                    continue;
                }
                if (quotedMessage && quotedMessage.body) {
                    const nombreObjetivo = quotedMessage.body.trim();
                    const mensajeLimpioObjetivo = nombreObjetivo.replace(/[^\w\sáéíóúüñ]/gi, '').toLowerCase();
                    const palabrasMensajeObjetivo = mensajeLimpioObjetivo.split(/\s+/).filter(palabra => palabra !== '_');

                    entidad = buscarObjetivo(palabrasMensajeObjetivo); // Objetivo inferido
                    if (!entidad || !entidad.datos) {
                        await message.reply('_No se encontró el objetivo especificado._');
                        continue;
                    }
                } else {
                    message.reply('_El mensaje no contiene un cuerpo válido._');
                    continue;
                }
            }

            tipo = entidad.tipo;
            objetivo = entidad.datos;

            if(objetivo.nombre === atacante.nombre){
               console.log("Error. El objetivo es el propio jugador.");
               break; 
            }
            // Verificar si el atacante está registrado
            if (!atacante) {
                await message.reply('_No estás registrado. Por favor regístrate para unirte al juego._');
                break;
            }

            // Calcular probabilidad de éxito del ataque
            let probabilidad = calcularProbabilidadExito(atacante, objetivo, 0);

            let ataqueExitoso = Math.random() * 100 < probabilidad;

            // Crear o actualizar el objeto consolidado del objetivo
            if (!objetivos[objetivo.nombre]) {
                objetivos[objetivo.nombre] = {
                    nombre: objetivo.nombre,
                    fallos: 0,
                    ataquesExitosos: 0,
                    dañoTotal: 0,
                    intentos: 0,
                    vidaRestante: objetivo.estadisticas.vida,
                    derrotado: false,
                    jugador: atacante,
                    criatura: objetivo,
                    huida: false,
                };
            }

            if(objetivos[objetivo.nombre].intentos > atacante.estadisticas.velAt){
                await message.reply(`_*¡Demasiados ataques! ${atacante.nombre} no puede atacar tan rapido*_`);
                break;
            }

            if (!ataqueExitoso) {
                objetivos[objetivo.nombre].fallos += 1;
                objetivos[objetivo.nombre].intentos += 1;
            }else{

            const resultado = realizarAtaque(atacante, objetivo);

            objetivos[objetivo.nombre].ataquesExitosos += 1;
            objetivos[objetivo.nombre].dañoTotal += resultado.dañoTotal;
            objetivos[objetivo.nombre].vidaRestante = resultado.vidaRestante;
            objetivos[objetivo.nombre].derrotado = resultado.derrotado;
            objetivos[objetivo.nombre].intentos += 1;  
            objetivos[objetivo.nombre].huida = resultado.huida;
            }

            if (objetivo.estadisticas.autoCombat && objetivo.estadisticas.vida > 0) {
                    if (!objetivos[objetivo.nombre].contraataques) {
                    objetivos[objetivo.nombre].contraataques = {
                        fallos: 0,
                        ataquesExitosos: 0,
                        dañoTotal: 0,
                        intentos: 0,
                        vidaRestanteAtacante: atacante.estadisticas.vida,
                        derrotadoAtacante: false,
                    };
                }
                probabilidad = calcularProbabilidadExito(objetivo, atacante, 0);
                
                ataqueExitoso = Math.random() * 100 < probabilidad;

                if (ataqueExitoso) {
                    resultadoContraataque = realizarAtaque(objetivo, atacante);
                    objetivos[objetivo.nombre].contraataques.ataquesExitosos += 1;
                    objetivos[objetivo.nombre].contraataques.dañoTotal += resultadoContraataque.dañoSobrante;
                    objetivos[objetivo.nombre].contraataques.derrotado = resultadoContraataque.derrotado;
                    objetivos[objetivo.nombre].contraataques.intentos += 1;
                    if(objetivo?.subditos){
                       mensajeSubditos = procesarSubditos(atacante, objetivo);
                    }
                } else {
                    objetivos[objetivo.nombre].contraataques.fallos += 1;
                    objetivos[objetivo.nombre].contraataques.intentos += 1;
                    continue;
                }

                objetivos[objetivo.nombre].contraataques.vidaRestanteAtacante = resultadoContraataque.vidaRestante;
                objetivos[objetivo.nombre].contraataques.derrotadoAtacante = resultadoContraataque.derrotado;
                }else{
                    if(objetivo.estadisticas.vida <= 0){
                        break;
                    }
                }

                }

        mensajeFinal = '_Resultados de los ataques:_\n\n';
        for (let nombreObjetivo in objetivos) {
            const obj = objetivos[nombreObjetivo];
            if(obj.fallos === obj.intentos || obj.ataqueExitoso === 0){
                mensajeFinal += `_¡¡Todos tus ataques fallaron!!_\n`
            }else{
            if(!obj.dañoTotal){
                mensajeFinal += `_¡Algo salio mal con este ataque!_`
            }
            mensajeFinal += `🗡️ _Ataques contra ${obj.nombre}:_\n` +
                            `- _Fallos: ${obj.fallos}_\n` +
                            `- _Ataques Exitosos: ${obj.ataquesExitosos}_\n` +
                            `- _Daño Total: ${obj.dañoTotal}_\n` +
                            `- _Vida Restante: ${obj.vidaRestante}_\n` +
                            `${(obj.huida && !obj.derrotado) ? `_*${obj.nombre} intenta escapar!!*_\n` : ``}` +
                            `${obj.derrotado ? `_❌ ${obj.nombre} ha sido derrotado._` : ''}\n\n` +
                            `${(mensajeSubditos ? mensajeSubditos : ``)}`;
            }
                    if (obj.contraataques && !obj.derrotado){
                                mensajeFinal += `🔄 Contraataques realizados por ${obj.nombre}:\n` +
                                                `- Fallos: ${obj.contraataques.fallos}\n` +
                                                `- Ataques Exitosos: ${obj.contraataques.ataquesExitosos}\n` +
                                                `- Daño Total: ${obj.contraataques.dañoTotal}\n` +
                                                `- Vida Restante del atacante: ${obj.contraataques.vidaRestanteAtacante}\n` +
                                                `${obj.contraataques.derrotadoAtacante ? `❌ _El atacante ha sido derrotado._` : ''}\n\n`;
                            }

                            if(mensajeSubditos){ mensajeFinal += mensajeSubditos; }

                    await procesarResultados(obj, atacanteG, tipo, registros);
            }

        if (mensajeFinal.trim() !== '') {
            await message.reply(mensajeFinal.trim());
        }

    }catch (error) {
        console.log(`_Error al procesar ataque(s): ${error.stack}_`);
        await message.reply('_Hubo un error al procesar los ataques._');
}}

if (content.includes('#hechizo') || pergamino){
    try {
        const registros = cargarRegistros();
        const hechizos = cargarHechizos();
        let comandos = content.split('#hechizo').slice(1); // Divide por cada ocurrencia de #hechizo
        let hechizo = {};
        let objetivo = {};
        let mensajeFinal = '';
        let resultado = {};
        let objetivos = {};
        let tipo = '';
        let atacanteGH = {};

        for (const comando of comandos) {
            const mensajeLimpio = comando.replace(/[^\w\sáéíóúüñ#]/gi, '').toLowerCase();
            const palabrasMensaje = mensajeLimpio.split(/\s+/).filter(palabra => palabra !== '_');
            let nombreC = palabrasMensaje[2];
            const atacante = registros.find(r => r.numero === numero); 
            console.log(palabrasMensaje);
            console.log("Nombre para busqueda correcta: ", nombreC);
            let entidad;
            atacanteGH = atacante;

            let idHechizo = parseInt(palabrasMensaje[1], 10); 

            if (isNaN(idHechizo) || !idHechizo) {
                mensajeFinal += '_ID de hechizo inválido._\n';
                continue;
            }

            if(!atacante){
                await message.reply("_No estas registrado, por favor, registrate para entrar en el juego._"); 
                break;
            };

            hechizo = hechizos.find(h => h.id === idHechizo);
            
            const hechizosUsuario = atacante.hechizos;
            console.log("El hechizo en cuestion: ", hechizo);

            if (!hechizosUsuario.includes(idHechizo)) {
                await message.reply(`_¡No conoces el hechizo #${idHechizo}!_\n`)
                continue;
            }

            entidad = buscarObjetivo([nombreC]) || null;

            if (!entidad || !entidad.datos || !entidad.tipo) {
                const quotedMessage = message.hasQuotedMsg ? await message.getQuotedMessage() : null;

                if (!quotedMessage) {
                    await message.reply('_Debes responder a un mensaje del objetivo para atacarlo._');
                    continue;
                }
                if (quotedMessage && quotedMessage.body) {
                    const nombreObjetivo = quotedMessage.body.trim();
                    const mensajeLimpioObjetivo = nombreObjetivo.replace(/[^\w\sáéíóúüñ]/gi, '').toLowerCase();
                    const palabrasMensajeObjetivo = mensajeLimpioObjetivo.split(/\s+/).filter(palabra => palabra !== '_');

                    entidad = buscarObjetivo(palabrasMensajeObjetivo); // Objetivo inferido
                    if (!entidad || !entidad.datos) {
                        await message.reply('_No se encontró el objetivo especificado._');
                        continue;
                    }
                } else {
                    message.reply('_El mensaje no contiene un cuerpo válido._');
                    continue;
                }
            }

            tipo = entidad.tipo;
            objetivo = entidad.datos;

            let probabilidad = calcularProbabilidadExito(atacante, objetivo, hechizo.probabilidad, true); 

            let ataqueExitoso = Math.random() * 100 <= probabilidad;

            if (!objetivos[objetivo.nombre]) {
                objetivos[objetivo.nombre] = {
                    nombre: objetivo.nombre,
                    fallos: 0,
                    hechizosExitosos: 0,
                    dañoTotal: 0,
                    intentos: 0,
                    vidaRestante: objetivo.estadisticas.vida,
                    muerto: false,
                    jugador: atacante,
                    criatura: objetivo,
                    mensaje: '',
                    efectos: []
                };
            }

            if (!ataqueExitoso){
                objetivos[objetivo.nombre].fallos += 1;
                objetivos[objetivo.nombre].intentos += 1;  
                mensajeFinal += `_¡El hechizo fallo por la agilidad del objetivo!_\n`;
                console.log("Fallo + 1");
            }else{
                if (atacante.estadisticas.mana < hechizo.costo) {
                    mensajeFinal += `_¡Tú mana es insuficiente!_\n`;
                    console.log("Falta de maná");
                    continue;
                }
                
                if (atacante.nivel < hechizo.nivelRequerido) {
                    mensajeFinal += `_¡Tu nivel es insuficiente para ejecutar este hechizo!_\n`;
                    console.log("Falta de nivel");
                    continue;
                }

                resultado = lanzarHechizo(hechizo, atacante, objetivo);
                console.log("El resultado del hechizo lanzado: ", resultado);

                objetivos[objetivo.nombre].hechizosExitosos += 1;
                objetivos[objetivo.nombre].dañoTotal += resultado.dañoTotal;
                objetivos[objetivo.nombre].vidaRestante = resultado.vidaRestante;
                objetivos[objetivo.nombre].muerto = resultado.derrotado;
                objetivos[objetivo.nombre].intentos += 1;
                objetivos[objetivo.nombre].efectos = resultado.efectosAplicados;
                objetivos[objetivo.nombre].huida = resultado.huida;
                objetivos[objetivo.nombre].mensaje = resultado.mensaje;
            }

            if (objetivo.estadisticas.autoCombat && objetivo.estadisticas.vida > 0) {
                // Inicializar estructura de contraataques si no existe
                if (!objetivos[objetivo.nombre].contraataques) {
                    objetivos[objetivo.nombre].contraataques = {
                        fallos: 0,
                        ataquesExitosos: 0,
                        dañoTotal: 0,
                        intentos: 0,
                        vidaRestanteAtacante: atacante.estadisticas.vida,
                        derrotadoAtacante: false
                    };
                }
            
                // Calcular probabilidad de éxito del contraataque
                probabilidad = calcularProbabilidadExito(objetivo, atacante, 0);
                const ataqueExitoso = Math.random() * 100 < probabilidad;
            
                if (ataqueExitoso) {

                    let respuesta = realizarAtaque(objetivo, atacante);
                    objetivos[objetivo.nombre].contraataques.dañoTotal += respuesta.dañoTotal;
                    objetivos[objetivo.nombre].contraataques.ataquesExitosos += 1;
                    objetivos[objetivo.nombre].contraataques.derrotadoAtacante = respuesta.derrotado;
                    objetivos[objetivo.nombre].contraataques.intentos += 1;
                } else {
                    objetivos[objetivo.nombre].contraataques.fallos += 1;
                    objetivos[objetivo.nombre].contraataques.intentos += 1;
                }
                
                if (
                    (objetivo.idRango * 10 + (objetivo.idRango + 7) <= Math.random() * 100) &&
                    (objetivo.hechizos.length > 0)
                  ) {
                    const hechizosValidos = objetivo.hechizos.filter((id) => id != null);
                  
                    if (hechizosValidos.length > 0) {
                      // Seleccionar un ID válido al azar
                      const numR = Math.floor(Math.random() * hechizosValidos.length);
                      const idHechizoSeleccionado = hechizosValidos[numR];

                      const hechizoElegido = hechizos.find(hechizo => hechizo.id === idHechizoSeleccionado);
                  
                      // Usar el ID del hechizo para lanzarlo
                      const respuestaH = lanzarHechizo(hechizoElegido, objetivo, atacante);
                        
                      console.log("La criatura ha lanzado uno o más hechizos.");
                  
                      if (!objetivos[objetivo.nombre].hechizos) {
                        objetivos[objetivo.nombre].hechizos = [];
                      }
                  
                      objetivos[objetivo.nombre].hechizos.push({
                        id: idHechizoSeleccionado,
                        dañoTotal: respuestaH.dañoTotal,
                        vidaRestanteAtacante: atacante.estadisticas.vida,
                        derrotadoAtacante: respuestaH.derrotado,
                        efectos: respuestaH.efectosAplicados,
                      });
                    } else {
                      console.warn(`El objetivo ${objetivo.nombre} no tiene hechizos válidos para lanzar.`);
                    }
                  }
            };
        }

        if(!atacanteGH || !objetivo){ 
            console.log("Atacante u objetivo no encontrado en hechizos."); 
            await message.reply(mensajeFinal.trim() || '_Todos tus hechizos fallaron._');
            guardarRegistros(registrosG);
            return; 
        }
            for (let nombreObjetivo in objetivos) {
            const obj = objetivos[nombreObjetivo];
                console.log("Entrando al bucle...");
                console.log(obj);

            if(obj.fallos === obj.intentos || obj.hechizosExitosos === 0){
                mensajeFinal += `_¡¡Todos tus hechizos fallaron!!_\n`;
                console.log("Fallo en todos los hechizos.");
            }else{
            if(!obj.intentos){
                mensajeFinal += `_¡Algo salio mal con este ataque!_\n`
                break;
            }
            mensajeFinal += `🗡️ _Ataques contra ${obj.nombre}:_\n` +
                `- _Fallos: ${obj.fallos}_\n` +
                `- _Ataques Exitosos: ${obj.hechizosExitosos}_\n` +
                `- _Daño Total: ${obj.dañoTotal}_\n` +
                `- _Vida Restante: ${obj.vidaRestante}_\n` +
                `${obj.mensaje ? `_Efecto especial:_ ${obj.mensaje}` : ``}` +
                 `${(obj    .huida && !obj.derrotado) ? `_*${obj.nombre} intenta escapar!!*_\n` : ``}`
                if (Array.isArray(obj.efectos) && obj.efectos.length > 0) {
                    mensajeFinal += `     - _*Efectos Aplicados:*_\n\n`;
                    obj.efectos.forEach((efecto) => {
                        mensajeFinal += `    _• ${efecto}_\n`;
                    });
                }
                mensajeFinal += `${obj.derrotado ? `_❌ ${obj.nombre} ha sido derrotado._` : ''}\n\n`;

        if (obj.contraataques && !obj.mueto) {
            mensajeFinal += `🔄 Contraataques realizados por ${obj.nombre}:\n` +
                            `- Fallos: ${obj.contraataques.fallos}\n` +
                            `- Ataques Exitosos: ${obj.contraataques.ataquesExitosos}\n` +
                            `- Daño Total: ${obj.contraataques.dañoTotal}\n` +
                            `- Vida Restante del atacante: ${obj.contraataques.vidaRestanteAtacante}\n` +
                            `${obj.contraataques.derrotadoAtacante ? `\n❌ _El atacante ha sido derrotado._` : ''}\n\n`;
        }
        if (Array.isArray(obj.hechizos) && obj.hechizos.length > 0) {
            mensajeFinal += `🔮 _Hechizos Lanzados contra ${obj.jugador.nombre}:_\n`;
            obj.hechizos.forEach((hechizo, index) => {
                mensajeFinal += `  ${index + 1}. _${hechizo.nombre}_\n` +
                                `     - _Daño Total: ${hechizo.dañoTotal ?? 0}_\n` +
                                `     - _Vida Restante del Atacante: ${hechizo.vidaRestanteAtacante ?? 0}_\n` +
                                `${hechizo.derrotadoAtacante ? `     ❌ _El atacante fue derrotado._\n` : ''}`;
                if (Array.isArray(hechizo.efectos) && hechizo.efectos.length > 0) {
                    mensajeFinal += `     - _Efectos Aplicados:_\n`;
                    hechizo.efectos.forEach((efecto) => {
                        mensajeFinal += `        • ${efecto}\n`;
                    });
                }
                mensajeFinal += '\n';
            });
        }

        if(!mensajeFinal){
            mensajeFinal = `_No se genero correctamente el mensaje..._`;
        }
        await message.reply(mensajeFinal.trim());
        await procesarResultados(obj, atacanteGH, tipo, registros);
}}
       
    } catch (error) {
        console.log(`_Error al procesar hechizo(s): ${error.stack}_`);
        await message.reply('_Hubo un error al procesar los hechizos._');
    }
}

if (content.includes('#morder')) {
    try {
        const registros = cargarRegistros();
        let comandos = '';
        comandos = content.split('#morder').slice(1); 
        let objetivos = {}; 
        let atacanteG = {};
        let objetivo;
        let tipo;
        let mensajeFinal = '';

        for (const comando of comandos) {
            const mensajeLimpio = comando.replace(/[^\w\sáéíóúüñ#]/gi, '').toLowerCase();
            const palabrasMensaje = mensajeLimpio.split(/\s+/).filter(palabra => palabra !== '_');
            const nombreAtacante = palabrasMensaje[1];
            const nombreC = palabrasMensaje[2]; // Objetivo explícito
            console.log("Nombre de la criatura: ", nombreAtacante);
            console.log("Nombre para la busqueda explicita: ", nombreC);

        let atacanteDatos = buscarObjetivo([nombreAtacante]);
        
        if (!atacanteDatos || !atacanteDatos.datos) {
            await message.reply('_No se encontró al atacante especificado. Por favor revisa el nombre._');
            continue;
        }

        const atacante = atacanteDatos.datos; // Extraer los datos del atacante
        atacanteG = atacante;

        const usuario = registros.find(r => r.numero === numero); 

        if(!usuario?.adjudicados){
            usuario.adjudicados = [];
        }

        if(usuario?.adjudicados?.length <= 0 || !usuario?.adjudicados.some(c => c.nombre === nombreAtacante)){
            if(!esAdmin){
                await message.reply(`_¡No tienes está criatura adjudicada!_`);
                return;
            }
        }

            // Buscar objetivo por el nombre proporcionado
            let entidad = buscarObjetivo([nombreC]) || null;


            if (!entidad || !entidad.datos || !entidad.tipo) {
                const quotedMessage = message.hasQuotedMsg ? await message.getQuotedMessage() : null;

                if (!quotedMessage) {
                    await message.reply('_Debes responder a un mensaje del objetivo para atacarlo._');
                    continue;
                }
                if (quotedMessage && quotedMessage.body) {
                    const nombreObjetivo = quotedMessage.body.trim();
                    const mensajeLimpioObjetivo = nombreObjetivo.replace(/[^\w\sáéíóúüñ]/gi, '').toLowerCase();
                    const palabrasMensajeObjetivo = mensajeLimpioObjetivo.split(/\s+/).filter(palabra => palabra !== '_');

                    entidad = buscarObjetivo(palabrasMensajeObjetivo); // Objetivo inferido
                    if (!entidad || !entidad.datos) {
                        await message.reply('_No se encontró el objetivo especificado._');
                        continue;
                    }
                } else {
                    message.reply('_El mensaje no contiene un cuerpo válido._');
                    continue;
                }
            }

            tipo = entidad.tipo;
            objetivo = entidad.datos;

            // Calcular probabilidad de éxito del ataque
            let probabilidad = calcularProbabilidadExito(atacante, objetivo, 0);

            let ataqueExitoso = Math.random() * 100 < probabilidad;

            // Crear o actualizar el objeto consolidado del objetivo
            if (!objetivos[objetivo.nombre]) {
                objetivos[objetivo.nombre] = {
                    nombre: objetivo.nombre,
                    fallos: 0,
                    ataquesExitosos: 0,
                    dañoTotal: 0,
                    intentos: 0,
                    vidaRestante: objetivo.estadisticas.vida,
                    derrotado: false,
                    jugador: atacante,
                    criatura: objetivo,
                };
            }

            if(objetivos[objetivo.nombre].intentos > atacante.estadisticas.velAt){
                await message.reply(`_*¡Demasiados ataques! ${atacante.nombre} no puede atacar tan rapido*_`);
                break;
            }

            if (!ataqueExitoso) {
                objetivos[objetivo.nombre].fallos += 1;
                objetivos[objetivo.nombre].intentos += 1;
            }else{

            const resultado = realizarAtaque(atacante, objetivo);

            objetivos[objetivo.nombre].ataquesExitosos += 1;
            objetivos[objetivo.nombre].dañoTotal += resultado.dañoTotal;
            objetivos[objetivo.nombre].vidaRestante = resultado.vidaRestante;
            objetivos[objetivo.nombre].derrotado = resultado.derrotado;
            objetivos[objetivo.nombre].intentos += 1;  
            }

        }

        mensajeFinal = '_Resultados de los ataques:_\n\n';
        for (let nombreObjetivo in objetivos) {
            const obj = objetivos[nombreObjetivo];
            if(obj.fallos === obj.intentos || obj.ataqueExitoso === 0 || (obj.fallos === 1 && obj.intentos === 1)){
                mensajeFinal += `_¡¡Todos tus ataques fallaron!!_\n`
            }else{
            if(!obj.dañoTotal){
                mensajeFinal += `_¡Algo salio mal con este ataque!_`
            }
            mensajeFinal += `🗡️ _Ataques contra ${obj.nombre}:_\n` +
                            `- _Fallos: ${obj.fallos}_\n` +
                            `- _Ataques Exitosos: ${obj.ataquesExitosos}_\n` +
                            `- _Daño Total: ${obj.dañoTotal}_\n` +
                            `- _Vida Restante: ${obj.vidaRestante}_\n` +
                            `${obj.derrotado ? `_❌ ${obj.nombre} ha sido derrotado._` : ''}\n\n`;
            }
                    await procesarResultados(obj, atacanteG, tipo, registros);
            }

        if (mensajeFinal.trim() !== '') {
            await message.reply(mensajeFinal.trim());
        }

    }catch (error) {
        console.log(`_Error al procesar ataque(s): ${error.stack}_`);
        await message.reply('_Hubo un error al procesar los ataques._');
}}

if(content.includes('#deletepersona')){

const args = content.split(' ');
const indice = args.indexOf('#deletepersona');
const nombrepersona = args[indice+1];
const registros = cargarRegistros();
const nombre = registros.find(r => r.nombre === nombrepersona);

    if(!nombrepersona || !nombre)
        { message.reply('Por favor, proporcione el nombre correcto de la persona.');
            return;
        }

    if (!esAdmin) {
            await message.reply('_No tienes permiso para este content._');
            return;
    }
    
    const resultado = await eliminarRegistro(nombrepersona);
    await message.reply(`${resultado}`);
    }

if(content.includes('#saludo')){
    try {
        const texto = await leerArchivos('saludo2.txt');
        message.reply(texto);
    } catch (error) {
        console.error('Error al leer el archivo de texto:', error.message);
        await message.reply('_Hubo un error al cargar los content.._');
    }
}   

if(content.includes('#infobot')) {
    try {
        const texto = await leerArchivos('texto2.txt');
        message.reply(texto);
    } catch (error) {
        console.error('Error al leer el archivo de texto:', error.message);
        await message.reply('_Hubo un error al cargar los comandos.._');
    }
} //check

if (content.includes('#verinventario')) {
    try {
        // Cargar registros
        const registros = cargarRegistros();
        const usuario = registros.find(registro => registro.numero === numero);
    
        if (!usuario) {
            await message.reply('_No se encontró al usuario registrado._');
            return;
        }
    
        // Llamar a la función para obtener las estadísticas, inventario, etc.
        const mensaje = await mostrarEstadisticasPersonaje(usuario);
        await message.reply(mensaje);
        
    } catch (error) {
        await message.reply(`_Error al ver el inventario: ${error.message}_`);
    }

}

if(content.includes('#mision')){

    if(!personajeNum){
        await message.reply("_No se encontro al jugador._");
        return;
    }

    const {mensaje, criaturaPrincipal, criaturasSecundarias } = await generarMision(personajeNum, chat, Mundo);

    console.log("Punto de control luego de llamar a las misiones:", mensaje);

    if(!mensaje || !criaturaPrincipal || !criaturasSecundarias){
        await message.reply("_Algo salio mal._");
        return;
    }

    await message.reply(mensaje.trim());
    console.log("La criatura principal: ", criaturaPrincipal);
    console.log("Criaturas secundarias: ", criaturasSecundarias);
}

if (content.includes('#equipararma')) {
    try {
        // Dividir el mensaje en palabras
        const args = content.split(/\s+/);
        const indice = args.indexOf('#equipararma');
        
        if (indice === -1 || indice === args.length - 1) {
            await message.reply('_Debes especificar el nombre del arma después del comando._');
            return;
        }

        let nombreItem = args.slice(indice + 1).join(' ');

        if (nombreItem.includes('(') && nombreItem.includes(')')) {
            const inicio = nombreItem.indexOf('(') + 1;
            const fin = nombreItem.indexOf(')');
            nombreItem = nombreItem.slice(inicio, fin).trim();
        } else {
            nombreItem = nombreItem.split('\n')[0].trim(); 
        }

        const registros = cargarRegistros();
        const usuario = registros.find(registro => registro.numero === numero);

        if (!usuario) {
            await message.reply('_No se encontró al usuario registrado._');
            return;
        }

        const arma = usuario.inventario.find(item => 
            item.nombre.toLowerCase() === nombreItem.toLowerCase() && item.tipo === 'arma'
        );

        if (!arma) {
            await message.reply('_No tienes un arma con ese nombre en tu inventario._');
            return;
        }

        // Si ya hay un arma equipada, devolverla al inventario y eliminar sus modificadores
        if (usuario.armaPrincipal) {
            const armaEquipada = usuario.armaPrincipal;

            if (armaEquipada.equipada) {
                // Marcar como no equipada
                armaEquipada.equipada = false;

                // Remover sus modificadores del usuario
                usuario.modificadoresTemp = usuario.modificadoresTemp.filter(
                    mod => mod.fuente !== armaEquipada.nombre && mod.fuente !== 'arma'
                );

                // Revertir efectos del arma en las estadísticas
                for (const mod of armaEquipada.modificadores) {
                    if (mod.estadistica === "todas") {
                        ["fuerza", "agilidad", "mana", "magia"].forEach(key => {
                            usuario.estadisticas[key] -= mod.intensidad;
                        });
                    } else {
                        usuario.estadisticas[mod.estadistica] -= mod.intensidad;
                    }
                }
            }

            const existente = usuario.inventario.find(item => item.nombre === armaEquipada.nombre);
            if (existente) {
                existente.cantidad += armaEquipada.cantidad;
            } else {
                usuario.inventario.push(armaEquipada);
            }
        }

        // Equipar el arma nueva
        usuario.armaPrincipal = { ...arma, equipada: true };
        usuario.inventario = usuario.inventario.filter(item => item !== arma);

        // Aplicar los modificadores del arma y sus efectos
        for (const mod of arma.modificadores) {
            const modConFuente = { ...mod, fuente: arma.nombre };
            usuario.modificadoresTemp.push(modConFuente);

            if (mod.estadistica === "todas") {
                ["fuerza", "agilidad", "mana", "magia"].forEach(key => {
                    usuario.estadisticas[key] += mod.intensidad;
                });
            } else {
                usuario.estadisticas[mod.estadistica] += mod.intensidad;
            }
        }

        let mensaje = `_Has equipado el arma principal: ${arma.nombre}._\n`;
        mensaje += `_- Calidad: ${arma.rango}_\n`;
        mensaje += `_- Daño: ${arma.daño}_\n`;
        if (arma.modificadores.length > 0) {
            mensaje += `\n_*Los modificadores del arma han sido aplicados!*_`;
        }

        guardarRegistros(registros);
        await message.reply(mensaje.trim());
    } catch (error) {
        await message.reply(`_Error al equipar el arma: ${error.message}_`);
    }
}


if (content.includes('#renombrar')) {
    const registros = cargarRegistros();
    const usuario = registros.find(r => r.numero === numero);
    if (!usuario) {
        await message.reply('No estás registrado, por favor, regístrate para unirte al juego.');
        return;
    }

    const palabras = content.split(/\s+/); // Separar por espacios o saltos de línea
    const indice = palabras.indexOf('#renombrar');
    if (indice === -1 || indice === palabras.length - 1) {
        await message.reply('_Debes especificar el nuevo nombre después del comando._');
        return;
    }

    let nuevonombre = palabras.slice(indice + 1).join(' ');
    if (typeof nuevonombre !== 'string' || nuevonombre.trim() === '') {
        await message.reply('Por favor, introduce un nombre válido.');
        return;
    }

    if (!usuario.armaPrincipal) {
        await message.reply('No tienes un arma principal para renombrar.');
        return;
    }

    if (nuevonombre.includes('(') && nuevonombre.includes(')')) {
        const inicio = nuevonombre.indexOf('(') + 1 || indice + 1;
        const fin = nuevonombre.lastIndexOf(')');
        if (fin > inicio) {
            nuevonombre = nuevonombre.slice(inicio, fin);
        } else {
            await message.reply('_Formato inválido: verifica los paréntesis en el nombre._');
            return;
        }
    } else {
        nuevonombre = nuevonombre.split('\n')[0];
    }

    if(nuevonombre.length > 8){
        await message.reply(`_Nombre demasiado largo. Por favor, use otro nombre._`);
        return;
    }
    usuario.armaPrincipal.nombre = nuevonombre;

    guardarRegistros(registros);

    await message.reply(`_Tu arma ahora tiene el nombre: *${usuario.armaPrincipal.nombre}*_`);
}

if (content.includes('#crearcriatura')) {
    try {
        if(!esAdmin){
            await message.reply(`_No tienes permisos para usar este comando._`);
        }
        const args = content.split(' ');
        const indice = args.indexOf('#crearcriatura');
        const nombre = args[indice + 1];
        const rango = args[indice + 2]?.toUpperCase();

        if (!nombre || !rango) {
            await message.reply('_Uso: #crearCriatura <nombre> <rango (D, C, B, A, S, SS)>_');
            return;
        }

        const criatura = crearCriatura(nombre, rango);
        if (criatura === 'existe'){

            message.reply('La criatura ya existe. Por favor, use otro nombre.');
        }   

        if(criatura && criatura.idRango > 2){

            if(!criatura.armaPrincipal){
                criatura.armaPrincipal = {};
            }

            const arma = generarArmaAleatoria(criatura.idRango, null, false, null, false);
            criatura.armaPrincipal = arma;
            const criaturas = cargarCriaturas();
            guardarCriaturas(criaturas);
        }

        if (criatura) {
            const mensaje = mostrarEstadisticasCriatura(criatura); 
            await message.reply(mensaje); 

        }
    } catch (error) {
        await message.reply(`_Error al crear criatura: ${error.message}_`);
    }
}

if(content.includes('#estado')){

    const registros = cargarRegistros();
    const usuario = registros.find(u => u.numero === numero);
    let mensaje = '';

    if(!usuario){
        await message.reply(`_¡Jugador no encontrado! Por favor, registrate para entrar al juego._`);
        return;
    }

    if(!usuario.estadisticas.efectos || usuario.estadisticas.efectos.length <= 0){
        usuario.estadisticas.efectos = [];
        await message.reply(`_¡No tienes efectos activos por ahora!_`);
        return;
    }

    if (usuario.estadisticas.efectos.length > 0) {
        mensaje += `✨ *Tus efectos actuales son:* ✨\n\n`;
    
        usuario.estadisticas.efectos.forEach((efecto, index) => {
            mensaje += `🎯 *${index + 1}. ${efecto.nombre}*\n`;
            mensaje += `   📅 Duración restante: ${efecto.duracion} turnos\n`;
            mensaje += `   🔹 Intensidad: ${efecto.intensidad || 'No aplica'}\n\n`;
        });
    
        mensaje += `💠 ¡Mantente alerta, los efectos pueden ser decisivos en combate! 💠`;
    }

    await message.reply(mensaje.trim());

}

// if(content.includes('#iniciartienda')){

//     if(!esAdmin){
//     await message.reply('No tienes permisos para usar este comando. Usa reroll en su lugar.');
//     }

//     reiniciarTienda(10);
//     mostrarTienda();
// }


if(content.includes('#verhechizos')){

let mensaje = "_=== *Hechizos del Jugador* ===_\n\n";

const registros = cargarRegistros();
const jugador = registros.find(r => r.numero === numero);

if(!jugador){
    await message.reply("_No estás registrado, por favor, registrate para entrar al juego._");
    return;
}

const hechizosJugador = jugador.hechizos; 

hechizosJugador.forEach(id => {
    // Buscar el hechizo en la base de datos
    const hechizos = cargarHechizos();
    const hechizo = hechizos.find(h => h.id === id);
    
    if (hechizo){
        mensaje += `=== *Hechizo:* _${hechizo.nombre}_ / *ID:* _${hechizo.id}_ ===\n`;
        mensaje += `\n_${hechizo.descripcion}_\n`;
        mensaje += `*Daño Base:* _${hechizo.dañoBase}_\n`;
        mensaje += `*Intensidad:* _${hechizo.intensidad}_\n`;
        mensaje += `*Duración:* _${hechizo.duracion} turnos_\n`;
        mensaje += `*Costo de maná:* _${hechizo.costo}_\n`;
        mensaje += `*Nivel Requerido:* _${hechizo.nivelRequerido}_\n`;
        mensaje += `*Rango:* _${hechizo.rango}_\n`;
        mensaje += `*Probabilidad Aumentada:* _${hechizo.probabilidad || 0}%_\n`;
        
        if (hechizo.efectos.length > 0) {
            mensaje += `\n*Efectos:*\n`;
            hechizo.efectos.forEach((efecto, index) => {
                mensaje += `  _*${index + 1}. ${efecto.nombre}* -- Intensidad: ${efecto.intensidad}, Duración: ${efecto.duracion} turnos_\n`;
            });
        } else {
            mensaje += "*Efectos:* _Ninguno_\n";
        }
        
        mensaje += "\n";
    } else {
        mensaje += `_Hechizo no encontrado._\n\n`;
    }
});

await message.reply(mensaje);

}

if(content.includes('#descansar')){

    if(!esAdmin){
        await message.reply(`_No tienes permiso para ejecutar este comando._`);
        return;
    }

    const registros = cargarRegistros();
    const newcontent = content.replace(/[^\w\sáéíóúüñ#]/gi, '').toLowerCase().trim();
    const palabras = newcontent.split(/\s+/);
    const indice = palabras.indexOf('#descansar');
    const nombre = palabras[indice+1];
    console.log("Nombre en descansar: ", nombre);

    let usuario = registros.find(u => u.nombre === nombre);
    console.log("El usuario encontrado: ", usuario);

    if(!usuario || !nombre || indice === -1){
        await message.reply(`_Usuario no valido o no registrado._`);
        return;
    }

    usuario.estadisticas.vida += Math.round(usuario.estadisticas.vidaMax * 0,75);
    usuario.estadisticas.mana += Math.round(usuario.estadisticas.manaMax * 0,75);

    usuario.estadisticas.vida > usuario.estadisticas.vidaMax ? usuario.estadisticas.vida = usuario.estadisticas.vidaMax : usuario.estadisticas.vida = usuario.estadisticas.vida;
    usuario.estadisticas.mana > usuario.estadisticas.manaMax ? usuario.estadisticas.mana = usuario.estadisticas.manaMax : usuario.estadisticas.mana = usuario.estadisticas.mana;

    if(usuario.estadisticas.efectos && usuario.estadisticas.efectos.length > 0){
    usuario.estadisticas.efectos = [];
    }

    if(usuario.modificadoresTemp && usuario.modificadoresTemp.length > 0){
        usuario.modificadoresTemp = usuario.modificadoresTemp.forEach(mod => { 

        if(mod.duración > 0 && mod.fuente !== "arma"){
            mod.duración = 0;
        }

    });

    await actualizarModificadoresTemporales(usuario);

    }

    if(usuario.distancia){
        usuario.distancia = [];
    }
    guardarObjetivo('usuario', usuario);
    guardarRegistros(registros);

    await message.reply(`_El jugador ha descansado correctamente. Vida y maná recuperados. Efectos de estado eliminados._`);

}

if(content.includes('#criaturasactivas')) {
    
    if(!esAdmin){
        await message.reply();
    }

    const criaturas = cargarCriaturas();
    const criaturasActivas = criaturas.map(criatura => `_${criatura.nombre}_`); 
    const numeroTotal = criaturas.length;
    const nombresC = criaturasActivas.join('\n'); 

    await message.reply(`_Total de criaturas activas: ${numeroTotal}._\n_Nombres:_\n${nombresC}`);
}

// if(content.includes('#tienda')){
//     const mensajeCompleto = mostrarTienda();
//     await message.reply(mensajeCompleto);
// }

// if(content.includes('#comprar')){

//     const registros = cargarRegistros();
//     const usuario = registros.find(u => u.numero === numero);
       
//         const args = content.split(/\s+/);
//         const indice = args.indexOf('#comprar');
        
//         if (indice === -1 || indice === args.length - 1) {
//             await message.reply('_Debes especificar el nombre del objeto a comprar después del comando._');
//             return;
//         }

//         let nombreItem = args.slice(indice + 1).join(' ');
//         let cantidad = args[args.length - 1]; // Último argumento (posible cantidad)

//     if (isNaN(cantidad) || cantidad <= 0) {
//     cantidad = 1;
//     } else {
//     cantidad = parseInt(cantidad, 10); // Convertir la cantidad a un número entero
//     }
//             // Manejar casos con paréntesis
//         if (nombreItem.includes(')')) {
//             const inicio = nombreItem.indexOf('(') + 1 || indice + 1; // Índice después de "("
//             const fin = nombreItem.indexOf(')'); // Índice de ")"
//             nombreItem = nombreItem.slice(inicio, fin).trim(); // Extraer el contenido entre paréntesis
//         } else {
           
//             nombreItem = nombreItem.split('\n')[0].trim(); // Cortar hasta el primer salto de línea
//         }

//         let tienda = leerTienda();

//         const compra = comprarObjeto(usuario,tienda, nombreItem,cantidad);

//         guardarRegistros(registros);

//         await message.reply(compra);
//     }

// if(content.includes('#reroll')){

//     registros = cargarRegistros();
//     usuario = registros.find(u => u.numero === numero);

//     rerollTienda(usuario, 10);

//     const newtienda = mostrarTienda();

//     await message.reply(newtienda);

// }

if(content.includes('#arma')){

    if(!esAdmin){
        await message.reply('_No tienes permiso para generar este comando._');
        return;
    }

    if(!personajeNum){
        console.log("Personaje no encontrado: ", personajeNum);
        await message.reply(`Hubo un error.`);
        return;
    }

    const num = 2;

    const nuevaArma = generarArmaAleatoria(num, null, true, null, 'arco', true);

    personajeNum.inventario.push(nuevaArma);

    await message.reply(`_Has adquirido el arma: ${nuevaArma.nombre}, tú fuerza es: ${personajeNum.estadisticas.fuerza} y el daño del arma es: ${nuevaArma.daño}_`);

    guardarRegistros(registrosG);
}

if(content.includes('#loot')){

    if(!esAdmin){
        await message.reply(`No tienes permisos para usar este comando.`);
        return;
    }
    let mensaje = '';

    let criatura = crearCriatura("Criatura_X", 'C');

    if(criatura === 'existe'){
        const criaturas = cargarCriaturas();
        const exCriatura = criaturas.find(c => c.nombre === 'Criatura_X');
        exCriatura.estadisticas.vida = 0;
        criatura = exCriatura;
    }

    console.log("La criatura antes de llevar su vida a 0: ", criatura);
    if(criatura && typeof criatura !== 'string'){
        console.log("La criatura en cuestion: ", criatura);
        criatura.estadisticas.vida = 0;
    }else{
        console.error("Hubo un error al crear la criatura.", criatura);
    }
    if(criatura.estadisticas.vida === 0){
    mensaje = await mensajeDropeo(personajeNum, criatura);
    }else{
        mensaje = "_Hubo un error al dropear usando el comando loot._"
    }

    await message.reply(mensaje);

}

// if(content.includes('#vender')){
//     const args = content.split(/\s+/);
//     const indice = args.indexOf('#comprar');
    
//     // Verificar que haya texto después del comando
//     if (indice === -1 || indice === args.length - 1) {
//         await message.reply('_Debes especificar el nombre del item a vender después del comando._');
//         return;
//     }

//     let nombreItem = args.slice(indice + 1).join(' ');
//     let cantidad = args[args.length - 1]; // Último argumento (posible cantidad)

// // Verificar si la cantidad es un número válido
// if (isNaN(cantidad) || cantidad <= 0) {
// cantidad = 1; // Si no es un número válido, asignar cantidad por defecto como 1
// } else {
// cantidad = parseInt(cantidad, 10); // Convertir la cantidad a un número entero
// }
//         // Manejar casos con paréntesis
//     if (nombreItem.includes('(') && nombreItem.includes(')')) {
//         const inicio = nombreItem.indexOf('(') + 1 || indice + 1; // Índice después de "("
//         const fin = nombreItem.indexOf(')'); // Índice de ")"
//         nombreItem = nombreItem.slice(inicio, fin).trim(); // Extraer el contenido entre paréntesis
//     } else {
       
//         nombreItem = nombreItem.split('\n')[0].trim(); // Cortar hasta el primer salto de línea
//     }

//         const registros = cargarRegistros();
//         const usuario = registros.find(r => r.numero === numero);

//         itemAVender = usuario.inventario.find(item => item.nombre === nombreItem);

//         if(!item.rango || !itemAVender){
//             await message.reply('_El item no es valido._');
//         }

//         if(itemAVender.cantidad > cantidad){
//             await message.reply('_La cantidad de objetos a vender es superior a la que tienes realmente._');
//         }
        
//         const valor = calcularPrecio(itemAVender, itemAVender.rango, cantidad);

//         if (itemAVender.cantidad > 1) {
//             itemAVender.cantidad -= cantidad;
//         } else {
//             const index = usuario.inventario.indexOf(itemAVender);
//             if (index !== -1) {
//                 usuario.inventario.splice(index, 1);
//             }
//         }

//         usuario.dinero += valor;

//         await message.reply(`_Has vendido ${nombreItem} y has obtenido: ${valor}_`);
// }

if (content.includes('#hab')) {
    // Se espera que el comando tenga el formato: "#hab <id>"
    const args = content.split(" ");
    const idHabilidad = parseInt(args[1]);
  
    if (!idHabilidad || isNaN(idHabilidad)) {
      console.log("Error: Debes proporcionar un id de habilidad numérico.");
    } else {
      // Ejecuta la función para activar la habilidad en la entidad "jugador"
      const resultado = usarHabilidad(personajeNum, idHabilidad);
      await message.replY(resultado);

    }
}


if(content.includes('#ahechizo')){

    if(!esAdmin){
        await message.reply(`_Este es un comando de depuración. No tienes permisos._`);
        return;
    }
    try{

    const registros = cargarRegistros();
    const jugador = registros.find(d => d.numero === numero);

    if(!jugador){
        message.reply('_Jugador no encontrado._');
        return;
    }

    const { mensaje } = aprenderHechizo(jugador);

    guardarRegistros(registros);

    await message.reply(mensaje);
}catch (error){
    console.log("Algo fallo en el proceso del comando: ", error.message, error.stack);
}
}

if(content.includes('#verarma')){

    if(!personajeNum){
        await message.reply(`_No estas registrado, por favor, registrate._`);
        return;
    }

    if(!personajeNum?.armaPrincipal || !personajeNum?.armaPrincipal?.daño){
        await message.reply(`_No tienes un arma._`);
        return;
    }

    const mensaje = mostrarEstadisticasArma(personajeNum?.armaPrincipal);

    await message.reply(mensaje);

}


if(content.includes('#LunaRoja')){

    if(!esAdmin){
        await message.reply("_No tienes permisos para ejecutar este comando._");
        return;
    }

    if(Mundo.evento === 'luna Roja'){
        Mundo.evento === '';
        await message.reply(`¡El evento de Luna Roja ha terminado!`);

    }else{
        Mundo.evento = 'luna Roja'
        await message.reply(`¡El evento de la Luna Roja ha empezado!`);
    }

}

if(content.includes('#callatehades')){
    message.reply('_Si, *callate* hades._');
}

if(content.includes('#abrazo') || content.includes('#abrazar') || content.includes('#hug')){
    await message.reply("_*/Abrazo*_");
}

if((content.includes('#beso') || content.includes('#besar')  || content.includes('#kiss')) && numero !== "51924091418@c.us" ){
    await message.reply("_*/besitos*_");
}

if((content.includes('#follada') || content.includes('#follar') || content.includes('#sex')) && numero !== "51924091418@c.us" ){
    await message.reply("_*Se la folla*_");
}

if(content.includes('#funa')){
    await message.reply("_*Le abre un hilo en Twitter*_");
}

async function procesarResultados(objetivo, atacante, tipo, registros) {
    try {
        if(atacante.estadisticas.vida > 0){
            await procesarTurno(atacante);
            }
            if(objetivo.criatura.estadisticas.vida > 0){
            await procesarTurno(objetivo);
            }

        const registrosN = registros || cargarRegistros();
        guardarRegistros(registrosN); // Asegura que los registros estén actualizados
        await guardarObjetivo(tipo, objetivo.criatura); // Guarda la información del objetivo actualizado
        const criaturas = cargarCriaturas();

        console.log("Codigo entrando correctamente en procesar resultado");

        // Mensaje de rol adicional si aplica
        const mensajeRol = handleAutoCombat(objetivo, tipo);

        if (mensajeRol) {
            await message.reply(mensajeRol.trim());
        }

        if(atacante.habilidades.length > 0){
            actualizarHabilidadesActivas(atacante);
        }
        if(objetivo.habilidades.length > 0){
            actualizarHabilidadesActivas(objetivo);
        }

        guardarRegistros(registrosN);
        guardarCriaturas(criaturas);

        if (objetivo.derrotado && tipo === 'criatura') {
            const dropeo = await mensajeDropeo(atacante, objetivo.criatura);
            await message.reply(dropeo);
        }

        if(objetivo?.contraataques?.muerto){
            await eliminarRegistro(objetivo.jugador);
            guardarRegistros(registrosN);
        }


    } catch (error) {
        console.error(`Error en procesarResultados: ${error.stack}`);
        await message.reply('_Hubo un error al procesar los resultados del ataque._');
    }
}

}catch (error){

    console.error('Hubo un error al manejar los comandos.', error.message, error.stack);
}; 

}

async function leerArchivos(archivo){

    if(!archivo){ return };

    try{
    const filePath = path.join(__dirname, archivo);
    const texto = fs.readFileSync(filePath, 'utf8');
    return texto;
    }catch(error){ console.error('Hubo un error al leer el archivo:', error.message); 
        throw error;
    }
}

function mostrarEstadisticasPersonaje(personaje) {
    const stats = personaje.estadisticas;
    const xpMaxima = personaje.nivel * 100;

    // Mensaje de estadísticas generales
    let mensaje = `*${personaje.nombre} - Nivel: ${personaje.nivel}*\n` +
                  `-----------------------------------\n` +
                  `*Vida*: ${stats.vida} / ${stats.vidaMax} HP\n` +
                  `*Fuerza*: ${stats.fuerza}\n` +
                  `*Agilidad*: ${stats.agilidad}\n` +
                  `*Maná*: ${stats.mana} MP\n` +
                  `*Magia*: ${stats.magia}\n` +
                  `*Armadura*: ${personaje.armadura}\n` +
                  `*Experiencia*: ${personaje.experiencia} | ${xpMaxima}\n` +
                  `*Dinero*: ${personaje.dinero}\n` +
                  `-----------------------------------\n`;

    // Inventario
    const inventario = personaje.inventario.map(item => `_${item.nombre}_ x${item.cantidad}`).join('\n') || '_Sin objetos en el inventario._';
    const inventarioMensaje = `_*Inventario:*_\n\n${inventario}\n`;

    // Arma principal
    const armaPrincipal = personaje.armaPrincipal ? personaje.armaPrincipal.nombre : 'Sin arma principal.';
    const armaPrincipalMensaje = `_*Arma Principal:*_\n_*${armaPrincipal}*_\n`;

    // Reliquias
    const reliquias = personaje.reliquias || '_No tiene reliquias._';
    const reliquiasMensaje = `_*Reliquias:*_\n${reliquias}`;

    // Construir el mensaje final
    mensaje += `${inventarioMensaje}\n${armaPrincipalMensaje}\n${reliquiasMensaje}`;

    // Enviar el mensaje
    return mensaje.trim();
}

function isAdmin(num, admin, participantes) {
    // Buscar al participante en la lista
    const participante = participantes.find(p => p.id?._serialized === num);

    // Debugging para entender los valores

    // Verificar si se encontró un participante
    if (!participante) {
        console.log("No se encontró al participante.");
        return false;
    }
    // Verificar si el participante es administrador o si admin es true
    if (participante.isAdmin || admin) {
        return true;
    }
    return false;
}

function calcularProbabilidadExito(atacante, objetivo, probabilidadAumentada, esHechizo) {
    // 1. Verificar e inicializar el objeto de distancia entre atacante y objetivo.
    // Se asume que cada entidad posee (o se le asigna) una propiedad "distancia" que es un arreglo de objetos { nombre, distancia }.
    if (!atacante.distancia) {
      atacante.distancia = [];
    }

    let registroDistancia = atacante.distancia.find(item => item.nombre === objetivo.nombre);
    
    if (!registroDistancia) {
      let distInicial = 0;
      if (esHechizo) {
        distInicial = 20;
      } else {
        if (!atacante.armaPrincipal || atacante.armaPrincipal.tipoAtaque === "Melee") {
          distInicial = 0;
        } else if (atacante.armaPrincipal.tipoAtaque === "distancia") {
          distInicial = atacante.armaPrincipal.distancia;
        }
      }
      registroDistancia = { nombre: objetivo.nombre, distancia: distInicial };
      atacante.distancia.push(registroDistancia);
    }

    if (!esHechizo) {

      if (!atacante.armaPrincipal || atacante.armaPrincipal.tipoAtaque === "Melee") {
        if (registroDistancia.distancia > 0) {
          return 0;
        }
      }

      if (atacante.armaPrincipal && atacante.armaPrincipal.tipoAtaque === "distancia") {
        // Si la distancia real es mayor que la distancia máxima del arma (fuera de rango), falla el ataque.
        if (registroDistancia.distancia > atacante.armaPrincipal.distancia) {
          return 0;
        }

        let probabilidad = (atacante.estadisticas.agilidad)
          - (atacante.armaPrincipal.distancia - registroDistancia.distancia) * 10
          + (atacante.estadisticas.precision || 0);
        return Math.max(0, Math.min(100, probabilidad));
      }
    }

    const agilidadAtacante = atacante.estadisticas.agilidad || 0;
    const agilidadObjetivo  = objetivo.estadisticas.agilidad || 0;
    const probabilidadA     = probabilidadAumentada || 0;
  
    // Regla especial: si la agilidad del atacante es el doble (o más) que la del objetivo,
    // o si el atacante ataca a sí mismo, el éxito es garantizado.
    if (agilidadAtacante >= 2 * agilidadObjetivo || atacante.nombre === objetivo.nombre) {
      return 100;
    }
    // Regla especial: si la agilidad del objetivo es el doble (o más) que la del atacante
    // y no hay bonificación, el ataque falla.
    if (agilidadObjetivo >= 2 * agilidadAtacante && probabilidadA === 0) {
      return 0 + probabilidadAumentada;
    }
  
    const relacionAgilidad = agilidadAtacante / agilidadObjetivo;
    let probabilidad;
    if (relacionAgilidad === 1) {
      probabilidad = 50;
    } else if (relacionAgilidad > 1) {
      // Si el atacante es más ágil: escalar hacia 100%
      probabilidad = 50 + ((relacionAgilidad - 1) / 1) * 50;
    } else {
      // Si el objetivo es más ágil: escalar hacia 0%
      probabilidad = 50 - ((1 - relacionAgilidad) / 1) * 50;
    }
    
    return Math.max(0, Math.min(100, probabilidad + probabilidadA));
  }
  

module.exports = { handleCommands, mostrarEstadisticasPersonaje };