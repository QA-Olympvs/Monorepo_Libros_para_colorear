function getRemoved(item) {
    removedItem = item;
}

window.getRemoved = getRemoved;

class dragado_tipo5LBS extends componentBase {
	constructor() {
		super();
		this.endPositions = [];
		this.endElements;
		this._itemLbs = {value: ''};
		this._extraFields = {
			x: '',
			y: '',
			elemento: ''
		};
	}


	async getData() {
        var txt = '';
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
          	if(xmlhttp.status == 200 && xmlhttp.readyState == 4){
				txt = xmlhttp.responseText;
				this.shadowRoot.innerHTML = txt;
				this._drag = this;
				this.objs = this.shadowRoot.querySelector("slot[name='imagen']").assignedElements({ flatten: true });

				this.objs.forEach(element => {
					element.src = 'assets/drag_recursos/' + element.id + '.png';
				});
				
				

				this.updateStyle(this);

				this.endElements = this.shadowRoot.querySelector('slot[name="drag_target"]').assignedElements({ flatte: true});
				// this.endElements = this.shadowRoot.querySelectorAll(".border-iman");

				this.endElements.forEach((element, index) => {
					this.endPositions[index] = {x: parseInt(element.style.left), y: parseInt(element.style.top)};
				});
				
				this._draggadoFuncionalidad();
        	};
          
        };
        xmlhttp.open("GET","components/dragado_tipo5LBS/dragado_tipo5LBS.html",true);
        xmlhttp.send();
    }

	updateStyle() {
        const { shadowRoot } = this;

        shadowRoot.querySelector("style").textContent = ``;

        const linkCompontCss = document.createElement("link");
		linkCompontCss.setAttribute("rel", "stylesheet");
		linkCompontCss.setAttribute("href", "components/dragado_tipo5LBS/dragado_tipo5LBS.css");

		shadowRoot.insertBefore(linkCompontCss, shadowRoot.firstChild);

        // this._id = shadowRoot.getAttribute("id");
        
        // this.observers();
        // this.loadData();
    }

	_draggadoFuncionalidad() { 
		this.dragImages = this.objs;
		const overlapThreshold = "50%"; 
        const dragObjs = new Draggable.create(this.dragImages);
		const _thisComponent = this;


		dragObjs.forEach(item => {
			gsap.set(item, {
				x: parseInt(item.target.getAttribute("x")), 
				y: parseInt(item.target.getAttribute("y"))
			});
		});
		

		// this.dragImages.forEach(img => {
		// 	const elementoImgDB = _thisComponent._getDragadoFromDB(img.getAttribute("id"));
		// 	console.log(elementoImgDB);
		// 	gsap.to(img, {x: elementoImgDB[0].x, y: elementoImgDB[0].y, duration: 0.1});
		// });

		this.dragImages.forEach(function(element, index) {
			initDraggableDrop(element);
		});

		function initDraggableDrop(element) {
			
			let insideZone = false;
			let iDropEl;
			const originalX = parseInt(element.getAttribute("x"));
			const originalY = parseInt(element.getAttribute("y"));



			const elementoDB = _thisComponent._getDragadoFromDB(element.getAttribute("id"))[0];
			console.log(elementoDB);

			if(elementoDB !== undefined) {
				gsap.set(element, {x: elementoDB.x, y: elementoDB.y, top: '', left: ''});
				
				const posDrops = _thisComponent.endPositions;

				posDrops.forEach((pos, index) => {
					if(pos.x === elementoDB.x && pos.y === elementoDB.y) {
						_thisComponent.endElements[index].classList.add("unido");
						iDropEl = _thisComponent.endElements[index];
						return;
					}
				});
				

			} else {
				gsap.set(element, {x: originalX, y: originalY, top: '', left: ''});
			}

			
			let dropZoneActual;
			Draggable.create(element, { 
				onDragStart: function() {
					dropZoneActual = '';
						for (let i = 0; i < _thisComponent.endElements.length; i++) {
							if (this.hitTest(_thisComponent.endElements[i], overlapThreshold)) {
							dropZoneActual = _thisComponent.endElements[i];
							break;
							}
						}
				},	
				
				onDragEnd: function() {
					// borrar en firestore 
					insideZone = false;
					let iPosition = 0;

					//Itera en las dropZones, si el elmento esta dentor de una, sale del arreglo.
					for(let i = 0; i < _thisComponent.endElements.length; i++) {
						if(this.hitTest(_thisComponent.endElements[i], overlapThreshold)) {
							insideZone = true;
							iPosition = i;
							break;
						}
					}	

					//Check si esta dentro de una zona de drop && si la drop zone tiene la clase 'unido'
					//Si no tiene la clase ssuelta el objeto en la dropzone, sino lo regresa a su pos inicial
					if(insideZone && !_thisComponent.endElements[iPosition].classList.contains("unido")) {
						console.log("inside");
						//Deja el elemento en la posicion de la dropzone
						gsap.to(element, {
							x: _thisComponent.endPositions[iPosition].x,
							y: _thisComponent.endPositions[iPosition].y,
							top: '',
							left: '',
							duration: 0.4,
							ease: "power2.inOut",
						});
						iDropEl = _thisComponent.endElements[iPosition];
						_thisComponent.endElements[iPosition].classList.add("unido");
						if(dropZoneActual !== undefined && dropZoneActual !== '') {

							dropZoneActual.classList.remove("unido");
						}
						//Guardar en firestore (pos x, pos y, id element (ejercicio img))
						

						_thisComponent._saveDragado(_thisComponent.endPositions[iPosition].x, 
							_thisComponent.endPositions[iPosition].y, 
							element.getAttribute('id'));

					} else {
						//REgresa el elemento a posicion inicial
						gsap.to(element, {
							x: originalX,
							y: originalY,
							top: '',
							left: '',
							duration: 0.2,
							ease: "power2.inOut",
						});
						dropZoneActual.classList.remove("unido");
						_thisComponent._deleteDragable(element.getAttribute("id"));
					}

					//Si esta fuera de la dropzone o lo saca, regresa el elemento a su pos inicial.
					//Y remueve la clase unido
					if(!insideZone) { 
						console.log("outside");
						gsap.to(element, 0.2, {
							x: originalX,
							y: originalY,
							top: '',
							left: '',
						});
						if (dropZoneActual) {
							console.log(dropZoneActual);
							dropZoneActual.classList.remove("unido");
						  }
						iDropEl.classList.remove("unido");
						_thisComponent._deleteDragable(element.getAttribute("id"));
					}
				}



			});
			
		}
	}
		


	_getDragadoFromDB(imgID) {
		return this.Visor.store.getState().bookReducer.filter(a => a.elemento === imgID);
	}

	_saveDragado(posX, posY, imgID) {
		this._itemLbs.value = imgID;
		this._extraFields.x = posX;
		this._extraFields.y = posY;
		this._extraFields.elemento = imgID;
		
		setTimeout(() => {
			console.log("save");
			this._saveData().then(() => {
				console.log('Drag Saved');
			}).catch(err => console.error(err));
		}, 50);
	}

	_deleteDragable(imgID) {
		setTimeout(() => {
			this._deleteData(imgID);
		}, 50);
	}

	

	connectedCallback() {
        this.getData();
    }
    disconnectedCallback() {
        
    }
}

customElements.define('lbs-dragado-tipo5', dragado_tipo5LBS);