//import htmlDOC from './player.html'
class indiceLbs extends componentBase {

    constructor() {
        super();
    }

    async getData() {
        // console.log('GET DATA');
        var txt = '';
        var xmlhttp = new XMLHttpRequest();
        console.log("status", xmlhttp);
        xmlhttp.onreadystatechange = () => {
            if((xmlhttp.status == 200 || xmlhttp.status == 0) && xmlhttp.readyState == 4){
                txt = xmlhttp.responseText;
                this.shadowRoot.innerHTML = txt;
                // this._itemLbs = this.shadowRoot.querySelector("input");
                // this._logicData(this);
                this.shadowRoot.querySelector("#btnCerrarIndice").addEventListener("click",this._attachEventHandlers.bind(this));
                this.shadowRoot.querySelector("#btnTacha").addEventListener("click",this._attachEventHandlers.bind(this));
                
                
                // this.shadowRoot.querySelector("input").addEventListener('blur', this._saveData.bind(this));
                this.updateStyle(this);
            }
        };
        console.log("================xmlhttp====================!");
        console.log("status", xmlhttp);
        xmlhttp.open("GET","componentsAndroid/indiceLbs/indiceLbs.html",true);
        xmlhttp.send();
    }
    
    updateStyle(elem) {
        const shadow = elem.shadowRoot;
        
        shadow.querySelector("style").textContent = `
        
        
        .modal {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 1050;
            display: none;
            overflow: hidden;
            outline: 0;

            animation: fadeInUpBig;
            animation-duration: 400ms;
        }
        .modal-dialog {
            box-shadow: 0 17px 50px 0 rgba(11,20,26,.19), 0 12px 15px 0 rgba(11,20,26,.24);
        }

        .modal-body {
            max-height: calc(100vh - 210px);
            overflow-y: auto;
        }

        .modal-heigh-75 {
            height: 75% !important;
            margin-top: 25% !important;
            min-height: 75% !important;
        }

        .modal-heigh-100 {
            height: 100% !important;
        }

        @keyframes fadeInUpBig {
            from {
              opacity: 0;
              transform: translate3d(0, 2000px, 0);
            }
          
            to {
              opacity: 1;
              transform: translate3d(0, 0, 0);
            }
          }
          
          .fadeInUpBig {
            animation-name: fadeInUpBig;
          }



                
        @keyframes fadeOutUpBig {
            from {
            opacity: 1;
            }
        
            to {
            opacity: 0;
            transform: translate3d(0, -2000px, 0);
            }
        }
  
          
        .fadeOutUpBig {
            animation-name: fadeOutUpBig;
            animation-duration: 600ms;
            animation-timing-function: ease;
        }
            
        `;
    }
    


    // PAGINAS

    async _logicDataPag(numPag) {
        // console.log('LOGIC DATA PAGINA');
        const aNodeList = await this._insertDataPag(numPag);
        
        aNodeList.forEach(occurence => {
            occurence.addEventListener('click', (e) => {
                IDRViewer.goToPage(e.target.getAttribute('index'));
                this._attachEventHandlers(this);
                
            });
        });
    }
    
    _insertDataPag(numPag){
        // console.log("INSERT DATA PAGINA");
        var grupoLista = this.shadowRoot.querySelector(".list-group");
        
        for(let i = 1; i <= numPag; i++){
            
            var btnIndice = document.createElement("a");
            btnIndice.setAttribute("type", "button");
            btnIndice.setAttribute("class", "list-group-item list-group-item-action");
            btnIndice.setAttribute("index", i);
            var pagina = "Página "+i;
            btnIndice.innerText = pagina
            grupoLista.appendChild(btnIndice);
            
        }
        
        // console.log(grupoLista.querySelectorAll('a'));
        return new Promise(resolve => {
              resolve(grupoLista.querySelectorAll('a'));
            
          });
        
    }



    // TITULOS

    _insertDataTitu(){
        var titulos = this.Visor.Indice;

        var grupoLista = this.shadowRoot.querySelector(".list-group");
        
        for(let i = 0; i < titulos.length; i++){
            
            var btnIndice = document.createElement("a");
            btnIndice.setAttribute("type", "button");
            btnIndice.setAttribute("class", "list-group-item list-group-item-action");
            var pagina = gotoPageIndice(titulos[i]);
            btnIndice.setAttribute("index", pagina);
            btnIndice.innerText = titulos[i]
            grupoLista.appendChild(btnIndice);
            
        }
        
        // console.log(grupoLista.querySelectorAll('a'));
        return new Promise(resolve => {
              resolve(grupoLista.querySelectorAll('a'));
            
          });
        // var pagina=gotoPageIndice(capitulo);
        
    }

    async _logicDataTitu() {
        // console.log('LOGIC DATA PAGINA');
        const aNodeList = await this._insertDataTitu();
        
        aNodeList.forEach(occurence => {
            occurence.addEventListener('click', (e) => {
                IDRViewer.goToPage(e.target.getAttribute('index'));
                this._attachEventHandlers(this);
                
            });
        });
    }



    // SALIR DEL MODAL

    _attachEventHandlers() {
        const modalClass = this.shadowRoot.querySelector(".modal")
        modalClass.classList.add('fadeOutUpBig');
        // modalClass.style.animation = 'fadeOutDownBig';
		setTimeout(() => {
            modalClass.classList.remove('fadeOutUpBig');
            // modalClass.style.animation = 'fadeInDownBig';
            modalClass.style.display="none";
			app.mostrarFabsAudioPlayerCerrar(false);
		}, 600);
    }


    connectedCallback() {
        const idIndice = this.getAttribute("id");
        const esto = this;
        IDRViewer.on('ready', function(data) {
            if(idIndice == "indicePaginas"){
                esto._logicDataPag(data.pagecount);
            }
            else if(idIndice == "indiceTitulos"){
                esto._logicDataTitu();
            }
        });
            
        this.getData();



    }

    disconnectedCallback() {
        //this.shadowRoot.querySelector("button").removeEventListener('click', this._showModal);
        //this.shadowRoot.querySelector("#btnFabButton").removeEventListener('click', this._showModal);
        // this.shadowRoot.querySelector("input").removeEventListener('blur', this._saveData);
        this._unsubscribe();
    }
}

customElements.define('indice-lbs',indiceLbs);