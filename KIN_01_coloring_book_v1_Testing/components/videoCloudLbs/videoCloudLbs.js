class videoCloudLbs extends componentBase {
  constructor() {
    super();
    this._onOnline = this._handleOnline.bind(this);
    this._onOffline = this._handleOffline.bind(this);
    this._templateReady = false;
  }

  // ─── Carga del template ──────────────────────────────────────────────────

  getData() {
    var self = this;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        self.shadowRoot.innerHTML = xhr.responseText;
        self._templateReady = true;
        self._init();
      }
    };
    xhr.open("GET", "components/videoCloudLbs/videoCloudLbs.html", true);
    xhr.send();
  }

  // ─── Inicialización tras cargar el template ──────────────────────────────

  _init() {
    var self = this;
    var src = this.getAttribute("src") || "";

    // Wiring del botón Reintentar
    var retryBtn = this.shadowRoot.querySelector(".vc-retry");
    if (retryBtn) {
      retryBtn.addEventListener("click", function () {
        var s = self.getAttribute("src") || "";
        if (!s) {
          self._showState("no-src");
          return;
        }
        self._showState("loading");
        self._checkConnectivity(function (ok) {
          ok ? self._renderPlayer(s) : self._showState("offline");
        });
      });
    }

    if (!src) {
      this._showState("no-src");
      return;
    }

    this._showState("loading");
    this._checkConnectivity(function (ok) {
      ok ? self._renderPlayer(src) : self._showState("offline");
    });
  }

  // ─── Verificación de conectividad (XHR — sin fetch, falla en Android) ───

  _checkConnectivity(cb) {
    if (!navigator.onLine) { cb(false); return; }
    // Image() evita CORS — las imágenes cross-origin cargan sin restricción.
    // onload = internet ok | onerror = sin red o servidor caído.
    var done  = false;
    var timer = setTimeout(function () {
      if (!done) { done = true; cb(false); }
    }, 4000);
    var img     = new Image();
    img.onload  = function () {
      if (!done) { done = true; clearTimeout(timer); cb(true); }
    };
    img.onerror = function () {
      if (!done) { done = true; clearTimeout(timer); cb(false); }
    };
    // favicon.ico devuelve 200 + imagen real → onload dispara cuando hay internet
    img.src = "https://www.google.com/favicon.ico?" + Date.now();
  }

  // ─── Renderizado del player ──────────────────────────────────────────────

  _renderPlayer(src) {
    var iframe = this.shadowRoot.querySelector(".vc-iframe");
    if (iframe) iframe.setAttribute("src", src);
    this._showState("player");
  }

  // ─── Control de estados ──────────────────────────────────────────────────

  _showState(state) {
    var ids = ["loading", "offline", "no-src", "player"];
    for (var i = 0; i < ids.length; i++) {
      var el = this.shadowRoot.querySelector("#state-" + ids[i]);
      if (el) el.style.display = ids[i] === state ? "" : "none";
    }
  }

  // ─── Handlers de red ────────────────────────────────────────────────────

  _handleOnline() {
    if (!this._templateReady) return;
    var self = this;
    var src = this.getAttribute("src") || "";
    if (!src) return;
    this._showState("loading");
    this._checkConnectivity(function (ok) {
      ok ? self._renderPlayer(src) : self._showState("offline");
    });
  }

  _handleOffline() {
    if (!this._templateReady) return;
    this._showState("offline");
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────

  connectedCallback() {
    window.addEventListener("online", this._onOnline);
    window.addEventListener("offline", this._onOffline);
    this.getData();
  }

  disconnectedCallback() {
    window.removeEventListener("online", this._onOnline);
    window.removeEventListener("offline", this._onOffline);
  }
}

customElements.define("video-cloud-lbs", videoCloudLbs);
