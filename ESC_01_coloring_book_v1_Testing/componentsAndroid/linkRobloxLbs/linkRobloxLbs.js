//import htmlDOC from './player.html'
class linkRobloxLbs extends componentBase {

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
            this._itemLbs = this.shadowRoot.querySelector(".container");
            this.shadowRoot.querySelector(".container").addEventListener("click", this.linkToRoblox.bind(this));
            this.getElements(this);
            this.updatePosition();
            this.animateEntrance();
          }
        };
        xmlhttp.open("GET","components/linkRobloxLbs/linkRobloxLbs.html",true);
        xmlhttp.send();
    }

    updatePosition() {
        this.style.position = "absolute";
        this.style.left = "-560px";
        this.style.bottom = "770px";
    }

    getElements(elem) {
        this._id = elem.getAttribute("id");
        this._pagina = elem.getAttribute("pagina");
        this._placeId = elem.getAttribute("placeid");
        
        elem.style.cssText += 'display: inline-table';
        elem.style.cssText += 'position: relative';

        this.observers();
        this.loadData();
    }

    loadData(){
        const search = this.Visor.store.getState().bookReducer.filter(a => a.elemento == this._id);

        if(search != 0) {
            this._itemLbs.value = search[0].data;
        } 
    }

    observers(){
        this._unsubscribe = this.Visor.store.subscribe(()=>{
            const search = this.Visor.store.getState().bookReducer.filter(a => a.elemento == this._id);

            if(search != 0) 
                this._itemLbs.value = search[0].data;
        });
    }
    
    toBase64URL(text) {
        let base64 = btoa(text);
        // Reemplaza los caracteres no válidos en Base64URL
        base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        return base64;
    }

    linkToRoblox() {
        const claveLibro  = this._isAndroid ? parent.IDRViewer.config.fileName.replace(".pdf",'') : IDRViewer.config.fileName.replace(".pdf",'');
        console.log(this._id);
        console.log(this.Visor.idLibro);
        console.log(claveLibro);

        const tema = this._id.split("_")[3]
        
        const launchData = {
            "ActivityKey": this._id,
            "Theme": tema,
            "UserId": this.Visor.tokenUser.usuario,
            "BookId": claveLibro
        };
        const launchDataURL = this.toBase64URL(JSON.stringify(launchData));
        
        const link = `https://www.roblox.com/games/start?placeId=${this._placeId}&launchData=${launchDataURL}`
        this.Visor.abrirLink(link);
    }
 
    animateEntrance() {
        const container = this.shadowRoot.querySelector(".container");
        if (!container) return;
      
        if (container.dataset.animated) return;
      
        container.dataset.animated = "true";

        gsap.set(container, {
          scale: 0.8,
          opacity: 0,
          y: 60
        });
      
        const observer = new IntersectionObserver((entries, obs) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              gsap.to(container, {
                scale: 1,
                opacity: 1,
                duration: 0.8,
                ease: "power2.out",
                y: 0,
                onComplete: () => {
                    const pulseTimeline = gsap.timeline({ repeat: -1, repeatDelay: 0.7 });
                    pulseTimeline
                        .to(container, {
                            scale: 1.05,
                            duration: 0.3,
                            ease: "power1.out"
                        })
                        .to(container, {
                            scale: 1,
                            duration: 0.2,
                            ease: "power1.in"
                        });
                }
              });
              obs.unobserve(container);
            }
          });
        }, { threshold: 0.4 });
      
        observer.observe(container);
    }
      
    connectedCallback() {
        this.getData();
    }
    disconnectedCallback() {
        this.shadowRoot.querySelector(".container").removeEventListener('click', this.linkToRoblox);
        this._unsubscribe();
    }
}

customElements.define('link-roblox-lbs',linkRobloxLbs);