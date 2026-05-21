// import { composeWithDevTools } from 'redux-devtools-extension'
// import getRemoved from './components/relacionarLbs/relacionarLbs.js';
// import { getRemoved } from './components/relacionarLbs/relacionarLbs.js';
const sendRemoved = window.getRemoved
console.log("reduxLbs");
const { combineReducers } = Redux;

const bookReducer = (state = [],action) => {
	//console.log("bookReducer : ",state,action);
if (action.type === "INIT_BOOKS") {
  		return [...action.payload];
}
if (action.type === "ADD_BOOKS") {
	/*return { 
		items : [...state.items,action.payload],
	};*/
	console.log("entra addbooks");
	const busqueda = state.filter(a => a.elemento == action.payload.elemento);    
	if(busqueda.length != 0) 
	return state.map( item =>{
		if(item.elemento == action.payload.elemento)
		return {
			...action.payload
		}
		else
		return item;
	});
	else
	return [...state,{ ...action.payload }];	
}

if (action.type === "MODIFIED_DATA"){
	return state.map(item => {
			return item.id === action.payload.id ? action.payload : item;
		}); // replace matched item and returns the array 
}

if (action.type === "REMOVE_DATA"){

	// console.log(state);
	// console.log(action.payload.elemento);
	
	return state.filter(i => i.elemento !== action.payload.elemento );

}

  return state;
};

const removeMiddleWare = store => next => action => {
// function fetchData(action) {	
	if(action.type === 'REMOVE_DATA'){
		// console.log(action);
		var data = [action.payload.elemento, action.type];
		getRemoved(data);
	}
	next(action);
  }

const lbsEnhancer = Redux.compose(
	// EXAMPLE: Add whatever middleware you actually want to use here
	Redux.applyMiddleware(removeMiddleWare), 
	window.__REDUX_DEVTOOLS_EXTENSION__
	    ? window.__REDUX_DEVTOOLS_EXTENSION__()
	    : f => f
	// window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
	// other store enhancers if any

)

//   function sendData(action) {
// 	// Invert control!
// 	// Return a function that accepts `dispatch` so we can dispatch later.
// 	// Thunk middleware knows how to turn thunk async actions into actions.
// 		return action.payload.elemento
//   }

const isActiveDynamicNoteReducer = (state = false,action) => {
	//console.log("bookReducer : ",state,action);
  console.log(action);
  if (action.type === "ENABLED_DYNAMICNOTE") {
  		return action.payload = true;
  }
  if (action.type === "DISABLED_DYNAMICNOTE") {
  		return action.payload = false;
  }

  return state;
};

Visor.store = Redux.createStore(combineReducers({
									bookReducer,
									isActiveDynamicNoteReducer
									
									//reducerCounter
								}),
								lbsEnhancer
								//{name: "name field"},
								//initialState,
								// window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
								// Redux.applyMiddleware(removeMiddleWare)
								);

//console.log(Visor.store.getState());