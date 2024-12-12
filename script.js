// Asegúrate de que el archivo tatwas.js esté cargado antes que este archivo.

// Función para obtener la hora del amanecer en Bogotá
async function getSunrise() {
    const response = await fetch('https://api.sunrise-sunset.org/json?lat=4.611-1&lng=-74.08175&formatted=0');
    const data = await response.json();
    //const sunrise = new Date(data.results.sunrise);
    const sunrise = new Date(data.results.civil_twilight_begin);
    return sunrise;
}

async function initializeTatwas() {
    const sunrise = await getSunrise();
    const sunriseHour = sunrise.getUTCHours() - 5; // Ajustar a la hora de Bogotá (UTC-5)
    const sunriseMinute = sunrise.getUTCMinutes(); // Obtener los minutos de la hora de amanecer

    const tatwaTimes = [];

    // Generar los horarios cada 24 minutos a partir de la hora de amanecer
    let totalTatwasToGenerate = 24 * 60 / 24; // Total de Tatwas en un día (24 horas / 24 minutos por Tatwa)
    
    // Calcular el tiempo de inicio en minutos desde la medianoche
    let startTimeInMinutes = sunriseHour * 60 + sunriseMinute;

    for (let i = 0; i < totalTatwasToGenerate; i++) {
        const currentTimeInMinutes = startTimeInMinutes + (i * 24); // Sumar 24 minutos por cada Tatwa
        const hour = Math.floor(currentTimeInMinutes / 60) % 24; // Obtener la hora
        const minute = currentTimeInMinutes % 60; // Obtener los minutos

        const formattedHour = String(hour).padStart(2, '0'); // Formatear la hora
        const formattedMinute = String(minute).padStart(2, '0'); // Formatear los minutos
        tatwaTimes.push(`${formattedHour}:${formattedMinute}`);
    }

    const scheduleList = document.getElementById("calendar-timeline");
    scheduleList.innerHTML = '';  // Limpiar la lista antes de agregar nuevos elementos

    // Asegúrate de que se muestren todos los Tatwas
    const totalTatwas = tatwas.length;

    // Obtener la hora actual 
    const now = new Date(); 
    const currentHour = now.getHours(); 
    const currentMinute = now.getMinutes();

    tatwaTimes.forEach((time, index) => {
        const [hour, minute] = time.split(':').map(Number);
    // Solo agregar el artículo si la hora del Tatwa es mayor a la hora actual 
    if (hour > currentHour || (hour >= currentHour-1 && minute > currentMinute)) {

        // Obtener el Tatwa correspondiente para la hora actual
        const tatwaForTime = tatwas[index % totalTatwas];  // Usar el índice para acceder al Tatwa correspondiente
        // Crear el artículo con <h2> (para la hora) y <p> (para el nombre del evento)
        const article = document.createElement('article');

        // Crear el <h2> para la hora
        const title = document.createElement('h2');
        title.textContent = time;  // Asignar la hora correspondiente

        // Crear el <p> para la descripción del evento (nombre del Tatwa)
        const description = document.createElement('p');
        // Usar innerHTML para insertar HTML dinámicamente
        description.innerHTML = `<span id="tatwa-name-text" style="color: ${tatwaForTime.color_hex}; font-size: 50px;">
            ${tatwaForTime.name}    
        </span>`;  // Asignar el nombre del Tatwa con el estilo dinámico

        // Insertar <h2> y <p> en el artículo
        article.appendChild(title);
        article.appendChild(description);

            // Asignar clase de fondo basado en el Tatwa
        switch (tatwaForTime.name) {
            case "Akash":
            article.classList.add("bg-akash");
            break;
            case "Vayu":
            article.classList.add("bg-vayu");
            break;
            case "Agni":
                article.classList.add("bg-agni");
            break;
            case "Jala":
                article.classList.add("bg-jala");
            break;
            case "Prithvi":
                article.classList.add("bg-prithvi");
            break;
            // Otros casos para diferentes Tatwas
        }

        // Agregar el artículo al contenedor del calendario
        scheduleList.appendChild(article);  
    }
});

    console.log(scheduleList);
}

// Función para calcular el Tatwa actual y el siguiente Tatwa basado en la hora de la primera luz
function getCurrentTatwa(time, firstLightTime) {
    // Hora actual en minutos desde la medianoche
    const currentMinutes = time.getHours() * 60 + time.getMinutes();

    // Hora de la primera luz en minutos desde la medianoche
    const firstLightMinutes = firstLightTime.getHours() * 60 + firstLightTime.getMinutes();

    // Tiempo transcurrido desde la primera luz
    const elapsedMinutes = currentMinutes - firstLightMinutes;

    // Manejar casos en los que la hora actual sea antes de la primera luz
    if (elapsedMinutes < 0) {
        return { message: "Los Tatwas aún no han comenzado" }; // Puede devolver un mensaje o un objeto vacío
    }

    const tatwaDuration = 24; // Cada Tatwa dura 24 minutos

    // Índice del Tatwa actual
    let currentTatwaIndex = Math.floor(elapsedMinutes / tatwaDuration) % tatwas.length;

    // Calcular el índice del siguiente Tatwa
    let nextTatwaIndex = (currentTatwaIndex + 1) % tatwas.length;

    // Calcular las horas de inicio y fin del Tatwa actual
    const currentTatwaStartMinutes = firstLightMinutes + Math.floor(elapsedMinutes / tatwaDuration) * tatwaDuration;
    const currentTatwaEndMinutes = currentTatwaStartMinutes + tatwaDuration;

    // Calcular las horas de inicio y fin del siguiente Tatwa
    const nextTatwaStartMinutes = currentTatwaEndMinutes;
    const nextTatwaEndMinutes = nextTatwaStartMinutes + tatwaDuration;

    // Convertir minutos a formato de hora para el Tatwa actual
    const currentStartTime = new Date(time.getFullYear(), time.getMonth(), time.getDate(), Math.floor(currentTatwaStartMinutes / 60), currentTatwaStartMinutes % 60);
    const currentEndTime = new Date(time.getFullYear(), time.getMonth(), time.getDate(), Math.floor(currentTatwaEndMinutes / 60), currentTatwaEndMinutes % 60);

    // Convertir minutos a formato de hora para el siguiente Tatwa
    const nextStartTime = new Date(time.getFullYear(), time.getMonth(), time.getDate(), Math.floor(nextTatwaStartMinutes / 60), nextTatwaStartMinutes % 60);
    const nextEndTime = new Date(time.getFullYear(), time.getMonth(), time.getDate(), Math.floor(nextTatwaEndMinutes / 60), nextTatwaEndMinutes % 60);

    return {
        actualTatwa: {
            tatwa: tatwas[currentTatwaIndex],
            start: currentStartTime,
            end: currentEndTime
        },
        nextTatwa: {
            tatwa: tatwas[nextTatwaIndex],
            start: nextStartTime,
            end: nextEndTime
        }
    };
}





function getNextTatwa(currentTime, firstLightTime) {
    // Convertir la primera luz y la hora actual a minutos desde la medianoche
    const firstLightMinutes = firstLightTime.getHours() * 60 + firstLightTime.getMinutes();
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

    const tatwaDuration = 24; // Cada Tatwa dura 24 minutos

    // Calcular los minutos transcurridos desde la primera luz del día
    const minutesSinceFirstLight = (currentMinutes - firstLightMinutes + 1440) % 1440; // Asegurarse de que no haya valores negativos

    // Calcular el índice del siguiente Tatwa
    const nextTatwaIndex = Math.floor((minutesSinceFirstLight + tatwaDuration) / tatwaDuration) % tatwas.length;

    return tatwas[nextTatwaIndex];
}



// Función para mostrar el Tatwa Actual
async function displayCurrentTatwa() {
    const currentTime = new Date();
    const sunrise = await getSunrise();
    const { actualTatwa, nextTatwa } = getCurrentTatwa(currentTime, sunrise);
    currentTatwa = actualTatwa.tatwa;
    start = actualTatwa.start;
    end = actualTatwa.end;
    

    // Actualizar el nombre del Tatwa con el color y el icono
    const tatwaNameElement = document.getElementById("tatwa-name");
    tatwaNameElement.innerHTML = `
        <span id="tatwa-icon" style="color: ${currentTatwa.color_hex}; font-size: 50px; margin-right: 10px;">
            ${currentTatwa.icon}
        </span>
        <span id="tatwa-name-text" style="color: ${currentTatwa.color_hex}; font-size: 50px;">
            ${currentTatwa.name}    
        </span>
    `;

    const tatwaNameHTML = `
    <span id="tatwa-name-text" style="font-size: 2em; font-weight: bold; color: ${currentTatwa.color_hex}; font-size: 30px;">
        ${currentTatwa.name}
    </span>
    `;

    // Formatea las horas a un formato legible
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    const startFormatted = start.toLocaleTimeString('es-CO', options);
    const endFormatted = end.toLocaleTimeString('es-CO', options);

    // Actualiza el contenido del elemento
    // Actualiza el contenido del elemento sliderContent
    const sliderContent = document.getElementById("sliderContent");
    sliderContent.innerHTML = `
        Tatwa regente en este momento: ${tatwaNameHTML} <br> 
            <span style="font-size: 0.8em; font-style: italic; color: #666;">
                Horario: ${startFormatted} - ${endFormatted}
            </span>`;

    // Mostrar la descripción del Tatwa actual
    document.getElementById("tatwa-description").innerText = currentTatwa.description;

    // Mostrar el color en texto si es necesario (opcional)
    document.getElementById("tatwa-color").innerText = currentTatwa.color;

    // Mostrar el código hexadecimal del color (opcional)
    document.getElementById("tatwa-color_hex").innerText = currentTatwa.color_hex;

    // Actualizar el ícono directamente en caso de necesitarse por separado (opcional)
    document.getElementById("tatwa-icon").innerText = currentTatwa.icon;

    // Mostrar el siguiente Tatwa
    //const nextTatwa = getNextTatwa(currentTime, sunrise);
    //document.getElementById("next-tatwa").innerText = nextTatwa.name;
    //console.log(nextTatwa);

    // Seleccionar el elemento de la imagen
    const tatwaImageElement = document.getElementById("tatwa-image");

    // Establecer la ruta de la imagen basada en el nombre del Tatwa
    tatwaImageElement.src = `Assets/tatwa-${currentTatwa.name}.jpeg`;

    // Llamar a otras funciones adicionales (acciones recomendadas, horarios, etc.)
    // displayTatwaSchedule(currentTime);
    displayTatwaActions(currentTatwa);

    // Generar la línea de tiempo
    generateTatwaTimeline(currentTime, start, end);
}

// Función para mostrar el Tatwa Siguiente
async function displayNextTatwa() {
    const currentTime = new Date();
    const sunrise = await getSunrise();
    const { actualTatwa, nextTatwa } = getCurrentTatwa(currentTime, sunrise);
    currentTatwa = nextTatwa.tatwa;
    start = nextTatwa.start;
    end = nextTatwa.end;
    

    // Actualizar el nombre del Tatwa con el color y el icono
    const tatwaNameElement = document.getElementById("tatwa-name");
    tatwaNameElement.innerHTML = `
        <span id="tatwa-icon" style="color: ${currentTatwa.color_hex}; font-size: 50px; margin-right: 10px;">
            ${currentTatwa.icon}
        </span>
        <span id="tatwa-name-text" style="color: ${currentTatwa.color_hex}; font-size: 50px;">
            ${currentTatwa.name}    
        </span>
    `;

    const tatwaNameHTML = `
    <span id="tatwa-name-text" style="font-size: 2em; font-weight: bold; color: ${currentTatwa.color_hex}; font-size: 30px;">
        ${currentTatwa.name}
    </span>
    `;

    // Formatea las horas a un formato legible
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    const startFormatted = start.toLocaleTimeString('es-CO', options);
    const endFormatted = end.toLocaleTimeString('es-CO', options);

    // Actualiza el contenido del elemento
    // Actualiza el contenido del elemento sliderContent
    const sliderContent = document.getElementById("sliderContent");
    sliderContent.innerHTML = `
        Siguiente Tatwa regente: ${tatwaNameHTML} <br> 
            <span style="font-size: 0.8em; font-style: italic; color: #666;">
                Horario desde las: ${startFormatted} - ${endFormatted}
            </span>`;

    // Mostrar la descripción del Tatwa actual
    document.getElementById("tatwa-description").innerText = currentTatwa.description;

    // Mostrar el color en texto si es necesario (opcional)
    document.getElementById("tatwa-color").innerText = currentTatwa.color;

    // Mostrar el código hexadecimal del color (opcional)
    document.getElementById("tatwa-color_hex").innerText = currentTatwa.color_hex;

    // Actualizar el ícono directamente en caso de necesitarse por separado (opcional)
    document.getElementById("tatwa-icon").innerText = currentTatwa.icon;

    // Mostrar el siguiente Tatwa
    //const nextTatwa = getNextTatwa(currentTime, sunrise);
    //document.getElementById("next-tatwa").innerText = nextTatwa.name;
    //console.log(nextTatwa);

    // Seleccionar el elemento de la imagen
    const tatwaImageElement = document.getElementById("tatwa-image");

    // Establecer la ruta de la imagen basada en el nombre del Tatwa
    tatwaImageElement.src = `Assets/tatwa-${currentTatwa.name}.jpeg`;

    // Llamar a otras funciones adicionales (acciones recomendadas, horarios, etc.)
    // displayTatwaSchedule(currentTime);
    displayTatwaActions(currentTatwa);

    // Generar la línea de tiempo
    generateTatwaTimeline(currentTime, start, end);
}

// Función para generar la línea de tiempo con subtatwas
function generateTatwaTimeline(currentTime, startTatwaTime, endTatwaTime) {
    const subtatwas_order = ["akash","vayu","agni","jala","prithvi"];
    const tatwaDuration = (endTatwaTime - startTatwaTime) / 60000; // Duración en minutos
    const subTatwaCount = 5; // Número de subtatwas (5)
    const subTatwaDuration = tatwaDuration / subTatwaCount; // Duración de cada subtatwa en minutos

    // Calcular los minutos transcurridos desde el inicio del Tatwa actual
    const elapsedMinutes = (currentTime - startTatwaTime) / 60000;

    // Obtener el índice del subtatwa actual
    const subTatwaIndex = Math.floor(elapsedMinutes / subTatwaDuration);

    const timelineElement = document.getElementById("tatwa-timeline");

    // Limpiar la línea de tiempo antes de agregar nuevos segmentos
    timelineElement.innerHTML = "";

    // Crear los 5 segmentos para la línea de tiempo
    for (let i = 0; i < subTatwaCount; i++) {
        const segment = document.createElement("div");
        segment.classList.add("timeline-segment");

        // Calcular la posición del subtatwa
        const startOfSegment = startTatwaTime.getTime() + (subTatwaDuration * i * 60000);
        const endOfSegment = startTatwaTime.getTime() + (subTatwaDuration * (i + 1) * 60000);

        // Marcar el subtatwa activo
        if (i === subTatwaIndex) {
            segment.classList.add("active");
        }

        // Añadir el nombre del subtatwa al segmento
        const label = document.createElement("span");
        label.textContent = `Subtatwa ${subtatwas_order[i]} (${formatTime(startOfSegment)} - ${formatTime(endOfSegment)})`;
        segment.appendChild(label);

        // Añadir el segmento a la línea de tiempo
        timelineElement.appendChild(segment);
    }
}

// Función para formatear el tiempo
function formatTime(timeInMillis) {
    const date = new Date(timeInMillis);
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    return date.toLocaleTimeString('es-CO', options);
}

// Mostrar acciones recomendadas y no recomendadas
function displayTatwaActions(currentTatwa) {
    const actionsList = document.getElementById("tatwa-actions");
    actionsList.innerHTML = ''; // Limpiar la lista antes de agregar nuevos elementos

    // Mostrar las acciones recomendadas directamente
    if (typeof currentTatwa.actions === 'string') {
        const li = document.createElement("li");
        li.innerText = currentTatwa.actions; // Agregar el texto de la acción
        actionsList.appendChild(li);
    } else {
        // Si no hay acciones, mostrar un mensaje
        actionsList.innerHTML = '<li>No hay acciones recomendadas.</li>';
    }

    const notRecommendedList = document.getElementById("not-recommended-actions");
    notRecommendedList.innerHTML = ''; // Limpiar la lista antes de agregar nuevos elementos

    // Mostrar las acciones no recomendadas directamente
    if (typeof currentTatwa.notRecommended === 'string') {
        const li = document.createElement("li");
        li.innerText = currentTatwa.notRecommended; // Agregar el texto de la acción no recomendada
        notRecommendedList.appendChild(li);
    } else {
        // Si no hay acciones no recomendadas, mostrar un mensaje
        notRecommendedList.innerHTML = '<li>No hay acciones no recomendadas.</li>';
    }
}

//------------------------WIDGET----------------------------



// script.js

document.addEventListener("DOMContentLoaded", () => {
    // Coordenadas de Bogotá, Colombia
    const latitude = 4.7110;
    const longitude = -74.0721;

    // Endpoint de Sunrise-Sunset.org API
    const apiUrl = `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`;

    // Obtener datos de la API
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.status === "OK") {
                // Extraer y convertir las horas relevantes
                const sunriseUTC = new Date(data.results.sunrise);
                const sunsetUTC = new Date(data.results.sunset);
                const firstLightUTC = new Date(data.results.civil_twilight_begin);
                const lastLightUTC = new Date(data.results.civil_twilight_end);

                // Formatear a hora legible
                const options = { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Bogota' };
                const sunriseFormatted = sunriseUTC.toLocaleTimeString('es-CO', options);
                const sunsetFormatted = sunsetUTC.toLocaleTimeString('es-CO', options);
                const firstLightFormatted = firstLightUTC.toLocaleTimeString('es-CO', options);
                const lastLightFormatted = lastLightUTC.toLocaleTimeString('es-CO', options);

                // Mostrar resultados en el widget
                document.getElementById("sunrise").textContent = sunriseFormatted;
                document.getElementById("sunset").textContent = sunsetFormatted;
                document.getElementById("first-light").textContent = firstLightFormatted;
                document.getElementById("last-light").textContent = lastLightFormatted;
            } else {
                console.error("Error al obtener datos del API.");
            }
        })
        .catch(error => console.error("Error de conexión:", error));
});

//--------------------SLIDER-------------------------


document.addEventListener('DOMContentLoaded', () => {
    const sliderContent = document.getElementById('sliderContent');
    const nextButton = document.getElementById('nextButton');
    const prevButton = document.getElementById('prevButton');

    if (!sliderContent || !nextButton || !prevButton) {
        console.error("Elementos no encontrados. Verifica los IDs en el HTML.");
        return;
    }

    let currentIndex = 0;
    const texts = ["", ""];

    const updateSlider = () => {
        sliderContent.style.opacity = 0; // Desvanece el texto

        setTimeout(() => {
            sliderContent.innerText = texts[currentIndex]; // Cambia el texto
            sliderContent.style.opacity = 1; // Vuelve a mostrar el texto
            if (currentIndex === 0) {
                displayCurrentTatwa();
            }
            else {
                displayNextTatwa()
            }
        }, 500); // Espera 500ms antes de cambiar el texto
    };

    nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % texts.length; // Cambia entre 0 y 1
        updateSlider();
    });

    prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + texts.length) % texts.length; // Cambia entre 0 y 1
        updateSlider();
    });
});

//----------------------onload------------------------
// Inicializar la aplicación al cargar
window.onload = function() {
    initializeTatwas();
    displayCurrentTatwa();
};