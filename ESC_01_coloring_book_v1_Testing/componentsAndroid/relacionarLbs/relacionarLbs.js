var removedItem = ["a", "b"];
function getRemoved(items) {
    removedItem = items;
}

// export default getRemoved;
window.getRemoved = getRemoved;

// export { getRemoved };

var line;
var Estado=0; //Ejercicio Relacionar
var numerolinea=0; //Ejercicio Relacionar
var vx1;//Ejercicio Relacionar
var vx2;//Ejercicio Relacionar
var vy1;//Ejercicio Relacionar
var vy2;//Ejercicio Relacionar
var punto1;//Ejercicio Relacionar
var punto2;//Ejercicio Relacionar
var point1;//Ejercicio Relacionar
var point2;//Ejercicio Relacionar
var ubicacion=0;//Ejercicio Relacionar
var ubicacioncolumna=0;//Ejercicio Relacionar
var vuelta=0;//Ejercicio Relacionar
var divs;//Ejercicio Relacionar
var points;//Ejercicio Relacionar
var elemUno;//Ejercicio Relacionar
var elemDos;//Ejercicio Relacionar
class relacionarLbs extends componentBase {

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
        xmlhttp.open("GET","componentsAndroid/relacionarLbs/relacionarLbs.html",true);
        xmlhttp.send();
    }

    updateStyle(elem) {
        const shadow = elem.shadowRoot;
		const leftCss = this.style.left;
		const bottomCss = this.style.bottom;
		
        shadow.querySelector("style").textContent = `
            div {
                left: ${leftCss}; 
                position: fixed; 
                bottom: ${bottomCss}; 
                height: 60px; 
                width: 60px;
                z-index:4;
            }
        `;

        this._id = elem.getAttribute("id");
        this._pagina = elem.getAttribute("pagina");
        
        this.observers();
        this.loadData();
    }

    _logicData(){
        
        Estado++;
        // console.log(this._id);
        const  divsplit=this._id.split("_",3);
        // console.log(divsplit);

        var point =document.querySelectorAll('[id2=point_'+this.id+']')
        var recttop = point[0].offsetTop;
        var rectleft=   point[0].offsetLeft;
        // console.log("Estado: " +Estado);
        // console.log("divsplit: " +divsplit);
        // console.log("point: " +point);
        // console.log("recttop: " +recttop);
        // console.log("rectleft: " +rectleft);
        if(Estado==1){
            // console.log("ENTRANDO A ESTADO 1")
              punto1=this;
              point1=document.querySelectorAll('[id2=point_'+this._id+']');
              //********************si ya esta relacionado**********
        
            if(!(punto1.getAttribute("name")=== undefined || punto1.getAttribute("name") === null || punto1.getAttribute("name").length === 0 ) ) {
                Estado=0;
                // console.log("ESTA RALACIONADO");
                // console.log("BORRANDO LINEA");
                //se elimina de la bd
                // console.log("rela: " + this.getAttribute("name"));
                var rela =  this.getAttribute("name").split("_",10);
                // console.log("rela: " + rela);
                delete rela[0];
                var divi = rela[1] +"_"+ rela[2] +"_"+ rela[3] +"_"+ rela[4] +"_"+ rela[5].split("",3).join('');
                var divu = rela[5].split("",7).slice(3,7).join('') +"_"+ rela[6] +"_"+ rela[7] +"_"+ rela[8] +"_"+ rela[9];
                var divl = "line_" + this.getAttribute("name")
                // console.log("rela: " + rela);
                // console.log("divi: " + divi);
                // console.log("divu: " + divu);
                // console.log("divl: " + divl);
                // console.log(typeof rela);

                
                var temo = this._id;
                
                this._id = divi;
                // console.log(this._id);
                // this._deleteObserver(divi);
                this._deleteData(divi);
                
                this._id = divu;
                // console.log(this._id);
                this._deleteData(divu);
                
                this._id = divl;
                // console.log(this._id);
                this._deleteData(divl);
                
                this._id = temo;
                // console.log(this._id);
                
                // EliminarRelacionar(document.getElementById("line_"+this.getAttribute("name"))); 
                // se elimina del html



                document.getElementById("line_"+this.getAttribute("name")).remove(); 
                divs=document.getElementsByName(this.getAttribute("name"));
                // console.log("divs: "+divs[0] )
                points=document.getElementsByName(point1[0].getAttribute("name"));
    
    
                for(var i=0; i < 2 ;i++) {
                    // EliminarRelacionar(divs[0]);
                    divs[0].removeAttribute("class"); 
                    divs[0].setAttribute("name","");
    
    
                }
                points[0].style.webkitTextStroke=0+"px";
                points[1].style.webkitTextStroke=0+"px";
                points[0].setAttribute("name","");
                points[0].setAttribute("name","");
    
                return;
            }
            vx1=rectleft+5;
            vy1=recttop+65;//el mas 52 es para ajustar el top al idrview
            punto1.setAttribute("class", "borde_relacionar");
            point1[0].style.webkitTextStroke=110+"px";
            ubicacion=this._id;
            ubicacioncolumna=divsplit[1].substring(0,1);
            // console.log("vx1: "+vx1);
            // console.log("vy1: "+vy1);
            // console.log("punto1: "+punto1);
            // console.log("ubicacion: "+ubicacion);
            // console.log("ubiccolumna: "+ubicacioncolumna);
       
        }
        if(Estado==2)
        {
          point2=document.querySelectorAll('[id2=point_'+this._id+']');
          punto2=this;
        //   console.log("ENTRANDO A ESTADO 2");
          //CONDICIONANTES AL MOMENTO DE RELACIONAR
     
         if (ubicacion==this._id){
             Estado=0;
             punto1.name=undefined;
             punto1.removeAttribute("class");
             point1[0].style.webkitTextStroke=0+"px";
            //  console.log("SELECCIONÓ EL MISMO PUNTO, SELECCIONE OTRO");
             
             return;} //si vuelve a tocar el mismo punto
     
         if (ubicacioncolumna==divsplit[1].substring(0,1)){
             Estado=0;
             punto1.name=undefined;
             punto1.removeAttribute("class");
             point1[0].style.webkitTextStroke=0+"px";
            //  console.log("SELECCIONÓ UN PUNTO DE LA MISMA COLUMNA, SELECCIONE OTRO")
             
             return;} // si toca en la misma columna
     
         if(!(punto2.getAttribute("name")=== undefined || punto2.getAttribute("name") === null || punto2.getAttribute("name").length === 0 ) ){
             //si en el segundo touch, toca uno que ya esta relaciondo no hace nada, debe de tocar uno que no esta relacionado
             Estado=1;
            //  console.log("SELECCIONÓ UN PUNTO YA RELACIONADO, SELECCIONA OTRO");
             return;    
         }
         vx2=rectleft+5;
         vy2=recttop+65;//el mas 52 es para ajustar el top al idrview
         punto2.setAttribute("class", "borde_relacionar");
         Estado=0;
         numerolinea++;
         elemUno=ubicacion;
         elemDos=this._id;
         ubicacion+=this._id;
         punto1.setAttribute("name","relacionado_" + ubicacion);
         punto2.setAttribute("name","relacionado_" + ubicacion);
         point1[0].setAttribute("name","point_" + ubicacion);
         point2[0].setAttribute("name","point_" + ubicacion);
         point2[0].style.webkitTextStroke=110+"px";
         vuelta=1;
        //  console.log("numerolinea: "+numerolinea);
        //  console.log("ubicacion: "+ubicacion);
        //  console.log("Estado: "+Estado);
        //  console.log("_itemLbs: "+this._itemLbs);
        //  console.log("_itemLbs.value: "+this._itemLbs.value);
        //  console.log("this.value: "+punto1.getAttribute("name"));

        this._extraFields = {
            uuid : localStorage.getItem("UUID")
          }

         var h = document.getElementById("p"+this._pagina);
             h.insertAdjacentHTML("beforeend", "<div class='line' id='line_relacionado_"+ubicacion+"' ejercicio='"+ this.getAttribute("ejercicio") + "'></div>");
         this.createLineDentroLibro(vx1,vy1,vx2,vy2,"line_relacionado_"+ubicacion, h);

         this._itemLbs.value = punto1.getAttribute("name");
         this._id = elemUno;
        //  console.log("_itemLbs value: "+this._itemLbs.value);
        //  console.log("_itemLbs _id: "+elemUno);
         this._saveData();

         this._itemLbs.value = punto2.getAttribute("name");
         this._id = elemDos;
        //  console.log("_itemLbs value: "+this._itemLbs.value);
        //  console.log("_itemLbs _id: "+elemDos);
         this._saveData();
         
       }

    }

        createLineDentroLibro(x1,y1,x2,y2,lineId, h){
            // console.log("CREANDO LINEA DENTRO LIBRO");

            var distance=Math.sqrt(((x1-x2)*(x1-x2))+((y1-y2)*(y1-y2))-4000);

            var xMid= (x1+x2)/2;
            var yMid= (y1+y2)/2;

            var salopeInRadian= Math.atan2(y1-y2, x1-x2 );
            var salopeInDegrees= (salopeInRadian*180)/Math.PI;

            var line= document.getElementById(lineId);
            line.style.width=distance  + "px";
            line.style.top=yMid  + "px";
            line.style.left=xMid - (distance/2)  + "px";
            line.style.transform="rotate("+salopeInDegrees+"deg)";
            line.style.webkitTransform="rotate("+salopeInDegrees+"deg)";

            // console.log("lineId: "+lineId);
            // var attrValue = String(document.getElementById(lineId).attributes);
            // console.log("value: "+line.outerHTML);
            // var tempItem = this._itemLbs.value;
            this._itemLbs.value = line.outerHTML;
            this._id = lineId;
            

            // GuardarRelacionarDentroLibro(line,pagina);
            this._saveData();
            // this._itemLbs.value = tempItem;
        }

    loadData(){
        // console.log("loadData");
        const search = this.Visor.store.getState().bookReducer.filter(a => a.elemento == this._id);

        // console.log("search: "+search);
        if(search != 0) {
            
            var divelem = this;
            divelem.setAttribute("name",search[0].data);
            divelem.setAttribute("class","border-relacionar");

            var divelem2=document.querySelectorAll('[id2=point_'+this._id+']');
            var lista = search[0].data.split('_',10);
            var lista2 = lista.shift();
            
            divelem2[0].setAttribute("name","point_" + lista.join('_'));
            divelem2[0].style.webkitTextStroke=110+"px";

        }

        const search2 = this.Visor.store.getState().bookReducer.filter(b => b.elemento == "line_"+search[0]?.data);
        // console.log("search2: "+search2);
        if(search2 != 0) {
            if(!! document.getElementById("line_"+search[0]?.data)) {
                // console.log("adentro if line_"+search[0].data);
                
            }
            else{
                var h = document.getElementById("p"+this._pagina);
                h.insertAdjacentHTML("beforeend", search2[0].data);
            }
                
            
        }   
    }

    observers(){
        this._unsubscribe = this.Visor.store.subscribe(()=>{
            const search = this.Visor.store.getState().bookReducer.filter(a => a.elemento == this._id);
            
            if(search != 0) {
                
                var divelem = this;
                divelem.setAttribute("name",search[0].data);
                divelem.setAttribute("class","border-relacionar");
                
                var divelem2=document.querySelectorAll('[id2=point_'+this._id+']');
                var lista = search[0].data.split('_',10);
                var lista2 = lista.shift();
                
                divelem2[0].setAttribute("name","point_" + lista.join('_'));
                divelem2[0].style.webkitTextStroke=110+"px";
                
            }
            else{
                if(window.parent.removedItem[1] === "REMOVE_DATA"){
                
                    if(window.parent.removedItem[0] == this._id){
                        // console.log("removed y id son iguales");
                        var divelem = this;
                        var divelem2=document.querySelectorAll('[id2=point_'+this._id+']'); 

                        divelem.setAttribute("name","");
                        divelem.setAttribute("class","");
                        
                        divelem2[0].setAttribute("name","");
                        divelem2[0].style.webkitTextStroke=0+"px";
                    }
                }
            }
            
            const search2 = this.Visor.store.getState().bookReducer.filter(b => b.elemento == "line_"+search[0]?.data);
            
            if(search2 != 0) {
                if(!! document.getElementById("line_"+search[0]?.data)) {
                    
                    if(search2[0].elemento.includes(window.parent.removedItem[0])){
                        line = search2[0].elemento
                        
                    }
                }
                else{
                    if(window.parent.removedItem[0] == search2[0].elemento){
                    }
                    else{
                        line = search2[0].elemento
                    }
                    var h = window.parent.document.getElementById("iframe"+this._pagina).contentWindow.document.getElementById("p"+this._pagina);
                    h.insertAdjacentHTML("beforeend", search2[0].data);
                    
                }
                
            }   
            else{
                if(window.parent.removedItem[1] === "REMOVE_DATA"){
                    if(window.parent.removedItem[0] === line){
                        line = null;
                        window.parent.removedItem[1] = null;
                        const linea = window.parent.document.getElementById("iframe"+this._pagina).contentWindow.document.getElementById(window.parent.removedItem[0]);
                        linea.remove();
                    }
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

customElements.define('relacionar-lbs',relacionarLbs);