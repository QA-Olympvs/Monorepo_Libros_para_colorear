let currentIndex = 0;

class ColorearDibujoLBS extends componentBase {

    constructor() {
        super();
        this._ejercicioLBS;
        this.db = null;
    }

    connectedCallback() {
        this.loadComponent();
    }

    loadComponent() {

        const xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = async () => {

            if (xmlhttp.readyState === 4) {

                if (xmlhttp.status === 200) {

                    try {

                        // Insertar HTML
                        this.shadowRoot.innerHTML = xmlhttp.responseText;

                        // CSS
                        this.updateStyle();

                        // Firebase
                        this.initializeFirebase();

                        // Eventos del juego
                        this.initializeGameElements();

                        // Restaurar datos guardados
                        await this.cargarDatosDesdeFirestore();

                    } catch (error) {
                        console.error('Error inicializando componente:', error);
                    }

                } else {
                    console.error(`HTTP error! status: ${xmlhttp.status} | ColorearDibujo Could not be fetched`);
                }
            }
        };

        const archivo = this.getAttribute('archivo') || '0';

        xmlhttp.open("GET", `./components/coloring_book/draws/${archivo}.html`, true);

        xmlhttp.send();
    }

    // =========================
    // FIREBASE
    // =========================

    initializeFirebase() {

        if (!firebase.apps.length) {
            throw new Error("Firebase no ha sido inicializado desde componentBase");
        }

        const app = firebase.app();

        this.db = app.firestore();
    }

    obtenerUsuario() {
        return this.Visor.tokenUser.usuario;
    }

    obtenerID() {
        return this.Visor.tokenUser.id;
    }

    // =========================
    // LOAD FUNCTIONS
    // =========================

    initializeGameElements() {

        this._ejercicioLBS = this.shadowRoot.querySelector("#pantalla-juego");

        this.setupColorSelection();

        this.setupPieceColoring();

        this.setupStartButton();

        this.setupCartonEvents();

        this.setupSaveButton();
    }

    setupColorSelection() {

        const colores = this.shadowRoot.querySelectorAll('.color');

        colores.forEach(color => {

            color.addEventListener('click', () => this.selectColor(color));

        });
    }

    setupPieceColoring() {

        const piezas = this.shadowRoot.querySelectorAll('.pieza');

        piezas.forEach(pieza => {

            pieza.addEventListener('click', () => this.colorPiece(pieza));

        });
    }

    setupStartButton() {

        const botonIniciar = this.shadowRoot.getElementById('boton-iniciar');

        if (!botonIniciar) return;

        botonIniciar.addEventListener('click', this.startGame.bind(this));
    }

    setupCartonEvents() {

        const icono = this.shadowRoot.getElementById('icono');
        const carton = this.shadowRoot.getElementById('carton');
        const cerrarCarton = this.shadowRoot.getElementById('cerrar_carton');

        if (icono && carton) {

            icono.addEventListener('click', () => {

                icono.classList.add("hidden");
                carton.classList.remove("hidden");

            });
        }

        if (cerrarCarton && carton && icono) {

            cerrarCarton.addEventListener('click', () => {

                carton.classList.add("hidden");
                icono.classList.remove("hidden");

            });
        }
    }

    setupSaveButton() {

        const botonGuardar = this.shadowRoot.getElementById('botonguardar');

        if (!botonGuardar) return;

        botonGuardar.addEventListener('click', this.guardarEnFirestore.bind(this));
    }

    // =========================
    // GAME FUNCTIONS
    // =========================

    startGame() {

        const pantallaInstrucciones = this.shadowRoot.getElementById('pantalla-instrucciones');

        pantallaInstrucciones.classList.add('fadeOut');

        setTimeout(() => {

            pantallaInstrucciones.classList.add("hidden");

        }, 800);
    }

    selectColor(color) {

        const selected = this.shadowRoot.querySelector('.selected');

        if (selected) {
            selected.classList.remove("selected");
        }

        color.classList.add("selected");
    }

    colorPiece(pieza) {

        const selected = this.shadowRoot.querySelector('.selected');

        if (!selected) return;

        const color = selected.getAttribute('colorasignado');

        const zonasParaColorear = pieza.querySelectorAll('.zonaParaColorear');

        zonasParaColorear.forEach(zona => {

            zona.style.fill = color;

        });

        pieza.setAttribute('data-color', color);

        console.log(`Pieza ${pieza.id} coloreada con: ${color}`);
    }

    // =========================
    // FIRESTORE
    // =========================

    recolectarPiezasColoreadas() {

        const piezasColoreadas = {};

        const piezas = this.shadowRoot.querySelectorAll('.pieza[data-color]');

        piezas.forEach(pieza => {

            const piezaId = pieza.id;
            const color = pieza.getAttribute('data-color');

            if (color) {
                piezasColoreadas[piezaId] = color;
            }
        });

        return piezasColoreadas;
    }

    obtenerSvgDibujo() {

        const svg = this.shadowRoot.querySelector('svg');

        if (!svg) {
            throw new Error('No se encontró el SVG');
        }

        return svg;
    }

    async cargarDatosDesdeFirestore() {

        try {

            const usuarioId = this.obtenerUsuario();

            const svg = this.obtenerSvgDibujo();

            const contenedor = this.shadowRoot.querySelector('.pantalla-juego');

            const libroId = contenedor?.id || 'libro_sin_id';

            const drawId = svg.id || 'dibujo_sin_id';

            console.log(`Cargando datos para libro: ${libroId}, dibujo: ${drawId}`);

            const dibujoRef = this.db.collection(usuarioId).doc('libros').collection(libroId).doc(drawId);

            const doc = await dibujoRef.get();

            if (doc.exists) {

                const datos = doc.data();

                const piezasGuardadas = datos.piezas;

                Object.keys(piezasGuardadas).forEach(piezaId => {

                    const color = piezasGuardadas[piezaId];

                    const piezaElement = this.shadowRoot.getElementById(piezaId);

                    if (piezaElement) {

                        const zonasParaColorear = piezaElement.querySelectorAll('.zonaParaColorear');

                        zonasParaColorear.forEach(zona => {

                            zona.style.fill = color;

                        });

                        piezaElement.setAttribute('data-color', color);

                        console.log(`Pieza ${piezaId} restaurada con color: ${color}`);
                    }

                });

                console.log('Coloreado restaurado exitosamente');

                return true;
            }

            console.log('No se encontraron datos guardados');

            return false;

        } catch (error) {

            console.error('Error al cargar datos:', error);

            return false;
        }
    }

    async guardarEnFirestore() {

        const boton = this.shadowRoot.getElementById('botonguardar');

        try {

            if (boton) {
                boton.disabled = true;
            }

            const usuarioId = this.obtenerUsuario();

            const svg = this.obtenerSvgDibujo();

            const contenedor = this.shadowRoot.querySelector('.pantalla-juego');

            const libroId = contenedor?.id || 'libro_sin_id';

            const drawId = svg.id || 'dibujo_sin_id';

            const piezasColoreadas = this.recolectarPiezasColoreadas();

            if (Object.keys(piezasColoreadas).length === 0) {

                this.showToast('No hay piezas coloreadas para guardar', 'error');

                return;
            }

            const datosDibujo = {
                nombreDibujo: drawId,
                piezas: piezasColoreadas,
                fechaCreacion: new Date().toISOString()
            };

            const librosRef = this.db.collection(usuarioId).doc('libros');

            const dibujoRef = librosRef.collection(libroId).doc(drawId);

            const batch = this.db.batch();

            batch.set(librosRef, { fechaCreacion: firebase.firestore.FieldValue.serverTimestamp() }, { merge:true });

            batch.set(dibujoRef, datosDibujo, { merge:true });

            await batch.commit();

            console.log('Datos guardados exitosamente');

            this.showToast('¡Guardado correctamente!', 'success');

        } catch (error) {

            console.error('Error al guardar:', error);

            this.showToast('Error al guardar: ' + error.message, 'error');

        } finally {

            if (boton) {
                boton.disabled = false;
            }
        }
    }

    // =========================
    // TOAST
    // =========================

    showToast(message, type = 'success') {

        let toast = this.shadowRoot.querySelector('.toast');

        if (!toast) {

            toast = document.createElement('div');

            toast.className = 'toast';

            this.shadowRoot.appendChild(toast);
        }

        toast.textContent = message;

        toast.style.background = type === 'success' ? '#4CAF50' : '#f44336';

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // =========================
    // AUX FUNCTIONS
    // =========================

    updateStyle() {

        const { shadowRoot } = this;

        const linkCompontCss = document.createElement("link");

        linkCompontCss.setAttribute("rel", "stylesheet");

        linkCompontCss.setAttribute("href","components/coloring_book/coloring_book.css");

        shadowRoot.insertBefore(linkCompontCss, shadowRoot.firstChild);
    }
}

// Registrar componente
customElements.define("coloring-book", ColorearDibujoLBS);