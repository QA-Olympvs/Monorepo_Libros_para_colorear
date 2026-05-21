class panelProyectoLbs extends componentBase {

	constructor() {
        super();
		this._elementContent;
		this._closeElements;
		this._elementModalContent;
		this._elementTitulo;
    }

	async getData() {
    var txt = '';
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = () => {
      if(xmlhttp.status == 200 && xmlhttp.readyState == 4) {
        txt = xmlhttp.responseText;
		this.shadowRoot.innerHTML = txt;
		this._elementContent =  this.shadowRoot.querySelector('#content-robotica');
		this._elementModalContent = this.shadowRoot.querySelector('#modal-content');
		this._elementTitulo = this.shadowRoot.querySelector('#tituloProyecto');

		this.shadowRoot.querySelector('#btn-close-panel1').addEventListener('click', this._closePanel.bind(this));
		this.shadowRoot.querySelector('#btn-close-panel2').addEventListener('click', this._closePanel.bind(this));

        this.updateStyle(this);
      }
    };
    xmlhttp.open("GET","components/panelProyectoLbs/panelProyectoLbs.html", true);
    xmlhttp.send();
  }

	updateStyle(elem) {
   	const shadow = elem.shadowRoot;

		const linkBootstrapCss = document.createElement("link");
		linkBootstrapCss.setAttribute("rel", "stylesheet");
		linkBootstrapCss.setAttribute("href", "assets/bootstrap.min.css");
		
		const linkFontAwesomeCss = document.createElement("link");
		linkFontAwesomeCss.setAttribute("rel", "stylesheet");
		linkFontAwesomeCss.setAttribute("href", "assets/font-awesome.min.css");

		const linkCompontCss = document.createElement("link");
		linkCompontCss.setAttribute("rel", "stylesheet");
		linkCompontCss.setAttribute("href", "components/panelProyectoLbs/panelProyectoLbs.css");
		// Attach the created element to the shadow DOM
		shadow.insertBefore(linkBootstrapCss, shadow.firstChild);
		shadow.insertBefore(linkFontAwesomeCss, shadow.firstChild);
		shadow.insertBefore(linkCompontCss, shadow.firstChild);

        // this.loadData();
    }

	_showPanel(data, proyectoPag) {
		this.style.display = "block";
		const textoTitulo = `Proyecto`; 
		const contenidoData = data === undefined ? '<p><b><i>No existe proyecto aún.</i><b></p>' : data.data;

		this._elementContent.innerHTML = contenidoData;
		this._elementTitulo.innerHTML = textoTitulo;

		if(!this._isMobile){
			Visor.botonesHandlerWeb('hide');
		} 

	}
	_closePanel() {
		this._elementModalContent.classList.add('fadeOutDown');

		setTimeout(() => {
			this._elementModalContent.classList.remove('fadeOutDown');	
			this.style.display = 'none';
			this._elementContent.innerHTML = '';
			if(!this._isMobile) Visor.botonesHandlerWeb('show');
		}, 400);

	}
	connectedCallback() {
        this.getData();
    }
    disconnectedCallback() {
        console.log("disconnected panel robotica lbs");
    }
}

customElements.define('panel-proyecto-lbs', panelProyectoLbs);