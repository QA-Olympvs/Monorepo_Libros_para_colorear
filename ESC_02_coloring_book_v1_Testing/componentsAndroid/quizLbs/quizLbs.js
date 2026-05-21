class quizLbs extends componentBase {

    constructor() {
        super();
        this._quizData     = null;
        this._currentIndex = 0;
        this._userAnswers  = {};   // { questionNumber: label }
        this._completed    = false;
        this._result       = null;
        this._state        = 'preview'; // 'preview' | 'playing' | 'results'
        this._modalEl      = null;
        this._modalShadow  = null;
    }

    async getData() {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
            if ((xmlhttp.status == 200 || xmlhttp.status == 0) && xmlhttp.readyState == 4) {
                this.shadowRoot.innerHTML = xmlhttp.responseText;
                this._itemLbs = this.shadowRoot.querySelector('div');
                this.updateStyle(this);
            }
        };
        xmlhttp.open("GET", "componentsAndroid/quizLbs/quizLbs.html", true);
        xmlhttp.send();
    }

    updateStyle(elem) {
        const shadow = elem.shadowRoot;
        shadow.querySelector("style").textContent = this._getStyles();

        this._id      = elem.getAttribute("id");
        this._pagina  = elem.getAttribute("pagina");
        this._archivo = elem.getAttribute("archivo");

        this._loadJSON();
    }

    // ─── JSON ────────────────────────────────────────────────────────────────

    _loadJSON() {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
            if (xmlhttp.status == 200 && xmlhttp.readyState == 4) {
                try {
                    this._quizData = JSON.parse(xmlhttp.responseText);
                    this._render();
                } catch (e) {
                    console.error('quizLbs: error al parsear JSON', e);
                }
            }
        };
        xmlhttp.open("GET", this._archivo, true);
        xmlhttp.send();
    }

    // ─── MATH ────────────────────────────────────────────────────────────────

    _parseMath(text) {
        if (!text) return '';
        return text.replace(/\$([^$]+)\$/g, (_, content) => {
            var result = content
                .replace(/\\text\s*\{([^}]+)\}/g, '$1')
                .replace(/\\%/g, '%')
                .replace(/\^-/g, '⁻')
                .replace(/\^\+/g, '⁺')
                .replace(/\^([0-9])/g, function(m, d) {
                    return '⁰¹²³⁴⁵⁶⁷⁸⁹'[parseInt(d)];
                });
            return '<em class="math">' + result + '</em>';
        });
    }

    // ─── PREVIEW (en shadow del componente) ──────────────────────────────────

    _render() {
        var body = this.shadowRoot.querySelector('.quiz-body');
        if (!body || !this._quizData) return;

        body.innerHTML = this._renderPreview();
        body.querySelector('.ql-start-btn').addEventListener('click', () => {
            this._state = 'playing';
            this._openModal();
        });
    }

    _renderPreview() {
        var q = this._quizData;

        // Muestra hasta 4 preguntas como preview con texto truncado
        var previewItems = q.questions.slice(0, 4).map(function(question, i) {
            var num = (i + 1 < 10 ? '0' : '') + (i + 1);
            var text = question.question || '';
            if (text.length > 60) text = text.substring(0, 60) + '…';
            return '<div class="ql-qp-item">' +
                '<span class="ql-qp-num">' + num + '</span>' +
                '<span class="ql-qp-text">' + text + '</span>' +
            '</div>';
        }).join('');

        return '<div class="ql-preview-card">' +
            '<div class="ql-preview-top">' +
                '<div class="ql-preview-icon-wrap">' +
                    '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
                '</div>' +
                '<div class="ql-preview-badge">Quiz</div>' +
            '</div>' +
            '<h2 class="ql-preview-title">' + q.title + '</h2>' +
            '<div class="ql-questions-preview">' +
                previewItems +
                '<div class="ql-qp-fade"></div>' +
            '</div>' +
            '<div class="ql-preview-chips">' +
                '<span class="ql-chip">' +
                    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
                    q.questions.length + '\u00a0preguntas' +
                '</span>' +
                '<span class="ql-chip">' +
                    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>' +
                    'Selecci\u00f3n m\u00FAltiple' +
                '</span>' +
            '</div>' +
            '<button class="ql-start-btn">Comenzar</button>' +
        '</div>';
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

    // ─── MODAL (inyectado en parent.document.body) ────────────────────────────
    //
    // El shell (backdrop + .ql-modal) se crea UNA SOLA VEZ en _openModal().
    // Solo se anima en la apertura. Las actualizaciones posteriores solo tocan
    // .ql-modal-header y .ql-modal-content, evitando el flash de reapertura.

    _openModal() {
        if (this._modalEl) return;
        var doc;
        try { doc = parent.document; } catch (e) { doc = document; }
        this._modalEl    = doc.createElement('div');
        this._modalShadow = this._modalEl.attachShadow({ mode: 'open' });
        doc.body.appendChild(this._modalEl);
        this._modalEl.style.setProperty('--safe-top', this._getSafeTop(doc) + 'px');

        // Shell fijo — las animaciones solo se ejecutan aquí, una vez
        this._modalShadow.innerHTML =
            '<style>' + this._getModalStyles() + '</style>' +
            '<div class="ql-backdrop">' +
                '<div class="ql-modal">' +
                    '<div class="ql-modal-header"></div>' +
                    '<div class="ql-modal-content"></div>' +
                '</div>' +
            '</div>';

        // Evento estático: cerrar al hacer clic fuera del modal
        var backdrop = this._modalShadow.querySelector('.ql-backdrop');
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) this._closeModal();
        });

        this._refreshModal();
        this._toggleNativeButtons(false);
    }

    // Actualiza solo el header y el contenido interior — sin reanimar el backdrop
    _refreshModal() {
        var root = this._modalShadow;
        if (!root) return;

        var headerEl  = root.querySelector('.ql-modal-header');
        var contentEl = root.querySelector('.ql-modal-content');
        if (!headerEl || !contentEl) return;

        headerEl.innerHTML  = this._renderHeader();
        contentEl.innerHTML = this._state === 'playing'  ? this._renderPlayingContent()
                            : this._state === 'results'  ? this._renderResultsContent()
                            : '';
        this._bindInnerEvents();
    }

    _closeModal() {
        this._toggleNativeButtons(true);
        if (this._modalEl && this._modalEl.parentNode) {
            this._modalEl.parentNode.removeChild(this._modalEl);
        }
        this._modalEl     = null;
        this._modalShadow = null;
        this._state = 'preview';
        this._render();
    }

    _toggleNativeButtons(visible) {
        if (!this._isMobile && !this._isAndroid) {
            try {
                Visor.botonesHandlerWeb(visible ? 'show' : 'hide');
            } catch {
                try {
                    this.Visor.botonesHandlerWeb(visible ? 'show' : 'hide');
                } catch {
                    return
                }
            }
            return;
        }
        app.esconderBotonesDesdeComponentes(!visible);
    }

    // ─── HEADER (compartido entre playing y results) ──────────────────────────

    _renderHeader() {
        var q = this._quizData;
        var svgClose = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

        var iconHtml = this._state === 'results'
            ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
            : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="' + this._tema.mainColor + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';

        var titleText = this._state === 'results'
            ? 'Resultados &mdash; ' + q.title
            : q.title;

        return '<div class="ql-header-left">' +
                    iconHtml +
                    '<span class="ql-title">' + titleText + '</span>' +
                '</div>' +
                '<button class="ql-close-x" title="Cerrar">' + svgClose + '</button>';
    }

    // ─── PLAYING CONTENT ─────────────────────────────────────────────────────

    _renderPlayingContent() {
        var q           = this._quizData;
        var current     = q.questions[this._currentIndex];
        var total       = q.questions.length;
        var answered    = Object.keys(this._userAnswers).length;
        var progress    = Math.round(((this._currentIndex + 1) / total) * 100);
        var selected    = this._userAnswers[current.number] || null;
        var isFirst     = this._currentIndex === 0;
        var isLast      = this._currentIndex === total - 1;
        var allAnswered = answered === total;

        var dotsHtml = q.questions.map(function(qt, i) {
            var cls = 'ql-dot';
            if (i === this._currentIndex) cls += ' active';
            if (this._userAnswers[qt.number]) cls += ' answered';
            return '<button class="' + cls + '" data-goto="' + i + '"></button>';
        }, this).join('');

        var optionsHtml = current.options.map(function(opt) {
            var cls     = 'ql-option-btn' + (selected === opt.label ? ' selected' : '');
            var checkSvg = selected === opt.label
                ? '<svg class="ql-check" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
                : '';
            return '<button class="' + cls + '" data-label="' + opt.label + '">' +
                '<div class="ql-option-letter">' + opt.label + '</div>' +
                '<span class="ql-option-text">' + this._parseMath(opt.text) + '</span>' +
                checkSvg +
            '</button>';
        }, this).join('');

        var svgLeft  = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
        var svgRight = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
        var svgCheck = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        var svgList  = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>';

        var navRight = isLast
            ? '<button class="ql-nav-btn ql-submit-btn"' + (!allAnswered ? ' disabled' : '') + '>' + svgCheck + '<span>Finalizar</span></button>'
            : '<button class="ql-nav-btn ql-next-btn"><span>Siguiente</span>' + svgRight + '</button>';

        return '<div class="ql-progress-section">' +
                    '<div class="ql-progress-info">' +
                        '<span class="ql-prog-text">Pregunta ' + (this._currentIndex + 1) + ' de ' + total + '</span>' +
                        '<span class="ql-prog-answered">' + answered + '/' + total + ' respondidas</span>' +
                    '</div>' +
                    '<div class="ql-progress-bar"><div class="ql-progress-fill" style="width:' + progress + '%"></div></div>' +
                    '<div class="ql-dots">' + dotsHtml + '</div>' +
                '</div>' +
                '<div class="ql-question-area">' +
                    '<div class="ql-question-card">' +
                        '<div class="ql-type-badge">' + svgList + '<span>Selecci\u00f3n m\u00FAltiple</span></div>' +
                        '<p class="ql-question-text">' + this._parseMath(current.question) + '</p>' +
                        '<div class="ql-options-list">' + optionsHtml + '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="ql-navigation">' +
                    '<button class="ql-nav-btn ql-prev-btn"' + (isFirst ? ' disabled' : '') + '>' + svgLeft + '<span>Anterior</span></button>' +
                    navRight +
                '</div>';
    }

    // ─── RESULTS CONTENT ─────────────────────────────────────────────────────

    _renderResultsContent() {
        var q      = this._quizData;
        var result = this._result;
        var scoreColor = this._getScoreColor(result.score);
        var scoreLabel = this._getScoreLabel(result.score);

        var reviewHtml = result.answers.map(function(ans, i) {
            var question   = q.questions.find(function(qt) { return qt.number === ans.number; });
            var correctOpt = question.options.find(function(o) { return o.label === question.correctAnswer; });
            var userOpt    = question.options.find(function(o) { return o.label === ans.label; }) || null;
            var rationaleOpt = ans.isCorrect ? userOpt : correctOpt;

            var svgOk  = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
            var svgErr = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
            var svgInfo= '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="' + this._tema.mainColor + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';

            var wrongRow = !ans.isCorrect
                ? '<div class="ql-review-row correct-row">' +
                      '<span class="ql-ans-label">Correcta:</span>' +
                      '<span class="ql-ans-val">' + this._parseMath(correctOpt.text) + '</span>' +
                  '</div>'
                : '';

            var rationaleHtml = (rationaleOpt && rationaleOpt.rationale)
                ? '<div class="ql-rationale">' +
                      svgInfo +
                      '<span>' + this._parseMath(rationaleOpt.rationale) + '</span>' +
                  '</div>'
                : '';

            return '<div class="ql-review-card ' + (ans.isCorrect ? 'correct' : 'incorrect') + '">' +
                '<div class="ql-review-header">' +
                    '<span class="ql-review-num">' + (i + 1) + '</span>' +
                    (ans.isCorrect ? svgOk : svgErr) +
                '</div>' +
                '<p class="ql-review-question">' + this._parseMath(question.question) + '</p>' +
                '<div class="ql-review-answers">' +
                    '<div class="ql-review-row' + (!ans.isCorrect ? ' wrong' : '') + '">' +
                        '<span class="ql-ans-label">Tu respuesta:</span>' +
                        '<span class="ql-ans-val">' + (userOpt ? this._parseMath(userOpt.text) : '&mdash;') + '</span>' +
                    '</div>' +
                    wrongRow +
                '</div>' +
                rationaleHtml +
            '</div>';
        }, this).join('');

        var svgClose = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

        return '<div class="ql-results-container">' +
            '<div class="ql-score-section">' +
                '<div class="ql-score-circle" style="--score-color:' + scoreColor + '">' +
                    '<span class="ql-score-num">' + result.score + '%</span>' +
                    '<span class="ql-score-lbl">' + scoreLabel + '</span>' +
                '</div>' +
                '<div class="ql-score-stats">' +
                    '<div class="ql-stat correct"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>' + result.correctCount + ' correctas</span></div>' +
                    '<div class="ql-stat incorrect"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg><span>' + result.incorrectCount + ' incorrectas</span></div>' +
                '</div>' +
            '</div>' +
            '<h3 class="ql-review-title">Revisi\u00f3n de respuestas</h3>' +
            reviewHtml +
            '<div class="ql-results-actions">' +
                '<button class="ql-retry-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg><span>Repetir</span></button>' +
                '<button class="ql-close-btn">' + svgClose + '<span>Cerrar</span></button>' +
            '</div>' +
        '</div>';
    }

    // ─── EVENTOS (solo el interior, el backdrop ya tiene su listener) ─────────

    _bindInnerEvents() {
        var root = this._modalShadow;
        if (!root) return;

        // Botón cerrar del header
        var closeX = root.querySelector('.ql-close-x');
        if (closeX) closeX.addEventListener('click', () => this._closeModal());

        if (this._state === 'playing') {
            root.querySelectorAll('.ql-option-btn').forEach(function(btn) {
                btn.addEventListener('click', () => {
                    var label   = btn.getAttribute('data-label');
                    var current = this._quizData.questions[this._currentIndex];
                    this._userAnswers[current.number] = label;
                    this._refreshOptions(); // solo actualiza opciones, sin reanimar la pregunta
                });
            }, this);

            root.querySelectorAll('.ql-dot').forEach(function(dot) {
                dot.addEventListener('click', () => {
                    this._currentIndex = parseInt(dot.getAttribute('data-goto'));
                    this._refreshModal();
                });
            }, this);

            var prevBtn = root.querySelector('.ql-prev-btn');
            if (prevBtn) prevBtn.addEventListener('click', () => {
                if (this._currentIndex > 0) { this._currentIndex--; this._refreshModal(); }
            });

            var nextBtn = root.querySelector('.ql-next-btn');
            if (nextBtn) nextBtn.addEventListener('click', () => {
                if (this._currentIndex < this._quizData.questions.length - 1) { this._currentIndex++; this._refreshModal(); }
            });

            var submitBtn = root.querySelector('.ql-submit-btn');
            if (submitBtn) submitBtn.addEventListener('click', () => this._submit());

        } else if (this._state === 'results') {
            var retryBtn = root.querySelector('.ql-retry-btn');
            if (retryBtn) retryBtn.addEventListener('click', () => this._restart());

            var closeBtn = root.querySelector('.ql-close-btn');
            if (closeBtn) closeBtn.addEventListener('click', () => this._closeModal());
        }
    }

    // ─── LÓGICA ──────────────────────────────────────────────────────────────

    // Actualiza solo las opciones y el estado del progreso sin reanimar la pregunta
    _refreshOptions() {
        var root = this._modalShadow;
        if (!root) return;

        var current  = this._quizData.questions[this._currentIndex];
        var selected = this._userAnswers[current.number] || null;
        var total    = this._quizData.questions.length;
        var answered = Object.keys(this._userAnswers).length;

        // Opciones: clase + check SVG sin reemplazar nodos
        root.querySelectorAll('.ql-option-btn').forEach(function(btn) {
            var label      = btn.getAttribute('data-label');
            var isSelected = label === selected;
            btn.className  = 'ql-option-btn' + (isSelected ? ' selected' : '');

            var check = btn.querySelector('.ql-check');
            if (isSelected && !check) {
                btn.insertAdjacentHTML('beforeend',
                    '<svg class="ql-check" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>');
            } else if (!isSelected && check) {
                check.remove();
            }
        });

        // Dots: actualizar clases
        root.querySelectorAll('.ql-dot').forEach(function(dot, i) {
            var qt = this._quizData.questions[i];
            dot.className = 'ql-dot' +
                (i === this._currentIndex ? ' active' : '') +
                (this._userAnswers[qt.number] ? ' answered' : '');
        }, this);

        // Contador de respondidas
        var progAnswered = root.querySelector('.ql-prog-answered');
        if (progAnswered) progAnswered.textContent = answered + '/' + total + ' respondidas';

        // Submit: habilitar cuando todas estén respondidas
        var submitBtn = root.querySelector('.ql-submit-btn');
        if (submitBtn) submitBtn.disabled = answered !== total;
    }

    _submit() {
        var answers = this._quizData.questions.map(function(q) {
            var label     = this._userAnswers[q.number] || '';
            var isCorrect = label === q.correctAnswer;
            return { number: q.number, label: label, isCorrect: isCorrect };
        }, this);

        var correctCount = answers.filter(function(a) { return a.isCorrect; }).length;
        var total        = this._quizData.questions.length;

        this._result = {
            totalQuestions : total,
            correctCount   : correctCount,
            incorrectCount : total - correctCount,
            score          : Math.round((correctCount / total) * 100),
            answers        : answers
        };

        this._completed = true;
        this._state     = 'results';
        this._refreshModal();
    }

    _restart() {
        this._currentIndex = 0;
        this._userAnswers  = {};
        this._completed    = false;
        this._result       = null;
        this._state        = 'playing';
        this._refreshModal();
    }

    _getScoreColor(score) {
        if (score >= 80) return '#22c55e';
        if (score >= 60) return '#eab308';
        if (score >= 40) return '#f97316';
        return '#ef4444';
    }

    _getScoreLabel(score) {
        if (score >= 90) return 'Excelente';
        if (score >= 80) return 'Muy bien';
        if (score >= 70) return 'Bien';
        if (score >= 60) return 'Aprobado';
        if (score >= 50) return 'Casi';
        return 'Necesitas repasar';
    }

    // ─── ESTILOS (preview — en shadow del componente) ─────────────────────────

    _getStyles() {
        return `
        :host { --lbs-main-color: ${this._tema.mainColor}; --lbs-main-color-rgb: ${this._tema.mainColorRgb}; }
        * { box-sizing: border-box; }
        .quiz-shell { width: 100%; font-family: 'Volte', sans-serif; }

        .ql-preview-card {
            background: linear-gradient(135deg, #272727 0%, #272727 100%);
            border-radius: 24px;
            border: 1px solid rgba(255,255,255,0.1);
            padding: 28px 24px 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            text-align: center;
        }
        .ql-preview-top { display: flex; flex-direction: column; align-items: center; gap: 14px; }
        .ql-preview-icon-wrap {
            width: 80px; height: 80px;
            border-radius: 22px;
            background: linear-gradient(135deg, var(--lbs-main-color), var(--lbs-main-color));
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0; color: white;
        }
        .ql-preview-badge {
            background: rgba(var(--lbs-main-color-rgb), 0.2);
            border: 1px solid rgba(var(--lbs-main-color-rgb), 0.35);
            color: var(--lbs-main-color);
            font-size: 18px; font-weight: 600;
            padding: 5px 16px; border-radius: 20px;
            letter-spacing: 0.5px; text-transform: uppercase;
        }
        .ql-preview-body { display: flex; flex-direction: column; gap: 14px; align-items: center; }
        .ql-preview-title { font-size: 38px; font-weight: 700; color: #fff; line-height: 1.3; margin: 0; text-align: center; }
        .ql-preview-desc  { font-size: 28px; color: rgba(255,255,255,0.6); line-height: 1.6; margin: 0; max-width: 380px; }

        /* Question preview strip */
        .ql-questions-preview {
            position: relative;
            width: 100%;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 14px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        .ql-qp-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 14px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .ql-qp-item:last-of-type { border-bottom: none; }
        .ql-qp-num {
            font-size: 17px;
            font-weight: 700;
            color: var(--lbs-main-color);
            flex-shrink: 0;
            font-variant-numeric: tabular-nums;
            letter-spacing: 0.5px;
        }
        .ql-qp-text {
            font-size: 18px;
            color: rgba(255,255,255,0.55);
            text-align: left;
            line-height: 1.4;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .ql-qp-fade {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            height: 36px;
            background: linear-gradient(to bottom, transparent, #272727);
            pointer-events: none;
        }

        .ql-preview-chips { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
        .ql-chip {
            display: inline-flex; align-items: center; gap: 6px;
            background: rgba(255,255,255,0.07);
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 20px; padding: 6px 16px;
            font-size: 18px; color: rgba(255,255,255,0.7);
        }
        .ql-start-btn {
            display: inline-flex; align-items: center; justify-content: center;
            background: linear-gradient(135deg, var(--lbs-main-color), var(--lbs-main-color));
            border: none; border-radius: 50px; padding: 16px 48px;
            cursor: pointer; color: #fff; font-size: 18px; font-weight: 700;
            touch-action: manipulation;
            transition: opacity 0.2s, transform 0.15s; letter-spacing: 0.4px;
        }
        .ql-start-btn:active { opacity: 0.85; transform: scale(0.97); }
        `;
    }

    // ─── ESTILOS (modal — en parent.body shadow) ──────────────────────────────

    _getModalStyles() {
        return `
        :host { --lbs-main-color: ${this._tema.mainColor}; --lbs-main-color-rgb: ${this._tema.mainColorRgb}; }
        * { box-sizing: border-box; }

        /* Shell — anima solo en apertura */
        .ql-backdrop {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.92);
            z-index: 9998;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Volte', sans-serif;
            animation: ql-fadeIn 0.2s ease-out;
        }
        .ql-modal {
            width: 100%;
            height: 100%;
            border-radius: 0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            background: linear-gradient(180deg, #272727 0%, #272727 100%);
            animation: ql-slideUp 0.25s ease-out;
        }
        @keyframes ql-fadeIn {
            from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes ql-slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        /* Header — vive en .ql-modal-header */
        .ql-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: calc(var(--safe-top, 0px) + 14px) 20px 14px 20px;
            background: #151515;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            flex-shrink: 0;
        }
        .ql-header-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
        .ql-title {
            font-size: clamp(15px, 1.6vw, 22px); font-weight: 600; color: #fff;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .ql-close-x {
            background: rgba(255,255,255,0.1);
            border: none; border-radius: 8px; padding: 8px;
            color: #fff; cursor: pointer; touch-action: manipulation;
            flex-shrink: 0; display: flex; align-items: center; justify-content: center;
            transition: background 0.2s;
        }
        .ql-close-x:active { background: rgba(255,255,255,0.2); transform: scale(0.95); }

        /* Content — vive en .ql-modal-content */
        .ql-modal-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        /* Progress */
        .ql-progress-section { padding: 14px 20px; flex-shrink: 0; }
        .ql-progress-info    { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .ql-prog-text     { font-size: clamp(13px, 1.6vw, 16px); font-weight: 500; color: rgba(255,255,255,0.9); }
        .ql-prog-answered { font-size: clamp(12px, 1.4vw, 14px); color: rgba(255,255,255,0.45); }
        .ql-progress-bar  {
            height: 4px; background: rgba(255,255,255,0.1);
            border-radius: 2px; overflow: hidden; margin-bottom: 12px;
        }
        .ql-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--lbs-main-color), var(--lbs-main-color));
            border-radius: 2px; transition: width 0.35s ease;
        }
        .ql-dots { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
        .ql-dot {
            width: clamp(10px, 1vw, 14px); height: clamp(10px, 1vw, 14px); border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.25);
            background: transparent; cursor: pointer; padding: 0;
            touch-action: manipulation; transition: all 0.2s;
        }
        .ql-dot.active           { border-color: var(--lbs-main-color); background: var(--lbs-main-color); transform: scale(1.25); }
        .ql-dot.answered         { border-color: rgba(var(--lbs-main-color-rgb), 0.6); background: rgba(var(--lbs-main-color-rgb), 0.4); }
        .ql-dot.active.answered  { background: var(--lbs-main-color); transform: scale(1.25); }

        /* Question area */
        .ql-question-area {
            flex: 1; overflow-y: auto;
            padding: 0 20px 20px;
            -webkit-overflow-scrolling: touch;
        }
        .ql-question-area::-webkit-scrollbar { width: 4px; }
        .ql-question-area::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        .ql-question-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }

        .ql-question-card { animation: ql-slideIn 0.2s ease-out; }
        @keyframes ql-slideIn {
            from { opacity: 0; transform: translateX(16px); }
            to   { opacity: 1; transform: translateX(0); }
        }

        .ql-type-badge {
            display: inline-flex; align-items: center; gap: 6px;
            background: rgba(var(--lbs-main-color-rgb), 0.15);
            border: 1px solid rgba(var(--lbs-main-color-rgb), 0.25);
            border-radius: 20px; padding: 4px 12px; margin-bottom: 16px;
            color: rgba(255,255,255,0.8); font-size: clamp(12px, 1.4vw, 14px); font-weight: 500;
        }
        .ql-question-text {
            font-size: clamp(17px, 2.5vw, 26px); font-weight: 500; color: #fff;
            line-height: 1.55; margin: 0 0 24px 0;
        }

        /* Options */
        .ql-options-list { display: flex; flex-direction: column; gap: 10px; }
        .ql-option-btn {
            display: flex; align-items: center; gap: 12px;
            background: rgba(255,255,255,0.06);
            border: 1.5px solid rgba(255,255,255,0.12);
            border-radius: 14px; padding: 14px 16px;
            cursor: pointer; text-align: left; width: 100%;
            color: #fff; touch-action: manipulation; transition: all 0.2s;
        }
        .ql-option-btn:active { transform: scale(0.98); }
        .ql-option-btn.selected { background: rgba(var(--lbs-main-color-rgb), 0.15); border-color: var(--lbs-main-color); }
        .ql-option-btn.selected .ql-option-letter { background: var(--lbs-main-color); color: #fff; }
        .ql-option-letter {
            width: clamp(32px, 2.8vw, 44px); height: clamp(32px, 2.8vw, 44px); border-radius: 8px;
            background: rgba(255,255,255,0.1);
            display: flex; align-items: center; justify-content: center;
            font-size: clamp(14px, 1.8vw, 17px); font-weight: 600; color: rgba(255,255,255,0.8);
            flex-shrink: 0; transition: all 0.2s;
        }
        .ql-option-text  { flex: 1; font-size: clamp(15px, 2vw, 18px); color: rgba(255,255,255,0.9); line-height: 1.4; }
        .ql-check { color: var(--lbs-main-color); flex-shrink: 0; margin-left: auto; }

        /* Navigation */
        .ql-navigation {
            display: flex; justify-content: space-between;
            padding: 14px 20px;
            background: #151515;
            border-top: 1px solid rgba(255,255,255,0.1);
            flex-shrink: 0; gap: 8px;
        }
        .ql-nav-btn {
            display: flex; align-items: center; gap: 6px;
            padding: 10px 20px; border-radius: 12px; border: none;
            cursor: pointer; font-size: clamp(14px, 1.8vw, 17px); font-weight: 500;
            touch-action: manipulation; transition: all 0.2s;
        }
        .ql-nav-btn:active   { transform: scale(0.97); }
        .ql-nav-btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }
        .ql-prev-btn   { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); }
        .ql-next-btn   { background: rgba(var(--lbs-main-color-rgb), 0.2); color: var(--lbs-main-color); border: 1px solid rgba(var(--lbs-main-color-rgb), 0.3); margin-left: auto; }
        .ql-submit-btn { background: linear-gradient(135deg, var(--lbs-main-color), var(--lbs-main-color)); color: #fff; margin-left: auto; }
        .ql-submit-btn:disabled { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.3); }

        /* Results */
        .ql-results-container {
            flex: 1; overflow-y: auto; padding: 20px;
            -webkit-overflow-scrolling: touch;
        }
        .ql-results-container::-webkit-scrollbar { width: 4px; }
        .ql-results-container::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }

        .ql-score-section {
            display: flex; flex-direction: column; align-items: center;
            margin-bottom: 28px;
            animation: ql-fadeInScore 0.5s ease-out;
        }
        @keyframes ql-fadeInScore {
            from { opacity: 0; transform: scale(0.8); }
            to   { opacity: 1; transform: scale(1); }
        }
        .ql-score-circle {
            width: clamp(130px, 10vw, 180px); height: clamp(130px, 10vw, 180px); border-radius: 50%;
            border: 4px solid var(--score-color, #22c55e);
            background: rgba(255,255,255,0.04);
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            margin-bottom: 18px; box-shadow: 0 0 30px rgba(0,0,0,0.3);
        }
        .ql-score-num { font-size: clamp(34px, 3vw, 52px); font-weight: 700; color: var(--score-color, #22c55e); line-height: 1; }
        .ql-score-lbl { font-size: clamp(11px, 1.3vw, 13px); color: rgba(255,255,255,0.6); margin-top: 4px; }
        .ql-score-stats { display: flex; gap: 24px; }
        .ql-stat { display: flex; align-items: center; gap: 6px; font-size: clamp(14px, 1.8vw, 17px); color: rgba(255,255,255,0.8); }

        /* Review */
        .ql-review-title { font-size: clamp(15px, 1.6vw, 18px); font-weight: 600; color: #fff; margin: 0 0 14px 0; }
        .ql-review-card {
            background: rgba(255,255,255,0.04);
            border-radius: 14px; padding: 14px; margin-bottom: 10px;
            border-left: 4px solid transparent;
        }
        .ql-review-card.correct   { border-left-color: #22c55e; }
        .ql-review-card.incorrect { border-left-color: #ef4444; }
        .ql-review-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .ql-review-num { font-size: clamp(12px, 1.4vw, 14px); font-weight: 600; color: rgba(255,255,255,0.45); }
        .ql-review-question { font-size: clamp(14px, 1.8vw, 17px); color: rgba(255,255,255,0.9); margin: 0 0 10px 0; line-height: 1.4; }
        .ql-review-answers { display: flex; flex-direction: column; gap: 5px; }
        .ql-review-row { font-size: clamp(13px, 1.6vw, 16px); color: rgba(255,255,255,0.6); display: flex; gap: 6px; align-items: baseline; }
        .ql-review-row.wrong .ql-ans-val { color: #ef4444; text-decoration: line-through; }
        .ql-review-row.correct-row .ql-ans-val { color: #22c55e; font-weight: 600; }
        .ql-ans-label { color: rgba(255,255,255,0.4); flex-shrink: 0; }
        .ql-ans-val   { color: rgba(255,255,255,0.85); }
        .ql-rationale {
            display: flex; gap: 8px; margin-top: 10px;
            padding: 10px 12px;
            background: rgba(var(--lbs-main-color-rgb), 0.08);
            border-radius: 10px; font-size: clamp(13px, 1.6vw, 16px);
            color: rgba(255,255,255,0.7); line-height: 1.4; align-items: flex-start;
        }
        .ql-rationale svg { flex-shrink: 0; margin-top: 1px; }

        /* Result actions */
        .ql-results-actions {
            display: flex; gap: 12px; justify-content: center;
            padding: 20px 0 8px 0;
        }
        .ql-retry-btn, .ql-close-btn {
            display: flex; align-items: center; gap: 8px;
            padding: 12px 24px; border-radius: 12px; border: none;
            cursor: pointer; font-size: clamp(14px, 1.8vw, 17px); font-weight: 500;
            color: #fff; touch-action: manipulation; transition: all 0.2s;
        }
        .ql-retry-btn:active, .ql-close-btn:active { transform: scale(0.97); }
        .ql-retry-btn { background: linear-gradient(135deg, var(--lbs-main-color), var(--lbs-main-color)); }
        .ql-close-btn { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); }

        /* Math */
        em.math { font-style: italic; font-family: Georgia, serif; }
        `;
    }

    // ─── LIFECYCLE ───────────────────────────────────────────────────────────

    connectedCallback() {
        this.getData();
    }

    disconnectedCallback() {
        this._closeModal();
    }
}

customElements.define('quiz-lbs', quizLbs);
