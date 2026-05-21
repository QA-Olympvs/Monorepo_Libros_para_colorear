//import htmlDOC from './player.html'



class audioLbs extends componentBase {

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
            this._itemLbs = this.shadowRoot.querySelector("object");

            var audiopath = this.getAttribute("audio");
            const esto = this.shadowRoot.querySelector("#ctn-audio");
            const audio = new Audio('assets/audio/'+ audiopath+".mp3");
            this.shadowRoot.appendChild(audio);

            this.shadowRoot.querySelector("div").addEventListener('touchstart', this._playAudio.bind(this,audio,esto));
            audio.addEventListener('ended', this._audioEnded.bind(this,esto));
            
            this.updateStyle(this);

        }
    };
    xmlhttp.open("GET","componentsAndroid/audioLbs/audioLbs.html",true);
    xmlhttp.send();
}

updateStyle(elem) {
    const shadow = elem.shadowRoot;
    
        shadow.querySelector("style").textContent = `
        object {
            position: relative;
            top: 46px;
            z-index: -1;
        }
        
        `;
        

    elem.style.cssText += 'display: inline-table';    
    
    var div = shadow.querySelector("div")
    div.setAttribute("id", this.getAttribute("id"));
    div.setAttribute("class", this.getAttribute("class"));
    div.style.cssText += 'display: table-row';    
    
}

_audioEnded(bocina) {
    bocina = bocina.querySelector("#playTriangle").contentDocument.getElementById("playTriangle");

    bocina.setAttribute("fill","rgb(255 76 136)");
}

_audioIsPlaying(audio) { 
    return !audio.paused; 
}

_playAudio(audio, bocina){

    bocina = bocina.querySelector("#playTriangle").contentDocument.getElementById("playTriangle");


    if (this._audioIsPlaying(audio)) {
        // Si el mismo audio ya se está reproduciendo entonces se pausa, 
        // se regresa al inicio del audio y se vuelve a reproducir
        audio.pause();
        audio.currentTime = 0;
        audio.play();
        bocina.setAttribute("fill","rgb(0 222 1)");
    }
    else {
        // Si el audio no se está reproduciendo, entonces busca si hay otros audios que se esten reproduciendo, 
        // de ser así, pausar ese audio, regresarlo al inicio y reproducir el audio seleccionado. 
        // Si no encuentra simplemente reproduce el audio seleccionado
        var checkAudios = [];
        var checkBocina = [];
        var ayfreim = window.parent.document.querySelectorAll(".page-inner")

        for (var x=0; x < ayfreim.length; x++) {
            var templist = ayfreim[x].contentWindow.document.querySelectorAll("audio-lbs");
            if(templist.length > 0){
                for (var z=0; z < templist.length; z++) {
                    checkAudios.push(templist[z].shadowRoot.querySelectorAll("audio")[0]);
                    checkBocina.push(templist[z].shadowRoot.querySelectorAll("div")[0].children[0].contentDocument.getElementById("playTriangle"));
                }
            }
        }
        for (var i=0; i < checkAudios.length; i++) {
            if (this._audioIsPlaying(checkAudios[i])) {
                checkBocina[i].setAttribute("fill","rgb(255 76 136)");
                checkAudios[i].pause();
                checkAudios[i].currentTime = 0;
            }
        }
        
        audio.play();
        bocina.setAttribute("fill","rgb(0 222 1)");

    }


    //audio.play();

};

    connectedCallback() {
        this.getData();

    }
    disconnectedCallback() {
        this.shadowRoot.querySelector("object").removeEventListener('ontouchstart', this);
        audio.removeEventListener('onended', this);
        // this._unsubscribe();
    }
}

customElements.define('audio-lbs',audioLbs);