//import htmlDOC from './player.html'
class oneTouchLbs extends componentBase {

    constructor() {
        super();
    }

    async getData() {
        var txt = '';
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
            if((xmlhttp.status == 200 || xmlhttp.status == 0) && xmlhttp.readyState == 4){
            txt = xmlhttp.responseText;
            this.shadowRoot.innerHTML = txt;
            this._itemLbs = this.shadowRoot.querySelector("div");

            this.shadowRoot.querySelector("div").addEventListener('touchstart', this._logicData.bind(this));
            this.updateStyle(this);
          }
        };
        xmlhttp.open("GET","componentsAndroid/oneTouchLbs/oneTouchLbs.html",true);
        xmlhttp.send();
    }

    updateStyle(elem) {
        const shadow = elem.shadowRoot;

        shadow.querySelector("style").textContent = `
            div {
                position: absolute;
                width: 230px;
                height: 230px;
                bottom: -50px;
                left: -25px;
                border-radius: 17px;
                background: transparent; 
                border:none;
                letter-spacing:-0.6px; 
                display: flex; 
                justify-content: center;
                align-items: center;
                z-index: 2; 
                font-size:inherit;
                font-family:Volte-Medium_Lbs,FontAwesome; 
                color:inherit;
            }
        `;

        this._id = elem.getAttribute("id");
        this._pagina = elem.getAttribute("pagina");
        
        this.observers();
        this.loadData();
    }

    // e69_4_s12_c_u     ✓  ✗ 
    // Azul: #23c1ea
    // Verde: #00db00
    // Rojo: #ff0e04

    _logicData(){
        
        const  tipo=this._id.split("_");
        //console.log(tipo);
        if(tipo[1]==="c"){
            if(this._itemLbs.style.backgroundColor==='transparent')             this._itemLbs.style.backgroundColor='rgb(35, 193, 234)';
            else if(this._itemLbs.style.backgroundColor==='rgb(35, 193, 234)')  this._itemLbs.style.backgroundColor='rgb(0, 219, 0)';
            else if(this._itemLbs.style.backgroundColor==='rgb(0, 219, 0)')     this._itemLbs.style.backgroundColor='rgb(255, 14, 4)';
            else if(this._itemLbs.style.backgroundColor==='rgb(255, 14, 4)')    this._itemLbs.style.backgroundColor="transparent";
            this._itemLbs.value = this._itemLbs.style.backgroundColor;
        }
        else if (tipo[1]==="gb"){

            if(this._itemLbs.innerText==='') this._itemLbs.innerText="✓";
            else if(this._itemLbs.innerText==="✓")    this._itemLbs.innerText="✗";
            else if(this._itemLbs.innerText==="✗")  this._itemLbs.innerText="";
            this._itemLbs.value = this._itemLbs.innerText;
        }
        // else if(tipo[4]=="m5"){
        //     if(this._itemLbs.style.borderColor==='transparent')  this._itemLbs.style.borderColor="red";
        //     else if(this._itemLbs.style.borderColor==="red")     this._itemLbs.style.borderColor="green";
        //     else if(this._itemLbs.style.borderColor==="green")   this._itemLbs.style.borderColor="blue";
        //     else if(this._itemLbs.style.borderColor==="blue")    this._itemLbs.style.borderColor="orange";
        //     else if(this._itemLbs.style.borderColor==="orange")  this._itemLbs.style.borderColor="purple";
        //     else if(this._itemLbs.style.borderColor==="purple")  this._itemLbs.style.borderColor="transparent";

        // } else {

        //      if(this._itemLbs.style.borderColor==='transparent') this._itemLbs.style.borderColor="red";
        //      else if(this._itemLbs.style.borderColor==="red")    this._itemLbs.style.borderColor="green";
        //      else if(this._itemLbs.style.borderColor==="green")  this._itemLbs.style.borderColor="blue";
        //      else if(this._itemLbs.style.borderColor==="blue")   this._itemLbs.style.borderColor="transparent";             
        // }
        
        
        this._saveData();
    }

    loadData(){
        const search = this.Visor.store.getState().bookReducer.filter(a => a.elemento == this._id);

        const tipo = this._id.split("_");

        if(search != 0) {
            if(tipo[1]=="c"){
                this._itemLbs.style.backgroundColor = search[0].data;
           }
           else if (tipo[1]=="gb"){
                this._itemLbs.innerText = search[0].data;
           }
            
        } 
    }

    observers(){
        //console.log("observers txtlbs");
        this._unsubscribe = this.Visor.store.subscribe(()=>{
            
            const search = this.Visor.store.getState().bookReducer.filter(a => a.elemento == this._id);
            const tipo = this._id.split("_");

            if(search != 0) {
                if(tipo[1]=="c"){
                    this._itemLbs.style.backgroundColor = search[0].data;
               }
               else if (tipo[1]=="gb"){
                    this._itemLbs.innerText = search[0].data;
               }
                
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

customElements.define('one-touch-lbs',oneTouchLbs);