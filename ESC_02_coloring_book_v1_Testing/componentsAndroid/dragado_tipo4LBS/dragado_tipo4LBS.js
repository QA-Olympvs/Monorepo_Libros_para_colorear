function getRemoved(item) {
    removedItem = item;
}

window.getRemoved = getRemoved;

class dragado_tipo4LBS extends componentBase { 
	constructor() {
		super();
		this._itemLbs = {value: ''};
		this._extraFields = {
			x: '',
			y: '',
			elemento: ''
		};

		this.imgs; // imgs  to draggables elements
		this.dropZones;  //drop zones elements
		this.posDrops = [];  //pos drop zones
	}


	async getData() {
        var txt = '';
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
			if((xmlhttp.status == 200 || xmlhttp.status == 0) && xmlhttp.readyState == 4){
				txt = xmlhttp.responseText;
				this.shadowRoot.innerHTML = txt;
				
				this.imgs = this.shadowRoot.querySelector("slot[name='imagen']").assignedElements({ flatte: true});
				this.dropZones = this.shadowRoot.querySelector('slot[name="end-pos-draggable"]').assignedElements({ flatte: true});

				this.dropZones.forEach((element, index) => {
					this.posDrops[index] = {x: parseInt(element.style.left), y: parseInt(element.style.top), unido: false};
				});
				
				
				this.updateStyle(this);

				this._draggadoFuncionalidad();
        	};
          
        };
        xmlhttp.open("GET","componentsAndroid/dragado_tipo4LBS/dragado_tipo4LBS.html", true);
        xmlhttp.send();
    }


	updateStyle() {
		const { shadowRoot } = this;

        shadowRoot.querySelector("style").textContent = ``;

        const linkCompontCss = document.createElement("link");
		linkCompontCss.setAttribute("rel", "stylesheet");
		linkCompontCss.setAttribute("href", "components/dragado_tipo4LBS/dragado_tipo4LBS.css");

		shadowRoot.insertBefore(linkCompontCss, shadowRoot.firstChild);
	}


	_draggadoFuncionalidad() {
		const {posDrops, imgs, dropZones } = this;
		const _thisC = this;
		const overlapThreshold = "50%";
		let iDropEl;

		imgs.forEach((element, index) => {
			initDraggableDrop(element);
		});

		function initDraggableDrop(element) {
			let insideZone = false;
			
			const originalX = element.getAttribute("original-x");
			const originalY = element.getAttribute("original-y");
			
			const elementoDB = _thisC.getDragadoFromDB(element.getAttribute("id"))[0];

			if(elementoDB !== undefined) {
				gsap.set(element, {x: elementoDB.x, y: elementoDB.y, top: '', left: ''});
				
				posDrops.forEach((pos, index) => {
					if(pos.x === elementoDB.x && pos.y === elementoDB.y) { 
						dropZones[index].classList.add("unido");
						iDropEl = dropZones[index];
						// posDrops[index].unido = true;
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
						for (let i = 0; i < dropZones.length; i++) {
							if (this.hitTest(dropZones[i], overlapThreshold)) {
							dropZoneActual = dropZones[i];
							break;
							}
						}
				},	
				onDragEnd: function() {
					insideZone = false;
					let iPos = 0;

					for(let i = 0; i < dropZones.length; i++) {
						if(this.hitTest(dropZones[i], overlapThreshold)) {
							console.log("drggin")
							insideZone = true;
							iPos = i;
							break;
						}
					}

					
					if(insideZone && !dropZones[iPos].classList.contains("unido") 
					&& (element.getAttribute('tipo-img') === dropZones[iPos].getAttribute('tipo-img'))) {
						console.log("inside");
						gsap.to(element, {
							x: posDrops[iPos].x,
							y: posDrops[iPos].y,
							top: '',
							left: '',
							duration: 0.4,
							ease: "power2.inOut",
						});
						posDrops[iPos].unido = true;
						iDropEl = dropZones[iPos];
						dropZones[iPos].classList.add("unido");
						if(dropZoneActual !== undefined && dropZoneActual !== '') {
							dropZoneActual.classList.remove("unido");
						}
						_thisC._saveDragado(posDrops[iPos].x, 
							posDrops[iPos].y,
							element.getAttribute("id") );
					} else {
						console.log("outside");
						gsap.to(element, {
                            x: originalX,
                            y: originalY,
                            top: '',
                            left: '',
                            duration: 0.3,
                            ease: "power2.inOut",
                        });
						
						console.log(iDropEl);
						_thisC._deleteDragable(element.getAttribute("id"));
						dropZoneActual.classList.remove("unido");

					
					}

					if(!insideZone) {
						console.log("fuera");
						gsap.to(element, 0.3, {
							x: originalX,
							y: originalY,
							top: '',
							left: '',
						});

						if (dropZoneActual) {
							console.log(dropZoneActual);
							dropZoneActual.classList.remove("unido");
						  }
				
						// posDrops[iPos].unido = false;
						iDropEl.classList.remove("unido");
						_thisC._deleteDragable(element.getAttribute("id"));
					}
					console.log(posDrops);
				}
				

			});

		}
	}

	_saveDragado(posX, posY, elementID) {
		console.log("_saveDragado", posX, posY, elementID);
		this._itemLbs.value = elementID;
		this._extraFields.x = posX;
		this._extraFields.y = posY;
		this._extraFields.elemento = elementID;
		
		setTimeout(() => {
			this._saveData().then(() => {
				console.log('Drag Saved');
			}).catch(err => console.error(err));
		}, 50);
	 }

	 getDragadoFromDB(elementID) {
		return this.Visor.store.getState().bookReducer.filter(a => a.elemento === elementID);
	 }

	_deleteDragable(elementID) {
		setTimeout(() => {
			this._deleteData(elementID);
		}, 50);
	}

	connectedCallback() {
        this.getData();
    }
    disconnectedCallback() {
        
    }

}

customElements.define('lbs-dragado-tipo4', dragado_tipo4LBS);