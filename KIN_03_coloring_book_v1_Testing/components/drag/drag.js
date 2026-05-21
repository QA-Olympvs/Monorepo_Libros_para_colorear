let removedItem = null;
function getRemoved(item) {
    removedItem = item;
}

window.getRemoved = getRemoved;

class Drag extends componentBase {
    botonAnterior;
    botoSeleccionado;
    colorSeleccionado;

    constructor() {
        super();
		this.dataInDB;
        this._drag;
		this._itemLbs = {value: ''};
		this._extraFields = {
			x: '',
			y: '',
			elemento: ''
		};
		this._id;
		this.strokeColorOriginal;
		this.strokeColorDentro = 'green';
    }

    async getData() {
        var txt = '';
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
          if(xmlhttp.status == 200 && xmlhttp.readyState == 4){
            txt = xmlhttp.responseText;
			let _thisComponent = this;
            this.shadowRoot.innerHTML = txt;
			this._drag = this;

            var objs = this.shadowRoot.querySelector("slot[name='imagen']");
            var dragImages = objs.assignedElements({ flatten: true });
            var circulo = this.shadowRoot.querySelector("#circulo");
			this.strokeColorOriginal = circulo.style.stroke;
            var overlapThreshold = "80%"; 

            var dragObj = new Draggable.create(dragImages);

			dragObj.forEach(item => {
				_thisComponent.getItemsInDB(item.target.getAttribute("id"));
				
				item.type = "x,y";	
				if(_thisComponent.dataInDB.length > 0) {
					item.target.setAttribute('y', _thisComponent.dataInDB[0].y);
					item.target.setAttribute('x', _thisComponent.dataInDB[0].x);
					item.x = _thisComponent.dataInDB[0].x;
					item.y = _thisComponent.dataInDB[0].y;

					gsap.set(item.target, {x: _thisComponent.dataInDB[0].x, y: _thisComponent.dataInDB[0].y});
					
					setTimeout(() => {
						item.update();
					}, 50);
				}
				
				item.addEventListener('press', function(evt) {
					_thisComponent._setThisId(this.target.getAttribute('id'));
					_thisComponent.getItemsInDB(item.target.getAttribute('id'));
				});
	
				item.addEventListener('dragend', (evt) => {
					const initialX = item.target.getAttribute('original-x');
					const initialY = item.target.getAttribute('original-y');
					
					if(!item.hitTest(circulo, overlapThreshold)) {
						console.log("test");
						gsap.to(item.target, {
							top: initialX,
							left: initialY,
							delay: 0.1,
							duration: 0.1,
							ease: "power2.inOut",
							transform: "translate3d(0px, 0px, 0px)"
						});
						
						_thisComponent.getItemsInDB(item.target.getAttribute('id'));
						const existsInDB = _thisComponent.dataInDB.some(data => data.data === item.target.getAttribute('id'));

						if (existsInDB) {
							_thisComponent._deleteDrag(); // Delete if item leaves the circle
							_thisComponent.getItemsInDB(item.target.getAttribute("id"));
							setTimeout(() => {
								item.target.style.transform = '';
								item.update();
							},85);
							_thisComponent.getItemsInDB(item.target.getAttribute('id'));
						}

					} else {
						/**
						 * Guardar en firestore
						 */
						_thisComponent._setDataItemLbs('value', item.target.getAttribute('id'));
						_thisComponent._setDataExtraFiels('elemento', item.target.getAttribute('id'));
						_thisComponent._setDataExtraFiels('x', item.x);
						_thisComponent._setDataExtraFiels('y', item.y);
						_thisComponent._saveDrag();
					}
				});
				
				item.addEventListener('drag', function(evt) {
					if(!item.hitTest(circulo, overlapThreshold)) {
						circulo.style.stroke = _thisComponent.strokeColorOriginal;
					} else {
						circulo.style.stroke = _thisComponent.strokeColorDentro;
					}
				});

				item.addEventListener('release', function(evt) {
					circulo.style.stroke = _thisComponent.strokeColorOriginal;
				});

			});

				this.updateStyle(this);
            };
			
          
        };
        xmlhttp.open("GET","components/drag/drag.html",true);
        xmlhttp.send();

    }

    updateStyle(elem) {
        const shadow = elem.shadowRoot;

        shadow.querySelector("style").textContent = `
        path{
				
            fill: none;
            stroke: #A626A6;
            stroke-width: 15.277778;
            stroke-linecap: butt;
            stroke-linejoin: miter;
            stroke-miterlimit: 4;
        }
        `;

        

        this._id = elem.getAttribute("id");
        
        // this.observers();
        // this.loadData();
    }

	_saveDrag() {
		setTimeout(() => {
			console.log(this._itemLbs);
			this._saveData().then(() => {
				console.log('Drag Saved');
			}).catch(err => console.error(err));

		}, 50);
	}

	_deleteDrag() {
		setTimeout(() => {
			this._deleteData();
			
		}, 50);
	}

    _dragCirculo() {

    }

	_setDataExtraFiels(key, value) {
		this._extraFields[key] = value;
		
	}

	_setDataItemLbs(key, value) {
		this._itemLbs[key] = value;
	}

	_setThisId(value) {
		this._id = value;
	}


	getItemsInDB(elementID) {
		this.dataInDB = this.Visor.store.getState().bookReducer.filter(a => a.elemento === elementID);
		console.log(this.dataInDB);
	}
    connectedCallback() {
        this.getData();
    }
    disconnectedCallback() {
        //this.shadowRoot.querySelector("button").removeEventListener('click', this._showModal);
        //this.shadowRoot.querySelector("#btnFabButton").removeEventListener('click', this._showModal);
        //this.shadowRoot.querySelector(".close").removeEventListener('click', this._hideModal);
    }
}

customElements.define('lbs-drag',Drag);