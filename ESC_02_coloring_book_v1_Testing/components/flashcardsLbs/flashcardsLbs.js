class flashcardsLbs extends componentBase {

    static get observedAttributes() { return ['src', 'csv', 'modal', 'label']; }

    constructor() {
        super();
        this._cards     = [];
        this._deck      = [];
        this._index     = 0;
        this._correct   = 0;
        this._wrong     = 0;
        this._results   = [];
        this._isFlipped = false;
        this._flipping  = false;
        this._modalEl   = null;
        this._modalShadow = null;
        this._escHandler  = null;
        this._label     = 'Tarjetas de estudio';
        this._src       = null;
        this._csv       = null;
    }

    connectedCallback() {
        this.getData();
    }

    disconnectedCallback() {
        this._closeModal();
    }

    attributeChangedCallback(_name, oldVal, newVal) {
        if (oldVal !== newVal && this.shadowRoot && this.shadowRoot.innerHTML) {
            this.updateStyle(this);
        }
    }

    // ─── Detectar si modo modal ────────────────────────────────────────────────
    get _isModal() {
        return this.hasAttribute('modal');
    }

    // ─── Game root helper ─────────────────────────────────────────────────────
    get _gameRoot() {
        return (this._isModal && this._modalShadow)
            ? this._modalShadow
            : this.shadowRoot;
    }

    // ─── Load HTML template via XHR ──────────────────────────────────────────

    getData() {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200 || xmlhttp.status == 0) {
                    this.shadowRoot.innerHTML = xmlhttp.responseText;
                    this._itemLbs = this.shadowRoot.querySelector('div');
                    this.updateStyle(this);
                } else {
                    console.error('[flashcardsLbs] getData falló, status:', xmlhttp.status);
                }
            }
        };
        xmlhttp.open('GET', 'components/flashcardsLbs/flashcardsLbs.html', true);
        xmlhttp.send();
    }

    updateStyle(elem) {
        const shadow = elem.shadowRoot;
        shadow.querySelector('style').textContent = this._getStyles();

        this._id     = elem.getAttribute('id');
        this._pagina = elem.getAttribute('pagina');
        this._label  = elem.getAttribute('label') || 'Tarjetas de estudio';
        this._src    = elem.getAttribute('src');
        this._csv    = elem.getAttribute('csv');

        this._render();
    }

    _render() {
        var body = this.shadowRoot.querySelector('.fc-body');
        if (!body) return;

        if (this._isModal) {
            body.innerHTML = this._renderPreview();
            body.querySelector('.fc-start-btn').addEventListener('click', () => this._openModal());
        } else {
            body.innerHTML = this._renderGameHTML();
            this._bindEvents();
            this._loadCards();
        }
    }

    // ─── Preview card ─────────────────────────────────────────────────────────

    _renderPreview() {
        var label = this._label;
        var svgIcon = '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'
            + '<rect x="2" y="3" width="20" height="14" rx="2"/>'
            + '<line x1="8" y1="21" x2="16" y2="21"/>'
            + '<line x1="12" y1="17" x2="12" y2="21"/>'
            + '</svg>';

        return '<div class="fc-preview-card">'
            + '<div class="fc-preview-top">'
                + '<div class="fc-preview-icon-wrap">' + svgIcon + '</div>'
                + '<div class="fc-preview-badge">Tarjetas</div>'
            + '</div>'
            + '<div class="fc-preview-body">'
                + '<h2 class="fc-preview-title">' + label + '</h2>'
                + '<p class="fc-preview-desc">Repasa el contenido con tarjetas de estudio interactivas.</p>'
                + '<div class="fc-preview-chips">'
                    + '<span class="fc-chip">'
                        + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/></svg>'
                        + 'Voltear para ver respuesta'
                    + '</span>'
                    + '<span class="fc-chip">'
                        + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
                        + 'Marca tu progreso'
                    + '</span>'
                + '</div>'
            + '</div>'
            + '<button class="fc-start-btn"><span>Comenzar</span></button>'
        + '</div>';
    }

    // ─── Game HTML (markup of screens as JS string) ───────────────────────────

    _renderGameHTML() {
        return '<div class="fc-host">'
            + '<div id="fc-loading" class="fc-screen fc-active">'
                + '<p class="fc-loading-msg" id="fc-loading-msg">Cargando tarjetas...</p>'
            + '</div>'
            + '<div id="fc-game" class="fc-screen">'
                + '<div class="fc-progress-wrap">'
                    + '<span class="fc-progress-text" id="fc-progress-text">Tarjeta 1 de 1</span>'
                    + '<div class="fc-progress-track"><div class="fc-progress-fill" id="fc-progress-fill"></div></div>'
                + '</div>'
                + '<div class="fc-scene" id="fc-scene">'
                    + '<div class="fc-card" id="fc-card">'
                        + '<div class="fc-face fc-face--front">'
                            + '<span class="fc-status-label" id="fc-status-label"></span>'
                            + '<span class="fc-label">Pregunta</span>'
                            + '<p class="fc-text" id="fc-front-text"></p>'
                        + '</div>'
                        + '<div class="fc-face fc-face--back">'
                            + '<span class="fc-label">Respuesta</span>'
                            + '<p class="fc-text" id="fc-back-text"></p>'
                        + '</div>'
                        + '<div class="fc-feedback" id="fc-feedback"></div>'
                    + '</div>'
                + '</div>'
                + '<div class="fc-hint" id="fc-hint">Toca la tarjeta para ver la respuesta</div>'
                + '<div class="fc-nav">'
                    + '<button class="fc-arrow" id="fc-prev">&#8592;</button>'
                    + '<div class="fc-actions">'
                        + '<button class="fc-btn fc-btn--wrong" id="fc-wrong">&#10007; <span class="fc-btn-count" id="fc-count-wrong">0</span></button>'
                        + '<button class="fc-btn fc-btn--correct" id="fc-correct">&#10003; <span class="fc-btn-count" id="fc-count-correct">0</span></button>'
                    + '</div>'
                    + '<button class="fc-arrow" id="fc-next">&#8594;</button>'
                + '</div>'
            + '</div>'
            + '<div id="fc-summary" class="fc-screen">'
                + '<p class="fc-summary-title" id="fc-summary-title">Sesi\u00f3n terminada</p>'
                + '<div class="fc-summary-body">'
                    + '<div id="fc-donut"></div>'
                    + '<div class="fc-summary-stats">'
                        + '<div class="fc-summary-row"><span class="fc-stat-label">Correctas</span><span class="fc-stat-val fc-stat-val--correct" id="fc-stat-correct">0</span></div>'
                        + '<div class="fc-summary-row"><span class="fc-stat-label">Incorrectas</span><span class="fc-stat-val fc-stat-val--wrong" id="fc-stat-wrong">0</span></div>'
                        + '<div class="fc-summary-row"><span class="fc-stat-label">Omitidas</span><span class="fc-stat-val fc-stat-val--skipped" id="fc-stat-skipped">0</span></div>'
                    + '</div>'
                + '</div>'
                + '<div class="fc-summary-actions">'
                    + '<button class="fc-btn fc-btn--secondary" id="fc-restart">Reintentar</button>'
                    + '<button class="fc-btn fc-btn--primary" id="fc-shuffle">Mezclar y reiniciar</button>'
                + '</div>'
            + '</div>'
        + '</div>';
    }

    // ─── Modal header ─────────────────────────────────────────────────────────

    _renderModalHeader() {
        var svgClose = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">'
            + '<line x1="18" y1="6" x2="6" y2="18"/>'
            + '<line x1="6" y1="6" x2="18" y2="18"/>'
            + '</svg>';
        var svgIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="' + this._tema.mainColor + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
            + '<rect x="2" y="3" width="20" height="14" rx="2"/>'
            + '</svg>';
        return '<div class="fc-header-left">'
                + svgIcon
                + '<span class="fc-header-title">' + this._label + '</span>'
            + '</div>'
            + '<button class="fc-close-x" title="Cerrar">' + svgClose + '</button>';
    }

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

    // ─── Modal overlay (Shadow DOM, full-screen) ──────────────────────────────

    _openModal() {
        if (this._modalEl) return;

        var doc;
        try { doc = parent.document; this._win = parent.window; } catch (e) { doc = document; this._win = window; }
        this._modalEl     = doc.createElement('div');
        this._modalShadow = this._modalEl.attachShadow({ mode: 'open' });
        doc.body.appendChild(this._modalEl);
        this._modalEl.style.setProperty('--safe-top', this._getSafeTop(doc) + 'px');

        this._modalShadow.innerHTML =
            '<style>' + this._getModalStyles() + '</style>' +
            '<div class="fc-backdrop">' +
                '<div class="fc-modal">' +
                    '<div class="fc-modal-header">' + this._renderModalHeader() + '</div>' +
                    '<div class="fc-modal-content">' + this._renderGameHTML() + '</div>' +
                '</div>' +
            '</div>';

        this._bindEvents();
        this._loadCards();

        // Cerrar al hacer clic fuera del modal
        var backdrop = this._modalShadow.querySelector('.fc-backdrop');
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) this._closeModal();
        });

        // Botón cerrar del header
        var closeX = this._modalShadow.querySelector('.fc-close-x');
        if (closeX) closeX.addEventListener('click', () => this._closeModal());

        // Cerrar con Escape
        this._escHandler = (e) => {
            if (e.key === 'Escape') {
                e.stopImmediatePropagation();
                e.preventDefault();
                this._closeModal();
            }
        };
        this._win.addEventListener('keydown', this._escHandler, { capture: true });
        this._toggleNativeButtons(false);
    }

    _closeModal() {
        this._toggleNativeButtons(true);
        if (this._escHandler) {
            (this._win || window).removeEventListener('keydown', this._escHandler, { capture: true });
            this._escHandler = null;
            this._win = null;
        }
        if (this._modalEl && this._modalEl.parentNode) {
            this._modalEl.parentNode.removeChild(this._modalEl);
        }
        this._modalEl     = null;
        this._modalShadow = null;
    }

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
        if (typeof app !== 'undefined' && app && typeof app.esconderBotonesDesdeComponentes === 'function') {
            app.esconderBotonesDesdeComponentes(!visible);
            return;
        }
        try {
            var nativeHost = window.Capacitor || (parent && parent.Capacitor);
            if (nativeHost && typeof nativeHost.toNative === 'function') {
                nativeHost.toNative('LbsViewer', 'FabsHandler', { key1: visible ? 1 : 0 });
                return;
            }
        } catch {}
        try {
            this.Visor.botonesHandlerWeb(action);
        } catch {}
    }

    // ─── Events ───────────────────────────────────────────────────────────────

    _bindEvents() {
        const sr = this._gameRoot;
        sr.getElementById('fc-scene')  .addEventListener('click', () => this._flipCard());
        sr.getElementById('fc-correct').addEventListener('click', (e) => { e.stopPropagation(); this._mark('correct'); });
        sr.getElementById('fc-wrong')  .addEventListener('click', (e) => { e.stopPropagation(); this._mark('wrong');   });
        sr.getElementById('fc-prev')   .addEventListener('click', () => this._navigate(-1));
        sr.getElementById('fc-next')   .addEventListener('click', () => this._navigate(1));
        sr.getElementById('fc-restart').addEventListener('click', () => this._startSession(this._cards));
        sr.getElementById('fc-shuffle').addEventListener('click', () => this._startSession(this._shuffle(this._cards)));
    }

    // ─── Data loading ─────────────────────────────────────────────────────────

    _loadCards() {
        this._showScreen('fc-loading');
        this._setLoadingMsg('Cargando tarjetas...', false);

        const inlineCsv = this._csv;
        const srcPath   = this._src;

        if (inlineCsv) {
            this._processRaw(inlineCsv);
        } else if (srcPath) {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = () => {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        this._processRaw(xmlhttp.responseText);
                    } else {
                        this._setLoadingMsg('No se pudo cargar el archivo: HTTP ' + xmlhttp.status, true);
                    }
                }
            };
            xmlhttp.open('GET', srcPath, true);
            xmlhttp.send();
        } else {
            this._setLoadingMsg('Falta el atributo src o csv.', true);
        }
    }

    _processRaw(raw) {
        const cards = this._parseCSV(raw);
        if (cards.length === 0) {
            this._setLoadingMsg('El archivo CSV no contiene tarjetas validas.', true);
            return;
        }

        this._cards = cards;
        this._startSession(cards);
    }

    _setLoadingMsg(msg, isError) {
        const el = this._gameRoot.getElementById('fc-loading-msg');
        if (!el) return;
        el.textContent = msg;
        el.className = 'fc-loading-msg' + (isError ? ' fc-error' : '');
    }

    // ─── CSV Parser ───────────────────────────────────────────────────────────

    _parseCSV(raw) {
        raw = raw.replace(/^\uFEFF/, ''); // strip BOM
        const rows = [];
        let row = [], field = '', inQuotes = false;

        for (let i = 0; i < raw.length; i++) {
            const ch = raw[i];
            if (inQuotes) {
                if (ch === '"') {
                    if (raw[i + 1] === '"') { field += '"'; i++; }
                    else inQuotes = false;
                } else {
                    field += ch;
                }
            } else {
                if (ch === '"') {
                    inQuotes = true;
                } else if (ch === ',') {
                    row.push(field.trim()); field = '';
                } else if (ch === '\n') {
                    row.push(field.trim()); field = '';
                    if (row.some(c => c !== '')) rows.push(row);
                    row = [];
                } else if (ch === '\r') {
                    // skip carriage return
                } else {
                    field += ch;
                }
            }
        }
        if (field !== '' || row.length > 0) {
            row.push(field.trim());
            if (row.some(c => c !== '')) rows.push(row);
        }

        rows.shift(); // skip header row

        return rows
            .filter(r => r.length >= 2 && (r[0] || r[1]))
            .map(r => ({ question: r[0] || '', answer: r[1] || '' }));
    }

    // ─── Session ──────────────────────────────────────────────────────────────

    _startSession(deck) {
        this._deck      = deck;
        this._index     = 0;
        this._correct   = 0;
        this._wrong     = 0;
        this._results   = new Array(deck.length).fill('skipped');
        this._isFlipped = false;
        this._showScreen('fc-game');
        this._updateCounters();
        this._showCard(0);
    }

    _showCard(index) {
        const sr    = this._gameRoot;
        const card  = sr.getElementById('fc-card');
        const scene = sr.getElementById('fc-scene');

        card.classList.remove('is-flipped');
        this._isFlipped = false;
        sr.getElementById('fc-hint').classList.remove('fc-hidden');

        sr.getElementById('fc-front-text').textContent = this._deck[index].question;
        sr.getElementById('fc-back-text').textContent  = this._deck[index].answer;

        const total = this._deck.length;
        sr.getElementById('fc-progress-text').textContent = 'Tarjeta ' + (index + 1) + ' de ' + total;
        sr.getElementById('fc-progress-fill').style.width = (((index + 1) / total) * 100) + '%';

        const result = this._results[index];
        const lbl    = sr.getElementById('fc-status-label');
        if (result === 'correct') {
            lbl.className   = 'fc-status-label fc-status-label--correct';
            lbl.textContent = 'Entendido';
        } else if (result === 'wrong') {
            lbl.className   = 'fc-status-label fc-status-label--wrong';
            lbl.textContent = 'Perdida';
        } else {
            lbl.className   = 'fc-status-label';
            lbl.textContent = '';
        }

        scene.classList.remove('fc-entering');
        void scene.offsetWidth;
        scene.classList.add('fc-entering');
        setTimeout(() => scene.classList.remove('fc-entering'), 350);
    }

    // ─── Flip ─────────────────────────────────────────────────────────────────

    _flipCard() {
        if (this._flipping) return;
        this._flipping = true;
        setTimeout(() => this._flipping = false, 100);

        const sr   = this._gameRoot;
        const card = sr.getElementById('fc-card');
        const hint = sr.getElementById('fc-hint');

        this._isFlipped = !this._isFlipped;
        card.classList.toggle('is-flipped', this._isFlipped);
        hint.classList.toggle('fc-hidden', this._isFlipped);
    }

    // ─── Mark ─────────────────────────────────────────────────────────────────

    _mark(result) {
        if (this._marking) return;
        this._marking = true;

        const prev = this._results[this._index];
        if (prev === 'correct') this._correct--;
        if (prev === 'wrong')   this._wrong--;

        this._results[this._index] = result;
        if (result === 'correct') this._correct++;
        if (result === 'wrong')   this._wrong++;

        this._updateCounters();

        const card      = this._gameRoot.getElementById('fc-card');
        const feedback  = this._gameRoot.getElementById('fc-feedback');
        const swipeClass = result === 'correct' ? 'fc-swipe-right' : 'fc-swipe-left';

        feedback.textContent = result === 'correct' ? '¡Excelente!' : '¡Sigue Intentando!';
        feedback.className   = 'fc-feedback fc-feedback--' + result + ' fc-feedback--visible';
        card.classList.add(swipeClass);

        setTimeout(() => {
            feedback.className   = 'fc-feedback';
            feedback.textContent = '';
            card.classList.remove(swipeClass);
            this._marking = false;
            const next = this._nextForward(this._index + 1);
            if (next === -1) {
                this._showSummary();
            } else {
                this._index = next;
                this._showCard(this._index);
            }
        }, 360);
    }

    _nextForward(from) {
        for (let i = from; i < this._deck.length; i++) {
            if (this._results[i] === 'skipped') return i;
        }
        return -1;
    }

    // ─── Navigate ─────────────────────────────────────────────────────────────

    _navigate(dir) {
        const next = this._index + dir;
        if (next < 0) return;
        if (next >= this._deck.length) {
            this._showSummary();
            return;
        }
        this._index = next;
        this._showCard(this._index);
    }

    // ─── Update counters ──────────────────────────────────────────────────────

    _updateCounters() {
        const sr = this._gameRoot;
        sr.getElementById('fc-count-correct').textContent = this._correct;
        sr.getElementById('fc-count-wrong').textContent   = this._wrong;
    }

    // ─── Summary ──────────────────────────────────────────────────────────────

    _showSummary() {
        this._showScreen('fc-summary');
        const sr      = this._gameRoot;
        const total   = this._deck.length;
        const correct = this._correct;
        const wrong   = this._wrong;

        const pct   = total > 0 ? correct / total : 0;
        const title = pct >= 0.8 ? '\u00a1Excelente trabajo!' :
                      pct >= 0.5 ? 'Buen intento' :
                                   'Lo lograr\u00e1s la pr\u00f3xima vez';
        sr.getElementById('fc-summary-title').textContent  = title;
        sr.getElementById('fc-donut').innerHTML            = this._buildDonut(correct, wrong, total);
        sr.getElementById('fc-stat-correct').textContent   = correct;
        sr.getElementById('fc-stat-wrong').textContent     = wrong;
        sr.getElementById('fc-stat-skipped').textContent   = total - correct - wrong;
    }

    _buildDonut(correct, wrong, total) {
        const r       = 52;
        const circ    = 2 * Math.PI * r;
        const skipped = total - correct - wrong;

        const correctArc = (correct / total) * circ;
        const wrongArc   = (wrong   / total) * circ;
        const skippedArc = (skipped / total) * circ;

        const startOffset   = circ / 4;
        const wrongOffset   = startOffset - correctArc;
        const skippedOffset = wrongOffset - wrongArc;

        const pctLabel = Math.round((correct / total) * 100);

        return '<svg viewBox="0 0 120 120" style="width:100%;max-width:300px;height:auto;display:block;margin:0 auto">'
            + '<circle cx="60" cy="60" r="' + r + '" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="14"/>'
            + '<circle cx="60" cy="60" r="' + r + '" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="14"'
                + ' stroke-dasharray="' + skippedArc.toFixed(2) + ' ' + (circ - skippedArc).toFixed(2) + '"'
                + ' stroke-dashoffset="' + skippedOffset.toFixed(2) + '"/>'
            + '<circle cx="60" cy="60" r="' + r + '" fill="none" stroke="#991b1b" stroke-width="14"'
                + ' stroke-dasharray="' + wrongArc.toFixed(2) + ' ' + (circ - wrongArc).toFixed(2) + '"'
                + ' stroke-dashoffset="' + wrongOffset.toFixed(2) + '"/>'
            + '<circle cx="60" cy="60" r="' + r + '" fill="none" stroke="#0f6b32" stroke-width="14"'
                + ' stroke-dasharray="' + correctArc.toFixed(2) + ' ' + (circ - correctArc).toFixed(2) + '"'
                + ' stroke-dashoffset="' + startOffset.toFixed(2) + '"/>'
            + '<text x="60" y="58" text-anchor="middle"'
                + ' font-size="18" font-family="\'Volte\',sans-serif" fill="#fff">' + correct + '/' + total + '</text>'
            + '<text x="60" y="76" text-anchor="middle"'
                + ' font-size="13" font-family="\'Volte\',sans-serif" fill="rgba(255,255,255,0.5)">' + pctLabel + '%</text>'
            + '</svg>';
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    _showScreen(id) {
        this._gameRoot.querySelectorAll('.fc-screen').forEach(function(el) {
            el.classList.toggle('fc-active', el.id === id);
        });
    }

    _shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
        }
        return a;
    }

    // ─── ESTILOS (preview — en shadow del componente) ─────────────────────────

    _getStyles() {
        return `
        * { box-sizing: border-box; }
        :host {
            display: block;
            font-family: 'Volte', sans-serif;
            --lbs-main-color: ${this._tema.mainColor};
            --lbs-main-color-rgb: ${this._tema.mainColorRgb};
        }
        .fc-shell { width: 100%; }
        .fc-body  { width: 100%; }

        /* ── Preview card ── */
        .fc-preview-card {
            background: linear-gradient(135deg, #272727 0%, #272727 100%);
            border-radius: 24px;
            border: 1px solid rgba(255,255,255,0.1);
            padding: 44px 36px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 28px;
            text-align: center;
        }
        .fc-preview-top { display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .fc-preview-icon-wrap {
            width: 80px; height: 80px;
            border-radius: 22px;
            background: linear-gradient(135deg, var(--lbs-main-color), var(--lbs-main-color));
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0; color: white;
        }
        .fc-preview-badge {
            background: rgba(var(--lbs-main-color-rgb), 0.2);
            border: 1px solid rgba(var(--lbs-main-color-rgb), 0.35);
            color: var(--lbs-main-color);
            font-size: 18px; font-weight: 600;
            padding: 5px 16px; border-radius: 20px;
            letter-spacing: 0.5px; text-transform: uppercase;
        }
        .fc-preview-body { display: flex; flex-direction: column; gap: 14px; align-items: center; }
        .fc-preview-title { font-size: 38px; font-weight: 700; color: #fff; line-height: 1.3; margin: 0; }
        .fc-preview-desc  { font-size: 22px; color: rgba(255,255,255,0.6); line-height: 1.7; margin: 0; max-width: 380px; }
        .fc-preview-chips { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
        .fc-chip {
            display: inline-flex; align-items: center; gap: 6px;
            background: rgba(255,255,255,0.07);
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 20px; padding: 6px 16px;
            font-size: 18px; color: rgba(255,255,255,0.7);
        }
        .fc-start-btn {
            display: inline-flex; align-items: center; justify-content: center;
            background: linear-gradient(135deg, var(--lbs-main-color), var(--lbs-main-color));
            border: none; border-radius: 50px; padding: 16px 48px;
            cursor: pointer; color: #fff; font-size: 18px; font-weight: 700;
            touch-action: manipulation;
            transition: opacity 0.2s, transform 0.15s; letter-spacing: 0.4px;
        }
        .fc-start-btn:active { opacity: 0.85; transform: scale(0.97); }

        /* ── Game UI (modo normal, sin modal) ── */
        ${this._getGameCSS()}
        `;
    }

    // ─── ESTILOS (modal — en parent.body shadow) ──────────────────────────────

    _getModalStyles() {
        return `
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .fc-backdrop {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.85);
            z-index: 9998;
            display: flex; align-items: center; justify-content: center;
            font-family: 'Volte', sans-serif;
            animation: fc-fadeIn 0.22s ease-out;
        }
        .fc-modal {
            width: 100%;
            height: 100%;
            border-radius: 0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            background: linear-gradient(180deg, #272727 0%, #272727 100%);
            animation: fc-slideUp 0.25s ease-out;
        }
        @keyframes fc-fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fc-slideUp { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }

        /* ── Header ── */
        .fc-modal-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: calc(var(--safe-top, 0px) + 12px) 20px 12px 20px;
            background: #151515;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            flex-shrink: 0;
        }
        .fc-header-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
        .fc-header-title {
            font-size: 15px; font-weight: 600; color: #fff;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .fc-close-x {
            background: rgba(255,255,255,0.1); border: none; border-radius: 8px; padding: 8px;
            color: #fff; cursor: pointer; touch-action: manipulation;
            flex-shrink: 0; display: flex; align-items: center; justify-content: center;
            transition: background 0.2s;
        }
        .fc-close-x:active { background: rgba(255,255,255,0.2); transform: scale(0.95); }

        /* ── Content area ── */
        .fc-modal-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        /* ── Game UI (re-declarado en este shadow) ── */
        ${this._getGameCSS()}
        `;
    }

    // ─── Game CSS compartido ──────────────────────────────────────────────────

    _getGameCSS() {
        return `
        .fc-host {
            display: flex; flex-direction: column; align-items: center;
            flex: 1; min-height: 0; padding: 28px 16px; overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            --fc-primary:    ${this._tema.mainColor};
            --fc-primary-rgb: ${this._tema.mainColorRgb};
            --fc-correct:    #0f6b32;
            --fc-wrong:      #991b1b;
            --fc-card-front: linear-gradient(145deg, #272727 0%, #272727 100%);
            --fc-card-back:  linear-gradient(145deg, #1a2e25 0%, #1e3530 100%);
            --fc-card-radius: 18px;
            --fc-card-shadow: 0 8px 40px rgba(0,0,0,0.55);
            --fc-transition:  0.55s;
        }
        .fc-host::-webkit-scrollbar { width: 4px; }
        .fc-host::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }

        .fc-screen { display: none; width: 100%; max-width: 640px; flex-direction: column; align-items: center; }
        .fc-screen.fc-active { display: flex; flex: 1; justify-content: center; }

        /* Loading */
        .fc-loading-msg { font-size: clamp(16px, 2vw, 20px); color: rgba(255,255,255,0.6); margin-top: 80px; text-align: center; }
        .fc-loading-msg.fc-error { color: var(--fc-wrong); }

        /* Progress */
        .fc-progress-wrap { width: 100%; margin-bottom: 20px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .fc-progress-text { font-size: clamp(13px, 1.6vw, 16px); color: rgba(255,255,255,0.5); letter-spacing: 0.5px; }
        .fc-progress-track { width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 99px; overflow: hidden; }
        .fc-progress-fill  { height: 100%; background: linear-gradient(90deg, var(--fc-primary), var(--fc-primary)); border-radius: 99px; transition: width 0.4s ease; width: 0%; }

        /* Scene / Card */
        .fc-scene {
            perspective: 1000px;
            width: 100%; max-width: 640px; height: 340px;
            cursor: pointer; margin-bottom: 14px; position: relative;
        }
        .fc-scene.fc-entering .fc-card { animation: fc-card-enter 0.3s ease forwards; }
        @keyframes fc-card-enter { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fc-card.fc-swipe-right { animation: fc-swipe-right 1s ease forwards; }
        .fc-card.fc-swipe-left  { animation: fc-swipe-left  1s ease forwards; }
        @keyframes fc-swipe-right { from { opacity:1; transform:translateX(0) rotate(0deg); } to { opacity:0; transform:translateX(110%) rotate(15deg); } }
        @keyframes fc-swipe-left  { from { opacity:1; transform:translateX(0) rotate(0deg); } to { opacity:0; transform:translateX(-110%) rotate(-15deg); } }

        .fc-feedback {
            position:absolute; inset:0; z-index:10;
            border-radius: var(--fc-card-radius);
            display:flex; align-items:center; justify-content:center;
            font-size: clamp(24px, 3vw, 32px); font-weight:800; letter-spacing:1px; color:#fff;
            opacity:0; pointer-events:none;
            transition: opacity 0.15s ease;
        }
        .fc-feedback.fc-feedback--correct { background: rgba(15,107,50,0.88); }
        .fc-feedback.fc-feedback--wrong   { background: rgba(153,27,27,0.88); }
        .fc-feedback.fc-feedback--visible { opacity:1; }

        .fc-card {
            width:100%; height:100%; position:relative;
            transform-style:preserve-3d;
            transition: transform var(--fc-transition) cubic-bezier(0.4,0.2,0.2,1);
            border-radius: var(--fc-card-radius);
        }
        .fc-card.is-flipped { transform: rotateY(180deg); }

        .fc-face {
            position:absolute; inset:0;
            backface-visibility:hidden; -webkit-backface-visibility:hidden;
            border-radius: var(--fc-card-radius);
            box-shadow: var(--fc-card-shadow);
            display:flex; flex-direction:column; align-items:center; justify-content:center;
            padding: 32px 40px; overflow-y:auto; gap:12px;
            background: var(--fc-card-front);
        }
        .fc-face--back {
            transform: rotateY(180deg);
            background: var(--fc-card-back);
        }

        .fc-label { font-size: clamp(11px, 1.3vw, 13px); text-transform:uppercase; letter-spacing:1.5px; color: rgba(255,255,255,0.4); align-self:flex-start; }
        .fc-face--back .fc-label { color: var(--fc-correct); }
        .fc-text  { font-size: clamp(18px, 2.5vw, 26px); color: #fff; text-align:center; margin:0; line-height:1.6; white-space:pre-wrap; }

        /* Status label */
        .fc-status-label { display:none; font-size: clamp(12px, 1.4vw, 14px); font-weight:700; text-transform:uppercase; letter-spacing:1px; align-self:flex-start; }
        .fc-status-label--correct { display:block; color: var(--fc-correct); }
        .fc-status-label--wrong   { display:block; color: var(--fc-wrong); }

        /* Hint */
        .fc-hint { font-size: clamp(13px, 1.5vw, 16px); color: rgba(255,255,255,0.35); margin-bottom:10px; transition: opacity 0.3s; }
        .fc-hint.fc-hidden { opacity:0; pointer-events:none; }

        /* Nav row */
        .fc-nav { display:flex; align-items:center; gap:12px; margin-top:4px; }

        /* Arrow buttons */
        .fc-arrow {
            border:none; border-radius:50%; width:48px; height:48px;
            background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8);
            font-size:20px; cursor:pointer;
            display:flex; align-items:center; justify-content:center;
            transition: background 0.15s, transform 0.1s; flex-shrink:0;
            touch-action: manipulation;
        }
        .fc-arrow:hover  { background: rgba(255,255,255,0.15); }
        .fc-arrow:active { transform: scale(0.92); }

        /* Action buttons */
        .fc-actions { display:flex; gap:12px; }
        .fc-btn {
            border:none; border-radius:50px; padding:12px 24px;
            font-size: clamp(14px, 1.8vw, 17px); font-family: 'Volte', sans-serif;
            font-weight:700; cursor:pointer;
            transition: transform 0.1s ease, box-shadow 0.1s ease;
            color:#fff; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display:flex; align-items:center; gap:8px;
            touch-action: manipulation;
        }
        .fc-btn:active { transform: scale(0.95); }
        .fc-btn--wrong     { background: #991b1b30; border: 1.5px solid #991b1b; }
        .fc-btn--correct   { background: #0f6b3230; border: 1.5px solid #0f6b32; }
        .fc-btn--primary   { background: linear-gradient(135deg, var(--fc-primary), var(--fc-primary)); }
        .fc-btn--secondary { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); box-shadow: none; }
        .fc-btn-count { font-size:13px; margin-left:2px; }

        /* Summary */
        .fc-summary-title { font-size: clamp(20px, 2.5vw, 28px); color:#fff; margin:0 0 20px; text-align:center; }
        .fc-summary-body  {
            display:flex; flex-direction:column; align-items:center; gap:20px;
            background: rgba(255,255,255,0.04);
            border-radius:16px; padding:28px 32px; margin-bottom:28px; width:100%;
        }
        .fc-summary-stats  { display:flex; flex-direction:row; gap:32px; font-size: clamp(15px, 2vw, 18px); justify-content:center; width:100%; }
        .fc-summary-row    { display:flex; flex-direction:column; align-items:center; gap:4px; }
        .fc-stat-label     { color: rgba(255,255,255,0.5); font-size: clamp(13px, 1.5vw, 16px); }
        .fc-stat-val       { font-weight:700; font-size: clamp(26px, 3vw, 34px); order:-1; }
        .fc-stat-val--correct { color: var(--fc-correct); }
        .fc-stat-val--wrong   { color: var(--fc-wrong); }
        .fc-stat-val--skipped { color: rgba(255,255,255,0.4); }
        .fc-summary-actions { display:flex; gap:16px; flex-wrap: wrap; justify-content: center; }

        /* ── Tablet (≥ 768px) ── */
        @media (min-width: 768px) {
            .fc-host { padding: 48px 32px; }
            .fc-progress-wrap { margin-bottom: 32px; gap: 12px; }
            .fc-scene { height: 460px; margin-bottom: 24px; }
            .fc-face { padding: 48px 56px; gap: 18px; }
            .fc-hint { margin-bottom: 18px; font-size: 15px; }
            .fc-nav { gap: 18px; margin-top: 8px; }
            .fc-arrow { width: 56px; height: 56px; font-size: 22px; }
            .fc-btn { padding: 14px 32px; font-size: 16px; }
            .fc-summary-title { font-size: 28px; margin-bottom: 28px; }
            .fc-summary-body { padding: 36px 48px; gap: 28px; margin-bottom: 36px; }
        }
        `;
    }
}

customElements.define('flash-cards', flashcardsLbs);
