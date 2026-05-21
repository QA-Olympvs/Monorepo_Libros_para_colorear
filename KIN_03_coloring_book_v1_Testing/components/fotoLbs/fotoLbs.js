//import htmlDOC from './player.html'
class fotoLbs extends componentBase {

    constructor() {
        super();
    }

    async getData() {
        var txt = '';
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
          if(xmlhttp.status == 200 && xmlhttp.readyState == 4){
            txt = xmlhttp.responseText;
            this.shadowRoot.innerHTML = txt;
            this._itemLbs = this.shadowRoot.querySelector("span");

            // this.shadowRoot.querySelectorAll('span[aria-hidden="true"]').forEach(occurence => {
            this.shadowRoot.querySelectorAll('label').forEach(occurence => {
                occurence.addEventListener('touchstart', (e) => {
                    if(e.target.className == "fa fa-camera"){
                        // console.log(e.target.className);
                        // console.log("camera clicked");

                        this.shadowRoot.getElementById("imgInp").addEventListener('input', (event) => {
                            // console.log("cambio");
                            this._cargarFoto(this.shadowRoot.getElementById(this._id), event)
                            // this._comprimirFoto(this.shadowRoot.getElementById(this._id), event)
                        
                        });

                        

                    }
                    else if(e.target.className == "fa fa-trash"){
                        // console.log(e.target.className);
                        // console.log("trash clicked");

                        this._EliminarFoto(this.shadowRoot.getElementById(this._id));
                    }
                    
                });
            });
            this.updateStyle(this);
          }
        };
        xmlhttp.open("GET","components/fotoLbs/fotoLbs.html",true);
        xmlhttp.send();
    }

    updateStyle(elem) {
        const shadow = elem.shadowRoot;

        shadow.querySelector("style").textContent = `
            img {
                width:100%;
                height:100%;
                object-fit:cover;
                object-position:center;
                text-indent: -10000px;
            }

            span.fa-trash {
                position: absolute;
                right: 17px;
                bottom: 8px;
                color: #ffffff;
                font-size: 50px;
                cursor: pointer; 
                text-shadow: 0px 0px 10px black;
            }

            label.fa-camera {
                position: absolute;
                right: 77px;
                bottom: 8px;
                color: #ffffff;
                font-size: 42px;
                cursor: pointer; 
                text-shadow: 0px 0px 10px black;
            }
            label.fa-camera input[accept*="image"] {
                display: none;
            }

                
        `;

        this._id = elem.getAttribute("id");
        this._pagina = elem.getAttribute("pagina");

        var imagen = shadow.querySelector("img");
        imagen.setAttribute("id",this._id);

        this.parentNode.setAttribute("style","position: absolute;z-index: 3;font-size: 87px;width: 563px;height: 390px;"); 
        this.parentNode.setAttribute("class",""); 
        
        this.observers();
        this.loadData();
    }

    _EliminarFoto(img) {
        // console.log("_Eliminar Foto", img.id);
        
        var inputs = this.shadowRoot.getElementById("imgInp");
        inputs.value = "";
        localStorage.removeItem(img.id);
        img.src = "#";
    }


    _cargarFoto(img, event) {
        img.id = this._id;
        // console.log(img.id);
        var reader = new FileReader();
        reader.onload = function(){
            img.src = reader.result;

            localStorage.setItem(img.id, reader.result);
        };

        reader.readAsDataURL(event.target.files[0]);

    };

    loadData(){

        if (localStorage.getItem(this._id)) {
            this.shadowRoot.getElementById(this._id).src = localStorage.getItem(this._id);
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
        this.shadowRoot.querySelector("span").removeEventListener('touchstart', this._saveData);
        this._unsubscribe();
    }
}

customElements.define('foto-lbs',fotoLbs);