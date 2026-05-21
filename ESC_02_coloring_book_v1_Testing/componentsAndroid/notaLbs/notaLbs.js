//import htmlDOC from './player.html'
class notaLbs extends componentBase {

    constructor() {
        super();
		this.notaData;
		this.verNotaElement = window.parent.document.getElementsByTagName('ver-nota-lbs');
		// this.verNotaElement = document.getElementsByTagName('ver-nota-lbs');
    }

    async getData() {
        var txt = '';
        var xmlhttp = new XMLHttpRequest();
        
		xmlhttp.onreadystatechange = () => {
            if((xmlhttp.status == 200 || xmlhttp.status == 0) && xmlhttp.readyState == 4){
            txt = xmlhttp.responseText;
            this.shadowRoot.innerHTML = txt;
            this._itemLbs = this.shadowRoot.querySelector("img");

            var draggable = new Draggable(this, {
              onPress: (evtPress) => {
                console.log("onpress");
                this._id = this.getAttribute('id');
				this.notaData =  this.Visor.store.getState().bookReducer.filter(a => a.elemento === this._id);
				this.classList.add('focused');
				// console.log(this.verNotaElement);
				setTimeout(() => { this.verNotaElement[0]._showComponent(this.notaData); }, 50); 

              },
              /*onDrag: function(e) {
                  
              },*/
              onDragEnd : (evt) =>{
                console.log("onDragEnd",this);
				var rect = evt.target.parentElement.getBoundingClientRect();
				var scale = rect.width / evt.target.parentElement.offsetWidth; // scale del elemento actual element p12,p11 etc
				const currentScale = 1 / parseFloat(scale); //Redimensionamiento
		
				var x = (evt.clientX - rect.left) * currentScale;
				var y = (evt.clientY - rect.top) * currentScale;
				this.setAttribute('x', x);
				this.setAttribute('y', y);
				if(this.notaData.length > 0) {
					this._itemLbs.value = this.notaData[0].data;
					
					this._extraFields = {
						usuario: this.notaData[0].userCreate,
						x : this.getAttribute("x"),
						y : this.getAttribute("y"),
					  };

					  this._saveData().then(() => {
						console.log('nota posicion actualizada');
					}).catch(err => console.error(err));
				}
              }
            });

            //this.shadowRoot.querySelector("#note").addEventListener('blur', this._saveData.bind(this));
            //this.shadowRoot.querySelector("input").addEventListener('blur', this._saveData.bind(this));
            this.updateStyle(this);
          }
        };
        xmlhttp.open("GET","componentsAndroid/notaLbs/notaLbs.html",true);
        xmlhttp.send();
    }

    updateStyle(elem) {
        const shadow = elem.shadowRoot;

        shadow.querySelector("style").textContent = `
            :host {
              width: 150px;
              height: 150px;
              top: ${elem.getAttribute("y")}px;
              left: ${elem.getAttribute("x")}px;
              background: transparent;
              z-index:100;
              -webkit-transform-origin: top left !important;
            }

			:host(.focused) {
				width: 200px !important;
				height: 200px !important;
			}
        `;

        this._id = elem.getAttribute("id");
        this._pagina = elem.getAttribute("pagina");
        return;
        //this.observers();
        //this.loadData();
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

    connectedCallback() {
        this.getData();
    }
    disconnectedCallback() {
        //this.shadowRoot.querySelector("button").removeEventListener('click', this._showModal);
        //this.shadowRoot.querySelector("#btnFabButton").removeEventListener('click', this._showModal);
        //this.shadowRoot.querySelector("input").removeEventListener('blur', this._saveData);
        //this._unsubscribe();
    }
}

customElements.define('nota-lbs',notaLbs);