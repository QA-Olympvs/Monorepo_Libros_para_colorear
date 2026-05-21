class componentBase extends HTMLElement {

    static TEMAS = {
        // Escolaridad
        lic: { mainColor: '#de8839', mainColorRgb: '222, 136, 57' },   // Licenciatura (default)
        hsc: { mainColor: '#ffb127', mainColorRgb: '255, 177, 39' },   // High School
        // Áreas de licenciatura
        emp: { mainColor: '#68178b', mainColorRgb: '104, 23, 139' },   // Empresas y Comercio
        arq: { mainColor: '#0c9763', mainColorRgb: '12, 151, 99' },    // Vivienda y Urbanismo / Arquitectura
        sal: { mainColor: '#0094c2', mainColorRgb: '0, 148, 194' },    // Salud
        jur: { mainColor: '#9a1f35', mainColorRgb: '154, 31, 53' },    // Jurídica y Política
        art: { mainColor: '#af1e55', mainColorRgb: '175, 30, 85' },    // Arte y Comunicación
    };

    get _tema() {
        return componentBase.TEMAS[this.getAttribute('tema')] ?? componentBase.TEMAS.lic;
    }

	constructor(){
		super();
		this._itemLbs;
		this._id = 0;
        this._value = "";
        this._pagina = 0;
        this._unsubscribe = undefined;
        this.attachShadow({ mode: 'open' });
        //const url = (window.location != window.parent.location) ? document.referrer : document.location.href;
        //console.log("url:",url);
        this._isAndroid = window.location.protocol == "file:" ? true : false;
        this.Visor = this._isAndroid ? parent.Visor :  Visor;
	}


	_saveData() {
		console.log("_saveData");
		const promise = new Promise((resolve, reject) => {
            const { usuario } = this.Visor.tokenUser;
            const idLibro     = this.Visor.idLibro;
            const claveLibro  = this._isAndroid ? parent.IDRViewer.config.fileName.replace(".pdf",'') : IDRViewer.config.fileName.replace(".pdf",'');

            const widgetData = {
                data: this._itemLbs.value, 
                ejercicio : "0",
                elemento: this._id,
                estado : 2,
                libroid : idLibro,
                pagina : this._pagina,
                ...this._extraFields
            }

            this.Visor.saveDataFireStore({...widgetData}).then(()=>{
                resolve("data");
            }).catch(err => reject(err));

            /*this.Visor.dbFirestore.doc(`${usuario}/libros`)
                             .collection(claveLibro)
                             .doc(this._id)
                             .set(widgetData)
            .then(()=> console.log)
            .catch(error => console.error("Error adding document: ", error));*/
        });

        return promise;
	}

    _deleteData(item){
        console.log("_deleteData");
        const { usuario } = this.Visor.tokenUser;
        const claveLibro  = this._isAndroid ? parent.IDRViewer.config.fileName.replace(".pdf",'') : IDRViewer.config.fileName.replace(".pdf",'');

        const search = this.Visor.store.getState().bookReducer.filter(a => a.elemento !== item);
        this.Visor.store.getState().bookReducer = search;
        console.log("Document successfully deleted!");
        
        this.Visor.dbFirestore.doc(`${usuario}/libros`)
                         .collection(claveLibro)
                         .doc(item)
                         .delete()
        .then(() => {
            // const search = this.Visor.store.getState().bookReducer.filter(a => a.elemento !== item);
            // this.Visor.store.getState().bookReducer = search;
            // console.log("Document successfully deleted!");
        }).catch((error) => {
            console.error("Error removing document: ", error);
        });
    }
}