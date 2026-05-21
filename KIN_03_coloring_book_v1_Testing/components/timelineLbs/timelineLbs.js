class timelineLbs extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._asset = '';
		this._isVisible = false;
		this._iframe = null;

		// Estilos
		const style = document.createElement('style');
		style.textContent = `
			:host {
				display: block;
				width: 100%;
				height: 100%;
				position: relative;
				background: #222;
				box-sizing: border-box;
			}

			.outer-container {
				width: 100%;
				height: 100%;
				position: relative;
				overflow: visible;
				background: #222;
				display: flex;
				justify-content: center;
				align-items: center;
				box-sizing: border-box;
			}

			.inner-container {
				position: relative;
				width: 100%;
				height: 100%;
				display: flex;
				justify-content: center;
				align-items: center;
				background: #222;
				box-sizing: border-box;
			}

			iframe {
				border: none;
				background: #222;
				width: 100%;
				height: 100%;
				display: block;
				box-sizing: border-box;
				opacity: 0;
				transition: opacity 0.3s ease-in-out;
			}

			iframe.loaded {
				opacity: 1;
			}

			@media screen and (max-width: 1023px) {
				:host {
					width: 100vw;
					height: 100vh;
				}
				.outer-container,
				.inner-container,
				iframe {
					width: 100%;
					height: 100%;
				}
			}

			@media screen and (max-width: 480px) {
				.outer-container {
					padding: 5px 0;
				}
				.inner-container,
				iframe {
					min-height: calc(100vh - 28px);
				}
			}
		`;
		this.shadowRoot.appendChild(style);

		// Crear contenedores
		this.outerContainer = document.createElement('div');
		this.outerContainer.className = 'outer-container';

		this.innerContainer = document.createElement('div');
		this.innerContainer.className = 'inner-container';

		this.outerContainer.appendChild(this.innerContainer);
		this.shadowRoot.appendChild(this.outerContainer);

		// Intersection Observer
		this.observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					this._isVisible = true;
					this.loadIframe();
					this.observer.disconnect();
				}
			});
		}, {
			threshold: 0.001
		});
	}

	get asset() {
		return this._asset;
	}

	set asset(value) {
		if (this._asset !== value) {
			this._asset = value;
			this.updateContent();
		}
	}

	static get observedAttributes() {
		return ['asset'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'asset' && oldValue !== newValue) {
			this._asset = newValue;
			this.updateContent();
		}
	}

	updateContent() {
		// Limpiar iframe anterior
		const oldIframe = this.innerContainer.querySelector('iframe');
		if (oldIframe) {
			oldIframe.remove();
		}

		// Solo crear iframe si ya es visible
		if (this._isVisible && this._asset) {
			this.loadIframe();
		} else {
			this.observer.observe(this);
		}
	}

	loadIframe() {
		if (this._asset) {
			this._iframe = document.createElement('iframe');
			this._iframe.style.border = 'none';
			this._iframe.style.background = '#222';
			this._iframe.src = this._asset;

			// Agregar evento de carga para manejar la transición y los estilos
			this._iframe.onload = () => {
				this._iframe.classList.add('loaded');
				
				try {
					// Intentar acceder al documento del iframe
					const iframeDoc = this._iframe.contentDocument || this._iframe.contentWindow.document;
					
					// Crear y agregar el estilo
					const style = iframeDoc.createElement('style');
					style.textContent = `
						.genially-view-navigation-actions-container {
							display: none !important;
						}
						a {
							display: none !important;
						}
					`;
					iframeDoc.head.appendChild(style);
				} catch (e) {
					console.warn('No se pudo acceder al contenido del iframe debido a restricciones de seguridad:', e);
				}
			};

			this._iframe.onerror = (error) => {
				console.error('Error loading iframe content:', error);
			};

			this.innerContainer.appendChild(this._iframe);
		}
	}

	connectedCallback() {
		this.updateContent();
	}

	disconnectedCallback() {
		if (this.observer) {
			this.observer.disconnect();
		}
	}
}

customElements.define('timeline-lbs', timelineLbs);
