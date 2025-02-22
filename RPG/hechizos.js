const fs = require('fs');
const path = require('path');
const { handleEspeciales } = require('./funcionesEspeciales.js');
const { error } = require('console');

const filePathHechizos = path.join(__dirname, 'hechizos.json');

function cargarHechizos() {
    if (!fs.existsSync(filePathHechizos)) {
        throw new Error('El archivo de hechizos no existe.');
    }

    const data = fs.readFileSync(filePathHechizos, 'utf-8');
    return JSON.parse(data);
}

function aprenderHechizo(jugador, id) {
    // Validación básica del jugador
    if (!jugador || typeof jugador !== 'object') {
        throw new Error('El jugador proporcionado no es válido.');
    }

    // Asegurarse de que el jugador tenga un arreglo de hechizos
    if (!Array.isArray(jugador.hechizos)) {
        jugador.hechizos = [];
    }

    // Cargar todos los hechizos
    const hechizos = cargarHechizos();

    // Filtrar hechizos no aprendidos
    const hechizosNoAprendidos = hechizos.filter(
        hechizo => !jugador.hechizos.includes(hechizo.id)
    );

    // Verificar si ya se aprendieron todos los hechizos
    if (hechizosNoAprendidos.length === 0) {
        return `_El jugador ${jugador.nombre} ya ha aprendido todos los hechizos disponibles._`;
    }

    let hechizoElegido;

    // Si se proporciona un ID, buscar el hechizo correspondiente
    if (id !== undefined) {
        hechizoElegido = hechizosNoAprendidos.find(hechizo => hechizo.id === id);

        if (!hechizoElegido) {
            return `_¡Ya conoces este hechizo o el ID proporcionado no es válido! El pergamino es inservible para ti._`;
        }
    } else {
        hechizoElegido = hechizosNoAprendidos[
            Math.floor(Math.random() * hechizosNoAprendidos.length)
        ];
    }

    // Agregar el hechizo aprendido a la lista del jugador
    jugador.hechizos.push(hechizoElegido.id);

    return {
        mensaje: `_*El jugador ${jugador.nombre} ha aprendido un nuevo hechizo: ${hechizoElegido.nombre}*_\n\n_*Descripción:*_\n _${hechizoElegido.descripcion}_`,
        hechizo: hechizoElegido,
    };
}

function lanzarHechizo(hechizo, atacante, objetivo) {
    try{
    console.log("la criatura que se pasa en lanzarHechizos es:", objetivo);
    console.log("El atacante en lanzarHechizos: ", atacante);
    console.log("El hechizo en lanzarHechizos:", hechizo);
    
    if(!hechizo.id || !atacante.estadisticas.vida || !objetivo.estadisticas.vida){
        console.log("Hubo un error al ejecutar la función de lanzar hechizos.");
    }

    const stats = objetivo.estadisticas;
    console.log("hechizo recibido: ", hechizo);

    let dañoTotal = 0;
    let mensajeCompleto = '';
    const efectosAplicados = [];

    if (isNaN(objetivo.estadisticas.vida)) {
        throw new Error('La propiedad "vida" del objetivo no es válida.');
    }
    console.log("Punto de control despues de revisar la vida.");

    atacante.estadisticas.mana -= hechizo.costo; 

    if (hechizo.dañoBase) {
        dañoTotal = hechizo.dañoBase + Math.floor(atacante.estadisticas.magia / 10); 
        objetivo.estadisticas.vida = Math.max(objetivo.estadisticas.vida - dañoTotal, 0);
    }

    if(isNaN(dañoTotal)){
        dañoTotal = 0;
        console.log("Daño total ahora vale 0.");
    }

    if (hechizo.efectos && hechizo.efectos.length > 0) {
        hechizo.efectos.forEach(efecto => {
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
    }

    if(hechizo.Especial.length > 0){
    mensajeCompleto = handleEspeciales(hechizo, objetivo, atacante) || '';
    }

    console.log("Punto de control despues de ejecutar las funciones especiales.");

    const derrotado = stats.vida <= 0;

    console.log("Efectos aplicados antes de retornar en lanzarHechizo: ", efectosAplicados);

    return {
        dañoTotal,
        efectosAplicados: efectosAplicados,
        vidaRestante: stats.vida,
        derrotado,
        mensaje: mensajeCompleto,
        costo: hechizo.costo,
        huida: objetivo.huida
    };
    }catch(error){
        console.error("Error al lanzar hechizo: ", error, error.stack);
        return{
            dañoTotal: 0,
            efectosAplicados: [],
            vidaRestante: objetivo.estadisticas.vida,
            derrotado: false,
            mensaje: '',
            costo: 0,
            huida: objetivo.huida
        }
    }}

module.exports = { aprenderHechizo, cargarHechizos, lanzarHechizo };
