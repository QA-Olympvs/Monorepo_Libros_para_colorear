class List_notasyfavoritosLbs extends componentBase { 
	
	constructor() {
        super();
		this.dropdownContent;
		this.dataListaContent;
		this.eliminarClicked;
		this.paginaNota;
		this.elementNota;
    }

	async getData() {
        // console.log('GET DATA');
        var txt = '';
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
            if(xmlhttp.status == 200 && xmlhttp.readyState == 4) {
                txt = xmlhttp.responseText;
                this.shadowRoot.innerHTML = txt;
                // this._itemLbs = this.shadowRoot.querySelector("input");
                // this._logicData(this);
				this.dropdownContent = this.shadowRoot.querySelector('#dropdown-menu-btns');
				this.dataListaContent = this.shadowRoot.querySelector('#data-lista-content');
				
				this._containerFavoritosYListaHandler('favoritos', 'cerrar');
				this._containerFavoritosYListaHandler('notas', 'cerrar');

				this.shadowRoot.querySelector('#btn-select-tipo-lista').addEventListener('click', this._btnDropdownHandler.bind(this));
				this.shadowRoot.querySelector('#btn-ver-lista-favoritos').addEventListener('click', this._btnListaFavoritosHandler.bind(this, false));
				this.shadowRoot.querySelector('#btn-ver-lista-notas').addEventListener('click', this._btnListaNotasHandler.bind(this, false));
				this.shadowRoot.querySelector('#btn-close').addEventListener('click', this._closeLista.bind(this));
				this.shadowRoot.querySelector('#btn-close-b').addEventListener('click', this._closeLista.bind(this));
				this.shadowRoot.querySelector('#btn-eliminar-cancelar').addEventListener('click', this._cancelarEliminar.bind(this));
				this.shadowRoot.querySelector('#btn-eliminar-aceptar').addEventListener('click', this._aceptarEliminar.bind(this));

				// console.log(this.shadowRoot.querySelector('#btn-select-tipo-lista'));
				// this.shadowRoot.querySelector("#btnCerrarIndice").addEventListener("click",this._attachEventHandlers.bind(this));
                // this.shadowRoot.querySelector("#btnTacha").addEventListener("click",this._attachEventHandlers.bind(this));
                
                
                // this.shadowRoot.querySelector("input").addEventListener('blur', this._saveData.bind(this));
                this.updateStyle(this);

				// this._containerFavoritosYListaHandler('favoritos', 'abrir');
            }
        };
        xmlhttp.open("GET","components/list_notasyfavoritosLbs/list_notasyfavoritosLbs.html", true);
        xmlhttp.send();
    }


	updateStyle(elem) {
		const shadow = elem.shadowRoot;
		const linkBootstrapCss = document.createElement("link");
		linkBootstrapCss.setAttribute("rel", "stylesheet");
		linkBootstrapCss.setAttribute("href", "assets/bootstrap.min.css");

		const linkCompontCss = document.createElement("link");
		linkCompontCss.setAttribute("rel", "stylesheet");
		linkCompontCss.setAttribute("href", "components/list_notasyfavoritosLbs/list_notasyfavoritosLbs.css");

		const linkFontAwesomeCss = document.createElement("link");
		linkFontAwesomeCss.setAttribute("rel", "stylesheet");
		linkFontAwesomeCss.setAttribute("href", "assets/font-awesome.min.css");
		// Attach the created element to the shadow DOM
		shadow.insertBefore(linkBootstrapCss, shadow.firstChild);
		shadow.insertBefore(linkCompontCss, shadow.firstChild);
		shadow.insertBefore(linkFontAwesomeCss, shadow.firstChild);
	}

	
	/**
	 * Dropdown handlers
	 */
	_btnDropdownHandler() {
		const styles = window.getComputedStyle(this.dropdownContent);
		const isHidden = styles.getPropertyValue('display') === 'none';

		this.dropdownContent.style.display = isHidden ? 'unset' : 'none';
	}

	_btnListaFavoritosHandler(itself) {
		const _thisC = this;
		// this.dataListaContent.empty();
		if(!itself) this._btnDropdownHandler();
		this._containerFavoritosYListaHandler('favoritos', 'abrir');
		this._containerFavoritosYListaHandler('notas', 'cerrar');
		const favoritosListaTemp = Visor.store.getState().bookReducer.filter(a => a.elemento.includes('lista'));
       console.log(favoritosListaTemp);
		this.shadowRoot.querySelector('.modal-body').classList.add('entrance-down');
		// this.classList.add('entrance-down');

		var favoritos = [];
		if(favoritosListaTemp.length > 0) {
			favoritos = favoritosListaTemp[0].data.sort((a, b) => a - b);
		}

		var bookmarkPanel = this.shadowRoot.querySelector('#outlinePanel');
		bookmarkPanel.innerHTML = '';
		
		var makeThumbnailClickHandler = (pg) => {
            return function() {
                IDRViewer.goToPage(pg);
				_thisC._closeLista();
				_thisC._containerFavoritosYListaHandler('favoritos', 'cerrar');
				bookmarkPanel.innerHTML = ' ';
                return false;
            };
        }

        
        favoritos.forEach(function(Pagina) {
			var numPagEle = document.createElement("p");
			numPagEle.className = "numero-pagina text-monospace";
			numPagEle.style.marginBottom = '0';
			numPagEle.style.textAlign = "center";
			numPagEle.innerHTML = `<span class="badge badge-light" style="border-radius: 10px;">Pagina ${Pagina}</span>`;
			bookmarkPanel.appendChild(numPagEle);

            var ele = document.createElement("a");
            ele.className = "thumbnail";
            // ele.href = "?page=" +  Pagina;
            ele.id = "thumb" +  Pagina;
            ele.onclick = makeThumbnailClickHandler(Pagina);
            ele.setAttribute('title', 'Page ' + Pagina);
            ele.innerHTML = '<img src="thumbnails/'+ Pagina+'.png"/>';
            bookmarkPanel.appendChild(ele);
        });


		setTimeout(() => {
			this.shadowRoot.querySelector('.modal-body').classList.remove('entrance-down');
			// this.classList.remove('entrance-down');
		}, 1000);
	}

	_btnListaNotasHandler(itself) {
		
		if(!itself) this._btnDropdownHandler();
		this._containerFavoritosYListaHandler('notas', 'abrir');
		this._containerFavoritosYListaHandler('favoritos', 'cerrar');
		const notas = this.Visor.store.getState().bookReducer.filter(elemento => elemento.elemento.includes('nota')).sort((a, b) => a.pagina - b.pagina);; 
		this.shadowRoot.querySelector('.modal-body').classList.add('entrance-down');

		const notasLista = notas.reduce((result, item) => {
			const key = item.pagina;
			if (!result[key]) {
				result[key] = [];
			}
			result[key].push(item);
			return result;
		}, {});

		const notasHtml = `<div class="container">
		${Object.entries(notasLista).map(([key, value]) => this._renderNotaPage(key, value)).join('')}
		</div>`;
		
		setTimeout(() => { 
			this.dataListaContent.innerHTML = notasHtml;
			this.shadowRoot.querySelectorAll('.ctn-nota').forEach(element => {
				element.addEventListener('click', this._irANotaHandler.bind(this));
			}); 
		}, 100);

		setTimeout(() => {
			this.shadowRoot.querySelectorAll(".btn-eliminar-nota").forEach(element => {
				console.log(element);
				element.addEventListener('click', this._eliminarNotaHandler.bind(this, element));
			});
		}, 100);

		setTimeout(() => {
			this.shadowRoot.querySelector('.modal-body').classList.remove('entrance-down');
			// this.classList.remove('entrance-down');
		}, 1000);
	}


	_irANotaHandler(evt) {
		if(this.eliminarClicked) return;
		console.log(evt.target.closest('.ctn-nota'));
		const ctnNotaElement = evt.target.closest('.ctn-nota');
		const pagina = ctnNotaElement.getAttribute('pagina');
		IDRViewer.goToPage(pagina);
		const idNota = evt.target.closest('.ctn-nota').getAttribute('nota-id');
		
		console.log(pagina);
		console.log(idNota);

		setTimeout(() => {
			const notav2Comp = document.querySelector('nota-v2-lbs');

			notav2Comp._showNota(pagina, true);
			
			this._containerFavoritosYListaHandler('notas', 'cerrar');
			this._containerFavoritosYListaHandler('favoritos', 'cerrar');
			this.style.display = 'none';


		 }, 500);

		/*
		setTimeout(() => {
			const notaElement = document.getElementById(idNota);
			const notaContainer = notaElement.parentNode;
			const { clientHeight: containerHeight } = notaContainer;
			const { offsetTop: elementOffset, clientHeight: elementHeight } = notaElement;
			const scrollPosition = elementOffset - containerHeight / 2 + elementHeight / 2;

			document.getElementById(idNota).scrollTo({ top: scrollPosition,  behavior: 'smooth' });

			setTimeout(() => {

				document.getElementById(idNota).classList.add('focused');	
				var eventTouchStart = new Event('touchstart');
				
				document.getElementById(idNota).dispatchEvent(eventTouchStart);
				
				this._closeLista();
			}, 100);
		}, 500);
		*/

	
		
	}

	 _renderNotaItem(item) {
		return `
		  <div pagina="${item.pagina}" nota-id="${item.elemento}" class="ctn-nota my-2 d-flex flex-grow-1 animacion-200ms" style="background-color: #f7f7f7; border-radius: 5px; padding: 10px; position: relative;">
			<img class="avatar rounded-circle float-start margin-right-5rem" src="./assets/user-img.png" alt="avatar">
			<div class="nota-user">
			  <div class="mb-2 d-sm-flex d-flex">
				<h6 class="margin-right-5rem">${item.userCreate}</h6>
				<span class="me-3 small">${item.fecha}</span>
			  </div>
			  <p>${item.data}</p>
			</div>
			<button class="btn btn-sm btn-link btn-eliminar-nota"><i class="fa fa-times" aria-hidden="true"></i></button>
		  </div>
		`;
	  }

	_renderNotaPage(key, value) {
		return `<div class="row" style="flex-direction: column; ">
			<p class="text-monospace" style="margin: auto;"><span class="badge badge-pill badge-light" style="border-radius: 3px;">Pagina ${key}</span></p>
			${value.map(this._renderNotaItem).join('')}
		</div>`;
	}

	_closeLista() {
		try{ 
			this._containerFavoritosYListaHandler('notas', 'cerrar');
			this._containerFavoritosYListaHandler('favoritos', 'cerrar');
			this.style.display = 'none';
			var message = ["INVALID", "ModusEcho", "FabsHandler", [1]];
			//window.webkit?.messageHandlers.cordova.postMessage(message);
			window.Capacitor?.toNative( "LbsViewer", "FabsHandler",{key1: 1});
			if(!this._isMobile) Visor.botonesHandlerWeb('show');
		} catch(error){
			window.Capacitor?.toNative( "LbsViewer", "FabsHandler",{key1: 1});
		}	
	}
	
	_containerFavoritosYListaHandler(container, accion) {
		const { shadowRoot } = this;
		switch (container) {
			case 'notas': {
				const listaContent = shadowRoot.querySelector('#data-lista-content');
				switch (accion) {
				case 'abrir': {
					listaContent.style.display = '';
					shadowRoot.querySelector('#lista-actual-notas').style.display = '';
					break;
				}
				case 'cerrar': {
					listaContent.style.display = 'none';
					listaContent.innerHTML = '';
					shadowRoot.querySelector('#lista-actual-notas').style.display = 'none';
					break;
				}
				}
				break;
			}
			case 'favoritos': {
				const outlinePanel = shadowRoot.querySelector('#outlinePanel');
				switch (accion) {	
				case 'abrir': {
					outlinePanel.style.display = '';
					shadowRoot.querySelector('#lista-actual-favoritos').style.display = '';
					break;
				}
				case 'cerrar': {
					outlinePanel.style.display = 'none';
					outlinePanel.innerHTML = '';
					shadowRoot.querySelector('#lista-actual-favoritos').style.display = 'none';
					break;
				}
				}
				break;
			}
		}
	}
   

	_openList() {
		this._containerFavoritosYListaHandler('favoritos', 'abrir');
		setTimeout(() => { 
			try{

				this._btnListaFavoritosHandler(true);
				var message = ["INVALID", "ModusEcho", "FabsHandler", [0]];
				//window.webkit?.messageHandlers.cordova.postMessage(message);
				window.Capacitor?.toNative( "LbsViewer", "FabsHandler",{key1: 0});
				if(!this._isMobile) Visor.botonesHandlerWeb('hide');

			} catch(error){
				window.Capacitor?.toNative( "LbsViewer", "FabsHandler",{key1: 0});
			}

		}, 200);
	}

	_openListFromVerNotas() {
		this._containerFavoritosYListaHandler('notas', 'abrir');
		setTimeout(() => { 
			try{
				this._btnListaNotasHandler(true);
				var message = ["INVALID", "ModusEcho", "FabsHandler", [0]];
				//window.webkit?.messageHandlers.cordova.postMessage(message);
				window.Capacitor?.toNative( "LbsViewer", "FabsHandler",{key1: 0});
				if(!this._isMobile) Visor.botonesHandlerWeb('hide');
			} catch(error){
				window.Capacitor?.toNative( "LbsViewer", "FabsHandler",{key1: 0});
			}
		}, 200);
	}


	_eliminarNotaHandler(element, ele2) {
		console.log("ELIMINAR NOTA", element.parentElement.getAttribute('pagina'));
		this.paginaNota = element.parentElement.getAttribute('pagina');
		this.elementNota = element.parentElement;
		this.shadowRoot.querySelector('.modal-wrapper-bg').style.display = 'block';
		this.eliminarClicked = true;
	}

	_aceptarEliminar() {
		console.log(this.paginaNota);
		console.log("aceptar");

		this._deleteData(`nota_${this.paginaNota}`);	

		Visor.toastHandler("show", "Nota eliminada.", 400);
		
			setTimeout(() => {
				Visor.toastHandler("hide", "", 400);
				this.elementNota.remove();
				this._btnListaNotasHandler(true);
			},3000);

		
			this.shadowRoot.querySelector('.modal-wrapper-bg').style.display = 'none';
			this.eliminarClicked = false;
	}

	_cancelarEliminar() {
		this.shadowRoot.querySelector('.modal-wrapper-bg').style.display = 'none';
		this.eliminarClicked = false;
		console.log("cancelar");
	}

	connectedCallback() {      
        this.getData();
    }

    disconnectedCallback() {
        //this.shadowRoot.querySelector("button").removeEventListener('click', this._showModal);
        //this.shadowRoot.querySelector("#btnFabButton").removeEventListener('click', this._showModal);
        // this.shadowRoot.querySelector("input").removeEventListener('blur', this._saveData);
        this._unsubscribe();
    }
}

customElements.define('list-notas-y-favoritos', List_notasyfavoritosLbs);