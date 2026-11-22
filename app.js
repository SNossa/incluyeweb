/**
 * IncluyeWeb — Controlador de navegación SPA accesible (WCAG 2.2 AAA)
 * Autor: Samuel Eduardo Nossa Ramirez | UNAD
 */

(function () {
  'use strict';

  const SCENES = {
    'escena-1': {
      indicator: 'Inicio',
      title: 'IncluyeWeb | Inicio — Guía Multimedia de Accesibilidad Digital',
      headingId: 'escena-1-titulo',
      showHomeButton: false,
    },
    'escena-2': {
      indicator: 'Módulo 1 de 3',
      title: 'IncluyeWeb | Módulo 1 de 3: Color y Contraste',
      headingId: 'escena-2-titulo',
      showHomeButton: true,
    },
    'escena-3': {
      indicator: 'Módulo 2 de 3',
      title: 'IncluyeWeb | Módulo 2 de 3: Tipografía y Alt-Text',
      headingId: 'escena-3-titulo',
      showHomeButton: true,
    },
    'escena-4': {
      indicator: 'Módulo 3 de 3',
      title: 'IncluyeWeb | Módulo 3 de 3: Subtítulos y Navegación',
      headingId: 'escena-4-titulo',
      showHomeButton: true,
    },
    'escena-5': {
      indicator: 'Cierre',
      title: 'IncluyeWeb | Cierre: Checklist de 10 Puntos',
      headingId: 'escena-5-titulo',
      showHomeButton: true,
    },
  };

  let currentSceneId = 'escena-1';

  const sceneElements = document.querySelectorAll('.scene');
  const indicatorEl = document.getElementById('scene-indicator');
  const homeButtonEl = document.getElementById('btn-home');

  // Controles de la Escena 2: Comparador Antes/Después y Simulador de Daltonismo
  const contrastToggleButtons = document.querySelectorAll('[data-contrast-mode]');
  const contrastDemoCardEl = document.getElementById('contrast-demo-card');
  const contrastDemoIconEl = document.getElementById('contrast-demo-icon');
  const contrastDemoLabelEl = document.getElementById('contrast-demo-label');
  const contrastDiagnosticEl = document.getElementById('contrast-diagnostic');
  const contrastDiagnosticTextEl = document.getElementById('contrast-diagnostic-text');

  const cvdRadios = document.querySelectorAll('input[name="cvd-mode"]');
  const cvdPreviewContainerEl = document.getElementById('cvd-preview-container');
  const cvdStatusEl = document.getElementById('cvd-status');

  // Controles de la Escena 3: Taller práctico de Alt-Text
  const altTextRadios = document.querySelectorAll('input[name="alttext-quiz"]');
  const altTextFeedbackEl = document.getElementById('alttext-feedback');
  const altTextFeedbackTitleEl = document.getElementById('alttext-feedback-title');
  const altTextFeedbackBodyEl = document.getElementById('alttext-feedback-body');

  // Controles de la Escena 4: Simulador de video accesible y transcripción
  const videoToggleBtn = document.getElementById('btn-toggle-video');
  const voiceToggleBtn = document.getElementById('btn-toggle-voice');
  const videoPlayStateEl = document.getElementById('video-play-state');
  const videoSlideTitleEl = document.getElementById('video-slide-title');
  const videoSlideSubEl = document.getElementById('video-slide-sub');
  const videoCaptionsEl = document.getElementById('video-captions');
  const videoTimeDisplayEl = document.getElementById('video-time-display');
  const videoProgressBarEl = document.getElementById('video-progressbar');
  const videoProgressFillEl = document.getElementById('video-progress-fill');

  const transcriptToggleBtn = document.getElementById('btn-toggle-transcript');
  const transcriptPanelEl = document.getElementById('transcript-panel');

  // Controles de la Escena 5: Checklist interactivo de 10 puntos
  const checklistInputs = document.querySelectorAll('.checklist-input');
  const checklistCounterEl = document.getElementById('checklist-counter');
  const checklistProgressBarEl = document.getElementById('checklist-progressbar');
  const checklistProgressFillEl = document.getElementById('checklist-progress-fill');
  const checklistCongratsEl = document.getElementById('checklist-congrats');
  const checklistResetBtn = document.getElementById('btn-reset-checklist');

  const VIDEO_DURATION_SEC = 15;
  const VIDEO_CUES = [
    {
      start: 0,
      end: 5,
      slideTitle: 'Bloque 1: Introducción audiovisual',
      slideSub: 'Contexto inicial de la cápsula educativa (0 a 5 segundos).',
      caption: '[Música suave de introducción] Bienvenida a esta cápsula sobre accesibilidad en video educativo.',
    },
    {
      start: 5,
      end: 10,
      slideTitle: 'Bloque 2: Subtítulos sincronizados',
      slideSub: 'Beneficio para personas sordas y entornos sin sonido (5 a 10 segundos).',
      caption: 'Los subtítulos sincronizados benefician a personas sordas y a quienes ven contenidos sin audio.',
    },
    {
      start: 10,
      end: 15.01,
      slideTitle: 'Bloque 3: Transcripción completa',
      slideSub: 'Cierre y cumplimiento del criterio WCAG 1.2.2 (10 a 15 segundos).',
      caption: '[Sonido de confirmación] Acompañar el clip con transcripción completa garantiza acceso universal según WCAG 1.2.2.',
    },
  ];

  let videoElapsedSec = 0;
  let videoIsPlaying = false;
  let videoTimerId = null;
  let lastCaptionIndex = -1;
  let voiceNarrationEnabled = true;

  const CHECKLIST_STORAGE_KEY = 'incluyeweb_checklist_v1';

  const ALTTEXT_FEEDBACK = {
    A: {
      correct: false,
      title: 'Opción A incorrecta: solo expone el nombre del archivo',
      body: 'Leer "grafico_estadistico_final.png" no aporta ningún dato real del gráfico. Cuando falta un alt-text significativo, el lector de pantalla suele anunciar el nombre técnico del archivo, dejando a la persona sin información útil.',
    },
    B: {
      correct: false,
      title: 'Opción B insuficiente: describe colores sin comunicar el dato',
      body: 'Decir "Imagen de unas barras amarillas y azules" introduce palabras redundantes ("Imagen de") y solo describe la apariencia estética, pero omite los porcentajes exactos (78% móvil y 22% computador) que dan sentido al gráfico.',
    },
    C: {
      correct: true,
      title: 'Opción C correcta: comunica el dato esencial sin redundancias',
      body: 'Excelente elección. Indica brevemente el tipo de recurso ("Gráfico de barras") y transmite con precisión los valores clave (78% móvil y 22% computador) para que cualquier persona reciba la misma información de forma clara.',
    },
  };

  /**
   * Actualiza el comparador interactivo "Antes (Inaccesible)" vs. "Después (Accesible)".
   * @param {'before'|'after'} mode
   */
  function setContrastMode(mode) {
    const isAccessible = mode === 'after';

    contrastToggleButtons.forEach((button) => {
      const isCurrent = button.getAttribute('data-contrast-mode') === mode;
      button.setAttribute('aria-pressed', String(isCurrent));
      button.classList.toggle('is-active', isCurrent);
    });

    if (contrastDemoCardEl) {
      contrastDemoCardEl.classList.toggle('contrast-demo-card--before', !isAccessible);
      contrastDemoCardEl.classList.toggle('contrast-demo-card--after', isAccessible);
    }

    if (contrastDemoIconEl) {
      contrastDemoIconEl.hidden = !isAccessible;
    }

    if (contrastDemoLabelEl) {
      contrastDemoLabelEl.hidden = !isAccessible;
    }

    if (contrastDiagnosticEl) {
      contrastDiagnosticEl.classList.toggle('diagnostic-panel--fail', !isAccessible);
      contrastDiagnosticEl.classList.toggle('diagnostic-panel--pass', isAccessible);
    }

    if (contrastDiagnosticTextEl) {
      contrastDiagnosticTextEl.textContent = isAccessible
        ? 'Ratio actual: 17.9:1 — Cumple WCAG AAA (alto contraste + redundancia visual)'
        : 'Ratio actual: 2.1:1 — No cumple WCAG (baja legibilidad y dependencia exclusiva del color)';
    }
  }

  /**
   * Aplica o retira el filtro SVG de deuteranopía sobre el contenedor de ejemplo.
   * @param {'normal'|'deuteranopia'} mode
   */
  function setVisionMode(mode) {
    const isDeuteranopia = mode === 'deuteranopia';

    if (cvdPreviewContainerEl) {
      cvdPreviewContainerEl.classList.toggle('is-deuteranopia', isDeuteranopia);
    }

    if (cvdStatusEl) {
      cvdStatusEl.textContent = isDeuteranopia
        ? 'Filtro actual: Deuteranopía simulada (los tonos rojo y verde tienden a confundirse).'
        : 'Filtro actual: Visión normal (sin alteración cromática).';
    }
  }

  /**
   * Muestra retroalimentación pedagógica inmediata para el taller de Alt-Text.
   * @param {'A'|'B'|'C'} optionKey
   */
  function updateAltTextFeedback(optionKey) {
    const feedback = ALTTEXT_FEEDBACK[optionKey];
    if (!feedback || !altTextFeedbackEl) {
      return;
    }

    altTextFeedbackEl.classList.toggle('alttext-feedback--correct', feedback.correct);
    altTextFeedbackEl.classList.toggle('alttext-feedback--incorrect', !feedback.correct);

    if (altTextFeedbackTitleEl) {
      altTextFeedbackTitleEl.textContent = feedback.title;
    }

    if (altTextFeedbackBodyEl) {
      altTextFeedbackBodyEl.textContent = feedback.body;
    }
  }

  /**
   * Formatea segundos enteros en formato MM:SS.
   * @param {number} seconds
   * @returns {string}
   */
  function formatTimeMMSS(seconds) {
    const clamped = Math.max(0, Math.min(VIDEO_DURATION_SEC, Math.floor(seconds)));
    const padded = String(clamped).padStart(2, '0');
    return `00:${padded}`;
  }

  /**
   * Detiene de inmediato cualquier narración de voz sintetizada en curso.
   */
  function stopSpeechNarration() {
    if ('speechSynthesis' in window && typeof window.speechSynthesis.cancel === 'function') {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Limpia acotaciones entre corchetes y pronuncia un bloque de subtítulos en español.
   * @param {string} captionText
   */
  function speakCueText(captionText) {
    if (
      !voiceNarrationEnabled ||
      !('speechSynthesis' in window) ||
      typeof SpeechSynthesisUtterance === 'undefined'
    ) {
      return;
    }

    const spokenText = captionText.replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();
    if (!spokenText) {
      return;
    }

    stopSpeechNarration();

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Alterna el estado de la narración de voz sintetizada opcional.
   */
  function toggleVoiceNarration() {
    voiceNarrationEnabled = !voiceNarrationEnabled;

    if (voiceToggleBtn) {
      voiceToggleBtn.setAttribute('aria-pressed', String(voiceNarrationEnabled));
      voiceToggleBtn.textContent = voiceNarrationEnabled
        ? 'Voz narrada: Activada'
        : 'Voz narrada: Desactivada';
    }

    if (!voiceNarrationEnabled) {
      stopSpeechNarration();
    }
  }

  /**
   * Actualiza barra de progreso, reloj y subtítulos sincronizados del reproductor simulado.
   */
  function renderVideoState() {
    const percent = Math.min(100, (videoElapsedSec / VIDEO_DURATION_SEC) * 100);
    const wholeSeconds = Math.floor(videoElapsedSec);

    if (videoProgressFillEl) {
      videoProgressFillEl.style.width = `${percent.toFixed(1)}%`;
    }

    if (videoProgressBarEl) {
      videoProgressBarEl.setAttribute('aria-valuenow', String(wholeSeconds));
      videoProgressBarEl.setAttribute('aria-valuetext', `${wholeSeconds} de ${VIDEO_DURATION_SEC} segundos`);
    }

    if (videoTimeDisplayEl) {
      videoTimeDisplayEl.textContent = `${formatTimeMMSS(videoElapsedSec)} / 00:${VIDEO_DURATION_SEC}`;
    }

    if (videoPlayStateEl) {
      videoPlayStateEl.textContent = videoIsPlaying ? 'Reproduciendo' : (videoElapsedSec >= VIDEO_DURATION_SEC ? 'Finalizado' : 'En pausa');
      videoPlayStateEl.classList.toggle('is-playing', videoIsPlaying);
    }

    if (videoToggleBtn) {
      videoToggleBtn.setAttribute('aria-pressed', String(videoIsPlaying));
    }

    const cueIndex = VIDEO_CUES.findIndex(
      (cue) => videoElapsedSec >= cue.start && videoElapsedSec < cue.end
    );

    if (cueIndex !== -1 && cueIndex !== lastCaptionIndex && (videoIsPlaying || videoElapsedSec > 0)) {
      const cue = VIDEO_CUES[cueIndex];
      lastCaptionIndex = cueIndex;

      if (videoSlideTitleEl) {
        videoSlideTitleEl.textContent = cue.slideTitle;
      }
      if (videoSlideSubEl) {
        videoSlideSubEl.textContent = cue.slideSub;
      }
      if (videoCaptionsEl) {
        videoCaptionsEl.textContent = cue.caption;
      }

      if (videoIsPlaying) {
        speakCueText(cue.caption);
      }
    }
  }

  /**
   * Detiene el temporizador de reproducción del reproductor simulado.
   */
  function pauseVideoSimulation() {
    videoIsPlaying = false;
    if (videoTimerId !== null) {
      window.clearInterval(videoTimerId);
      videoTimerId = null;
    }
    stopSpeechNarration();
    renderVideoState();
  }

  /**
   * Alterna entre reproducir y pausar la cápsula simulada de 15 segundos.
   */
  function toggleVideoSimulation() {
    if (videoIsPlaying) {
      pauseVideoSimulation();
      return;
    }

    if (videoElapsedSec >= VIDEO_DURATION_SEC) {
      videoElapsedSec = 0;
      lastCaptionIndex = -1;
    }

    videoIsPlaying = true;
    renderVideoState();

    videoTimerId = window.setInterval(() => {
      videoElapsedSec = Math.min(VIDEO_DURATION_SEC, videoElapsedSec + 0.1);
      if (videoElapsedSec >= VIDEO_DURATION_SEC) {
        pauseVideoSimulation();
        return;
      }
      renderVideoState();
    }, 100);
  }

  /**
   * Despliega o contrae el panel de transcripción completa mediante clic explícito.
   */
  function toggleTranscriptPanel() {
    if (!transcriptToggleBtn || !transcriptPanelEl) {
      return;
    }

    const isExpanded = transcriptToggleBtn.getAttribute('aria-expanded') === 'true';
    const nextExpanded = !isExpanded;

    transcriptToggleBtn.setAttribute('aria-expanded', String(nextExpanded));
    transcriptToggleBtn.textContent = nextExpanded
      ? 'Ocultar transcripción completa'
      : 'Leer transcripción completa';
    transcriptPanelEl.hidden = !nextExpanded;
  }

  /**
   * Actualiza el contador, la barra de progreso y el mensaje de felicitación del checklist.
   */
  function updateChecklistProgress() {
    const total = checklistInputs.length;
    if (total === 0) {
      return;
    }

    let checkedCount = 0;
    checklistInputs.forEach((input) => {
      if (input.checked) {
        checkedCount += 1;
      }
    });

    const percent = Math.round((checkedCount / total) * 100);

    if (checklistCounterEl) {
      checklistCounterEl.textContent = `${checkedCount} de ${total} criterios verificados - ${percent}%`;
    }

    if (checklistProgressFillEl) {
      checklistProgressFillEl.style.width = `${percent}%`;
    }

    if (checklistProgressBarEl) {
      checklistProgressBarEl.setAttribute('aria-valuenow', String(checkedCount));
      checklistProgressBarEl.setAttribute(
        'aria-valuetext',
        `${checkedCount} de ${total} criterios verificados, ${percent} por ciento`
      );
    }

    if (checklistCongratsEl) {
      checklistCongratsEl.hidden = checkedCount < total;
    }
  }

  /**
   * Guarda en localStorage los IDs de las casillas marcadas en el checklist.
   */
  function saveChecklistState() {
    const checkedIds = [];
    checklistInputs.forEach((input) => {
      if (input.checked && input.id) {
        checkedIds.push(input.id);
      }
    });

    try {
      window.localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checkedIds));
    } catch (error) {
      // Modo privado estricto o almacenamiento bloqueado: se omite persistencia sin fallar
    }
  }

  /**
   * Restaura desde localStorage las casillas marcadas previamente.
   */
  function restoreChecklistState() {
    try {
      const raw = window.localStorage.getItem(CHECKLIST_STORAGE_KEY);
      if (!raw) {
        return;
      }

      const savedIds = JSON.parse(raw);
      if (!Array.isArray(savedIds)) {
        return;
      }

      checklistInputs.forEach((input) => {
        input.checked = savedIds.includes(input.id);
      });
    } catch (error) {
      // Modo privado estricto o JSON inválido: se mantiene estado inicial limpio
    }
  }

  /**
   * Reinicia las 10 casillas de verificación del checklist y limpia localStorage.
   */
  function resetChecklist() {
    checklistInputs.forEach((input) => {
      input.checked = false;
    });

    try {
      window.localStorage.removeItem(CHECKLIST_STORAGE_KEY);
    } catch (error) {
      // Ignorar bloqueo de almacenamiento en modo privado
    }

    updateChecklistProgress();
  }

  /**
   * Obtiene el identificador de escena válido a partir de window.location.hash.
   * @returns {string|null}
   */
  function getSceneIdFromHash() {
    const rawHash = window.location.hash ? window.location.hash.slice(1) : '';
    return Object.prototype.hasOwnProperty.call(SCENES, rawHash) ? rawHash : null;
  }

  /**
   * Activa una escena por su ID, actualiza atributos ARIA, foco, barra superior y hash.
   * @param {string} targetId - Identificador de la sección destino (escena-1 a escena-5).
   * @param {Object} [options]
   * @param {boolean} [options.moveFocus=true] - Si debe mover el foco al encabezado de la nueva escena.
   * @param {boolean} [options.updateHash=true] - Si debe sincronizar window.location.hash.
   */
  function navigateToScene(targetId, options) {
    const config = SCENES[targetId];
    if (!config) {
      return;
    }

    const shouldMoveFocus = !options || options.moveFocus !== false;
    const shouldUpdateHash = !options || options.updateHash !== false;

    if (currentSceneId === 'escena-4' && targetId !== 'escena-4') {
      if (videoIsPlaying) {
        pauseVideoSimulation();
      } else {
        stopSpeechNarration();
      }
    }

    currentSceneId = targetId;

    sceneElements.forEach((section) => {
      const isTarget = section.id === targetId;
      section.classList.toggle('is-active', isTarget);
      section.setAttribute('aria-hidden', String(!isTarget));
      section.hidden = !isTarget;
    });

    if (indicatorEl) {
      indicatorEl.textContent = config.indicator;
    }

    if (homeButtonEl) {
      homeButtonEl.hidden = !config.showHomeButton;
    }

    document.title = config.title;

    if (shouldUpdateHash && window.location.hash !== `#${targetId}`) {
      window.location.hash = `#${targetId}`;
    }

    window.scrollTo({ top: 0, behavior: 'auto' });

    if (shouldMoveFocus) {
      const heading = document.getElementById(config.headingId);
      if (heading) {
        heading.focus({ preventScroll: true });
      }
    }
  }

  /**
   * Sincroniza la escena activa cuando el usuario navega con Atrás/Adelante del navegador.
   */
  function handleHashChange() {
    const targetId = getSceneIdFromHash() || 'escena-1';
    if (targetId === currentSceneId) {
      return;
    }

    navigateToScene(targetId, { moveFocus: true, updateHash: false });
  }

  /**
   * Delega clics en cualquier control con atributo data-target.
   * @param {MouseEvent} event
   */
  function handleNavigationClick(event) {
    const trigger = event.target.closest('[data-target]');
    if (!trigger) {
      return;
    }

    const targetId = trigger.getAttribute('data-target');
    if (targetId && targetId !== currentSceneId) {
      navigateToScene(targetId, { moveFocus: true });
    }
  }

  /**
   * Inicializa la aplicación restaurando el checklist, estado inicial y escena del hash.
   */
  function init() {
    document.addEventListener('click', handleNavigationClick);
    window.addEventListener('hashchange', handleHashChange);

    contrastToggleButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const mode = button.getAttribute('data-contrast-mode');
        if (mode === 'before' || mode === 'after') {
          setContrastMode(mode);
        }
      });
    });

    cvdRadios.forEach((radio) => {
      radio.addEventListener('change', (event) => {
        setVisionMode(event.target.value);
      });
    });

    altTextRadios.forEach((radio) => {
      radio.addEventListener('change', (event) => {
        updateAltTextFeedback(event.target.value);
      });
    });

    if (videoToggleBtn) {
      videoToggleBtn.addEventListener('click', toggleVideoSimulation);
    }

    if (voiceToggleBtn) {
      voiceToggleBtn.addEventListener('click', toggleVoiceNarration);
    }

    if (transcriptToggleBtn) {
      transcriptToggleBtn.addEventListener('click', toggleTranscriptPanel);
    }

    checklistInputs.forEach((input) => {
      input.addEventListener('change', () => {
        saveChecklistState();
        updateChecklistProgress();
      });
    });

    if (checklistResetBtn) {
      checklistResetBtn.addEventListener('click', resetChecklist);
    }

    restoreChecklistState();
    updateChecklistProgress();
    renderVideoState();
    setContrastMode('before');
    setVisionMode('normal');

    const initialSceneId = getSceneIdFromHash() || 'escena-1';
    navigateToScene(initialSceneId, { moveFocus: false, updateHash: false });
  }

  init();
})();
