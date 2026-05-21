class diapositivasLbs extends componentBase {

  constructor() {
      super();
      this._slides       = [];
      this._currentIndex = 0;
      this._titulo       = 'Presentación LM1';
      this._modalEl      = null;
      this._modalShadow  = null;
      this._navigating   = false;
      this._keyHandler   = null;
  }

  async getData() {
      
      let txt = "";
      const xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = () => {
                if ((xmlhttp.status === 200 || xmlhttp.status === 0) && xmlhttp.readyState === 4) {
          txt = xmlhttp.responseText;
          this.shadowRoot.innerHTML = txt;

          // Handle click on any active slide
          this.shadowRoot
            .querySelector("swiper-container")
            .addEventListener("click", (event) => {
              const clickedSlide = event.target.closest(".swiper-slide-active");
              if (clickedSlide) {
                this.slideTouched(clickedSlide);
              }
            });
          this.updateStyle(this);
                    setTimeout(() => {
                        this._logicData(this);
                    }, 100);
        }
      };
      xmlhttp.open(
        "GET",
                "componentsAndroid/diapositivasLbs/diapositivasLbs.html",
        true
      );
      xmlhttp.send();
  }

  updateStyle(elem) {
      const shadow = elem.shadowRoot;

      shadow.querySelector("style").textContent = `

      #main-container {
          top: 300px;
          position: absolute;
          width: 900px;
          margin: 0 auto;
      }

      /* swiper container itself */
      swiper-slide {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 18px;
        font-size: 22px;
        color: #fff;
      }

      `;

            const linkSwiperCss = document.createElement("link");
            linkSwiperCss.setAttribute("rel", "stylesheet");
            linkSwiperCss.setAttribute("href", "assets/package/swiper-bundle.min.css");

            const scriptSwiperBundle = document.createElement("script");
            scriptSwiperBundle.setAttribute("src", "assets/package/swiper-bundle.min.js");

            const scriptSwiperElement = document.createElement("script");
            scriptSwiperElement.setAttribute("src", "assets/package/swiper-element-bundle.min.js");

            shadow.insertBefore(linkSwiperCss, shadow.firstChild);
            shadow.insertBefore(scriptSwiperBundle, shadow.firstChild);
            shadow.insertBefore(scriptSwiperElement, shadow.firstChild);

      this._id = elem.getAttribute("id");

      this.observers();
      this.loadData();
  }

  // For this slider we don't rely on JSON; we just show the 15 PNG slides
  _insertDataSlider(){
    return new Promise(resolve => {
      const swiperCont = this.shadowRoot.querySelector("swiper-container");
      const base = document.location.href.substring(0, document.location.href.lastIndexOf('/') + 1);
      const carpeta = this.getAttribute("pagina");
      const totalSlides = 13;

      for (let i = 1; i <= totalSlides; i++) {
        const swiperSlide = document.createElement("swiper-slide");
        const div = document.createElement("div");
        div.setAttribute("class", "swiper-slide-content");

        const img = document.createElement("img");
        img.setAttribute("class", "swiper-slide-bg-image");

        const slideNumber = String(i).padStart(2, "0");
        const src = base + `assets/slides/${carpeta}/Slide_${slideNumber}.png`;
        img.setAttribute("src", src);
        this._slides.push(src);

        // const clickVideo = document.createElement("img");
        // clickVideo.muted = true;
        // clickVideo.setAttribute("class", "video-click");
        // clickVideo.setAttribute("src", "assets/img/click.gif");
        
        swiperCont.appendChild(swiperSlide);
        swiperCont.children[i - 1].appendChild(img);
        swiperCont.children[i - 1].appendChild(div);
        // swiperCont.children[i - 1].appendChild(clickVideo);
      }

      resolve(swiperCont);
      return swiperCont;
    });
  }

  async _logicData(elem) {
    this._insertDataSlider()
    .then((swiperCont) => {
      const swiper = new Swiper("swiper-container");
      Object.assign(swiperCont, {
        centeredSlides: true,
        loop: true,
        slidesPerView: 1.1,
        spaceBetween: 9,
        effect: "slide",
        pagination: { dynamicBullets: true },
        injectStyles: [`
        .swiper-pagination-bullet {
          width: 30px;
          height: 30px;
          text-align: center;
          line-height: 30px;
          font-size: 20px;
          color: #000;
          opacity: 1;
          background: rgba(229,111,31, 0.3);
        }
  
        .swiper-pagination-bullet-active {
          color: #fff;
          background: #e56f1f;
        }
        `],
      });
      
      swiperCont.initialize();

      const swiperShadow = swiperCont.shadowRoot.querySelector(".swiper");
      const wrapperShadow = swiperCont.shadowRoot.querySelector(".swiper-wrapper");
      swiperShadow.style.cssText += "height:105%;";
      wrapperShadow.style.cssText += "height:94%;";

    })
    .catch((error) => {
        console.error(error.message);
    });
  }

  slideTouched(elem) {
    // abrir modal tipo slidesLbs, creado en parent.document
    this._openModal();
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

  // ─── MODAL estilo slidesLbs ───────────────────────────────────────────────

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
          '<div class="sl-backdrop">' +
              '<div class="sl-modal">' +
                  '<div class="sl-modal-header"></div>' +
                  '<div class="sl-modal-content"></div>' +
              '</div>' +
          '</div>';

      const backdrop = this._modalShadow.querySelector('.sl-backdrop');
      backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) this._closeModal();
      });

      // Navegación con teclado
      this._keyHandler = (e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Escape') {
              e.stopImmediatePropagation();
              e.preventDefault();
              if (e.key === 'ArrowDown') {
                  this._navigateModal(-1);
              } else if (e.key === 'ArrowUp') {
                  this._navigateModal(1);
              } else if (e.key === 'Escape') {
                  this._closeModal();
              }
          }
      };
      this._win.addEventListener('keydown', this._keyHandler, { capture: true });

      this._refreshModal();
      this._toggleNativeButtons(false);
  }

  _refreshModal() {
      const root = this._modalShadow;
      if (!root) return;

      const headerEl  = root.querySelector('.sl-modal-header');
      const contentEl = root.querySelector('.sl-modal-content');
      if (!headerEl || !contentEl) return;

      headerEl.innerHTML  = this._renderModalHeader();
      contentEl.innerHTML = this._renderSlideContent();
      this._bindModalEvents();
  }

  _renderModalHeader() {
      return (
          '<span class="sl-header-counter">' +
          (this._currentIndex + 1) +
          ' / ' +
          this._slides.length +
          '</span>' +
          '<span class="sl-header-title">' +
          this._titulo +
          '</span>' +
          '<button class="sl-close-x">✕</button>'
      );
  }

  _renderSlideContent() {
      const current = this._currentIndex;
      const total   = this._slides.length;
      const isFirst = current === 0;
      const isLast  = current === total - 1;

      const svgLeft  = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
      const svgRight = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';

      const dotsHtml = this._slides.map((_, i) =>
          '<button class="sl-modal-dot' + (i === current ? ' active' : '') + '" data-idx="' + i + '"></button>'
      ).join('');

      const mkWrap = (cls, src) =>
          '<div class="sl-img-wrap ' + cls + '">' +
              (src ? '<img class="sl-slide-img" src="' + src + '" alt="" />' : '') +
          '</div>';

      return (
          mkWrap('sl-slide-prev',    !isFirst ? this._slides[current - 1] : '') +
          mkWrap('sl-slide-current',  this._slides[current]) +
          mkWrap('sl-slide-next',    !isLast  ? this._slides[current + 1] : '') +
          '<button class="sl-modal-arrow sl-modal-prev"' + (isFirst ? ' disabled' : '') + '>' +
              '<span class="sl-arrow-icon">' + svgLeft + '</span>' +
          '</button>' +
          '<button class="sl-modal-arrow sl-modal-next"' + (isLast ? ' disabled' : '') + '>' +
              '<span class="sl-arrow-icon">' + svgRight + '</span>' +
          '</button>' +
          '<div class="sl-modal-footer">' + dotsHtml + '</div>'
      );
  }

  _bindModalEvents() {
      const root = this._modalShadow;
      if (!root) return;

      const closeX = root.querySelector('.sl-close-x');
      if (closeX) closeX.addEventListener('click', () => this._closeModal());

      const prevBtn = root.querySelector('.sl-modal-prev');
      if (prevBtn) prevBtn.addEventListener('click', () => this._navigateModal(1));

      const nextBtn = root.querySelector('.sl-modal-next');
      if (nextBtn) nextBtn.addEventListener('click', () => this._navigateModal(-1));

      root.querySelectorAll('.sl-modal-dot').forEach((dot) => {
          dot.addEventListener('click', () => {
              const idx = parseInt(dot.getAttribute('data-idx'));
              if (idx !== this._currentIndex && !Number.isNaN(idx)) {
                  this._currentIndex = idx;
                  this._refreshModalSlide();
              }
          });
      });

      const contentEl = root.querySelector('.sl-modal-content');
      if (contentEl) this._bindModalSwipe(contentEl);
  }

  _bindModalSwipe(el) {
      let startY    = 0;
      let dragging  = false;
      const threshold = 70;

      const get = (cls) => el.querySelector('.' + cls);

      const setTransitions = (on) => {
          const val = on ? 'transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none';
          ['sl-slide-prev', 'sl-slide-current', 'sl-slide-next'].forEach(function(cls) {
              const n = el.querySelector('.' + cls);
              if (n) n.style.transition = val;
          });
      };

      const applyDrag = (deltaY) => {
          const isEdge = (deltaY < 0 && this._currentIndex >= this._slides.length - 1) ||
                         (deltaY > 0 && this._currentIndex <= 0);
          const dy = isEdge ? Math.max(-40, Math.min(40, deltaY * 0.1)) : deltaY;
          const prev = get('sl-slide-prev'), cur = get('sl-slide-current'), next = get('sl-slide-next');
          if (cur)  cur.style.transform  = 'translateY(' + dy + 'px)';
          if (prev) prev.style.transform = 'translateY(calc(-100% + ' + dy + 'px))';
          if (next) next.style.transform = 'translateY(calc(100% + '  + dy + 'px))';
      };

      const snapBack = () => {
          setTransitions(true);
          const prev = get('sl-slide-prev'), cur = get('sl-slide-current'), next = get('sl-slide-next');
          if (cur)  cur.style.transform  = 'translateY(0)';
          if (prev) prev.style.transform = 'translateY(-100%)';
          if (next) next.style.transform = 'translateY(100%)';
          setTimeout(() => { setTransitions(false); }, 340);
      };

      const finishSwipe = (deltaY, fromMouse) => {
          if (fromMouse && Math.abs(deltaY) >= threshold) {
              el.addEventListener('click', function stopClick(e) {
                  e.stopPropagation();
                  el.removeEventListener('click', stopClick, true);
              }, true);
          }
          if (deltaY < -threshold && this._currentIndex < this._slides.length - 1) {
              this._navigateModal(-1);
          } else if (deltaY > threshold && this._currentIndex > 0) {
              this._navigateModal(1);
          } else {
              snapBack();
          }
      };

      // Touch
      el.addEventListener('touchstart', (e) => {
          if (this._navigating) return;
          startY = e.touches[0].clientY; dragging = true;
          setTransitions(false);
      }, { passive: true });

      el.addEventListener('touchmove', (e) => {
          if (!dragging) return;
          applyDrag(e.touches[0].clientY - startY);
      }, { passive: true });

      el.addEventListener('touchend', (e) => {
          if (!dragging) return; dragging = false;
          finishSwipe(e.changedTouches[0].clientY - startY, false);
      }, { passive: true });

      // Mouse
      el.addEventListener('mousedown', (e) => {
          if (this._navigating) return;
          startY = e.clientY; dragging = true;
          el.style.cursor = 'grabbing';
          setTransitions(false);
      });

      el.addEventListener('mousemove', (e) => {
          if (!dragging) return;
          applyDrag(e.clientY - startY);
      });

      el.addEventListener('mouseup', (e) => {
          if (!dragging) return; dragging = false;
          el.style.cursor = '';
          finishSwipe(e.clientY - startY, true);
      });

      el.addEventListener('mouseleave', () => {
          if (!dragging) return; dragging = false;
          el.style.cursor = '';
          snapBack();
      });
  }

  _navigateModal(dir) {
      if (this._navigating) return;
      if (dir < 0 && this._currentIndex >= this._slides.length - 1) return;
      if (dir > 0 && this._currentIndex <= 0) return;
      const root = this._modalShadow;
      if (!root) return;
      const el = root.querySelector('.sl-modal-content');
      if (!el) return;

      this._navigating = true;
      const h   = el.offsetHeight;
      const get = (cls) => el.querySelector('.' + cls);

      const setTransitions = (on) => {
          const val = on ? 'transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none';
          ['sl-slide-prev', 'sl-slide-current', 'sl-slide-next'].forEach(function(cls) {
              const n = el.querySelector('.' + cls); if (n) n.style.transition = val;
          });
      };

      setTransitions(true);
      const prev = get('sl-slide-prev'), cur = get('sl-slide-current'), next = get('sl-slide-next');
      if (dir < 0) {
          if (cur)  cur.style.transform  = 'translateY(-' + h + 'px)';
          if (next) next.style.transform = 'translateY(0)';
          if (prev) prev.style.transform = 'translateY(-200%)';
      } else {
          if (cur)  cur.style.transform  = 'translateY(' + h + 'px)';
          if (prev) prev.style.transform = 'translateY(0)';
          if (next) next.style.transform = 'translateY(200%)';
      }
      setTimeout(() => {
          this._currentIndex += (dir < 0 ? 1 : -1);
          this._refreshModalSlide();
          this._navigating = false;
      }, 340);
  }

  _refreshModalSlide() {
      const root = this._modalShadow;
      if (!root) return;

      const current = this._currentIndex;
      const total   = this._slides.length;

      ['sl-slide-prev', 'sl-slide-current', 'sl-slide-next'].forEach(function(cls) {
          const n = root.querySelector('.' + cls);
          if (n) { n.style.transition = 'none'; n.style.transform = ''; }
      });

      const setSlot = (cls, src) => {
          const wrap = root.querySelector('.' + cls);
          if (!wrap) return;
          const img = wrap.querySelector('.sl-slide-img');
          if (src) {
              if (img) { img.src = src; }
              else { wrap.innerHTML = '<img class="sl-slide-img" src="' + src + '" alt="" />'; }
          } else {
              wrap.innerHTML = '';
          }
      };
      setSlot('sl-slide-prev',    current > 0         ? this._slides[current - 1] : '');
      setSlot('sl-slide-current', this._slides[current]);
      setSlot('sl-slide-next',    current < total - 1 ? this._slides[current + 1] : '');

      const counter = root.querySelector('.sl-header-counter');
      if (counter) counter.textContent = (current + 1) + ' / ' + total;

      const prevBtn = root.querySelector('.sl-modal-prev');
      const nextBtn = root.querySelector('.sl-modal-next');
      if (prevBtn) prevBtn.disabled = current === 0;
      if (nextBtn) nextBtn.disabled = current === total - 1;

      root.querySelectorAll('.sl-modal-dot').forEach(function(dot, i) {
          dot.className = 'sl-modal-dot' + (i === current ? ' active' : '');
      });
  }

  _closeModal() {
      this._toggleNativeButtons(true);
      if (this._keyHandler) {
          (this._win || window).removeEventListener('keydown', this._keyHandler, { capture: true });
          this._keyHandler = null;
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

  _getModalStyles() {
      return `
      * { box-sizing: border-box; margin: 0; padding: 0; }

      .sl-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.96);
          z-index: 9998;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      .sl-modal {
          width: 100%;
          height: 100%;
          border-radius: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background: #080810;
      }

      .sl-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: calc(var(--safe-top, 0px) + 10px) 14px 10px 14px;
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
          gap: 10px;
      }
      .sl-header-counter {
          font-size: clamp(11px, 1.2vw, 14px);
          color: rgba(255,255,255,0.4);
          font-variant-numeric: tabular-nums;
          min-width: 42px;
          white-space: nowrap;
      }
      .sl-header-title {
          font-size: clamp(13px, 1.6vw, 22px);
          font-weight: 600;
          color: rgba(255,255,255,0.7);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
          text-align: center;
      }
      .sl-close-x {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 6px 8px;
          color: rgba(255,255,255,0.75);
          cursor: pointer;
          touch-action: manipulation;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
      }

      .sl-modal-content {
          flex: 1;
          position: relative;
          overflow: hidden;
          background: #000;
      }

      .sl-img-wrap {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
      }
      .sl-slide-prev    { transform: translateY(-100%); }
      .sl-slide-current { transform: translateY(0); }
      .sl-slide-next    { transform: translateY(100%); }

      .sl-slide-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          display: block;
          border-radius: 2px;
          pointer-events: none;
          user-select: none;
      }

      .sl-modal-arrow {
          position: absolute;
          right: 16px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(0,0,0,0.45);
          border: 1px solid rgba(255,255,255,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: rgba(255,255,255,0.8);
          touch-action: manipulation;
          z-index: 10;
          transition: background 0.2s, transform 0.15s;
      }
      .sl-modal-prev { top: calc(50% - 50px); }
      .sl-modal-next { top: calc(50% + 6px); }
      .sl-modal-arrow:hover  { background: rgba(255,255,255,0.18); }
      .sl-modal-arrow:active { transform: scale(0.92); }
      .sl-modal-arrow:disabled { opacity: 0.2; cursor: not-allowed; transform: none; }

      .sl-arrow-icon {
          display: flex; align-items: center; justify-content: center;
      }

      .sl-modal-footer {
          position: absolute;
          bottom: 14px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 5px;
          z-index: 11;
      }
      .sl-modal-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          border: none;
          padding: 0;
          cursor: pointer;
          touch-action: manipulation;
      }
      .sl-modal-dot.active { background: #fff; }
      `;
  }
  
  loadData(){
      const search = this.Visor.store.getState().bookReducer.filter(a => a.elemento == this._id);

      if(search != 0) {
          this._itemLbs.value = search[0].data;
      } 
  }

  observers(){
      this._unsubscribe = this.Visor.store.subscribe(()=>{
          
          const search = this.Visor.store.getState().bookReducer.filter(a => a.elemento == this._id);

          if(search != 0) {
              this._itemLbs.value = search[0].data;
          }

      });
  }

  connectedCallback() {
      this.getData();
  }
  disconnectedCallback() {
      this._unsubscribe();
  }
}

customElements.define("diapositivas-lbs", diapositivasLbs);

