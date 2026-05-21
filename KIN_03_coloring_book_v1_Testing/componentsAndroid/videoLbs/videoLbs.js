//import htmlDOC from './player.html'
class videoLbs extends componentBase {

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
    xmlhttp.open("GET","componentsAndroid/videoLbs/videoLbs.html",true);
    xmlhttp.send();
}

updateStyle(elem) {
    const shadow = elem.shadowRoot;
    const video = shadow.querySelector("video");
    if (!video) return;
    
    // console.log(this);
    
    video.setAttribute("class","videoUnidad");
    video.setAttribute("playsinline","");
    video.setAttribute("preload", "metadata");
    
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
        
        video.setAttribute("loop","");
        video.setAttribute("autoplay","true");
        video.setAttribute("muted","true");
        
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
        
        video.setAttribute("loop","");
        video.setAttribute("autoplay","true");
        video.setAttribute("muted","true");
        
    }
    else if(tipo === "divider"){
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

        video.setAttribute("loop","");
        video.setAttribute("autoplay","true");
        video.setAttribute("muted","true");
        
    }
    else{
        shadow.querySelector("style").textContent = `
        video {
            width: 100%; 
            height: 100%; 
            
        }
        `;
        
        video.setAttribute("controls","");
        
    }
    
}

_stopVideo(video){
    if(video.paused) video.play(); else video.pause();
    
}

_getVideo(elem){
    var archivo = elem.getAttribute("archivo");
    
    var video = this.shadowRoot.querySelector("video");
    var source = this.shadowRoot.querySelector("source");
    if (!video || !source) return;
    video.muted = true;
    
    source.setAttribute("src","assets/videos/"+archivo+".mp4");
    source.setAttribute("type","video/mp4");
    
    // console.log(video);
    // console.log(video.readyState);
    video.load();
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
        if (typeof this._unsubscribe === "function") {
            this._unsubscribe();
        }
    }
}

customElements.define('video-lbs',videoLbs);