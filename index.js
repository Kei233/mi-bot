const { Client, LocalAuth, MessageTypes } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { handleCommands } = require('./hCommands.js');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const logFilePath = path.join(__dirname, '.wwebjs_auth', 'session', 'Default', 'chrome_debug.log', 'session.json');

const grupos = ['120363362805067941@g.us', '120363385970988223@g.us', 
    '120363367296416960@g.us', '120363380670290037@g.us',
    '120363364249888983@g.us', '120363380801529962@g.us',
    '120363386493131769@g.us', '120363214542344945@g.us', '120363130633429484@g.us', 
    '120363284130959525@g.us', '120363284119423138@g.us', '120363131263183257@g.us',
    '120363382619103274@g.us', '120363395447611444@g.us', '120363031692524023@g.us' ];

const client = new Client({
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
    authStrategy: new LocalAuth(),
    takeoverOnConflict: true,
    emitSelfMessages: true,
});

client.on('qr', (qr) => {
    console.log('Escanea este código QR para iniciar sesión:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {

    console.log('El cliente está listo y conectado a WhatsApp!');

});

client.on('message_create', async (message) => {

        let chatId = (message.fromMe ? message.to : message.from);
        const isOwner = message.fromMe;

        if(isOwner && message.body.includes('#adm-request')){
            if(message){
            await message.reply("_Captura de mensajes inicializada._");
            }else{
                exec('pm2 restart mi-bot', (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error al reiniciar el bot: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.error(`stderr: ${stderr}`);
                        return;
                    }
            })}
        }
        
    // '120363380670290037@g.us' (Serio),  '120363364249888983@g.us' (The Other World), '120363380801529962@g.us' (OffRol)
    if ((message.body.includes('#init') && message.fromMe) ||(grupos.includes(chatId) && message.body.includes('#') || message.body.includes('@everyone')))
        {             
            const group = await message.getChat();
            const persona = message.author;
            const participantes = group.participants;
            const admin = message.fromMe;
            console.log(`Comando de ${persona} (${message.notifyName}): ${message.body}`)
;
            try {
                await handleCommands(message, client, admin, participantes, chatId); 

            } catch (commandError) {
                console.error('Error al procesar el comando:', commandError.message);
                await message.reply('Hubo un error al procesar tu comando.');
                exec('pm2 restart mi-bot', (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error al reiniciar el bot: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.error(`stderr: ${stderr}`);
                        return;
                    }
            })}
        }
});

// Manejador de desconexión, intenta reiniciar el cliente
client.on('disconnected', (reason) => {
    console.log('El cliente se desconectó. Razón:', reason);
    reconnectClient();
});


client.on('auth_failure', (message) => {
    console.error('Error de autenticación:', message);
});

const reconnectClient = () => {
    console.log('Intentando reconectar...');
    client.destroy()
        .then(() => {
            console.log('Cliente destruido. Inicializando de nuevo...');
            client.initialize();
        })
        .catch(err => console.error('Error al destruir el cliente:', err));
};

// Manejador de errores generales y críticos
client.on('error', (err) => {
    console.error('Error crítico. Reiniciando cliente:', err.message);
    removeLockedLogFile();
    reconnectClient();
});

// Manejo de excepciones no capturadas
process.on('uncaughtException', (err) => {
    console.error('Error no capturado:', err.message);
    reconnectClient();  // Asegura que el cliente se reinicie
});

const removeLockedLogFile = () => {
    try {
        if (fs.existsSync(logFilePath)) {
            fs.unlinkSync(logFilePath);
            console.log('Archivo de log eliminado con éxito.');
        }
    } catch (err) {
        console.error('No se pudo eliminar el archivo de log:', err.message);
    }
};

client.initialize(); // Inicializar el cliente