//import htmlDOC from './player.html'
class txtNotaLbs extends componentBase {

    constructor() {
        super();
        this._txtAreaNotas;
        const { Observable,Subject } = rxjs;
        //this.ObservableNota = 
        this.SubjectNota = new Subject();
        this._note;
		this.documentHammer;
    }

    async getData() {
        var txt = '';
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
          if(xmlhttp.status == 200 && xmlhttp.readyState == 4){
            txt = xmlhttp.responseText;
            this.shadowRoot.innerHTML = txt;
            this._itemLbs = this.shadowRoot.querySelector("#txt-notas");

            //this.shadowRoot.querySelector("input").addEventListener('blur', this._saveData.bind(this));
            this.shadowRoot.querySelector("#txt-notas").addEventListener('keydown',this._keyDown.bind(this));
            this.shadowRoot.querySelector("#txt-notas").addEventListener('input',this._input.bind(this));
            this.shadowRoot.querySelector("#btn-publicar").addEventListener("click",this._logicData.bind(this));
            this.shadowRoot.querySelector("#btn-cancelar").addEventListener("click",this._cancelar.bind(this));
            this._txtAreaNotas = this.shadowRoot.querySelector("#txt-notas");
            this._txtAreaNotas.addEventListener('click', () => { this.focus(); });
            this.updateStyle(this);
          }
        };
        xmlhttp.open("GET","components/txtNotaLbs/txtNotaLbs.html",true);
        xmlhttp.send();
    }

    updateStyle(elem) {
        const shadow = elem.shadowRoot;

        shadow.querySelector("style").textContent = `
            :host {
              display:none; 
              background-color: var(--white); 
              max-width: 100% !important; 
              padding-left: 0 !important; 
              padding-right: 0 !important; 
              border-color: #000000; 
              position: fixed; 
              bottom: 0; 
              width: 100% !important;
              animation: fadeInUp;
              animation-duration: 400ms;
            }

            .notas::placeholder {
              font-style: italic;
            }

            .text-arroba {
              font-style: italic;
            }

            #btn-publicar {
              width: 87%; 
              background-color: var(--blue); 
              border-radius: 10px; 
              margin-left: 30%
            } 

            #btn-cancelar {
              width: 92%; 
              background-color: var(--gray); 
              border-radius: 10px; 
              margin-left: 65%
            } 

            @media only screen and (min-width: 200px) {
              #btn-publicar { 
                width: 87%;
                margin-left: 20%;
              }
              #btn-cancelar { 
                width: 92%;
                margin-left: 55%;
              }

            }

            @media only screen and (min-width: 500px) {
              #btn-publicar { 
                width: 87%;
              }
              #btn-cancelar { 
                width: 92%;
                margin-left: 45%;
              }
            }
            
            @-webkit-keyframes fadeInUp {
              0% {
                opacity: 0;
                -webkit-transform: translate3d(0,100%,0);
                transform: translate3d(0,100%,0)
              }

              to {
                opacity: 1;
                -webkit-transform: translateZ(0);
                transform: translateZ(0)
              }
            }

            @keyframes fadeInUp {
              0% {
                opacity: 0;
                -webkit-transform: translate3d(0,100%,0);
                transform: translate3d(0,100%,0)
              }

              to {
                opacity: 1;
                -webkit-transform: translateZ(0);
                transform: translateZ(0)
              }
            }

            :host(.animacion.fadeOutDown) {
                animation-name: fadeOutDown;
            }

            @keyframes fadeOutDown {
              from {
                opacity: 1;
              }

              to {
                opacity: 0;
                transform: translate3d(0, 100%, 0);
              }
            }

            .animacion {
              animation-duration: 400ms;
              animation-name: fadeInUp;
            }
            
            /* Fade in entrance */
            .animacion.fadeInUp {
              animation-name: fadeInUp;
              animation-timing-function: ease;
            }
        `;
        
        //this.observers();
        //this.loadData();
    }

    loadData(){
        /*const search = this.Visor.store.getState().bookReducer.filter(a => a.elemento == this._id);

        if(search != 0) {
            this._itemLbs.value = search[0].data;
        }*/
    }

    _logicData() {
      console.log(this._note);
      this._extraFields.x = this._note.getAttribute('x');		
      this._extraFields.y = this._note.getAttribute('y');
      
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      
      const dateCreatedNote = new Date().toLocaleDateString(undefined, options);
      
      this._extraFields.fecha = dateCreatedNote;
      console.log(dateCreatedNote);

      if(this._txtAreaNotas.value !== '') {
        this._saveData().then(()=>{
        this.classList.add('fadeOutDown');
        setTimeout(() => {
          this.classList.remove('fadeOutDown');
          this.style.display = 'none';
          this.shadowRoot.querySelector("#txt-notas").value = '';
          this.SubjectNota.next(true);
          this.documentHammer.destroy();
          this.documentHammer = undefined;
          this._buttonsNativosHandeler('open');
        }, 400);
        }).catch(err => console.log(err));
      } else {
          Visor.toastHandler("show", "La nota no puede ir en blanco.", 400);
            setTimeout(() => {
                Visor.toastHandler("hide", "", 400);
            }, 3000);
       }
    }

    observers(){
        //console.log("observers txtlbs");
        this._unsubscribe = this.Visor.store.subscribe(()=> {
            
            const search = this.Visor.store.getState().bookReducer.filter(a => a.elemento == this._id);

            if(search != 0) {
                this._itemLbs.value = search[0].data;
            }

        });
    }

    _keyDown(event){
      if(event.keyCode === 46 || event.keyCode === 8) {
        if(this._txtAreaNotas.value === '' || this._txtAreaNotas.value === ' ') {
          this._txtAreaNotas.rows = 1;
        }
      }
    }

    _input(event){
      let textInput = event.target.value;
      if(textInput.endsWith('\n')) {
        this._txtAreaNotas.rows = 2;
        this._txtAreaNotas.scrollTop = this._txtAreaNotas.scrollHeight;
      }
    }

    showNote(note) {
      this._note = note
      this.style.display = 'unset';
		
      this._id = note.getAttribute("id");
      this._pagina = note.getAttribute("pagina");
		//note.classList.add("created");
      this._extraFields = {
        x : note.getAttribute("x"),
        y : note.getAttribute("y"),
      }

	   this.documentHammer = new Hammer(document); 
     
      var message = ["INVALID","ModusEcho","FabsHandler",[2]];
      //window.webkit?.messageHandlers.cordova.postMessage(message);
      //NUEVA LOGICA APP NUEVA , LLAMAR CAPACITOR
      window.Capacitor?.toNative( "LbsViewer", "FabsHandler",{key1: 2});
     this._txtAreaNotas.focus();        // <-- para index normal
	  // this.documentHammer = new Hammer(note.parentNode.parentNode.parentNode.parentNode);    // <-- para index android
	  
      this.documentHammer.on('tap', (event)=> {
        this._txtAreaNotas.focus();
          if(!this.contains(event.target)) {
              this.classList.add('fadeOutDown');
              setTimeout(() => {
                this.classList.remove('fadeOutDown');
                this.style.display = 'none';
				        this.shadowRoot.querySelector("#txt-notas").value = '';
                this.documentHammer.destroy();
                this.SubjectNota.next(false);
                this._buttonsNativosHandeler('open');
              }, 400);
          }
      });

      return this.SubjectNota;
    }
    _cancelar() {
      this.classList.add('fadeOutDown');

      setTimeout(() => {
        this.classList.remove('fadeOutDown');
        this.style.display = 'none';
        this.shadowRoot.querySelector("#txt-notas").value = '';
        this.documentHammer.destroy();
        this.SubjectNota.next(false);
        this._buttonsNativosHandeler('open');
      }, 400);

    }

    _buttonsNativosHandeler(type) {
      if(type === 'close') {
        var message = ["INVALID","ModusEcho","FabsHandler",[0]];
        //NUEVA LOGICA APP NUEVA , LLAMAR CAPACITOR
        window.Capacitor?.toNative( "LbsViewer", "FabsHandler",{key1: 0});
        if(!this._isMobile) Visor.botonesHandlerWeb('hide');
      } else {
        var message = ["INVALID","ModusEcho","FabsHandler",[1]];
        //NUEVA LOGICA APP NUEVA , LLAMAR CAPACITOR
        window.Capacitor?.toNative( "LbsViewer", "FabsHandler",{key1: 1});
        if(!this._isMobile) Visor.botonesHandlerWeb('show');
      }
      //window.webkit?.messageHandlers.cordova.postMessage(message);
    }


    connectedCallback() {
      this.getData();
    }
    disconnectedCallback() {
      //this.shadowRoot.querySelector("button").removeEventListener('click', this._showModal);
      //this.shadowRoot.querySelector("#btnFabButton").removeEventListener('click', this._showModal);
      this.shadowRoot.querySelector("#txt-notas").removeEventListener('blur', this._keyDown);
      this.shadowRoot.querySelector("#txt-notas").addEventListener('input',this._input);
      this._unsubscribe();
    }
}

customElements.define('txt-nota-lbs',txtNotaLbs);