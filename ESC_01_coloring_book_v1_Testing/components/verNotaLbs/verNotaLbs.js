class verNotaLbs extends componentBase {
	constructor() {
		super();
		this._notaActual;
		this._paginaActial;
		this._textoNota;
		this._autorNota;
		this._fechaNota;
		this._documentHammer;
		this._containerBtnsEdit;
		this._txtNotaEdit;
		this._extraFields = {};
		this._itemLbs = {};
	}

	async getData() {
		var txt = '';
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
          if(xmlhttp.status == 200 && xmlhttp.readyState == 4){
            txt = xmlhttp.responseText;
            this.shadowRoot.innerHTML = txt;

			this._textoNota = this.shadowRoot.querySelector("#txt-ver-nota");
			this._autorNota = this.shadowRoot.querySelector("#autor-nota");
			this._fechaNota = this.shadowRoot.querySelector("#fecha-nota");
			this._btnBorrarNotaElement = this.shadowRoot.querySelector("#delete-nota");
			this._containerBtnsEdit = this.shadowRoot.querySelector("#container-btns-edit");
			this._txtNotaEdit = this.shadowRoot.querySelector("#txt-nota-edit");

			this.shadowRoot.querySelector("#btn-abrir-lista-notas").addEventListener("click", this._abrirListaNotas.bind(this));
			this.shadowRoot.querySelector("#btn-next-nota").addEventListener("click", this._nextNota.bind(this));
			this.shadowRoot.querySelector("#btn-previous-nota").addEventListener("click", this._previousNota.bind(this));
			this.shadowRoot.querySelector("#delete-nota").addEventListener("click", this._deleteDataFirestore.bind(this));
			this.shadowRoot.querySelector("#btn-editar-nota").addEventListener("click", this._editarNota.bind(this));
			this.shadowRoot.querySelector("#btn-guardar-editar-nota").addEventListener('click', this._guardarEditNota.bind(this));
			this.shadowRoot.querySelector("#btn-cancelar-editar-nota").addEventListener('click', this._cancelarEditNota.bind(this));
			

            this.updateStyle(this);
          }
        };
        xmlhttp.open("GET","components/verNotaLbs/verNotaLbs.html",true);
        xmlhttp.send();
	}

	updateStyle(elem) {
        const shadow = elem.shadowRoot;

        shadow.querySelector("style").textContent = `
		:host {
			background-color: var(--white); 
			max-width: 100% !important; 
			padding-left: 0 !important; 
			padding-right: 0 !important; 
			border-color: #000000; 
			position: fixed; 
			bottom: 0; 
			width: 100% !important; 	
			display: none;
			animation: fadeInUp;
			animation-duration: 400ms;
		}

		.container-toolbar-notas {
			border: 2px solid var(--light);
			padding: 0 2%;
    		background-color: #ffffff;
    
		}
		
		.container-toolbar-notas button {
			color: var(--dark) !important;
			font-size: 1.3em;
			text-align: justify;
			margin-top: 0;
			margin-bottom: 0;
			
		}

		.btn {
			background-color: transparent !important;
		}

		.avatar {
			height: 1rem;
			width: 1rem;
			position: relative;
			display: inline-block;
			-ms-flex-negative: 0 !important;
			flex-shrink: 0 !important;
		}
		.margin-right-5rem {
			margin-right: 0.5rem !important;
		}
		.animacion {
			animation-duration: 400ms;
		}
		.animacion-200ms { 
			animation-duration: 200ms;
		}
		
		/* Fade in entrnace */
		.animacion.fadeInUp {
			animation-name: fadeInUp;
			animation-timing-function: ease;
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


		/* Fade out down exit */
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
		/* Fade in left entrance */
		
		@keyframes fadeInLeft {
			from {
			  opacity: 0;
			  transform: translate3d(-80%, 0, 0);
			}
		  
			to {
			  opacity: 1;
			  transform: translate3d(0, 0, 0);
			}
		  }
		  
		.fadeInLeft {
			animation-name: fadeInLeft;
		}

		/* Fade in right entrance */
		@keyframes fadeInRight {
			from {
			  opacity: 0;
			  transform: translate3d(80%, 0, 0);
			}
		  
			to {
			  opacity: 1;
			  transform: translate3d(0, 0, 0);
			}
		  }
		  
		  .fadeInRight {
			animation-name: fadeInRight;
		  }
		`;
	}

	_logicData() {
		console.log("logicData verNotaLbs");
	}

	_showComponent(noteData) {
		console.log(noteData);
		this._notaActual = noteData[0].elemento;
		this._paginaActial = noteData[0].pagina;
		this._textoNota.innerHTML = noteData[0].data;
		this._autorNota.innerHTML = noteData[0].userCreate;
		this._fechaNota.innerHTML = noteData[0].fecha;
		this._documentHammer = new Hammer(document);
		this._documentHammer.on('tap',  this._hideComponent);
		var message = ["INVALID", "ModusEcho", "FabsHandler", [0]];
		//window.webkit?.messageHandlers.cordova.postMessage(message);

    //NUEVA LOGICA APP NUEVA , LLAMAR CAPACITOR
    window.Capacitor?.toNative( "LbsViewer", "FabsHandler",{key1: 0});

		if(!this._isMobile) Visor.botonesHandlerWeb('hide');

		
		this.style.display = 'unset';
	}


	_hideComponent = (event) => {		
		document.getElementById(this._notaActual).classList.remove('focused');
		if(event.target.tagName === 'NOTA-LBS') {
			
		} else if(!this.contains(event.target) ){
			
			this.classList.add('fadeOutDown');
			
			if(this._documentHammer !== undefined) {
				this._documentHammer.stop();
				this._documentHammer.off('tap');
				this._documentHammer.destroy();
				this._documentHammer = undefined;
			}
			setTimeout(() => {
				this.classList.remove('fadeOutDown');
				this.style.display = 'none';
				var message = ["INVALID", "ModusEcho", "FabsHandler", [1]];
				//window.webkit?.messageHandlers.cordova.postMessage(message);
		    //NUEVA LOGICA APP NUEVA , LLAMAR CAPACITOR
		    window.Capacitor?.toNative( "LbsViewer", "FabsHandler",{key1: 1});
				if(!this._isMobile) Visor.botonesHandlerWeb('show');
				this._txtNotaEdit.value = '';
				this._txtNotaEdit.style.display = 'none';
				this._textoNota.style.display = 'unset';
				this._containerBtnsEdit.style.display = 'none';
			}, 400);
			
		}

	}


	_handlerCambiarNota(direccion) {
		console.log(direccion + " nota");
	  
		const animacion = direccion === 'next' ? 'fadeInRight' :
						  direccion === 'previous' ? 'fadeInLeft': '';
		

		const notas = this.Visor.store.getState().bookReducer.filter(elemento => elemento.elemento.includes('nota')).sort((a, b) => a.pagina - b.pagina);; 
		const indexNotaActual = notas.findIndex(elemento => elemento.elemento === this._notaActual);
		
		//console.log(notasSorted);
		console.log(notas);

		let dataNota = undefined;
		if (direccion === "next" && indexNotaActual < notas.length - 1) {
		  dataNota = notas[indexNotaActual + 1];
		} else if (direccion === "previous" && indexNotaActual > 0) {
		  dataNota = notas[indexNotaActual - 1];
		}
	  
		console.log(dataNota);
		if (dataNota !== undefined) {

		this.shadowRoot.querySelector("#container-nota-data").classList.add(animacion);
		document.getElementById(this._notaActual).classList.remove('focused');
		

		
		setTimeout(() => {
			
			this._notaActual = dataNota.elemento;
			this._textoNota.innerHTML = dataNota.data;
			this._autorNota.innerHTML = dataNota.userCreate;
			this._fechaNota.innerHTML = dataNota.fecha;
		
			if (this._paginaActial !== dataNota.pagina) {
			  IDRViewer.goToPage(dataNota.pagina);
			  this._paginaActial = dataNota.pagina;
			  
			}
			document.getElementById(this._notaActual).scrollIntoView({behavior: "smooth", block: "center"});
			document.getElementById(this._notaActual).classList.add('focused');
			this.shadowRoot.querySelector("#container-nota-data").classList.remove(animacion);
			this._txtNotaEdit.value = '';
			this._txtNotaEdit.style.display = 'none';
			this._textoNota.style.display = 'unset';
			this._containerBtnsEdit.style.display = 'none';
		}, 200);
	  }
	
	}
	  
	_nextNota() {
		this._handlerCambiarNota("next");
	}
	
	_previousNota() {
		this._handlerCambiarNota("previous");
	}

	_deleteDataFirestore() {
		console.log("_deleteDataFirestore");

		// const promiseBorrarNota = new Promise((resolve, reject) => {

		const claveLibro = IDRViewer.config.fileName.replace(".pdf",'');
		const { usuario } = this.Visor.tokenUser;
		
		this.Visor.dbFirestore.collection(usuario)
			.doc('libros')
			.collection(claveLibro)
			.doc(this._notaActual)
			.delete()
		.then(()=> {
			console.log("deleted");
			this.classList.add('fadeOutDown');
			
			if(this._documentHammer !== undefined) {
				this._documentHammer.stop();
				this._documentHammer.off('tap');
				this._documentHammer.destroy();
				this._documentHammer = undefined;
			}
			setTimeout(() => {
				this.classList.remove('fadeOutDown');
				this.style.display = 'none';
				document.getElementById(this._notaActual).remove();
				var message = ["INVALID", "ModusEcho", "FabsHandler", [1]];
				//window.webkit?.messageHandlers.cordova.postMessage(message);
		    //NUEVA LOGICA APP NUEVA , LLAMAR CAPACITOR
		    window.Capacitor?.toNative( "LbsViewer", "FabsHandler",{key1: 1});
				if(!this._isMobile) Visor.botonesHandlerWeb('show');
				this._txtNotaEdit.value = '';
				this._txtNotaEdit.style.display = 'none';
				this._textoNota.style.display = 'unset';
				this._containerBtnsEdit.style.display = 'none';
				// document.getElementById("page"+this._paginaActial).firstChild.contentWindow.document.getElementById(this._notaActual).remove();
			}, 400);
			
		})
		.catch(error => console.error("Error deleting document: ", error));

		
	};

	_editarNota() {
		console.log("abrir editar nota");
		this._containerBtnsEdit.style.display = 'flex';
		this._textoNota.style.display = 'none';
		this._txtNotaEdit.style.display = 'block';
		this._txtNotaEdit.value = this._textoNota.innerHTML;
	}

	_guardarEditNota() {

		console.log("nota actual: ", this._notaActual);

		console.log("Texto: ", this._txtNotaEdit.value);

		if(this._txtNotaEdit.value !== '' && this._txtNotaEdit.style !== 'none') {
			this._id = this._notaActual;
			this._itemLbs.value = this._txtNotaEdit.value;
			this._extraFields.x = document.getElementById(this._notaActual).getAttribute('x');		
			this._extraFields.y = document.getElementById(this._notaActual).getAttribute('y');
			this._id = document.getElementById(this._notaActual).getAttribute("id");
      		this._pagina = document.getElementById(this._notaActual).getAttribute("pagina");
			
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

			console.log("extrafields: ", this._extraFields);
			console.log(dateCreatedNote);
			
			

			this._saveData().then(()=>{
				;
				setTimeout(() => {
					this._textoNota.innerHTML = this._txtNotaEdit.value;
					this._txtNotaEdit.value = '';

					
					
					this._txtNotaEdit.style.display = 'none';
					this._textoNota.style.display = 'unset';
					this._fechaNota.innerHTML = dateCreatedNote;
					this._txtNotaEdit.style.display = 'none';
					this._containerBtnsEdit.style.display = 'none';
					Visor.toastHandler("show", "Nota modificada correctamente.", 400);
					setTimeout(() => {
						Visor.toastHandler("hide", "", 400);
					}, 3000);
				}, 400);
				}).catch(err => console.log(err));
		}
	}
	  

	_abrirListaNotas() {
		console.log("abrir lista notas");
		//Abre el componente de lista de favoritos y notas  ( mostrando notas )
		
		this.classList.add('fadeOutDown');

		if(this._documentHammer !== undefined) {
			this._documentHammer.stop();
			this._documentHammer.off('tap');
			this._documentHammer.destroy();
			this._documentHammer = undefined;
		}

		setTimeout(() => {
			this.classList.remove('fadeOutDown');
			this.style.display = 'none';
			document.getElementById("list-notas-favoritos").style.display = 'unset';
			document.getElementById("list-notas-favoritos")._openListFromVerNotas();
			document.getElementById(this._notaActual).classList.remove('focused');
		}, 400);
		
	}

	_cancelarEditNota() {
		this._containerBtnsEdit.style.display = 'none';
		this._textoNota.style.display = 'unset';
		this._txtNotaEdit.style.display = 'none';
		this._txtNotaEdit.value = '';
	}

	connectedCallback() {
        this.getData();
    }
    disconnectedCallback() {
        
        //this._unsubscribe();
    }
}

customElements.define('ver-nota-lbs', verNotaLbs);