//import htmlDOC from './player.html'
class notaV2Lbs extends componentBase {

    constructor() {
        super();
        this._elementContent;
		this._closeElements;
		this._elementModalContent;
		this._numNota;
        this._extraFields = { };
        this._fechaOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
    }

    async getData() {
        var txt = '';
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
            if(xmlhttp.status == 200 && xmlhttp.readyState == 4){
                txt = xmlhttp.responseText;
                this.shadowRoot.innerHTML = txt;

                this._elementContent =  this.shadowRoot.querySelector('#content-robotica');
                this._elementModalContent = this.shadowRoot.querySelector('#modal-content');
                this._numNota = this.shadowRoot.querySelector('#nota_pagina');
                this._txtnotav2 = this.shadowRoot.querySelector('#txt-notav2');
                this._fechaNota = this.shadowRoot.querySelector('#fecha-nota');

                this.shadowRoot.querySelector('#btn-close-panel1').addEventListener('click', this._closePanel.bind(this));
		        this.shadowRoot.querySelector('#btn-close-panel2').addEventListener('click', this._closePanel.bind(this));
                this.shadowRoot.querySelector('#btn-guardar-nota').addEventListener('click', this._guardarNota.bind(this));
                
                this.updateStyle();
            }
        };
        xmlhttp.open("GET","components/notaV2Lbs/notaV2Lbs.html", true);
        xmlhttp.send();
    }
    
    updateStyle() {
        const { shadowRoot } = this;
        
        const linkBootstrapCss = document.createElement("link");
		linkBootstrapCss.setAttribute("rel", "stylesheet");
		linkBootstrapCss.setAttribute("href", "assets/bootstrap.min.css");
		
		const linkFontAwesomeCss = document.createElement("link");
		linkFontAwesomeCss.setAttribute("rel", "stylesheet");
		linkFontAwesomeCss.setAttribute("href", "assets/font-awesome.min.css");

		const linkCompontCss = document.createElement("link");
		linkCompontCss.setAttribute("rel", "stylesheet");
		linkCompontCss.setAttribute("href", "components/notaV2Lbs/notaV2Lbs.css");
		// Attach the created element to the shadow DOM
		shadowRoot.insertBefore(linkBootstrapCss, shadowRoot.firstChild);
		shadowRoot.insertBefore(linkFontAwesomeCss, shadowRoot.firstChild);
		shadowRoot.insertBefore(linkCompontCss, shadowRoot.firstChild);
    }
    

    _showNota(pagina, aux) {
        console.log("not v2: ", pagina);

        this._numNota.innerHTML = pagina;
        
        const claveLibro = IDRViewer.config.fileName.replace(".pdf",'');
        const notaData = Visor.store.getState().bookReducer.filter(a => a.elemento === `nota_${pagina}`);
        console.log(notaData);
        
        if(notaData.length > 0) {
            this._txtnotav2.value = notaData[0].data;
            this._fechaNota.innerHTML = notaData[0].fecha;
         } else {
            this._txtnotav2.innerHTML = '';
            this._extraFields.fecha = '';
         }

         //si viene desde lista de notas
         console.log(aux);
         
         if(!aux) {
            var message = ["INVALID", "ModusEcho", "FabsHandler", [2]];
            ////window.webkit?.messageHandlers.cordova.postMessage(message);
            if(!this._isMobile) Visor.botonesHandlerWeb('hide');
            window.Capacitor?.toNative( "LbsViewer", "FabsHandler",{key1: 2});
         } 

        this.style.display = "block";
    }

    _guardarNota() { 
        this._extraFields.elemento = `nota_${this._numNota.innerHTML}`;
        this._itemLbs = this._txtnotav2
        this._extraFields.fecha = new Date().toLocaleDateString(undefined, this._fechaOptions);
        this._extraFields.pagina = this._numNota.innerHTML;
        console.log(this._extraFields.fecha);

        this._saveData().then(() => {
            console.log("saved");
            this._txtnotav2.value = '';
            this._fechaNota.innerHTML = '';
            this._extraFields.fecha = '';
            this._extraFields.pagina = '';
            this._closePanel();
        }).catch((err) => {
            console.log("error: ", err);
        });

    }

    _closePanel() {
		this._elementModalContent.classList.add('fadeOutDown');

		setTimeout(() => {
            this._txtnotav2.value = '';
            this._extraFields.fecha = '';
			this._elementModalContent.classList.remove('fadeOutDown');	
			this.style.display = 'none';
			// if(!this._isMobile) Visor.botonesHandlerWeb('show');
            var message = ["INVALID", "ModusEcho", "FabsHandler", [1]];
            ////window.webkit?.messageHandlers.cordova.postMessage(message);
            window.Capacitor?.toNative( "LbsViewer", "FabsHandler",{key1: 1});
            if(!this._isMobile) Visor.botonesHandlerWeb('show');
		}, 400);

	}

    connectedCallback() {
        this.getData();
    }

    disconnectedCallback() {
        this._unsubscribe();
    }
}

customElements.define('nota-v2-lbs', notaV2Lbs);