const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { handleCommands } = require('./commands.js');
const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '.wwebjs_auth', 'session', 'Default', 'chrome_debug.log', 'session.json');

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
    
    client.on('ready', async () => {
        console.log('Cliente listo para usar.');
    
        try {

        } catch (error) {
            console.error('Error al obtener los chats:', error);
        }
    });

});

client.on('message_create', async (message) => {

        let chatId = (message.fromMe ? message.to : message.from);

    if ((chatId === '120363362805067941@g.us' || chatId === '120363385970988223@g.us' || chatId ===  '120363367296416960@g.us') && message.body.startsWith('#') || message.body.startsWith('@everyone')) {
            const group = await message.getChat();
            const participantes = group.participants;
            console.log(`Comando de ${message.author}: ${message.body}`);

            try {
                await handleCommands(message, client, message.fromMe, participantes);  
            } catch (commandError) {
                console.error('Error al procesar el comando:', commandError.message);
                await message.reply('Hubo un error al procesar tu comando.');
            }}

});

// Manejador de desconexión, intenta reiniciar el cliente
client.on('disconnected', (reason) => {
    console.log('El cliente se desconectó. Razón:', reason);
    reconnectClient();
});

// Manejador de error de autenticación
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

module.exports = { client };