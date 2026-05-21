class toastLbs extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._isAndroid = window.location.protocol == "file:" ? true : false;
        this.Visor = this._isAndroid ? parent.Visor :  Visor;

		this.textToast;
	}

	async getData() {
		var txt = '';
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
			if((xmlhttp.status == 200 || xmlhttp.status == 0) && xmlhttp.readyState == 4){
				txt = xmlhttp.responseText;
				this.shadowRoot.innerHTML = txt;
				
				this.textToast = this.shadowRoot.querySelector("#text-toast");

				this.updateStyle();
			  }
			};
		xmlhttp.open("GET","componentsAndroid/toastLbs/toastLbs.html", true);
		xmlhttp.send();
		
	}

	updateStyle() {
		const { shadowRoot } = this;

		this.style.marginBottom = "60px";

        const linkBootstrapCss = document.createElement("link");
		linkBootstrapCss.setAttribute("rel", "stylesheet");
		linkBootstrapCss.setAttribute("href", "assets/bootstrap.min.css");

		const linkCompontCss = document.createElement("link");
		linkCompontCss.setAttribute("rel", "stylesheet");
		linkCompontCss.setAttribute("href", "componentsAndroid/toastLbs/toastLbs.css");
		// Attach the created element to the shadow DOM

		shadowRoot.insertBefore(linkBootstrapCss, shadowRoot.firstChild);
		shadowRoot.insertBefore(linkCompontCss, shadowRoot.firstChild);
	}


	_logicData(estado, msg, timer) {
		const animationType = estado === 'show' ? 'fade-in-an' : 'fade-out-an';
		const displayType = estado === 'show' ? 'block' : 'none';

		//funcion cerrarse despues de tiempo  | stanby
		
		this.classList.add(animationType);
		if(estado === 'show') {
			this.textToast.innerHTML = msg;
			this.style.display = displayType;
		} 
		
		setTimeout(() => {
			this.classList.remove(animationType);
			this.style.display = displayType;
			this.textToast.innerHTML = msg;
		}, 400);
	}

	connectedCallback() {
        this.getData();
    }
    disconnectedCallback() {
        //this.shadowRoot.querySelector("button").removeEventListener('click', this._showModal);
        //this.shadowRoot.querySelector("#btnFabButton").removeEventListener('click', this._showModal);
        
    }

}


customElements.define('toast-lbs', toastLbs);