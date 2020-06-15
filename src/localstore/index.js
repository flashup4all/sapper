import { user_data, user_token, vendor_data} from "../constant";
import { writable } from "svelte/store";
export const encrypt = (user) => {
    
    console.log(response)
}

export const store_user = (user) => {

   window.localStorage.setItem(user_data, JSON.stringify(user))
}

export const get_user = () => {
    if (process.browser) {
    return JSON.parse(window.localStorage.getItem(user_data))
    }
}

export const store_vendor = (user) => {
    window.localStorage.setItem(vendor_data, JSON.stringify(user))
 }
 
export const get_vendor = () => {
//     const store = writable(JSON.parse(localStorage.getItem(vendor_data)) || "");
//     console.log(store)
//     return store;
// //   store.subscribe(val => localStorage.setItem("store", val));
if (process.browser) {
     return JSON.parse(window.localStorage.getItem(vendor_data))
}
}
 
export const store_token = (token) => {

    window.localStorage.setItem(user_token, token)
}

export const get_token = () => {
    let token= ''
    try {
        token = window.localStorage.getItem(user_token)
    } catch (error) {
        console.log(error)
    }
    return token;
    
}

export const clear_store = () => {

    window.localStorage.removeItem(user_token)
    window.localStorage.removeItem(user_data)
    window.localStorage.removeItem(vendor_data)
}