//import htmlDOC from './player.html'
class txtAreaLbs extends componentBase {

    constructor() {
        super();
    }

    async getData() {
        var txt = '';
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
          if(xmlhttp.status == 200 && xmlhttp.readyState == 4){
            txt = xmlhttp.responseText;
            this.shadowRoot.innerHTML = txt;
            this._itemLbs = this.shadowRoot.querySelector("textarea");

            this.shadowRoot.querySelector("textarea").addEventListener('blur', this._saveData.bind(this));
            this.shadowRoot.querySelector("textarea").addEventListener('click', this._onClickToFocus.bind(this));
            this.updateStyle(this);
          }
        };
        xmlhttp.open("GET","components/txtAreaLbs/txtAreaLbs.html",true);
        xmlhttp.send();
    }

    updateStyle(elem) {
        const shadow = elem.shadowRoot;

        shadow.querySelector("style").textContent = `
            textarea {
              width: ${elem.getAttribute("width")}px;
              height: ${elem.getAttribute("height")}px;
              background: transparent;
              border:none; 
              text-align:center; 
              letter-spacing:-0.6px; 
              z-index: 2; 
              font-size:inherit;
              font-family:Volte-Medium_Lbs,FontAwesome; 
              color:inherit;
              padding : 1px;
            }
        `;

        this._id = elem.getAttribute("id");
        this._pagina = elem.getAttribute("pagina");
        
        this.observers();
        this.loadData();
    }

    loadData(){
        const search = this.Visor.store.getState().bookReducer.filter(a => a.elemento == this._id);

        if(search != 0) {
            this._itemLbs.value = search[0].data;
        } 
    }

    observers(){
        //console.log("observers txtlbs");
        this._unsubscribe = this.Visor.store.subscribe(()=>{
            
            const search = this.Visor.store.getState().bookReducer.filter(a => a.elemento == this._id);

            if(search != 0) {
                this._itemLbs.value = search[0].data;
            }

        });
    }

	_onClickToFocus() {
		this.shadowRoot.querySelector("textarea").focus();
	}

    connectedCallback() {
        this.getData();
    }
    
    disconnectedCallback() {
        this.shadowRoot.querySelector("textarea").removeEventListener('blur', this._saveData);
        this._unsubscribe();
    }
}

customElements.define('txt-area-lbs',txtAreaLbs);