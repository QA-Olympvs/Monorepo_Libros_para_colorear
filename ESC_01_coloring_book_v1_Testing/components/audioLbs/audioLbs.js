//import htmlDOC from './player.html'
class audioLbs extends componentBase {

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
            this._itemLbs = this.shadowRoot.querySelector("object");

            var audiopath = this.getAttribute("audio");
            const esto = this.shadowRoot.querySelector("#ctn-audio");
            const audio = new Audio('assets/audio/'+ audiopath+".mp3");
            this.shadowRoot.appendChild(audio);
            
            // Check if the user is using Safari
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
            const isIpad = /Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints && navigator.maxTouchPoints > 1;
            //const isSafari = /safari/.test(navigator.userAgent.toLowerCase());
            const isIos = /iphone|ipod|ipad/.test(navigator.userAgent.toLowerCase());
            // Check if the user is using Chrome
            const isChrome = /chrome/i.test(navigator.userAgent);

            // Usage example
            if (isSafari || isIos || isIpad) {
              //console.log('User is using Safari');
               this.addEventListener('touchstart', this._playAudio.bind(this,audio, esto));
            } else if (isChrome) {
              //console.log('User is using Chrome');
              this.shadowRoot.querySelector("div").addEventListener('touchstart', this._playAudio.bind(this,audio, esto));
            } else {
              //console.log('User is using a different browser');
              this.shadowRoot.querySelector("div").addEventListener('touchstart', this._playAudio.bind(this,audio, esto));
            }
            
            this.updateStyle(this);

        }
    };
    xmlhttp.open("GET","components/audioLbs/audioLbs.html",true);
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
    // div.setAttribute("id", this.getAttribute("id"));
    // div.setAttribute("class", this.getAttribute("class"));
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
    // const iconoBocina = bocina.querySelector("object");
    const iconoBocina = bocina.querySelector("#playTriangle").contentDocument.getElementById("playTriangle");
    // bocina = this.querySelector("#playTriangle");

    if (this._audioIsPlaying(audio)) {
        // Si el mismo audio ya se está reproduciendo entonces se pausa, 
        // se regresa al inicio del audio y se vuelve a reproducir
        audio.pause();
        audio.currentTime = 0;
        audio.play();
        iconoBocina.setAttribute("fill","rgb(0 222 1)");
    }
    else {
        // Si el audio no se está reproduciendo, entonces busca si hay otros audios que se esten reproduciendo, 
        // de ser así, pausar ese audio, regresarlo al inicio y reproducir el audio seleccionado. 
        // Si no encuentra simplemente reproduce el audio seleccionado
        var checkAudios = [];
        var checkBocina = [];
        var ayfreim = document.querySelectorAll(".page")

        for (var x=0; x < ayfreim.length; x++) {
            var templist = ayfreim[x].querySelectorAll("audio-lbs");
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
        iconoBocina.setAttribute("fill","rgb(0 222 1)");

    }
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