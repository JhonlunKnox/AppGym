# AppGym
Proyecto Final Desarrollo Móvil/ Proyecto Capaz de ser monetizado/ Freelance/ Emprendimientoooooo


1. COMO USAR EL REPOSITORIO
Clonar el repositorio:

git clone <url-del-repo>
cd AppGymFinal


Instalar las dependencias:

npm install


o, si usan yarn:

yarn install


👉 Esto descargará automáticamente todo lo que estaba en node_modules/ según tu package.json.

Crear su propio archivo .env en la parte afuera de app:
Tu .env está ignorado, así que él debe crear uno manualmente en la raíz del proyecto:

SUPABASE_URL=tu_url
SUPABASE_ANON_KEY=tu_key



DEFINICIÓN DE ARQUITECTURA, IDEAS Y DEMÁS

FIGMA: https://www.figma.com/design/XywtaUm6Xkr5J4VHy7L9PN/Fitness-App-UI-Kit-for-Gym-Workout-App-Fitness-Tracker-Mobile-App-Gym-Fitness-Mobile-App-UI-Kit--Community-?node-id=3032-2305&t=vmueZapZ2prt22Tm-1


Especificación Técnica Estricta para GymFlow App
Success Criteria (Criterios de Éxito)
El proyecto es exitoso si la aplicación es robusta y completa para la totalidad del proceso de gimnasio del usuario. Otro criterio clave es la automatización de las tareas de registro para garantizar que el proceso no sea percibido como tedioso. La aplicación debe impulsar una alta tasa de adherencia y un uso significativo de la funcionalidad de acompañamiento de IA.
User Stories (Historias de Usuario)
Se debe implementar el trackeo de pesos (series, repeticiones, carga) con funcionalidad de autocompletado inteligente. El sistema debe permitir la creación y planeación de rutinas mensuales programables. Se integrarán recordatorios de mensualidad mediante notificaciones proactivas. La IA proveerá consejos alimentarios personalizados y generará contenido para la parte social y el acompañamiento individual.
Requirements (Requisitos Técnicos)
La arquitectura de datos se basará en Firestore (NoSQL). Se requiere una Base de Datos Supra Base para perfiles, una Base de Datos Ejercicios estática y global, y una Base de Datos Alimentos detallada. Se necesita integrar la API de IA (Gemini API) para la generación de contenido estructurado avanzado. También se requiere una API de Calendario y Recordatorios para manejar las notificaciones push de vencimientos y la planificación de rutinas.
Risks (Riesgos)
El principal riesgo es la pereza del usuario y la alta fricción durante el registro diario de resultados. La mitigación se centra en la máxima automatización posible de las rutinas: autocompletar resultados de la sesión anterior y facilitar el registro con un mínimo de interacciones. Se fomentará el uso de rachas como mecanismo de motivación social.
Constraints (Limitaciones Técnicas)
La limitación clave es la implementación correcta de la IA, que debe garantizar que las sugerencias (ej. de rutina) se adhieran a un esquema JSON estricto para mantener la integridad de la base de datos. El manejo de las bases de datos es un constraint adicional debido a la necesidad de soportar una gran recolección de datos y alto uso, requiriendo una indexación y separación de colecciones optimizada (ej. datos de usuario separados de datos maestros globales).
