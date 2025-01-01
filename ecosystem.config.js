module.exports = {
    apps: [
        {
            name: "mi-bot", // Este nombre debe coincidir con el que usas en 'pm2 restart mi-bot'
            script: "./index/index.js", // Archivo principal de tu bot
            watch: true, 
            ignore_watch: ["node_modules", "logs"],
            env: {
                NODE_ENV: "development", // Entorno para desarrollo
            },
            env_production: {
                NODE_ENV: "production", // Entorno para producción
            },
            max_memory_restart: "200M", // Reinicia si supera los 200MB de RAM
            autorestart: true, // Asegura que el bot se reinicie automáticamente en caso de fallo
        },
    ],
};