class mindMapLbs extends componentBase {
    constructor() {
        super();
        this._mapData = null;
        this._expandedNodes = new Set();
        this._modalEl = null;
        this._modalDoc = null;

        this._scale = 1;
        this._tx = 0;
        this._ty = 0;
        this._dragging = false;
        this._moved = false;
        this._dragX0 = 0;
        this._dragY0 = 0;
        this._tx0 = 0;
        this._ty0 = 0;

        this._transformEl = null;
        this._nodesContainer = null;
        this._svgEl = null;
        this._canvasWrap = null;
        this._lastBounds = null;

        this._boundEsc = null;
        this._boundMouseMove = null;
        this._boundMouseUp = null;
        this._fontReadyHandler = null;

        this._toggleInProgress = false;
        this._renderAnimationMode = "none";
        this._headerIconColor = "#de8839";

        this.ROOT_W = 260;
        this.NODE_W = 200;
        this.H_GAP = 70;
        this.V_GAP = 10;
        this.COLORS = [
            "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
            "#10b981", "#06b6d4", "#f43f5e", "#84cc16"
        ];
    }

    async getData() {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
            if (xmlhttp.status == 200 && xmlhttp.readyState == 4) {
                this.shadowRoot.innerHTML = xmlhttp.responseText;
                this.updateStyle(this);
            }
        };
        xmlhttp.open("GET", "components/mindMapLbs/mindMapLbs.html", true);
        xmlhttp.send();
    }

    updateStyle(elem) {
        this._jsonPath = elem.getAttribute("json") || "";
        this._id = elem.getAttribute("id") || "mm-" + Date.now();
        this._pagina = elem.getAttribute("pagina") || "0";
        this._headerIconColor = elem.getAttribute("headericoncolor") || this._tema.mainColor;
        this._applyTheme();
        this._ensureGlobalStyles();
        this._loadData();
    }

    _applyTheme() {
        const { mainColor, mainColorRgb } = this._tema;
        this.style.setProperty('--mm-accent',             mainColor);
        this.style.setProperty('--mm-accent-soft',        `rgba(${mainColorRgb}, 0.2)`);
        this.style.setProperty('--mm-accent-border',      `rgba(${mainColorRgb}, 0.35)`);
        this.style.setProperty('--mm-accent-zoom-text',   mainColor);
        this.style.setProperty('--mm-accent-zoom-border', `rgba(${mainColorRgb}, 0.32)`);
        this.style.setProperty('--mm-accent-zoom-hover',  `rgba(${mainColorRgb}, 0.3)`);
    }

    connectedCallback() { this.getData(); }

    disconnectedCallback() {
        this._closeModal();
        if (this._unsubscribe) this._unsubscribe();
        if (this._fontReadyHandler && document.fonts && document.fonts.removeEventListener) {
            document.fonts.removeEventListener("loadingdone", this._fontReadyHandler);
            this._fontReadyHandler = null;
        }
    }

    _ensureGlobalStyles() {
        if (document.getElementById("mm-global-css")) return;
        var link = document.createElement("link");
        link.id = "mm-global-css";
        link.rel = "stylesheet";
        link.href = "components/mindMapLbs/mindMapLbs.css";
        document.head.appendChild(link);
    }

    _loadData() {
        if (!this._jsonPath) return;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
                try {
                    this._mapData = JSON.parse(xhr.responseText);
                    this._assignColors(this._mapData.root);
                    this._renderPreview();
                } catch (e) {
                    // Keep stable on malformed JSON.
                }
            }
        };
        xhr.open("GET", this._jsonPath, true);
        xhr.send();

        this._watchFontLoad();
    }

    _watchFontLoad() {
        if (!document.fonts) return;

        var rerender = function () {
            if (this._mapData) {
                this._renderMap();
                this._centerView();
            }
        }.bind(this);

        if (this._fontReadyHandler && document.fonts.removeEventListener) {
            document.fonts.removeEventListener("loadingdone", this._fontReadyHandler);
        }

        this._fontReadyHandler = function () {
            rerender();
        };

        if (document.fonts.addEventListener) {
            document.fonts.addEventListener("loadingdone", this._fontReadyHandler);
        }

        if (document.fonts.ready && document.fonts.ready.then) {
            document.fonts.ready.then(function () {
                rerender();
            });
        }
    }

    _assignColors(root) {
        root._color = "#6366f1";
        if (!root.children) return;
        for (var i = 0; i < root.children.length; i++) {
            this._paintBranch(root.children[i], this.COLORS[i % this.COLORS.length]);
        }
    }

    _paintBranch(node, color) {
        node._color = color;
        if (!node.children) return;
        for (var i = 0; i < node.children.length; i++) {
            this._paintBranch(node.children[i], color);
        }
    }

    _renderPreview() {
        var root = this.shadowRoot;
        var card = root.querySelector(".mm-preview-card");
        var titleEl = root.querySelector(".mm-preview-title");
        var chipsEl = root.querySelector(".mm-preview-chips");
        if (!card || !titleEl || !chipsEl || !this._mapData) return;

        titleEl.textContent = this._mapData.title || this._mapData.root.text || "Mapa mental";
        chipsEl.innerHTML = "";

        var kids = this._mapData.root.children || [];
        for (var i = 0; i < kids.length; i++) {
            var chip = document.createElement("span");
            chip.className = "mm-chip";
            var color = kids[i]._color || "#666";
            chip.style.background = color + "20";
            chip.style.border = "1px solid " + color + "50";
            chip.style.animationDelay = (i * 0.07) + "s";

            var dot = document.createElement("span");
            dot.className = "mm-chip-dot";
            dot.style.background = color;
            chip.appendChild(dot);

            var txt = document.createTextNode(kids[i].text);
            chip.appendChild(txt);
            chipsEl.appendChild(chip);
        }

        var btn = root.querySelector(".mm-start-btn");
        if (btn) btn.onclick = () => this._openModal();
        card.onclick = (e) => {
            if (e.target.closest(".mm-start-btn")) return;
            this._openModal();
        };
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

    _openModal() {
        if (this._modalEl || !this._mapData || !this._mapData.root) return;

        this._expandedNodes = new Set();
        this._expandedNodes.add(this._mapData.root.id);
        this._scale = 1;
        this._tx = 0;
        this._ty = 0;
        this._renderAnimationMode = "open";

        var doc;
        try { doc = parent.document; } catch (e) { doc = document; }
        this._modalDoc = doc;

        var mode = this._getModalMode();
        var modal = doc.createElement("div");
        modal.id = "mm-modal-" + this._id;
        modal.className = "mm-modal " + mode;

        var panel = document.createElement("div");
        panel.className = "mm-panel " + mode;

        var header = document.createElement("div");
        header.className = "mm-header";

        var topRow = document.createElement("div");
        topRow.className = "mm-header-row";

        var left = document.createElement("div");
        left.className = "mm-header-left";
        left.innerHTML = '<span class="mm-header-icon">' + this._getMindMapIconSvg(this._headerIconColor) + "</span>" +
            '<span class="mm-header-title">' + this._esc(this._mapData.title || "Mapa Mental") + "</span>";

        var btnClose = this._mkBtn("Cerrar", () => this._closeModal(), "close", this._getCloseIconSvg(), true);

        topRow.appendChild(left);
        topRow.appendChild(btnClose);

        var toolbar = document.createElement("div");
        toolbar.className = "mm-toolbar";

        var btnExpand = this._mkBtn("Expandir todo", () => this._expandAll(), "expand", this._getExpandIconSvg());
        var btnCollapse = this._mkBtn("Colapsar todo", () => this._collapseAll(), "collapse-all", this._getCollapseIconSvg());
        var btnCenter = this._mkBtn("Centrar", () => this._centerView(), "center", this._getCenterIconSvg());

        toolbar.appendChild(btnExpand);
        toolbar.appendChild(btnCollapse);
        toolbar.appendChild(btnCenter);

        header.appendChild(topRow);
        header.appendChild(toolbar);
        panel.appendChild(header);

        var canvas = document.createElement("div");
        canvas.className = "mm-canvas";
        this._canvasWrap = canvas;

        var transform = document.createElement("div");
        transform.className = "mm-transform";
        this._transformEl = transform;

        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add("mm-svg");
        svg.setAttribute("width", "1");
        svg.setAttribute("height", "1");
        this._svgEl = svg;
        transform.appendChild(svg);

        var nodes = document.createElement("div");
        nodes.className = "mm-nodes";
        this._nodesContainer = nodes;
        transform.appendChild(nodes);

        canvas.appendChild(transform);

        var zoom = document.createElement("div");
        zoom.className = "mm-zoom";
        var zIn = this._mkBtn("Acercar", () => this._zoomBy(1.25), "zbtn", this._getZoomInIconSvg(), true);
        var zOut = this._mkBtn("Alejar", () => this._zoomBy(0.8), "zbtn", this._getZoomOutIconSvg(), true);
        zoom.appendChild(zIn);
        zoom.appendChild(zOut);
        canvas.appendChild(zoom);

        panel.appendChild(canvas);
        modal.appendChild(panel);
        doc.body.appendChild(modal);
        this._modalEl = modal;
        var safeTop = this._getSafeTop(doc);
        if (safeTop > 0) topRow.style.paddingTop = (safeTop + 10) + 'px';

        this._setupPanZoom(canvas);

        this._boundEsc = (e) => { if (e.key === "Escape") this._closeModal(); };
        doc.addEventListener("keydown", this._boundEsc);

        this._toggleNativeButtons(false);
        this._renderMap();
        setTimeout(() => this._centerView(), 30);
    }

    _mkBtn(label, onClick, kind, iconSvg, iconOnly) {
        var b = document.createElement("button");
        b.setAttribute("aria-label", label);

        if (kind === "zbtn") {
            b.className = "mm-zbtn";
            if (iconSvg) {
                b.innerHTML = iconSvg;
            } else {
                b.textContent = label;
            }
        } else {
            b.className = kind === "close" ? "mm-btn close" : ("mm-btn " + (kind || ""));
            if (iconSvg) {
                if (iconOnly) {
                    b.innerHTML = iconSvg;
                } else {
                    b.innerHTML = '<span class="mm-btn-icon">' + iconSvg + "</span>" + '<span class="mm-btn-label">' + this._esc(label) + "</span>";
                }
            } else {
                b.textContent = label;
            }
        }

        b.onclick = onClick;
        return b;
    }

    _getMindMapIconSvg(color) {
        return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><circle cx="5" cy="7" r="2"/><circle cx="5" cy="17" r="2"/><circle cx="19" cy="7" r="2"/><circle cx="19" cy="17" r="2"/><path d="M9.3 10.4 7 8.6M9.3 13.6 7 15.4M14.7 10.4 17 8.6M14.7 13.6 17 15.4"/></svg>';
    }

    _getCloseIconSvg() {
        return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    }

    _getExpandIconSvg() {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" class="ionicon" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M432 320v112H320M421.8 421.77L304 304M80 192V80h112M90.2 90.23L208 208M320 80h112v112M421.77 90.2L304 208M192 432H80V320M90.23 421.8L208 304"/></svg>';
    }

    _getCollapseIconSvg() {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" class="ionicon" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M304 416V304h112M314.2 314.23L432 432M208 96v112H96M197.8 197.77L80 80M416 208H304V96M314.23 197.8L432 80M96 304h112v112M197.77 314.2L80 432"/></svg>';
        // return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 3 3 3 3 9"/><polyline points="15 21 21 21 21 15"/><line x1="3" y1="3" x2="10" y2="10"/><line x1="21" y1="21" x2="14" y2="14"/></svg>';
    }

    _getCenterIconSvg() {
        // return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" class="ionicon" viewBox="0 0 512 512"><path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M360 94.59V296M443.13 212.87L296 360M417.41 360H216M299.13 443.13l-144-144M152 416V216M68.87 299.13l144-144M94.59 152H288M212.87 68.87L360 216"/></svg>';
        return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>';
    }

    _getZoomInIconSvg() {
        return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';
    }

    _getZoomOutIconSvg() {
        return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';
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
            console.error("Could not toggle native buttons for mind map component. Please ensure your environment supports this feature and that the appropriate handlers are implemented.");
        }
    }

    _closeModal() {
        this._toggleNativeButtons(true);
        if (this._modalEl && this._modalEl.parentNode) {
            var m = this._modalEl;
            m.style.animation = "mmModalOut .25s cubic-bezier(.4,0,.2,1) both";
            m.addEventListener("animationend", function () {
                if (m.parentNode) m.parentNode.removeChild(m);
            });
        }

        this._modalEl = null;
        this._canvasWrap = null;
        this._transformEl = null;
        this._svgEl = null;
        this._nodesContainer = null;
        this._lastBounds = null;

        if (this._boundEsc) {
            (this._modalDoc || document).removeEventListener("keydown", this._boundEsc);
            this._boundEsc = null;
        }
        this._modalDoc = null;
        if (this._boundMouseMove) {
            window.removeEventListener("mousemove", this._boundMouseMove);
            this._boundMouseMove = null;
        }
        if (this._boundMouseUp) {
            window.removeEventListener("mouseup", this._boundMouseUp);
            this._boundMouseUp = null;
        }
    }

    _setupPanZoom(container) {
        var self = this;
        var lastDist = 0;

        container.addEventListener("mousedown", function (e) {
            if (e.button !== 0) return;
            self._dragging = true;
            self._moved = false;
            self._dragX0 = e.clientX;
            self._dragY0 = e.clientY;
            self._tx0 = self._tx;
            self._ty0 = self._ty;
            container.style.cursor = "grabbing";
            e.preventDefault();
        });

        self._boundMouseMove = function (e) {
            if (!self._dragging) return;
            var dx = e.clientX - self._dragX0;
            var dy = e.clientY - self._dragY0;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                self._moved = true;
            }
            self._tx = self._tx0 + dx;
            self._ty = self._ty0 + dy;
            self._applyTransform();
        };
        window.addEventListener("mousemove", self._boundMouseMove);

        self._boundMouseUp = function () {
            if (self._dragging) {
                self._dragging = false;
                self._moved = false;
                container.style.cursor = "grab";
            }
        };
        window.addEventListener("mouseup", self._boundMouseUp);

        container.addEventListener("wheel", function (e) {
            e.preventDefault();
            var rect = container.getBoundingClientRect();
            var mx = e.clientX - rect.left;
            var my = e.clientY - rect.top;
            var factor = e.deltaY > 0 ? 0.9 : 1.1;
            self._zoomAt(mx, my, factor);
        }, { passive: false });

        // Touch support for mobile Chrome: one-finger pan + two-finger pinch zoom.
        container.addEventListener("touchstart", function (e) {
            e.preventDefault();
            if (e.touches.length === 1) {
                self._dragging = true;
                self._moved = false;
                self._dragX0 = e.touches[0].clientX;
                self._dragY0 = e.touches[0].clientY;
                self._tx0 = self._tx;
                self._ty0 = self._ty;
            } else if (e.touches.length === 2) {
                self._dragging = false;
                lastDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
            }
        }, { passive: false });

        container.addEventListener("touchmove", function (e) {
            e.preventDefault();
            if (e.touches.length === 1 && self._dragging) {
                var dx = e.touches[0].clientX - self._dragX0;
                var dy = e.touches[0].clientY - self._dragY0;
                if (Math.abs(dx) > 3 || Math.abs(dy) > 3) self._moved = true;
                self._tx = self._tx0 + dx;
                self._ty = self._ty0 + dy;
                self._applyTransform();
            } else if (e.touches.length === 2) {
                var d = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                var rect = container.getBoundingClientRect();
                var cx = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - rect.left;
                var cy = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - rect.top;
                if (lastDist > 0) {
                    self._zoomAt(cx, cy, d / lastDist);
                }
                lastDist = d;
            }
        }, { passive: false });

        container.addEventListener("touchend", function (e) {
            self._dragging = false;
            if (!self._moved && e.changedTouches.length === 1) {
                var t = e.changedTouches[0];
                var activeDoc = self._modalDoc || document;
                var el = activeDoc.elementFromPoint(t.clientX, t.clientY);
                if (el && typeof el.click === "function") {
                    el.click();
                } else if (el && typeof el.dispatchEvent === "function") {
                    el.dispatchEvent(new MouseEvent("click", {
                        bubbles: true,
                        cancelable: true,
                        clientX: t.clientX,
                        clientY: t.clientY
                    }));
                }
            }
        }, { passive: true });
    }

    _zoomAt(px, py, factor) {
        var ns = Math.min(3, Math.max(0.15, this._scale * factor));
        this._tx = px - (px - this._tx) * (ns / this._scale);
        this._ty = py - (py - this._ty) * (ns / this._scale);
        this._scale = ns;
        this._applyTransform();
    }

    _zoomBy(factor) {
        if (!this._canvasWrap) return;
        var r = this._canvasWrap.getBoundingClientRect();
        this._zoomAt(r.width / 2, r.height / 2, factor);
    }

    _applyTransform() {
        if (!this._transformEl) return;
        this._transformEl.style.transform = "translate(" + this._tx + "px," + this._ty + "px) scale(" + this._scale + ")";
    }

    _renderMap() {
        if (!this._mapData || !this._nodesContainer || !this._svgEl) return;
        this._nodesContainer.innerHTML = "";
        while (this._svgEl.firstChild) this._svgEl.removeChild(this._svgEl.firstChild);
        this._nodeIndex = 0;

        var heights = this._measureHeights(this._mapData.root);
        var layout = this._layout(this._mapData.root, 0, 0, heights);
        this._lastBounds = this._layoutBounds(layout);

        var pad = 120;
        var svgX = this._lastBounds.minX - pad;
        var svgY = this._lastBounds.minY - pad;
        var svgW = (this._lastBounds.maxX - this._lastBounds.minX) + pad * 2;
        var svgH = (this._lastBounds.maxY - this._lastBounds.minY) + pad * 2;
        this._svgEl.setAttribute("viewBox", svgX + " " + svgY + " " + svgW + " " + svgH);
        this._svgEl.setAttribute("width", svgW);
        this._svgEl.setAttribute("height", svgH);
        this._svgEl.style.left = svgX + "px";
        this._svgEl.style.top = svgY + "px";

        this._drawNodes(layout);
        this._drawLines(layout);

        this._renderAnimationMode = "none";
    }

    _measureHeights(root) {
        var h = {};
        var self = this;
        var box = document.createElement("div");
        box.style.cssText = "position:absolute;left:-9999px;top:-9999px;visibility:hidden;pointer-events:none;z-index:-1;";
        this._nodesContainer.appendChild(box);

        this._walk(root, function (n, d) {
            var el = document.createElement("div");
            var w = d === 0 ? self.ROOT_W : self.NODE_W;
            var hasKids = n.children && n.children.length > 0;
            var padding = d === 0 ? "12px 16px" : (hasKids ? "10px 36px 10px 14px" : "10px 14px");
            el.style.cssText = "position:relative;padding:" + padding + ";font-size:" + (d === 0 ? 15 : 13) +
                "px;font-weight:" + (d === 0 ? 700 : 500) + ";width:" + w +
                "px;box-sizing:border-box;line-height:1.35;word-break:break-word;white-space:normal;" +
                "font-family:'Volte',-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;";
            el.textContent = n.text;
            box.appendChild(el);
            h[n.id] = Math.max(38, el.offsetHeight);
            box.removeChild(el);
        });

        this._nodesContainer.removeChild(box);
        return h;
    }

    _layout(node, depth, yStart, hMap) {
        var h = hMap[node.id] || 38;
        var w = depth === 0 ? this.ROOT_W : this.NODE_W;
        var x = this._xForDepth(depth);
        var expanded = this._expandedNodes.has(node.id);
        var kids = (expanded && node.children && node.children.length) ? node.children : [];

        if (depth === 0) {
            var rootY = 0;
            if (kids.length === 0) return { n: node, x: x, y: rootY, w: w, h: h, d: depth, kids: [], th: h };

            var totalKidsH = 0;
            for (var tk = 0; tk < kids.length; tk++) totalKidsH += this._subtreeTotal(kids[tk], depth + 1, hMap);
            totalKidsH += (kids.length - 1) * this.V_GAP;

            var rootCenter = rootY + h / 2;
            var cy0 = rootCenter - totalKidsH / 2;
            var childLayouts0 = [];
            for (var ck = 0; ck < kids.length; ck++) {
                var cl0 = this._layout(kids[ck], depth + 1, cy0, hMap);
                childLayouts0.push(cl0);
                cy0 += cl0.th + this.V_GAP;
            }
            return { n: node, x: x, y: rootY, w: w, h: h, d: depth, kids: childLayouts0, th: Math.max(totalKidsH, h) };
        }

        if (kids.length === 0) return { n: node, x: x, y: yStart, w: w, h: h, d: depth, kids: [], th: h };

        var childLayouts = [];
        var cy = yStart;
        for (var i = 0; i < kids.length; i++) {
            var cl = this._layout(kids[i], depth + 1, cy, hMap);
            childLayouts.push(cl);
            cy += cl.th + this.V_GAP;
        }
        var totalChildH = cy - this.V_GAP - yStart;

        var fc = childLayouts[0];
        var lc = childLayouts[childLayouts.length - 1];
        var mid = ((fc.y + fc.h / 2) + (lc.y + lc.h / 2)) / 2;
        var ny = Math.max(yStart, mid - h / 2);

        return { n: node, x: x, y: ny, w: w, h: h, d: depth, kids: childLayouts, th: Math.max(totalChildH, h) };
    }

    _subtreeTotal(node, depth, hMap) {
        var h = hMap[node.id] || 38;
        var expanded = this._expandedNodes.has(node.id);
        var kids = (expanded && node.children && node.children.length) ? node.children : [];
        if (kids.length === 0) return h;

        var total = 0;
        for (var i = 0; i < kids.length; i++) total += this._subtreeTotal(kids[i], depth + 1, hMap);
        total += (kids.length - 1) * this.V_GAP;
        return Math.max(h, total);
    }

    _xForDepth(d) {
        if (d === 0) return 0;
        return this.ROOT_W + this.H_GAP + (d - 1) * (this.NODE_W + this.H_GAP);
    }

    _drawNodes(L) {
        var node = L.n;
        var color = node._color || "#6366f1";
        var hasKids = node.children && node.children.length > 0;
        var isExp = this._expandedNodes.has(node.id);

        var delay = (this._nodeIndex || 0) * 0.04;
        this._nodeIndex = (this._nodeIndex || 0) + 1;

        var el = document.createElement("div");
        el.className = "mm-node " + (L.d === 0 ? "root" : "child");
        el.setAttribute("data-node-id", node.id);
        el.style.left = L.x + "px";
        el.style.top = L.y + "px";
        el.style.width = L.w + "px";

        if (L.d === 0) {
            el.style.background = "linear-gradient(135deg," + color + ",#4338ca)";
            el.style.boxShadow = "0 4px 20px " + this._rgba(color, 0.35);
        } else {
            el.style.background = this._rgba(color, 0.12);
            el.style.border = "1.5px solid " + this._rgba(color, 0.35);
            if (hasKids) el.style.paddingRight = "36px";
        }

        if (this._renderAnimationMode === "open") {
            el.style.animation = "mmNodeIn .35s " + delay.toFixed(2) + "s cubic-bezier(.25,.46,.45,.94) both";
        }

        var txt = document.createElement("span");
        txt.textContent = node.text;
        el.appendChild(txt);

        if (hasKids) {
            var badge = document.createElement("span");
            badge.className = "mm-node-badge";
            badge.style.background = color;
            badge.textContent = isExp ? "−" : "+";
            if (this._renderAnimationMode === "open") {
                badge.style.animation = "mmBadgePop .3s " + (delay + 0.1).toFixed(2) + "s cubic-bezier(.4,0,.2,1) both";
            }
            el.appendChild(badge);

            if (!isExp) {
                var cnt = document.createElement("span");
                cnt.className = "mm-node-count";
                cnt.textContent = node.children.length;
                el.appendChild(cnt);
            }
        }

        var self = this;
        el.onmouseover = function () {
            el.style.transform = "scale(1.05)";
            el.style.boxShadow = "0 6px 24px " + self._rgba(color, 0.4);
            el.style.zIndex = "10";
        };
        el.onmouseout = function () {
            el.style.transform = "";
            el.style.zIndex = "";
            if (L.d === 0) el.style.boxShadow = "0 4px 20px " + self._rgba(color, 0.35);
            else el.style.boxShadow = "";
        };

        if (hasKids) {
            el.addEventListener("click", function (e) {
                if (self._moved) {
                    return;
                }
                if (self._toggleInProgress) {
                    return;
                }
                e.stopImmediatePropagation();
                self._toggleNode(node.id);
            });
        }

        this._nodesContainer.appendChild(el);
        for (var i = 0; i < L.kids.length; i++) this._drawNodes(L.kids[i]);
    }

    _drawLines(L) {
        for (var i = 0; i < L.kids.length; i++) {
            var c = L.kids[i];
            var color = c.n._color || "#6366f1";

            var x1 = L.x + L.w;
            var y1 = L.y + L.h / 2;
            var x2 = c.x;
            var y2 = c.y + c.h / 2;
            var mx = (x1 + x2) / 2;

            var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
            p.classList.add("mm-line");
            p.setAttribute("d", "M" + x1 + " " + y1 + " C" + mx + " " + y1 + "," + mx + " " + y2 + "," + x2 + " " + y2);
            p.setAttribute("stroke", this._rgba(color, 0.55));
            p.setAttribute("stroke-width", "2");
            p.setAttribute("fill", "none");

            if (this._renderAnimationMode === "open") {
                var len = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) * 1.5;
                p.setAttribute("stroke-dasharray", len);
                p.setAttribute("stroke-dashoffset", len);
                p.style.animation = "mmLineIn .5s " + (i * 0.06).toFixed(2) + "s cubic-bezier(.4,0,.2,1) both";
            }

            this._svgEl.appendChild(p);
            this._drawLines(c);
        }
    }

    _toggleNode(id) {
        if (this._toggleInProgress) return;
        this._toggleInProgress = true;
        var wasExpanded = this._expandedNodes.has(id)
        if (wasExpanded) {
            this._animateCollapse(id);
            this._expandedNodes.delete(id);
            this._renderAnimationMode = "none";
            var self = this;
            setTimeout(function () {
                self._renderMap();
                self._toggleInProgress = false;
            }, 140);
        } else {
            this._expandedNodes.add(id);
            this._renderAnimationMode = "none";
            this._renderMap();
            this._animateExpand(id);
            this._toggleInProgress = false;
        }
    }

    _expandAll() {
        this._walk(this._mapData.root, function (n) {
            if (n.children && n.children.length) this._expandedNodes.add(n.id);
        }.bind(this));
        this._renderAnimationMode = "none";
        this._renderMap();
        this._animateExpand(this._mapData.root.id);
    }

    _collapseAll() {
        this._expandedNodes = new Set();
        this._expandedNodes.add(this._mapData.root.id);
        this._renderAnimationMode = "none";
        this._renderMap();
    }

    _animateCollapse(id) {
        if (!this._nodesContainer || !this._mapData || !this._mapData.root) return;
        var node = this._findNodeById(this._mapData.root, id);
        if (!node) return;

        var ids = [];
        this._collectDescendantIds(node, ids);
        for (var i = 0; i < ids.length; i++) {
            var el = this._nodesContainer.querySelector('[data-node-id="' + ids[i] + '"]');
            if (el) el.style.animation = "mmNodeOut .14s cubic-bezier(.4,0,.2,1) both";
        }
    }

    _animateExpand(id) {
        if (!this._nodesContainer || !this._mapData || !this._mapData.root) return;
        var node = this._findNodeById(this._mapData.root, id);
        if (!node) return;

        var ids = [];
        this._collectVisibleDescendantIds(node, ids);
        for (var i = 0; i < ids.length; i++) {
            var el = this._nodesContainer.querySelector('[data-node-id="' + ids[i] + '"]');
            if (el) {
                el.style.animation = "none";
                el.offsetHeight;
                el.style.animation = "mmNodeInQuick .18s " + (i * 0.02).toFixed(2) + "s cubic-bezier(.25,.46,.45,.94) both";
            }
        }
    }

    _findNodeById(node, id) {
        if (!node) return null;
        if (node.id === id) return node;
        if (!node.children) return null;
        for (var i = 0; i < node.children.length; i++) {
            var found = this._findNodeById(node.children[i], id);
            if (found) return found;
        }
        return null;
    }

    _collectDescendantIds(node, out) {
        if (!node || !node.children) return;
        for (var i = 0; i < node.children.length; i++) {
            out.push(node.children[i].id);
            this._collectDescendantIds(node.children[i], out);
        }
    }

    _collectVisibleDescendantIds(node, out) {
        if (!node || !node.children) return;
        for (var i = 0; i < node.children.length; i++) {
            var child = node.children[i];
            out.push(child.id);
            if (this._expandedNodes.has(child.id)) this._collectVisibleDescendantIds(child, out);
        }
    }

    _layoutBounds(layout) {
        var minX = layout.x;
        var minY = layout.y;
        var maxX = layout.x + layout.w;
        var maxY = layout.y + layout.h;

        for (var i = 0; i < layout.kids.length; i++) {
            var b = this._layoutBounds(layout.kids[i]);
            if (b.minX < minX) minX = b.minX;
            if (b.minY < minY) minY = b.minY;
            if (b.maxX > maxX) maxX = b.maxX;
            if (b.maxY > maxY) maxY = b.maxY;
        }

        return { minX: minX, minY: minY, maxX: maxX, maxY: maxY };
    }

    _centerView() {
        if (!this._canvasWrap || !this._lastBounds) return;
        var vp = this._canvasWrap.getBoundingClientRect();

        var minX = this._lastBounds.minX;
        var minY = this._lastBounds.minY;
        var maxX = this._lastBounds.maxX;
        var maxY = this._lastBounds.maxY;

        var cw = maxX - minX + 120;
        var ch = maxY - minY + 120;
        var sx = vp.width / cw;
        var sy = vp.height / ch;
        this._scale = Math.min(1.2, Math.min(sx, sy));

        this._tx = (vp.width - cw * this._scale) / 2 - (minX - 60) * this._scale;
        this._ty = (vp.height - ch * this._scale) / 2 - (minY - 60) * this._scale;
        this._applyTransform();
    }

    _walk(node, fn, depth) {
        depth = depth || 0;
        fn(node, depth);
        if (node.children) {
            for (var i = 0; i < node.children.length; i++) {
                this._walk(node.children[i], fn, depth + 1);
            }
        }
    }

    _rgba(hex, a) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return "rgba(" + r + "," + g + "," + b + "," + a + ")";
    }

    _esc(s) {
        var d = document.createElement("div");
        d.textContent = s;
        return d.innerHTML;
    }

    _getModalMode() {
        return "mobile";
    }
}

customElements.define("mind-map-lbs", mindMapLbs);
