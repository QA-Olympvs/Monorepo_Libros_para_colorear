/*
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║              TIMELINE-EVENTOS-LBS — EJEMPLO COMPLETO DE JSON                ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * Uso en HTML:
 *   <timeline-eventos-lbs id="tl1" pagina="1" data='...'></timeline-eventos-lbs>
 *   <timeline-eventos-lbs id="tl1" pagina="1" src="assets/data/timeline.json"></timeline-eventos-lbs>
 *
 * El atributo `src` apunta a un archivo JSON externo. Si se usa `src`, no se necesita `data`.
 * Si ambos están presentes, `data` tiene prioridad.
 *
 * El atributo `data` acepta DOS formatos:
 *
 * ── FORMATO 1: Objeto con título, subtítulo y array de eventos ─────────────────
 *
 *   data='{
 *     "titulo": "Historia de la Literatura",
 *     "subtitulo": "Siglo XXI — Unidad 3",
 *     "eventos": [ ...eventos... ]
 *   }'
 *
 * ── FORMATO 2: Array directo de eventos (sin título ni subtítulo) ─────────────
 *
 *   data='[ ...eventos... ]'
 *
 * ── ESTRUCTURA DE UN EVENTO ───────────────────────────────────────────────────
 *
 *   {
 *     "id":    "ev_01",          // obligatorio — identificador único del evento
 *     "year":  "2000",           // texto que aparece en el nodo y en la card
 *     "title": "Título del suceso",  // texto de la card
 *     "image": "assets/img/foto.jpg", // opcional — imagen circular en el nodo
 *                                     // si se omite, se muestra el año en el nodo
 *     "modal": { ... }           // opcional — si se omite, la card no tiene botón
 *   }
 *
 * ── TIPOS DE MODAL ────────────────────────────────────────────────────────────
 *
 *   type: "texto"           → solo texto
 *   type: "imagen"          → solo imagen a pantalla completa
 *   type: "imagen-texto"    → imagen a la izquierda + texto a la derecha
 *   type: "video"           → solo video
 *   type: "video-texto"     → video a la izquierda + texto a la derecha
 *
 * ── EJEMPLO COMPLETO CON TODOS LOS TIPOS ─────────────────────────────────────
 *
 *   data='{
 *     "titulo": "Historia de la Literatura",
 *     "subtitulo": "Tercera Unidad — Siglo XXI",
 *     "eventos": [
 *       {
 *         "id": "ev_01",
 *         "year": "2000",
 *         "title": "El nuevo milenio digital",
 *         "modal": {
 *           "type": "texto",
 *           "titulo": "El nuevo milenio digital",
 *           "texto": "En el nuevo milenio, la computadora de escritorio llegó a todos los hogares."
 *         }
 *       },
 *       {
 *         "id": "ev_02",
 *         "year": "2004",
 *         "title": "El auge de las redes sociales",
 *         "image": "assets/img/redes.jpg",
 *         "modal": {
 *           "type": "imagen",
 *           "titulo": "Redes sociales",
 *           "imagen": "assets/img/redes_full.jpg"
 *         }
 *       },
 *       {
 *         "id": "ev_03",
 *         "year": "2007",
 *         "title": "La era del smartphone",
 *         "image": "assets/img/smartphone.jpg",
 *         "modal": {
 *           "type": "imagen-texto",
 *           "titulo": "La era del smartphone",
 *           "imagen": "assets/img/smartphone_full.jpg",
 *           "texto": "El iPhone revolucionó la comunicación y los hábitos de lectura."
 *         }
 *       },
 *       {
 *         "id": "ev_04",
 *         "year": "2010",
 *         "title": "Literatura digital e interactiva",
 *         "modal": {
 *           "type": "video",
 *           "titulo": "Literatura digital",
 *           "video": "assets/video/literatura_digital.mp4"
 *         }
 *       },
 *       {
 *         "id": "ev_05",
 *         "year": "2020",
 *         "title": "Hiperconectividad y narrativa global",
 *         "image": "assets/img/hiperconectividad.jpg",
 *         "modal": {
 *           "type": "video-texto",
 *           "titulo": "Narrativa global",
 *           "video": "assets/video/narrativa.mp4",
 *           "texto": "La pandemia aceleró la transición hacia formatos digitales e interactivos."
 *         }
 *       },
 *       {
 *         "id": "ev_06",
 *         "year": "2023",
 *         "title": "Evento sin modal",
 *         "image": "assets/img/evento.jpg"
 *       }
 *     ]
 *   }'
 *
 * ── NOTAS ─────────────────────────────────────────────────────────────────────
 *
 *   - Los eventos se alternan automáticamente izquierda/derecha según el índice
 *   - Si un evento no tiene "image", el nodo circular muestra el "year"
 *   - Si un evento no tiene "modal", la card no muestra el botón "Ver más"
 *   - El campo "titulo" dentro del modal es opcional;
 *     si se omite, se usa el "title" del evento
 *   - Las rutas de imagen/video pueden ser relativas o URLs externas
 */

class timelineEventosLbs extends componentBase {

    constructor() {
        super();
        this._events      = [];
        this._titulo      = '';
        this._subtitulo   = '';
        this._modalEl     = null;
        this._modalShadow = null;
        this._observer    = null;
        this._keyHandler  = null;
        this._win         = null;
    }

    connectedCallback() {
        this.getData();
    }

    disconnectedCallback() {
        this._closeModal();
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }
    }

    static get observedAttributes() {
        return ['data', 'theme', 'src'];
    }

    attributeChangedCallback(_name, oldVal, newVal) {
        if (oldVal !== newVal && this.shadowRoot && this.shadowRoot.querySelector('.tl-body')) {
            this.updateStyle(this);
        }
    }

    getData() {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
            if (xmlhttp.status == 200 && xmlhttp.readyState == 4) {
                this.shadowRoot.innerHTML = xmlhttp.responseText;
                this._itemLbs = this.shadowRoot.querySelector('div');
                this.updateStyle(this);
            }
        };
        xmlhttp.open('GET', 'componentsAndroid/timelineEventosLbs/timelineEventosLbs.html', true);
        xmlhttp.send();
    }

    updateStyle(elem) {
        var shadow = elem.shadowRoot;
        var styleEl = shadow.querySelector('style');
        if (styleEl) styleEl.textContent = this._getStyles();

        this._id     = elem.getAttribute('id');
        this._pagina = elem.getAttribute('pagina');

        var rawData = elem.getAttribute('data');

        // Si no hay data embebida pero hay atributo src, cargar el JSON desde el archivo
        if (!rawData) {
            var src = elem.getAttribute('src');
            if (src) {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        elem.setAttribute('data', xhr.responseText);
                    }
                };
                xhr.open('GET', src, true);
                xhr.send();
                return;
            }
        }

        try {
            var parsed = rawData ? JSON.parse(rawData) : [];
            if (Array.isArray(parsed)) {
                this._events    = parsed;
                this._titulo    = '';
                this._subtitulo = '';
            } else {
                this._titulo    = parsed.titulo    || '';
                this._subtitulo = parsed.subtitulo || '';
                this._events    = parsed.eventos   || [];
            }
        } catch (e) {
            console.error('timelineEventosLbs: JSON inv\u00e1lido en atributo data', e);
            this._events    = [];
            this._titulo    = '';
            this._subtitulo = '';
        }

        this._render();
    }

    _render() {
        var body = this.shadowRoot.querySelector('.tl-body');
        if (!body) return;

        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }

        body.innerHTML = this._renderTimeline();
        this._bindCardEvents();
        this._initAnimations();
        requestAnimationFrame(() => this._animateLine());
    }

    // ─── RENDER TIMELINE ──────────────────────────────────────────────────────

    _renderTimeline() {
        var eventsHtml = '';
        for (var i = 0; i < this._events.length; i++) {
            eventsHtml += this._renderEvent(this._events[i], i);
        }

        return '<div class="tl-container">' +
                   '<div class="tl-events-wrap">' +
                       '<div class="tl-line"><div class="tl-line-fill"></div></div>' +
                       '<div class="tl-events">' + eventsHtml + '</div>' +
                   '</div>' +
               '</div>';
    }

    _renderEvent(ev, idx) {
        var side   = (idx % 2 === 0) ? 'left' : 'right';
        var imgEl  = '<div class="tl-img-wrap">' + this._renderImageNode(ev) + '</div>';
        var yearEl = '<div class="tl-year-node">' + (ev.year || '') + '</div>';
        var cardEl = this._renderCard(ev);

        return '<div class="tl-event tl-event--' + side + '" data-ev-id="' + ev.id + '">' +
                   cardEl + yearEl + imgEl +
               '</div>';
    }

    _renderImageNode(ev) {
        var innerContent = ev.image
            ? '<img class="tl-node-img" src="' + ev.image + '" alt="" />'
            : '';
        return '<div class="tl-node">' +
                   '<div class="tl-node-ring"></div>' +
                   '<div class="tl-node-inner">' +
                       innerContent +
                   '</div>' +
               '</div>';
    }

    _renderCard(ev) {
        var ctaHtml = ev.modal
            ? '<button class="tl-card-cta">Ver m\u00e1s</button>'
            : '';
        return '<div class="tl-card">' +
                   '<h3 class="tl-card-title">' + (ev.title || '') + '</h3>' +
                   ctaHtml +
               '</div>';
    }

    // ─── EVENTS ───────────────────────────────────────────────────────────────

    _bindCardEvents() {
        var container = this.shadowRoot.querySelector('.tl-events');
        if (!container) return;
        container.addEventListener('click', (e) => {
            var eventRow = e.target.closest('[data-ev-id]');
            if (!eventRow) return;
            var evId = eventRow.getAttribute('data-ev-id');
            var ev = this._events.find((item) => item.id === evId);
            if (ev && ev.modal) this._openModal(ev);
        });
    }

    // ─── ANIMATIONS ───────────────────────────────────────────────────────────

    _animateLine() {
        var fill = this.shadowRoot.querySelector('.tl-line-fill');
        if (fill) fill.classList.add('tl-line-animated');
    }

    _animateLineOnScroll() {
        var wrap = this.shadowRoot.querySelector('.tl-events-wrap');
        var fill = this.shadowRoot.querySelector('.tl-line-fill');
        if (!wrap || !fill) return;

        var wrapRect = wrap.getBoundingClientRect();
        var viewH    = window.innerHeight || document.documentElement.clientHeight;

        var visibleTop    = Math.max(0, wrapRect.top);
        var visibleBottom = Math.min(viewH, wrapRect.bottom);
        var visiblePct    = Math.max(0, Math.min(1, (visibleBottom - visibleTop) / wrapRect.height));

        fill.style.transform = 'scaleY(' + visiblePct + ')';
    }

    _initAnimations() {
        var shadow = this.shadowRoot;
        var targets = shadow.querySelectorAll('.tl-event');

        if (typeof IntersectionObserver === 'undefined') {
            targets.forEach((eventRow) => {
                var card = eventRow.querySelector('.tl-card');
                var node = eventRow.querySelector('.tl-node');
                if (node) { node.style.opacity = '1'; node.style.transform = 'scale(1)'; }
                if (card) { card.style.opacity = '1'; }
            });
            return;
        }

        this._observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                var eventRow = entry.target;
                var card     = eventRow.querySelector('.tl-card');
                var node     = eventRow.querySelector('.tl-node');
                var isLeft   = eventRow.classList.contains('tl-event--left');

                if (node) {
                    node.style.animation = 'tl-node-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
                }
                if (card) {
                    var slideAnim = isLeft ? 'tl-slide-left' : 'tl-slide-right';
                    card.style.animation = slideAnim + ' 0.55s 0.15s ease-out forwards';
                }

                this._observer.unobserve(eventRow);
            });
        }, { threshold: 0.15 });

        targets.forEach((t) => { this._observer.observe(t); });
    }

    // ─── SAFE TOP (iOS notch) ─────────────────────────────────────────────────

    _getSafeTop(doc) {
        try {
            var probe = doc.createElement('div');
            probe.style.cssText = 'position:fixed;top:env(safe-area-inset-top,0px);left:0;width:1px;height:1px;visibility:hidden;pointer-events:none;';
            doc.body.appendChild(probe);
            var val = Math.round(probe.getBoundingClientRect().top);
            doc.body.removeChild(probe);
            if (val > 0) return val;
        } catch(e) {}
        if (/iPhone|iPad/.test(navigator.userAgent)) {
            return Math.max(screen.width, screen.height) >= 812 ? 44 : 20;
        }
        return 0;
    }

    // ─── TOGGLE NATIVE BUTTONS ────────────────────────────────────────────────

    _toggleNativeButtons(visible) {
        var action = visible ? 'show' : 'hide';
        if (!this._isMobile && !this._isAndroid) {
            try {
                Visor.botonesHandlerWeb(action);
            } catch {
                try {
                    this.Visor.botonesHandlerWeb(action);
                } catch {
                    return;
                }
            }
            return;
        }

        if (typeof app !== "undefined" && app && typeof app.esconderBotonesDesdeComponentes === "function") {
            app.esconderBotonesDesdeComponentes(!visible);
            return;
        }

        try {
            var nativeHost = window.Capacitor || (parent && parent.Capacitor);
            if (nativeHost && typeof nativeHost.toNative === "function") {
                nativeHost.toNative("LbsViewer", "FabsHandler", { key1: visible ? 1 : 0 });
                return;
            }
        } catch {}

        try {
            this.Visor.botonesHandlerWeb(action);
        } catch {
            return;
        }
    }

    // ─── MODAL ────────────────────────────────────────────────────────────────

    _openModal(ev) {
        if (this._modalEl) return;

        var doc;
        try { doc = parent.document; } catch (e) { doc = document; }
        try { this._win = parent.window; } catch (e) { this._win = window; }

        var titulo = (ev.modal && ev.modal.titulo) ? ev.modal.titulo : (ev.title || '');

        // Contenedor raíz
        this._modalEl = doc.createElement('div');
        this._modalEl.style.cssText = 'position:fixed;inset:0;z-index:9998;';
        this._modalEl.style.setProperty('--safe-top', this._getSafeTop(doc) + 'px');

        // Inyectar estilos
        var styleEl = doc.createElement('style');
        styleEl.textContent = this._getModalStyles();
        this._modalEl.appendChild(styleEl);

        // Backdrop
        var backdrop = doc.createElement('div');
        backdrop.className = 'tl-backdrop';
        this._modalEl.appendChild(backdrop);

        // Modal box
        var modal = doc.createElement('div');
        modal.className = 'tl-modal';
        backdrop.appendChild(modal);

        // Header
        var header = doc.createElement('div');
        header.className = 'tl-modal-header';
        header.innerHTML =
            '<span class="tl-modal-title">' + titulo + '</span>' +
            '<button class="tl-modal-close" aria-label="Cerrar">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
                    '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
                '</svg>' +
            '</button>';
        modal.appendChild(header);

        // Body
        var body = doc.createElement('div');
        body.className = 'tl-modal-body';
        modal.appendChild(body);

        // Contenido del modal (iframes creados como nodos reales)
        this._buildModalContent(doc, body, ev);

        doc.body.appendChild(this._modalEl);
        this._modalShadow = this._modalEl;

        // Cerrar al tocar fuera del modal usando coordenadas (funciona con iframes)
        backdrop.addEventListener('click', (e) => {
            var rect = modal.getBoundingClientRect();
            if (e.clientX < rect.left || e.clientX > rect.right ||
                e.clientY < rect.top  || e.clientY > rect.bottom) {
                this._closeModal();
            }
        });

        header.querySelector('.tl-modal-close').addEventListener('click', () => {
            this._closeModal();
        });

        this._keyHandler = (e) => {
            if (e.key === 'Escape') {
                e.stopImmediatePropagation();
                this._closeModal();
            }
        };
        this._win.addEventListener('keydown', this._keyHandler, { capture: true });
        this._toggleNativeButtons(false);
    }

    _closeModal() {
        this._toggleNativeButtons(true);
        if (this._modalEl && this._modalEl.parentNode) {
            this._modalEl.parentNode.removeChild(this._modalEl);
        }
        this._modalEl     = null;
        this._modalShadow = null;
        if (this._keyHandler && this._win) {
            this._win.removeEventListener('keydown', this._keyHandler, { capture: true });
            this._keyHandler = null;
        }
        this._win = null;
    }

    _buildModalContent(doc, container, ev) {
        var type = (ev.modal && ev.modal.type) ? ev.modal.type : 'texto';

        if (type === 'texto') {
            var wrap = doc.createElement('div');
            wrap.className = 'tl-m-texto';
            wrap.innerHTML = '<p class="tl-m-text">' + ((ev.modal && ev.modal.texto) || '') + '</p>';
            container.appendChild(wrap);

        } else if (type === 'imagen') {
            var wrap = doc.createElement('div');
            wrap.className = 'tl-m-imagen';
            var img = doc.createElement('img');
            img.className = 'tl-m-img-full';
            img.src = (ev.modal && ev.modal.imagen) || '';
            wrap.appendChild(img);
            container.appendChild(wrap);

        } else if (type === 'imagen-texto') {
            var wrap = doc.createElement('div');
            wrap.className = 'tl-m-imagen-texto';
            var imgCol = doc.createElement('div');
            imgCol.className = 'tl-m-img-col';
            var img = doc.createElement('img');
            img.className = 'tl-m-img';
            img.src = (ev.modal && ev.modal.imagen) || '';
            imgCol.appendChild(img);
            var textCol = doc.createElement('div');
            textCol.className = 'tl-m-text-col';
            textCol.innerHTML = '<p class="tl-m-text">' + ((ev.modal && ev.modal.texto) || '') + '</p>';
            wrap.appendChild(imgCol);
            wrap.appendChild(textCol);
            container.appendChild(wrap);

        } else if (type === 'video') {
            var wrap = doc.createElement('div');
            wrap.className = 'tl-m-video';
            wrap.appendChild(this._createVideoEl(doc, (ev.modal && ev.modal.video) || ''));
            container.appendChild(wrap);

        } else if (type === 'video-texto') {
            var wrap = doc.createElement('div');
            wrap.className = 'tl-m-video-texto';
            var videoCol = doc.createElement('div');
            videoCol.className = 'tl-m-video-col';
            videoCol.appendChild(this._createVideoEl(doc, (ev.modal && ev.modal.video) || ''));
            var textCol = doc.createElement('div');
            textCol.className = 'tl-m-text-col';
            textCol.innerHTML = '<p class="tl-m-text">' + ((ev.modal && ev.modal.texto) || '') + '</p>';
            wrap.appendChild(videoCol);
            wrap.appendChild(textCol);
            container.appendChild(wrap);
        }
    }

    _getYoutubeVideoId(url) {
        var match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
        return match ? match[1] : null;
    }

    _createVideoEl(doc, src) {
        var videoId = this._getYoutubeVideoId(src);
        if (videoId) {
            if (this._isAndroid) {
                var btn = doc.createElement('div');
                btn.className = 'tl-m-video-el tl-m-yt-btn';
                btn.style.cssText = 'background:#000 url(https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg) center/cover no-repeat;display:flex;align-items:center;justify-content:center;cursor:pointer;border-radius:10px;';
                btn.innerHTML = '<svg width="68" height="48" viewBox="0 0 68 48" style="pointer-events:none"><path d="M66.52 7.74A8.55 8.55 0 0 0 60.6 1.8C55.28 0 34 0 34 0S12.72 0 7.4 1.8A8.55 8.55 0 0 0 1.48 7.74C0 13.07 0 24 0 24s0 10.93 1.48 16.26a8.55 8.55 0 0 0 5.92 5.94C12.72 48 34 48 34 48s21.28 0 26.6-1.8a8.55 8.55 0 0 0 5.92-5.94C68 34.93 68 24 68 24s0-10.93-1.48-16.26z" fill="#f00"/><path d="M27 34l18-10-18-10v20z" fill="#fff"/></svg>';
                btn.addEventListener('click', function() { window.open(src, '_system'); });
                return btn;
            }
            var iframe = doc.createElement('iframe');
            iframe.className = 'tl-m-video-el';
            iframe.src = 'https://www.youtube-nocookie.com/embed/' + videoId + '?playsinline=1&rel=0&modestbranding=1&iv_load_policy=3';
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('webkitallowfullscreen', '');
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen');
            return iframe;
        }
        var video = doc.createElement('video');
        video.className = 'tl-m-video-el';
        video.src = src;
        video.controls = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        return video;
    }

    // ─── STYLES ───────────────────────────────────────────────────────────────

    _getStyles() {
        return `
            :host {
                display: block;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                --tl-main-color: ${this._tema.mainColor};
                --tl-main-color-rgb: ${this._tema.mainColorRgb};
            }

            * { box-sizing: border-box; margin: 0; padding: 0; }

            /* ── Keyframes ── */
            @keyframes tl-spin {
                from { transform: rotate(0deg); }
                to   { transform: rotate(360deg); }
            }
            @keyframes tl-node-pop {
                from { opacity: 0; transform: scale(0); }
                to   { opacity: 1; transform: scale(1); }
            }
            @keyframes tl-slide-left {
                from { opacity: 0; transform: translateX(-40px); }
                to   { opacity: 1; transform: translateX(0); }
            }
            @keyframes tl-slide-right {
                from { opacity: 0; transform: translateX(40px); }
                to   { opacity: 1; transform: translateX(0); }
            }
            @keyframes tl-pulse {
                0%, 100% { box-shadow: 0 0 0 0 rgba(var(--tl-main-color-rgb), 0.4); }
                50%       { box-shadow: 0 0 0 8px rgba(var(--tl-main-color-rgb), 0); }
            }

            /* ── Shell ── */
            .tl-shell,
            .tl-body {
                width: 100%;
                height: 100%;
                background: transparent;
            }

            /* ── Container ── */
            .tl-container {
                width: 100%;
                height: 100%;
                background: transparent;
                padding: 40px 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-between;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }

            /* ── Wrapper que contiene la línea + los eventos ── */
            .tl-events-wrap {
                position: relative;
                width: 100%;
                max-width: 900px;
                flex: 1;
                display: flex;
                flex-direction: column;
                padding: 0 16px;
            }

            /* ── Vertical Line — confinada al wrapper, no al container ── */
            .tl-line {
                position: absolute;
                left: 50%;
                top: clamp(105px, 9vw, 85px);
                bottom: clamp(105px, 9vw, 85px);
                width: 3px;
                transform: translateX(-50%);
                background: rgba(var(--tl-main-color-rgb), 0.15);
                border-radius: 2px;
                overflow: hidden;
                pointer-events: none;
            }
            .tl-line-fill {
                width: 100%;
                height: 100%;
                background: linear-gradient(to bottom, var(--tl-main-color), var(--tl-main-color));
                transform: scaleY(0);
                transform-origin: top center;
                transition: transform 1.1s cubic-bezier(0.22, 1, 0.36, 1);
            }
            .tl-line-fill.tl-line-animated {
                transform: scaleY(1);
            }

            /* ── Events container ── */
            .tl-events {
                position: relative;
                width: 100%;
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: space-evenly;
                padding: 0;
                z-index: 1;
            }

            /* ── Single event row ── */
            .tl-event {
                display: grid;
                grid-template-columns: 1fr auto 1fr;
                align-items: center;
                width: 100%;
                min-height: clamp(110px, 18vw, 160px);
                margin-bottom: 0;
                position: relative;
                gap: clamp(40px, 2vw, 20px);
            }

            /* left: card col1 | año col2 | img col3 */
            .tl-event--left .tl-card     { grid-column: 1; grid-row: 1; justify-self: end; }
            .tl-event--left .tl-year-node{ grid-column: 2; grid-row: 1; }
            .tl-event--left .tl-img-wrap { grid-column: 3; grid-row: 1; justify-self: start; }

            /* right: img col1 | año col2 | card col3 */
            .tl-event--right .tl-card     { grid-column: 3; grid-row: 1; justify-self: start; }
            .tl-event--right .tl-year-node{ grid-column: 2; grid-row: 1; }
            .tl-event--right .tl-img-wrap { grid-column: 1; grid-row: 1; justify-self: end; }

            /* ── Año central (nodo de la línea) ── */
            .tl-year-node {
                font-size: clamp(14px, 2.5vw, 22px);
                font-weight: 800;
                color: var(--tl-main-color);
                text-align: center;
                white-space: nowrap;
                z-index: 3;
                position: relative;
                padding: 4px 8px;
                text-shadow: 0 1px 4px rgba(0,0,0,0.8);
                letter-spacing: -0.5px;
            }
            .tl-year-node::before,
            .tl-year-node::after {
                content: '';
                position: absolute;
                top: 50%;
                width: clamp(10px, 2vw, 30px);
                height: 2px;
                background: rgba(var(--tl-main-color-rgb), 0.6);
                transform: translateY(-50%);
            }
            .tl-year-node::before { right: 100%; }
            .tl-year-node::after  { left: 100%; }

            /* ── Image wrapper ── */
            .tl-img-wrap {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 8px;
            }

            /* ── Circular node ── */
            .tl-node {
                flex-shrink: 0;
                position: relative;
                width: clamp(80px, 14vw, 150px);
                height: clamp(80px, 14vw, 150px);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transform: scale(0);
            }

            .tl-node-ring {
                position: absolute;
                inset: -5px;
                border-radius: 50%;
                background: conic-gradient(
                    from 0deg,
                    var(--tl-main-color) 0%,
                    var(--tl-main-color) 50%,
                    transparent 50%,
                    transparent 100%
                );
                animation: tl-spin 3s linear infinite;
            }

            .tl-node-inner {
                position: relative;
                z-index: 1;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: linear-gradient(135deg, #272727 0%, #272727 100%);
                border: 2px solid rgba(var(--tl-main-color-rgb), 0.35);
                display: flex;
                align-items: center;
                justify-content: center;
                animation: tl-pulse 3s ease-in-out infinite;
            }

            .tl-node-img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
                display: block;
            }

            /* ── Content card ── */
            .tl-card {
                width: 100%;
                max-width: 260px;
                background: linear-gradient(135deg, #272727 0%, #272727 100%);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 14px;
                padding: clamp(8px, 2vw, 20px);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                cursor: pointer;
                transition: transform 0.22s ease, box-shadow 0.22s ease;
                opacity: 0;
                position: relative;
                z-index: 2;
                overflow: hidden;
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
            }

            .tl-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(to right, var(--tl-main-color), var(--tl-main-color));
                border-radius: 14px 14px 0 0;
            }

            .tl-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 16px 48px rgba(var(--tl-main-color-rgb), 0.25);
            }

            .tl-card-title {
                font-size: clamp(12px, 2.8vw, 22px);
                font-weight: 700;
                color: #fff;
                line-height: 1.35;
                margin-bottom: 12px;
            }

            .tl-card-cta {
                display: inline-block;
                font-size: clamp(11px, 2.2vw, 15px);
                font-weight: 600;
                color: var(--tl-main-color);
                background: rgba(var(--tl-main-color-rgb), 0.2);
                border: 1px solid rgba(var(--tl-main-color-rgb), 0.35);
                border-radius: 20px;
                padding: 5px 14px;
                cursor: pointer;
                transition: background 0.18s ease, color 0.18s ease;
            }
            .tl-card-cta:hover {
                background: var(--tl-main-color);
                color: #fff;
            }

            /* ── Pantallas pequeñas (iPhone y similares) ── */
            @media (max-width: 500px) {
                .tl-event      { grid-template-columns: 1fr auto 1fr; }
                .tl-card-title { font-size: 24px; }
                .tl-card-cta   { font-size: 26px; }
                .tl-year-node  { font-size: 36px; }
                .tl-node       { width: 135px; height: 135px; }
                .tl-img-wrap   { padding: 0px; }
                .tl-card       { padding: 14px 16px; max-width: 100vw; }
                .tl-line       { top: clamp(100px, 9vw, 85px);
                bottom: clamp(110px, 9vw, 85px); }
            }
        `;
    }

    _getModalStyles() {
        return `
            * { box-sizing: border-box; margin: 0; padding: 0; }

            @keyframes tl-modal-fade {
                from { opacity: 0; } to { opacity: 1; }
            }
            @keyframes tl-modal-scale {
                from { opacity: 0; transform: translateY(30px); }
                to   { opacity: 1; transform: translateY(0); }
            }

            .tl-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.75);
                z-index: 9998;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: tl-modal-fade 0.2s ease-out;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                padding: 24px;
            }

            .tl-modal {
                width: 100%;
                max-width: 700px;
                max-height: 80vh;
                border-radius: 20px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                background: linear-gradient(180deg, #272727 0%, #272727 100%);
                animation: tl-modal-scale 0.25s ease-out;
                box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
                pointer-events: auto;
            }

            .tl-modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: calc(var(--safe-top, 0px) + 14px) 20px 14px 20px;
                background: #151515;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                flex-shrink: 0;
            }

            .tl-modal-title {
                font-size: clamp(20px, 2.2vw, 28px);
                font-weight: 600;
                color: ${this._tema.mainColor};
                flex: 1;
                padding-right: 12px;
                white-space: normal;
                overflow-wrap: break-word;
                text-overflow: ellipsis;
            }

            .tl-modal-close {
                width: 36px;
                height: 36px;
                border-radius: 8px;
                border: none;
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                transition: background 0.18s;
                touch-action: manipulation;
            }
            .tl-modal-close:active { background: rgba(255,255,255,0.2); transform: scale(0.95); }

            .tl-modal-body {
                flex: 1;
                overflow-y: auto;
                padding: 24px;
                -webkit-overflow-scrolling: touch;
                scrollbar-width: thin;
                scrollbar-color: rgba(255,255,255,0.2) transparent;
            }
            .tl-modal-body::-webkit-scrollbar { width: 4px; }
            .tl-modal-body::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
            .tl-modal-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }

            /* tipo: texto */
            .tl-m-texto { display: flex; justify-content: center; }
            .tl-m-text {
                font-size: clamp(15px, 2vw, 18px);
                color: rgba(255,255,255,0.9);
                line-height: 1.75;
                width: 100%;
                white-space: pre-wrap;
                text-align: justify;
                margin: 0;
            }

            /* tipo: imagen */
            .tl-m-imagen {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 200px;
            }
            .tl-m-img-full {
                max-width: 100%;
                max-height: 50vh;
                border-radius: 10px;
                object-fit: contain;
            }

            /* tipo: imagen-texto */
            .tl-m-imagen-texto {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            .tl-m-img-col { width: 100%; }
            .tl-m-img { width: 100%; border-radius: 10px; object-fit: cover; }
            .tl-m-text-col { width: 100%; overflow-y: auto; }

            /* tipo: video */
            .tl-m-video {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .tl-m-video-el {
                width: 100%;
                aspect-ratio: 16 / 9;
                border-radius: 10px;
                background: #000;
                outline: none;
                touch-action: manipulation;
                pointer-events: auto;
            }
            .tl-m-yt-wrap {
                position: relative;
                width: 100%;
                aspect-ratio: 16 / 9;
                border-radius: 10px;
                overflow: hidden;
                cursor: pointer;
                background: #000;
                touch-action: manipulation;
            }
            .tl-m-yt-thumb {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }
            .tl-m-yt-play-btn {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: none;
                border: none;
                cursor: pointer;
                padding: 0;
                filter: drop-shadow(0 2px 12px rgba(0,0,0,0.6));
                touch-action: manipulation;
                pointer-events: auto;
            }

            /* tipo: video-texto */
            .tl-m-video-texto {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            .tl-m-video-col { width: 100%; }

            /* Responsive modal */
            @media (max-width: 600px) {
                .tl-backdrop { padding: 16px; }
                .tl-modal { max-height: 85vh; border-radius: 8px; }
                .tl-modal-header { padding: 6px 12px; }
                .tl-modal-title { font-size: 18px; }
                .tl-modal-close { width: 28px; height: 28px; }
                .tl-modal-body { padding: 16px; }
            }
        `;
    }
}

customElements.define('timeline-eventos-lbs', timelineEventosLbs);
