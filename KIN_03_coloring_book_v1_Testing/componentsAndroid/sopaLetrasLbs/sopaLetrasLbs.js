//import htmlDOC from './player.html'
var touches=0,divmove,
        elementFromPoint,cambiocolor,
        estasdibujandocolorrojo;
    const colorActual='rgb(255, 255, 255)';

    const colores = [
        'rgb(147, 81, 22)',
        'rgb(72, 201, 176)',
        'rgb(133, 193, 233)',
        'rgb(245, 183, 177)',
        'rgb(211, 84, 0)',
        'rgb(255, 229, 38)',
        'rgb(0, 255, 247)',
        'rgb(16, 190, 90)',
        'rgb(245, 3, 238)',
        'rgb(238, 95, 95)',
        'rgb(255, 151, 0)',
        'rgb(27, 132, 70)',
        'rgb(165, 15, 45)',
        'rgb(0, 75, 75)',
        'rgb(2, 25, 255)',
        'rgb(30, 144, 255)',
        'rgb(186, 85, 211)',
        'rgb(240, 128, 128)',
        'rgb(255, 5, 0)',
        'rgb(197, 236, 0)',
        'rgb(75, 0, 130)',
        'rgb(145, 123, 138)',
        'rgb(150, 150, 0)',
        'rgb(0, 255, 0)',
        'rgb(139, 0, 139)',
        'rgb(255, 20, 147)',
      ];

    let colorIndex=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25];
    let usedColors=[];
    let erasedColors=[];
    var coloid = 0;
    let borrando = false;
    let stopScrolling = false;


class sopaLetrasLbs extends componentBase {

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
            this._itemLbs = this.shadowRoot.querySelector("slot[name='sopa']");

            this.shadowRoot.querySelectorAll('slot[name="sopa"]').forEach(occurence => {
                occurence.addEventListener('touchstart', (e) => {
                    this._sopadeletras(e);
                });
                occurence.addEventListener('touchmove',  (e) => {
                    this._handleTouchMove(e);
                    this._sopadeletrasMove(e);
                });
                occurence.addEventListener('touchend', (e) => {
                    this._sopadeletrasEnd(e);
                });

            });

            this.updateStyle(this);
          }
        };
        xmlhttp.open("GET","componentsAndroid/sopaLetrasLbs/sopaLetrasLbs.html",true);
        xmlhttp.send();
    }


    updateStyle(elem) {
        const shadow = elem.shadowRoot;

        shadow.querySelector("style").textContent = `
        span {
            color:rgb(255, 255, 255);
        }
        `;

        elem.style.cssText += 'touch-action: none';
        elem.style.cssText += 'display: flex';

        this._id = elem.getAttribute("id");
        
        this.observers();
        this.loadData();
    }


    _sopadeletras(element) {
        // console.log('SOPA DE LETRAS START');

        erasedColors = [];
        borrando = false;
        stopScrolling = true;
      
        // element.preventDefault();

        var limit = false;
 
        cambiocolor =getComputedStyle(element.target).getPropertyValue("color");
        
        if(cambiocolor == colorActual) {
            do {
                if(usedColors.length == colores.length){
                    limit = true;
                    break;
                }

                const randomElement = colorIndex[Math.floor(Math.random() * colorIndex.length)];
                coloid= colorIndex.indexOf(randomElement);

            } while (usedColors.includes(colores[coloid]))

            if(!limit){
                usedColors.push(colores[coloid]);
            }
        }

        if(!colores.includes(cambiocolor)){
            element.target.style.color=colores[coloid];
            estasdibujandocolorrojo=true;
        }  
        else{
 
           element.target.style.color=colorActual;
            estasdibujandocolorrojo=false;
            borrando = true;

            var ind = colores.indexOf(cambiocolor);
            erasedColors.push(ind);
        }
        
 
     };
 
    _sopadeletrasMove(element) {
        // console.log('SOPA DE LETRAS MOVE');
          
    //   element.preventDefault();
        var touch = element.touches[0];
         divmove=element;
 
         var elementFromPoint = this.shadowRoot.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset);        

        if(elementFromPoint == '[object HTMLElement]'){
            var dentroSopa = elementFromPoint.shadowRoot.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset);
            

            if(getComputedStyle(dentroSopa).color==colorActual &&  divmove.target!=dentroSopa && estasdibujandocolorrojo==true )
            {
                dentroSopa.style.color=colores[coloid];
            }
            else if(colores.includes(getComputedStyle(dentroSopa).color) && estasdibujandocolorrojo==false)
            {
                if(!colores.includes(getComputedStyle(dentroSopa))){
                    if(cambiocolor!==getComputedStyle(dentroSopa).color){
                        var ind = colores.indexOf(getComputedStyle(dentroSopa).color);
                        erasedColors.push(ind);
                    }
                    else {
                        var ind = colores.indexOf(getComputedStyle(dentroSopa).color);
                        erasedColors.push(ind);
                    }
                }
                dentroSopa.style.color=colorActual ;
                borrando = true;
            }
        }
        else if(elementFromPoint == '[object HTMLSpanElement]'){

            if(getComputedStyle(elementFromPoint).color==colorActual &&  divmove.target!=elementFromPoint && estasdibujandocolorrojo==true )
            {
                elementFromPoint.style.color=colores[coloid];
            }
            else if(colores.includes(getComputedStyle(elementFromPoint).color)  && estasdibujandocolorrojo==false)
            {
                if(!colores.includes(getComputedStyle(elementFromPoint))){
                    if(cambiocolor!==getComputedStyle(elementFromPoint).color){

                        var ind = colores.indexOf(getComputedStyle(elementFromPoint).color);
                        erasedColors.push(ind);
                        
                    }
                    else{
                        var ind = colores.indexOf(getComputedStyle(elementFromPoint).color);
                        erasedColors.push(ind);
                    }
                }
                elementFromPoint.style.color=colorActual ;
                borrando = true;
            }
        } 
     };
     
 
     _sopadeletrasEnd(element) {
        // console.log('SOPA DE LETRAS END');
        stopScrolling = false;
        const uniqueArr1 = [...new Set(erasedColors)];
        var arr2 = [];
								
        var sopas = this.parentNode.querySelectorAll('sopa-letras-lbs');
        for (var i=0; i<sopas.length; i++){

            var lista = [];

            this._id = this.parentNode.getAttribute("id") +"_"+ this.children[0].getAttribute("pagina") + "_" + sopas[i].getAttribute("index");

            for (var x=0; x<sopas[i].children.length; x++){

                if(sopas[i].children[x].getAttribute('style') != null){
                    lista.push(sopas[i].getAttribute('id') + '-' + sopas[i].children[x].getAttribute('index') + '-' +sopas[i].children[x].getAttribute('style'));
                    
                    if(borrando == true){
                        if(uniqueArr1.includes(colores.indexOf(getComputedStyle(sopas[i].children[x]).color)) || usedColors.includes(getComputedStyle(sopas[i].children[x]).color)){
                            // console.log('1 aun quedan colores '+getComputedStyle(sopas[i].children[x]).color); 
                            
                            arr2.push(getComputedStyle(sopas[i].children[x]).color)

                        }
                    }   
                }
            }
            this._itemLbs.value = lista.join('#');

            this._extraFields = {
                uuid : localStorage.getItem("UUID")
            }

            this._saveData();
            
        }
        
        const uniqueArr2 = [...new Set(arr2)];
        for(let z=0; z<uniqueArr1.length; z++){
            if(!uniqueArr2.includes(colores[uniqueArr1[z]])){
                var indos = usedColors?.indexOf(colores[uniqueArr1[z]]);
                usedColors.splice(indos,1);
            }
        }
        
        this._id = this.parentNode.getAttribute("id") +"_"+ this.children[0].getAttribute("pagina") + "_" + "colores";
        this._itemLbs.value = usedColors.join('#');

        this._saveData();
        
     };


    _handleTouchMove(e) {
        if (!stopScrolling) {
          return;
        }
        e.preventDefault();
    }

    loadData(){

        this._id = this.parentNode.getAttribute("id") +"_"+ this.children[0].getAttribute("pagina") + "_" + this.getAttribute("index");

        const search = this.Visor.store.getState().bookReducer.filter(a => a.elemento == this._id);

        if(search != 0) {

            var texto = search[0].data;
            var datos = texto.split("#");

            for(var i = 0; i < datos.length; i++){

                var valores = datos[i].split('-',3);

                for(var x = 0; x < this.children.length; x++)

                    if(this.children[x].getAttribute("index") == valores[1]){

                        this.children[x].setAttribute("style", valores[2]);
                    }
            }
            
        }

        const getColor = this.parentNode.getAttribute("id") +"_"+ this.children[0].getAttribute("pagina") + "_" + "colores";

        const search2 = this.Visor.store.getState().bookReducer.filter(b => b.elemento == getColor);

        if(search2 != 0) {
            var colors = search2[0].data;
            usedColors = colors.split("#");
        }

    } 

    

    observers(){
        //console.log("observers txtlbs");
        this._unsubscribe = this.Visor.store.subscribe(()=>{

            this._id = this.parentNode.getAttribute("id") +"_"+ this.children[0].getAttribute("pagina") + "_" + this.getAttribute("index");

            const search = this.Visor.store.getState().bookReducer.filter(a => a.elemento == this._id);
    
            if(search != 0) {
    
                var texto = search[0].data;
                var datos = texto.split("#");
    
                for(var i = 0; i < datos.length; i++){
    
                    var valores = datos[i].split('-',3);
    
                    for(var x = 0; x < this.children.length; x++)
    
                        if(this.children[x].getAttribute("index") == valores[1]){
    
                            this.children[x].setAttribute("style", valores[2]);
                        }
                }
                
            }
    
            const getColor = this.parentNode.getAttribute("id") +"_"+ this.children[0].getAttribute("pagina") + "_" + "colores";
    
            const search2 = this.Visor.store.getState().bookReducer.filter(b => b.elemento == getColor);
    
            if(search2 != 0) {
                var colors = search2[0].data;
                usedColors = colors.split("#");
            }

        });
    }

    connectedCallback() {
        this.getData();
    }
    disconnectedCallback() {
        this._unsubscribe();
    }
}

customElements.define('sopa-letras-lbs',sopaLetrasLbs);