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
		this.toastMsg;
    }

    async getData() {
        var txt = '';
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
          if((xmlhttp.status == 200 || xmlhttp.status == 0) && xmlhttp.readyState == 4){
            txt = xmlhttp.responseText;
            this.shadowRoot.innerHTML = txt;
            this._itemLbs = this.shadowRoot.querySelector("#txt-notas");

            //this.shadowRoot.querySelector("input").addEventListener('blur', this._saveData.bind(this));
            this.shadowRoot.querySelector("#txt-notas").addEventListener('keydown',this._keyDown.bind(this));
            this.shadowRoot.querySelector("#txt-notas").addEventListener('input',this._input.bind(this));
            this.shadowRoot.querySelector("#btn-publicar").addEventListener("click",this._logicData.bind(this));
            this.shadowRoot.querySelector("#btn-cancelar").addEventListener("click",this._cancelar.bind(this));
            this._txtAreaNotas = this.shadowRoot.querySelector("#txt-notas");
            this.updateStyle(this);
          }
        };
        xmlhttp.open("GET","componentsAndroid/txtNotaLbs/txtNotaLbs.html",true);
        xmlhttp.send();
    }

    updateStyle(elem) {
        const shadow = elem.shadowRoot;

        const linkBootstrapCss = document.createElement("link");
		linkBootstrapCss.setAttribute("rel", "stylesheet");
		linkBootstrapCss.setAttribute("href", "assets/bootstrap.min.css");

		const linkCompontCss = document.createElement("link");
		linkCompontCss.setAttribute("rel", "stylesheet");
		linkCompontCss.setAttribute("href", "componentsAndroid/txtNotaLbs/txtNotaLbs.css");
		// Attach the created element to the shadow DOM

		const scriptBoostrapJs = document.createElement("script");
		scriptBoostrapJs.setAttribute("src", "assets/bootstrap.min.js");

		shadow.insertBefore(linkBootstrapCss, shadow.firstChild);
		shadow.insertBefore(linkCompontCss, shadow.firstChild);
		shadow.insertBefore(scriptBoostrapJs, shadow.firstChild);
        
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

      this._saveData().then(()=>{
		 this.classList.add('fadeOutDown');
		setTimeout(() => {
			this.classList.remove('fadeOutDown');
			this.style.display = 'none';
			this.shadowRoot.querySelector("#txt-notas").value = '';
			this.SubjectNota.next(true);
			this.documentHammer.destroy();
			this.documentHammer = undefined;
		}, 400);
    app.esconderBotonesDesdeComponentes(false);

      }).catch(err => console.log(err));
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


      console.log("entro show note");
	  
	  // this.documentHammer = new Hammer(document);         // <-- para index normal
	  this.documentHammer = new Hammer(note.parentNode.parentNode.parentNode.parentNode);    // <-- para index android

      this.documentHammer.on('tap', (event)=> {
          
        if(!this.contains(event.target)) {
            
          this.classList.add('fadeOutDown');

            setTimeout(() => {
              this.classList.remove('fadeOutDown');
              this.style.display = 'none';
		      		this.shadowRoot.querySelector("#txt-notas").value = '';
              this.documentHammer.destroy();
              console.log("entro esconder nota");
              this.SubjectNota.next(false);
				      app.esconderBotonesDesdeComponentes(false);
			      }, 400);
          }
      });
	  
	  setTimeout(() => {	
		this._txtAreaNotas.focus();
	  }, 425);
	  
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
              }, 400);
            app.esconderBotonesDesdeComponentes(false);



    }


    connectedCallback() {
        this.getData();
    }
    disconnectedCallback() {
        //this.shadowRoot.querySelector("button").removeEventListener('click', this._showModal);
        //this.shadowRoot.querySelector("#btnFabButton").removeEventListener('click', this._showModal);
        this.shadowRoot.querySelector("#txt-notas").removeEventListener('blur', this._keyDown);
        this.shadowRoot.querySelector("#txt-notas").addEventListener('input',this._input);
        //this._unsubscribe();
    }
}

customElements.define('txt-nota-lbs',txtNotaLbs);