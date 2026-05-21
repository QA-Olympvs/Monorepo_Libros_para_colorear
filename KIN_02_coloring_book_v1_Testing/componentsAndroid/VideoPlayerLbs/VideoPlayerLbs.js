class VideoPlayerLbs extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._videoElement = null;
    }
  
    connectedCallback() {
      this._loadHTML();
    }
  
    async _loadHTML() {
      var txt = '';
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = () => {
          if((xmlhttp.status == 200 || xmlhttp.status == 0) && xmlhttp.readyState == 4){
          txt = xmlhttp.responseText;
          this.shadowRoot.innerHTML = txt;
          this._setupVideo();
        }
      };
        xmlhttp.open("GET","componentsAndroid/VideoPlayerLbs/VideoPlayerLbs.html",true);
      xmlhttp.send();
    }
  
    _setupVideo() {
      const videoName = this.getAttribute("video");
      if (!videoName) return;
  
      const wrapper = this.shadowRoot.querySelector(".video-wrapper");
        if (!wrapper) return;
        wrapper.innerHTML = "";
  
      const video = document.createElement("video");
      video.setAttribute("controls", "true");
      video.setAttribute("preload", "metadata");
      video.src = `assets/videos/${videoName}.mp4`;
      
      const placeholder = this.getAttribute("placeholder");
      console.log(placeholder)
      // if (placeholder) {
        video.setAttribute("poster", `assets/img/${placeholder}`);
      // }
  
      this._videoElement = video;
      wrapper.appendChild(video);
    }
  
    /** 🔊 Reproduce el video manualmente desde fuera */
    play() {
      if (this._videoElement) {
        this._videoElement.play();
      }
    }
  
    pause() {
      if (this._videoElement) {
        this._videoElement.pause();
      }
    }
  
    get video() {
      return this._videoElement;
    }
  }
  
  customElements.define("video-player-lbs", VideoPlayerLbs);
  