function getRemoved(item) {
    removedItem = item;
}

window.getRemoved = getRemoved;

class dragado_tipo2LBS extends componentBase {

	constructor() {
		super();
		this._itemLbs = {value: ''};
		this._extraFields = {
			x: '',
			y: '',
			elemento: ''
		};
		this._id;
	}

	async getData() {
		var txt = '';
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = () => {
			if(xmlhttp.status == 200 && xmlhttp.readyState == 4){ 
				txt = xmlhttp.responseText;
				this.shadowRoot.innerHTML = txt;
				this.objs = this.shadowRoot.querySelector("slot[name='imagen']").assignedElements({ flatten: true });
				this.dropZone = this.shadowRoot.querySelector("slot[name='drag_target']").assignedElements({ flatten: true });;
				// this.dropZone[0].src = 'assets/drag_recursos/' + this.dropZone[0].id + '.svg';

				// console.log(this.dropZone)

				
				// this.objs.forEach(element => {
				
				// 	element.src = 'assets/drag_recursos/' + element.id + '.svg';
				// });

				
				

				this.updateStyle();
				this.dragtipo2();
			}
		};
		xmlhttp.open("GET","components/dragado_tipo2LBS/dragado_tipo2LBS.html", true);
        xmlhttp.send();
	}

	updateStyle() {
        const { shadowRoot } = this;

        this._id = this.getAttribute("id");

    }


	dragtipo2() {
		const { objs, dropZone } = this;
		const overlapThreshold = "80%";
		const _thisC = this;

		console.log(objs)
		console.log(dropZone)

		objs.forEach(element => {
			initDraggableDrop(element);
		});

		function initDraggableDrop(element) {
			const originalX = parseInt(element.getAttribute('original-x'));
			const originalY = parseInt(element.getAttribute('original-y'));

			const elementoDB = _thisC._getDragadoFromDB(element.getAttribute('id'));

			console.log(element)

			if(elementoDB.length > 0) {
				gsap.set( element, { x: elementoDB[0].x, y: elementoDB[0].y, top: '', left: ''});
			} else {
				gsap.set(element, {x: originalX, y: originalY, top: '', left: ''});	
			}

			Draggable.create(element, {
				onDragEnd: function() {
					var dentro = false;
					// dropZone.forEach(zona => {
					for (let i = 0; i < dropZone.length; i++) {
						// console.log(dropZone[i])
						
						if(this.hitTest(dropZone[i], overlapThreshold)) {
							dentro = true;
							// console.log("no fue hit", dropZone[i])
							
						}
					}
						// console.log("VERIFICANDO");
						// console.log(dentro);
						// console.log(dropZone.length);
						if(dentro == false){
							gsap.to(element, {
								x: originalX,
								y: originalY,
								top: '',
								left: '',
								duration: 0.2,
								ease: "power2.inOut",
							});
						
							const existsInDB = _thisC._getDragadoFromDB(element.getAttribute('id'));

							if(existsInDB) {
								_thisC._deleteDragado(element.getAttribute('id'));
								dentro = false;
							}

						} else {
							_thisC._saveDrag(element.getAttribute('id'), this.x, this.y);
							dentro = false;
						
					}

					
				}
			});
		}

		
	}

	_getDragadoFromDB(elementId) {
		return this.Visor.store.getState().bookReducer.filter(a => a.elemento == elementId);
	}

	_saveDrag(elementId, posX, posY) {
		this._itemLbs.value = elementId;
		this._extraFields.x = posX;
		this._extraFields.y = posY;
		this._extraFields.elemento = elementId;

		setTimeout(() => {
			this._saveData().then(() => {
			}).catch(err => console.error(err));
		}, 50);
	}

	_deleteDragado(elementId) { 
		setTimeout(() => {
			this._deleteData(elementId);
		});
	}

	connectedCallback() {	
		this.getData();
	}

	disconnectedCallback() {
     
    }
}

customElements.define('lbs-dragado-tipo2', dragado_tipo2LBS);