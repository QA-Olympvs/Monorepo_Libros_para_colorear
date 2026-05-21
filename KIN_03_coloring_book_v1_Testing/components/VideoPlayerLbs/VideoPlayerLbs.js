class VideoPlayerLbs extends componentBase {
  constructor() {
    super();
    this._videoElement = null;
  }

  async getData() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.status == 200 && xmlhttp.readyState == 4) {
        this.shadowRoot.innerHTML = xmlhttp.responseText;
        this._setupVideo(this);
      }
    };
    xmlhttp.open("GET", "components/VideoPlayerLbs/VideoPlayerLbs.html", true);
    xmlhttp.send();
  }

  _setupVideo(elem) {
    const video      = this.shadowRoot.querySelector("video");
    const archivo    = this.getAttribute("video");
    const placeholder = this.getAttribute("placeholder");

    if (placeholder) {
      video.setAttribute("poster", `assets/img/${placeholder}`);
    }

    // Cargar src solo cuando el elemento es visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!video.src) {
            video.setAttribute("preload", "metadata");
            video.setAttribute("src", "assets/videos/" + archivo + ".mp4");
          }
        } else {
          video.pause();
          video.removeAttribute("src");
          video.load();
        }
      });
    }, { threshold: 0.1 });

    observer.observe(video);
    this._observer    = observer;
    this._videoElement = video;

    this._setupCustomControls(video);
    this._setupPlayerButton();
  }

  _setupCustomControls(video) {
    const root        = this.shadowRoot;
    const tap         = root.querySelector('.vp-tap');
    const centerIcon  = root.querySelector('.vp-center-icon');
    const controls    = root.querySelector('.vp-controls');
    const btnPlay     = root.querySelector('.vp-btn-play');
    const btnMute     = root.querySelector('.vp-btn-mute');
    const progressEl  = root.querySelector('.vp-progress-touch');
    const fill        = root.querySelector('.vp-progress-fill');
    const thumb       = root.querySelector('.vp-progress-thumb');
    const timeCur     = root.querySelector('.vp-cur');
    const timeTotal   = root.querySelector('.vp-total');
    const iconSound   = root.querySelector('.icon-sound');
    const iconMute    = root.querySelector('.icon-mute');

    let hideTimer   = null;
    let isSeeking   = false;
    let lastTapTime = 0;
    let lastTapSide = null;
    let tapTimer    = null;

    const SVG_PLAY  = '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>';
    const SVG_PAUSE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
    const SVG_PLAY_CENTER  = '<svg width="22" height="22" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>';
    const SVG_PAUSE_CENTER = '<svg width="22" height="22" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';

    const fmt = (s) => {
      if (isNaN(s)) return '0:00';
      const m = Math.floor(s / 60);
      return m + ':' + String(Math.floor(s % 60)).padStart(2, '0');
    };

    const showControls = () => {
      controls.style.opacity = '1';
      controls.classList.add('active');
      centerIcon.style.opacity = '1';
      clearTimeout(hideTimer);
      if (!video.paused) {
        hideTimer = setTimeout(hideControls, 3000);
      }
    };

    const hideControls = () => {
      controls.style.opacity = '0';
      controls.classList.remove('active');
      centerIcon.style.opacity = '0';
    };

    const syncPlayIcon = () => {
      btnPlay.innerHTML     = video.paused ? SVG_PLAY : SVG_PAUSE;
      centerIcon.innerHTML  = video.paused ? SVG_PLAY_CENTER : SVG_PAUSE_CENTER;
    };

    const togglePlay = () => {
      video.paused ? video.play() : video.pause();
    };

    // ── Eventos del video ──────────────────────────────────────────
    video.addEventListener('play', () => {
      syncPlayIcon();
      hideTimer = setTimeout(hideControls, 3000);
    });

    video.addEventListener('pause', () => {
      syncPlayIcon();
      clearTimeout(hideTimer);
      showControls();
    });

    video.addEventListener('ended', () => {
      syncPlayIcon();
      clearTimeout(hideTimer);
      showControls();
    });

    video.addEventListener('timeupdate', () => {
      if (!video.duration) return;
      const pct = (video.currentTime / video.duration) * 100;
      fill.style.width  = pct + '%';
      thumb.style.left  = pct + '%';
      timeCur.textContent = fmt(video.currentTime);
    });

    video.addEventListener('loadedmetadata', () => {
      timeTotal.textContent = fmt(video.duration);
    });

    // ── Skip feedback ──────────────────────────────────────────────
    const skipFbLeft  = root.querySelector('.vp-skip-fb-left');
    const skipFbRight = root.querySelector('.vp-skip-fb-right');
    let skipFbTimer   = null;

    const showSkipFeedback = (side) => {
      const el = side === 'left' ? skipFbLeft : skipFbRight;
      el.classList.add('visible');
      clearTimeout(skipFbTimer);
      skipFbTimer = setTimeout(() => el.classList.remove('visible'), 700);
    };

    const skipSeconds = (secs) => {
      video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + secs));
      showControls();
    };

    // ── Tap overlay — detecta simple tap y doble tap ───────────────
    tap.addEventListener('click', (e) => {
      const now  = Date.now();
      const rect = tap.getBoundingClientRect();
      const side = (e.clientX - rect.left) < rect.width / 2 ? 'left' : 'right';

      if (now - lastTapTime < 300 && side === lastTapSide) {
        // Doble tap — cancelar single tap pendiente y hacer skip
        clearTimeout(tapTimer);
        lastTapTime = 0;
        if (side === 'right') {
          skipSeconds(15);
          showSkipFeedback('right');
        } else {
          skipSeconds(-15);
          showSkipFeedback('left');
        }
      } else {
        // Primer tap — esperar si viene un segundo
        lastTapTime = now;
        lastTapSide = side;
        tapTimer = setTimeout(() => {
          togglePlay();
          showControls();
        }, 250);
      }
    });

    // ── Botón play/pause ──────────────────────────────────────────
    btnPlay.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlay();
      showControls();
    });

    // ── Botón mute ────────────────────────────────────────────────
    btnMute.addEventListener('click', (e) => {
      e.stopPropagation();
      video.muted = !video.muted;
      iconSound.style.display = video.muted ? 'none'  : '';
      iconMute.style.display  = video.muted ? ''      : 'none';
      showControls();
    });

    // ── Seek bar ──────────────────────────────────────────────────
    const seekTo = (clientX) => {
      const rect = progressEl.getBoundingClientRect();
      const pct  = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      if (video.duration) video.currentTime = pct * video.duration;
    };

    progressEl.addEventListener('click', (e) => {
      e.stopPropagation();
      seekTo(e.clientX);
      showControls();
    });

    progressEl.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      isSeeking = true;
      progressEl.classList.add('vp-seeking');
      seekTo(e.touches[0].clientX);
    }, { passive: true });

    progressEl.addEventListener('touchmove', (e) => {
      if (!isSeeking) return;
      e.stopPropagation();
      seekTo(e.touches[0].clientX);
    }, { passive: true });

    progressEl.addEventListener('touchend', () => {
      isSeeking = false;
      progressEl.classList.remove('vp-seeking');
      showControls();
    });

    // Estado inicial
    syncPlayIcon();
    showControls();
  }

  _setupPlayerButton() {
    const playButton = this.parentElement
      ? this.parentElement.querySelector(".play-button")
      : null;
    if (!playButton) return;
    playButton.addEventListener("click", () => {
      if (this._videoElement) this.play();
    });
  }

  play() {
    if (this._videoElement) this._videoElement.play();
  }

  pause() {
    if (this._videoElement) this._videoElement.pause();
  }

  connectedCallback() {
    this.getData();
  }

  disconnectedCallback() {
    if (this._observer) this._observer.disconnect();
    if (this._videoElement) {
      this._videoElement.pause();
      this._videoElement.removeAttribute("src");
      this._videoElement.load();
      this._videoElement = null;
    }
    this._unsubscribe();
  }
}

customElements.define("video-player-lbs", VideoPlayerLbs);
