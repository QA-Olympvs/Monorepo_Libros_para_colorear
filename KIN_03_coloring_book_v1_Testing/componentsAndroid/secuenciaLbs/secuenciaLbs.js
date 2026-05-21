//import htmlDOC from './player.html'
class secuenciaLbs extends componentBase {

    constructor() {
        super();
        this._containerSecuencia;
    }

    async getData() {
        var txt = '';
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
            if((xmlhttp.status == 200 || xmlhttp.status == 0) && xmlhttp.readyState == 4){
            txt = xmlhttp.responseText;
            this.shadowRoot.innerHTML = txt;
            
            this._containerSecuencia = this.shadowRoot.querySelector('#content-secuencia');


            this.updateStyle();
        }
    };
    xmlhttp.open("GET","componentsAndroid/secuenciaLbs/secuenciaLbs.html", true);
    xmlhttp.send();
}


    updateStyle() {
        const { shadowRoot } = this;

        const linkCompontCss = document.createElement("link");
		linkCompontCss.setAttribute("rel", "stylesheet");
		linkCompontCss.setAttribute("href", "componentsAndroid/secuenciaLbs/secuenciaLbs.css");

        const linkBootstrapCss = document.createElement("link");
		linkBootstrapCss.setAttribute("rel", "stylesheet");
		linkBootstrapCss.setAttribute("href", "assets/bootstrap.min.css");

		shadowRoot.insertBefore(linkCompontCss, shadowRoot.firstChild);
        shadowRoot.insertBefore(linkBootstrapCss, shadowRoot.firstChild);


    }

    _showPanel(pagina) {
        console.log(pagina);
        let existeSecuencia;
        const secuencia = Visor.store.getState().bookReducer.filter(a => a.elemento === `sd_${pagina}`)[0];

        if(secuencia === undefined) { 
            Visor.toastHandler('show','Esta pagina no tiene secuencia didactica.', 400);
            setTimeout(() => {
                Visor.toastHandler('hide','', 400);
            }, 2000);
            existeSecuencia = false;
        } else {
            this._entranceHandler('show');
            this._containerSecuencia.innerHTML = secuencia.data;
            existeSecuencia = true;
        }
        return existeSecuencia;

    }

    _hidePanel() {
        this._containerSecuencia.innerHTML = '';
        this._entranceHandler('hide');
    }

    _entranceHandler(type) {
        const modalContainer = this.shadowRoot.querySelector('#modal-content');

        if (type === 'show') {
            this.style.display = 'block';
            modalContainer.classList.add('fadeInUp');
            modalContainer.classList.remove('fadeOutDown');
            app.esconderBotonesDesdeComponentes(true);
        } else if(type === 'hide') {
            modalContainer.classList.remove('fadeInUp');
            modalContainer.classList.add('fadeOutDown');
            setTimeout(() => { 
                app.esconderBotonesDesdeComponentes(false);
                this.style.display = 'none';
            }, 400);
        }
    }

    connectedCallback() {
        this.getData();

    }
    disconnectedCallback() {
        this._unsubscribe();
    }
}

customElements.define('secuencia-lbs', secuenciaLbs);