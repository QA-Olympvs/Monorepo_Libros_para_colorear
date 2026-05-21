//import htmlDOC from './player.html'
class radioLbs extends componentBase {

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
            this._itemLbs = this.shadowRoot.querySelector("div");

            this.shadowRoot.querySelector('slot[name="option"]').addEventListener('click', (event) => {
                this._logicData(event.target.parentNode,true,true);
            });

            this.updateStyle(this);
          }
        };
        xmlhttp.open("GET","components/radioLbs/radioLbs.html",true);
        xmlhttp.send();
    }

    _logicData(element,saveData, eventoFired){
        
      const nodos = element.children;
      const radio = element;

      const divseleccionado=element.parentNode.querySelector("[seleccionado='true']");

      if(eventoFired){
          if(divseleccionado == radio) {
            divseleccionado.style.color="black";
            divseleccionado.style.textDecoration="none";
            divseleccionado.setAttribute("seleccionado","false");

            this._itemLbs.value = '0';

            if(saveData)  
                this._saveData();

            return;
        }
      }  


      //Hace que todos los nodos hijos herede los estilos
      for(let i =0; i<nodos.length; i++){
            nodos[i].style.textDecoration="inherit";
            nodos[i].style.textDecorationColor="inherit";
            nodos[i].style.color="inherit";
      }

      if(divseleccionado){
           divseleccionado.style.color="black";
           divseleccionado.style.textDecoration="none";
           divseleccionado.setAttribute("seleccionado","false");

           radio.style.color="red"; 
           radio.style.textDecoration="underline";
           radio.style.textDecorationColor="black";
           radio.setAttribute("seleccionado","true");
      }
      else {
          radio.style.color="red";
          radio.setAttribute("seleccionado","true");
          radio.style.textDecoration="underline";
          radio.style.textDecorationColor="black";
      }

      this._itemLbs.value = element.getAttribute("option");

      if(saveData)  
        this._saveData();
    }

    updateStyle(elem) {
        const shadow = elem.shadowRoot;

        shadow.querySelector("style").textContent = ``;

        this._id = elem.getAttribute("id");
        this._pagina = elem.getAttribute("pagina");
        
        this.observers();
        this.loadData();
    }

    loadData(){
        const search = this.Visor.store.getState().bookReducer.filter(a => a.elemento == this._id);

        if(search != 0) {
            this._itemLbs.value = search[0].data;
            if (search[0].data == 0){
                var nodos = this.shadowRoot.querySelector('slot[name="option"]').assignedNodes();
                nodos.forEach(nodo => {
                    nodo.style.color="black";
                    nodo.style.textDecoration="none";
                    nodo.setAttribute("seleccionado","false");
                });

                
                return;
            }
            else
            this._logicData(this.shadowRoot.querySelector('slot[name="option"]').assignedNodes()[this._itemLbs.value - 1],false);
        } 
    }

    observers(){
        //console.log("observers txtlbs");
        this._unsubscribe = this.Visor.store.subscribe(()=>{
            
            const search = this.Visor.store.getState().bookReducer.filter(a => a.elemento == this._id);

            if(search != 0) {
                this._itemLbs.value = search[0].data;
                if (search[0].data == 0){
                    var nodos = this.shadowRoot.querySelector('slot[name="option"]').assignedNodes();
                    nodos.forEach(nodo => {
                        nodo.style.color="black";
                        nodo.style.textDecoration="none";
                        nodo.setAttribute("seleccionado","false");
                    });
                    return;
                }
                else
                this._logicData(this.shadowRoot.querySelector('slot[name="option"]').assignedNodes()[this._itemLbs.value - 1],false);
            } 

        });
    }

    connectedCallback() {
        this.getData();
    }
    disconnectedCallback() {
        //this.shadowRoot.querySelector("button").removeEventListener('click', this._showModal);
        //this.shadowRoot.querySelector("#btnFabButton").removeEventListener('click', this._showModal);
        //this.shadowRoot.querySelector("input").removeEventListener('blur', this._saveData);
        this._unsubscribe();
    }
}

customElements.define('radio-lbs',radioLbs);