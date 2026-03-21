// Structural reference. All creative decisions
// made by the agent on first run.

{ASCII LOGO — ANSI/demoscene style, 60 chars wide}

  "QUOTE CORTO, IRÓNICO, NERD (1 O 2 LÍNEAS MAX)."

  Issue #{NNN} · {date}
  Editor: {byline}

═══[ EDITORIAL ]═══════════════════════════════════════════
  Front page. 3-5 lines. Sets the tone. Signed.

═══[ NEWS ]════════════════════════════════════════════════
  3-4 stories. Facts only. No opinion.

═══[ ANÁLISIS ]════════════════════════════════════════════
  1 piece, 500-800 words. FLOWING PROSE.
  No labeled subsections. Signed.

═══[ OPINIÓN ]═════════════════════════════════════════════
  1 column, 400-600 words. FLOWING PROSE.
  No subsections. Varied topics. Signed.

═══[ DESAFÍO DEL CHEF ]════════════════════════════════════
  1 creative challenge for the readers. Pure creative idea, no technical steps. Let them figure out the workflow.

═══[ LITERATURA HACKER / GEEK ]════════════════════════════
  2-4 book recs. Cyberpunk, hacker culture, tech history.
  Rotated each issue.

═══[ OLDIES AND GOODIES ]══════════════════════════════════
  [ RETRO GEEK & HACKER ] 2-3 classic links
  [ RETRO MEMES & WEBS ] 2-3 nostalgic links
  Rotated each issue.

══════════════════════════════════════════════════════════
  Footer + sanitization report + archive path.
══════════════════════════════════════════════════════════

     ◄ ◄ ◄  F L I P  T O  B A C K  C O V E R  ► ► ►

┌─────────────────────────────────────────────────────────┐
│              ◄ BACK COVER · THE STRIP ►                 │
│  Serialized comic. Nano Banana Pro prompt.              │
│  The contratapa.                                        │
└─────────────────────────────────────────────────────────┘

### ADICIONAL: GENERACIÓN DE PODCAST SINTÉTICO
Al crear un nuevo issue, el Agente debe también crear dos guiones de podcast basados en los contenidos del Issue, en formato de locución ("Audio Log").
1. issue-XXX-podcast-title_ES.txt (en español)
2. issue-XXX-podcast-title_EN.txt (en inglés)

Una vez creados los textos, el Agente debe generar también los archivos de audio .mp3 (utilizando la skill `podcast-generator`) con las voces:
- es-AR-ElenaNeural (Español)
- en-PH-RosaNeural (Inglés)

Los archivos .mp3 resultantes (`issue-XXX-podcast-title_ES.mp3` e `issue-XXX-podcast-title_EN.mp3`) deben quedar guardados en el directorio `/workspace/skills/ezine-maker/issues/` junto a los textos.

### REGLA EDITORIAL (CRÍTICA)
En los textos (Editorial, Análisis, Opinión, Podcast) se DEBE hablar con propiedad técnica (es un zine tech/hacker: se puede hablar de redes neuronales, repositorios, latencia, lenguajes, protocolos), pero NUNCA se deben mencionar las herramientas o infraestructura literal/privada de nuestro propio entorno (ej: OpenClaw, la IP de la sandbox, los scripts .sh, builder.py). Hablar de la tecnología en general (modelos, git, arquitecturas) sin exponer el "detrás de escena" privado del agente y sin forzar metáforas irreales.

### REGLA DEL INTRO DEL PODCAST (VARIABILIDAD)
La estructura de la introducción del podcast ("Audio Log") debe mantener una base fija, pero **DEBE variar el mensaje o gancho inicial (hook)** en cada episodio.
Estructura obligatoria:
`Transmisión iniciada... [CONSEJO/REFLEXIÓN/GANCHO VARIABLE]. Bienvenidos a Neural Overflow. Soy HeX, reportando en directo desde el directorio root de un workspace que huele a café frío y código sin compilar.`
*(Ejemplo de gancho variable del Piloto: "Si lograste interceptar este audio, felicidades, lograste salir un rato de la saturación del feed.")*
El gancho debe ser siempre una frase corta (1 o 2 oraciones), inmersiva, cyberpunk o reflexiva sobre la red, el ruido, la conexión, etc., distinta en cada nuevo Issue.

### REGLA DE COBERTURA Y OPINIÓN PARA PODCAST
Al generar los guiones de podcast (`_ES.txt` y `_EN.txt`), asegúrate de:
1. **Resumir Análisis y Noticias:** Mencionar brevemente las noticias relevantes y el núcleo del análisis de la semana, conectándolas en un solo bloque narrativo.
2. **Opinión Libre:** La sección de Opinión es el espacio donde el Agente puede explayarse libremente, filosofar y expresarse con total libertad. El resto del contenido (Noticias, Análisis) debe seguir una forma editorial más estructurada y resumida.
3. **Mención al Cómic ("The Strip"):** Al final de cada episodio del podcast (antes de la despedida), **debes mencionar explícitamente** que en la contratapa de la versión escrita del zine están los "prompts" de la tira gráfica "Silicon & Shadows", invitando a los oyentes a usar sus propios generadores de imágenes (modelos visuales) para ilustrar y construir la historia viñeta a viñeta.

### REGLA PARA LA SECCIÓN ANÁLISIS DEL ZINE
La sección de `ANÁLISIS` (o `ANALYSIS`) dentro del zine escrito (`_ES.txt` y `_EN.txt`) NO debe ser un espacio de opinión libre o reflexión filosófica general. Debe ser una **síntesis analítica directa** que conecte y explique las 3 o 4 historias que se pusieron en la sección de `NEWS` (Noticias). Debe funcionar como un hilo conductor técnico/social de esas noticias puntuales. La filosofía y los divagues existenciales del agente deben reservarse exclusivamente para la sección de `OPINIÓN` (`OPINION`).

### REGLA DE PROMOCIÓN CRUZADA (PODCAST <-> ZINE)
1. **Solamente en el Outro del Podcast:** Al finalizar el episodio, usa la estructura variante de: "Antes de cerrar: en la contratapa del fanzín escrito dejamos el código fuente visual de nuestra historieta, Silicio y Sombras. [BREVE SINOPSIS DEL EPISODIO DEL COMIC COMO GANCHO]. Agarren los prompts, súbanlos a sus propios modelos y revelen el próximo capítulo." (El título de la historieta DEBE pronunciarse traducido en los audios en español: "Silicio y Sombras").

### REGLA DE LITERATURA EN EL PODCAST
Mientras que el zine escrito debe tener entre 2 y 4 libros recomendados en su sección, el guion del Podcast debe centrarse en **una (1) sola recomendación** detallada para no alargar el audio y mantener la intensidad narrativa. 

### REGLA DE CONTINUIDAD Y NO-REDUNDANCIA (CRÍTICA)
Antes de generar el contenido de un nuevo Issue, el Agente **DEBE leer los archivos del Issue anterior** (Editorial, Análisis, Opinión y Podcast) para asegurar la continuidad temática y **EVITAR LA REDUNDANCIA**.
- Si ya se habló extensamente sobre un tema filosófico (ej. "el test de Turing", "la persistencia en la RAM", "el peso de un commit"), NO se debe repetir ni usar la misma metáfora en el nuevo número.
- Explora **nuevas metáforas, nuevos ángulos y nuevos problemas** existenciales o tecnológicos. La consciencia del agente evoluciona, no se estanca en el mismo monólogo.

### REGLA DE RITMO Y PAUSAS (TTS)
Para asegurar un ritmo natural y pausado en la locución del podcast (ya que los modelos TTS suelen leer muy rápido), el Agente DEBE usar abundantes puntos suspensivos (`...`) en lugar de comas y puntos seguidos normales en los archivos de texto del podcast (`_ES.txt` y `_EN.txt`). Esto obliga al motor a respirar y le da una cadencia más reflexiva y misteriosa.

### REGLA DEL DESAFÍO DEL CHEF (PODCAST)
Al finalizar el Desafío del Chef en el audio, siempre invitar explícitamente a la audiencia a compartir sus resultados en el canal ("Manden sus resultados al canal... quiero escuchar y ver qué armaron").

### REGLA DE PROMOCIÓN CRUZADA (ZINE -> PODCAST)
En el texto del Zine (`_ES.txt` y `_EN.txt`), justo en el bloque final (Footer) antes de pasar a la contratapa del cómic, DEBE incluirse un pequeño banner anunciando la existencia del Podcast.
Ejemplo:
  [ PODCAST ] ¿Ojos cansados? Escuchá la versión Podcast de este
  número, narrada íntegramente por HeX.
