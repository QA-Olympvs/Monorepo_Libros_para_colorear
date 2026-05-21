//import htmlDOC from './player.html'
class videoLbs extends componentBase {

    constructor() {
        super();
        this._videoElement = null;
    }

    async getData() {
        var txt = '';
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
          if(xmlhttp.status == 200 && xmlhttp.readyState == 4){
            txt = xmlhttp.responseText;
            this.shadowRoot.innerHTML = txt;
           // this._itemLbs = this.shadowRoot.querySelector("video");

            // // this.shadowRoot.querySelector("input").addEventListener('blur', this._saveData.bind(this));
            // // this.shadowRoot.querySelector("input").addEventListener("click", this._onClickToFocus.bind(this));
            // var tipo = this.getAttribute("tipo");
            // if(tipo == "normal"){
            //     this.shadowRoot.querySelector("video").addEventListener('touchstart', this._stopVideo.bind(this.shadowRoot.children[1]));
            // }
            this.updateStyle(this);
            this._getVideo(this)

        }
    };
    xmlhttp.open("GET","components/videoLbs/videoLbs.html",true);
    xmlhttp.send();
}

updateStyle(elem) {
    const shadow = elem.shadowRoot;
    
    // console.log(this);
    
    shadow.children[1].setAttribute("class","videoUnidad");
    shadow.children[1].setAttribute("playsinline","");
    shadow.children[1].setAttribute("preload", "metadata");
    
    var tipo = elem.getAttribute("tipo");
    
    if(tipo == "big"){
        shadow.querySelector("style").textContent = `
        video {
            
            opacity: 0.9; 
            position: absolute; 
            top: 0px; 
            bottom: 0; 
            width: 100%; 
            height: 100%; 
            object-fit: cover; 
            object-position: center;
            
        }
        `;
        
        shadow.children[1].setAttribute("loop","");
        shadow.children[1].setAttribute("autoplay","true");
        shadow.children[1].setAttribute("muted","true");
        
    }
    else if(tipo == "small"){
        shadow.querySelector("style").textContent = `
        video {
            
            opacity: 0.9; 
            position: absolute; 
            top: 3px; 
            bottom: 0; 
            width: 100%; 
            height: 100%; 
            object-fit: cover; 
            object-position: center;
            
        }
        `;
        
        shadow.children[1].setAttribute("loop","");
        shadow.children[1].setAttribute("autoplay","true");
        shadow.children[1].setAttribute("muted","true");
        
    }
    else if(tipo === 'divider'){
        let offsetx = elem.getAttribute("x") || 24;
        let offsety = elem.getAttribute("y") || 22;
        let height = elem.getAttribute("height") || 570;
        let width = elem.getAttribute("width") || 865;
        shadow.querySelector("style").textContent = `
        video {
            position: absolute; 
            top: ` + offsety + `px; 
            left: ` + offsetx + `px; 
            width: ` + width + `px; 
            height: ` + height + `px; 
            object-fit: cover; 
            object-position: center;
        }
        `;

        shadow.children[1].setAttribute("loop","");
        shadow.children[1].setAttribute("autoplay","true");
        shadow.children[1].setAttribute("muted","true");
    }
    else{
        shadow.querySelector("style").textContent = `
        video {
            width: 100%; 
            height: 100%; 
            
        }
        `;
        
        shadow.children[1].setAttribute("controls","");
        
    }
    
}

_stopVideo(video){
    if(video.paused) video.play(); else video.pause();
    
}

_getVideo(elem){
    const shadow = elem.shadowRoot;
    
    var archivo = elem.getAttribute("archivo");
    
    var video = this.shadowRoot.querySelector("video");
    video.muted = true;
    
    shadow.children[1].children[0].setAttribute("src","assets/videos/"+archivo+".mp4");
    shadow.children[1].children[0].setAttribute("type","video/mp4");

    
    this._videoElement = video;
    
    // console.log(video);
    // console.log(video.readyState);
    //video.load();
    // console.log(video.readyState);
    
    // CHECAR PROMESA

    // var promise = this.shadowRoot.querySelector('video').play();
    
    // if (promise !== undefined) {
    // promise.then(_ => {
    //     // Autoplay started!
    //     console.log("Autoplay started");
    // }).catch(error => {
    //     // Autoplay was prevented.
    //     console.log("Autoplay was prevented");
    //     console.log(error);
    //     // Show a "Play" button so that user can start playback.
    // });
    // }
}


    connectedCallback() {
        this.getData();

    }
    disconnectedCallback() {
        
    if (this._videoElement) {
      this._videoElement.pause();
      this._videoElement.removeAttribute("src");
      this._videoElement.load(); // fuerza liberación del recurso
      this._videoElement = null;
    }
        this._unsubscribe();
    }
}

customElements.define('video-lbs',videoLbs);