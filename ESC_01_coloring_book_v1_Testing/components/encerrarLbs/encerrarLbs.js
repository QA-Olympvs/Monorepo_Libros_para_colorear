//import htmlDOC from './player.html'
class encerrarLbs extends componentBase {

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

            this.shadowRoot.querySelector("div").addEventListener('touchstart', this._logicData.bind(this));
            this.updateStyle(this);
          }
        };
        xmlhttp.open("GET","components/encerrarLbs/encerrarLbs.html",true);
        xmlhttp.send();
    }

    updateStyle(elem) {
        const shadow = elem.shadowRoot;

        shadow.querySelector("style").textContent = `
            div {
                width: 800px;
                height: 800px;
                border-style: solid;
                border-width: 21px;
                border-radius: 442px;
            }
        `;

        this._id = elem.getAttribute("id");
        this._pagina = elem.getAttribute("pagina");
        
        this.observers();
        this.loadData();
    }

    _logicData(){
        const  tipo=this._id.split("_",5);

        if(tipo[4]=="u"){
             if(this._itemLbs.style.borderColor==='transparent')            this._itemLbs.style.borderColor="rgb(255, 67, 139)";
             else if(this._itemLbs.style.borderColor==="rgb(255, 67, 139)") this._itemLbs.style.borderColor="transparent";
        }
        else if (tipo[4]=="d"){

            if(this._itemLbs.style.borderColor==='transparent') this._itemLbs.style.borderColor="red";
            else if(this._itemLbs.style.borderColor==="red")    this._itemLbs.style.borderColor="green";
            else if(this._itemLbs.style.borderColor==="green")  this._itemLbs.style.borderColor="transparent";
        }
        else if(tipo[4]=="m5"){
            if(this._itemLbs.style.borderColor==='transparent')  this._itemLbs.style.borderColor="red";
            else if(this._itemLbs.style.borderColor==="red")     this._itemLbs.style.borderColor="green";
            else if(this._itemLbs.style.borderColor==="green")   this._itemLbs.style.borderColor="blue";
            else if(this._itemLbs.style.borderColor==="blue")    this._itemLbs.style.borderColor="orange";
            else if(this._itemLbs.style.borderColor==="orange")  this._itemLbs.style.borderColor="purple";
            else if(this._itemLbs.style.borderColor==="purple")  this._itemLbs.style.borderColor="transparent";

        } else {

             if(this._itemLbs.style.borderColor==='transparent') this._itemLbs.style.borderColor="red";
             else if(this._itemLbs.style.borderColor==="red")    this._itemLbs.style.borderColor="green";
             else if(this._itemLbs.style.borderColor==="green")  this._itemLbs.style.borderColor="blue";
             else if(this._itemLbs.style.borderColor==="blue")   this._itemLbs.style.borderColor="transparent";             
        }
        
        this._itemLbs.value = this._itemLbs.style.borderColor;
        this._saveData();
    }

    loadData(){
        const search = this.Visor.store.getState().bookReducer.filter(a => a.elemento == this._id);

        if(search != 0) {
            this._itemLbs.style.borderColor = search[0].data;
        } 
    }

    observers(){
        //console.log("observers txtlbs");
        this._unsubscribe = this.Visor.store.subscribe(()=>{
            
            const search = this.Visor.store.getState().bookReducer.filter(a => a.elemento == this._id);

            if(search != 0) {
                this._itemLbs.style.borderColor = search[0].data;
            }

        });
    }

    connectedCallback() {
        this.getData();
    }
    
    disconnectedCallback() {
        this.shadowRoot.querySelector("div").removeEventListener('touchstart', this._logicData);
        this._unsubscribe();
    }
}

customElements.define('encerrar-lbs',encerrarLbs);