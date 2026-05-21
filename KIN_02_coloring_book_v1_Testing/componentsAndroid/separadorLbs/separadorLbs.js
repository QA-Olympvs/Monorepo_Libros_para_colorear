//import htmlDOC from './player.html'
var lista = [];
class separadorLbs extends componentBase {

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

            // this.shadowRoot.querySelector("div").addEventListener('click', this.logicData.bind(this));
            this.updateStyle(this);
            this.logicData(this);
          }
        };
        xmlhttp.open("GET","componentsAndroid/separadorLbs/separadorLbs.html",true);
        xmlhttp.send();
    }

    updateStyle(elem) {
        const shadow = elem.shadowRoot;

        shadow.querySelector("style").textContent = `
        /*.shape {
            width: 0px;
            height: 150px;
            box-sizing: border-box;
            border: 1px solid #000;
            border-bottom: 25px solid transparent;
            border-top: none;
            border-left: 22px solid #dc3545;
            border-right: 22px solid #dc3545;
        }*/

        @keyframes heartBeat {
            0% {
                transform: scale(1);
            }

            14% {
                transform: scale(1.3);
            }

            28% {
                transform: scale(1);
            }

            42% {
                transform: scale(1.3);
            }

            70% {
                transform: scale(1);
            }
            }

        .heartBeat {
            animation-name: heartBeat;
            animation-duration: 1.3s;
            animation-timing-function: ease-in-out;
        }

        .animate__animated {
            -webkit-animation-duration: 1s;
            animation-duration: 1s;
            -webkit-animation-duration: var(--animate-duration);
            animation-duration: var(--animate-duration);
            -webkit-animation-fill-mode: both;
            animation-fill-mode: both;
          }

        @media only screen and (min-width: 200px) {
            /*Celular*/
            .separador-cel{
                position: absolute;
                left: -16px;
                top: 60px;
                /* padding-bottom: 37px; */
                /* padding-top: 10px; */
                overflow: visible;
                background: url('assets/favorito.svg');
                background-repeat: no-repeat;
                background-size: contain;
                z-index: 15;
                /*background-color: red;*/
                width: 8%;
                height: 76px;
                float: left;
            }
            

        }
        
      
        
        @media only screen and (min-width: 500px) {
            /*Tablet*/
            .separador-tablet{
                position: absolute;
                left: -16px;
                top: 60px;
                background: url('assets/favorito.svg');
                background-repeat: no-repeat;
                background-size: contain;
                /* padding-bottom: 37px; */
                /* padding-top: 10px; */
                overflow: visible;
                z-index: 15;
                /*background-color: red;*/
                width: 8%;
                height: 70px;
                float: left;
            }

        }


        `;

        this._id = 'lista';

        this.observers();
        this.loadData();
    }

    logicData(elem){

        // console.log(lista);
        
        var _pagina = this.parentNode.getAttribute('id');
        var Pagina = _pagina.slice(1);
        var div = this.shadowRoot.querySelector('div')
        div.setAttribute('id', 'separador_'+Pagina);
        div.setAttribute('class', 'separador-tablet separador-cel heartBeat shape');
        // div.classList.add('animate__animated', 'animate__heartBeat')

        if(!lista.includes(Number(Pagina))){
            
            lista.push(Number(Pagina));
            this._itemLbs.value = lista;
            console.log(lista);
            this._saveData();
        }
        
    }
    borrarData(elem){

        // var borrar = this.getAttribute('borrar')
        // console.log(borrar);

        console.log(lista);
        
        var div = this.shadowRoot.querySelector('div')
        
        // this._id = 'lista'
        var Pagina = div.getAttribute('id').slice(10);
        console.log(Pagina)
        const index = lista.indexOf(Number(Pagina));
        console.log(index);
        lista.splice(index, 1);
        // console.log(lista);


        this._itemLbs.value = lista;
        console.log(this._itemLbs.value);
        this._saveData();

        div.removeAttribute('id');
        div.removeAttribute('class');

        

    }

    static get observedAttributes() {
        return ["borrar"];
      }

    loadData(){
        const search = this.Visor.store.getState().bookReducer.filter(a => a.elemento == this._id);

        if(search != 0) {
            // this._itemLbs.value = search[0].data;
            // console.log(search[0].data);
            lista = search[0].data;
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
    attributeChangedCallback(attrName, oldVal, newVal){
        if(attrName == 'borrar' && newVal == 'y'){
            this.borrarData();
        }
        
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

customElements.define('separador-lbs',separadorLbs);