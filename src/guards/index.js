
import { get_user, get_vendor } from '../localstore'
import { onMount } from 'svelte'

let vendor = get_vendor();
let user = get_user();


export const vendor_admin_guard = () => {
    if(user && user.user_role == "vendor_admin"){
        return true;
    }
    return false;
}
export const vendor_staff_guard = () => {
    if(user && user.user_role == "vendor_staff"){
        return true;
    }
    return false;
}
export const vendor_admin_staff_guard = () => {
    if(user && (user.user_role == "vendor_staff" || user.user_role == "vendor_admin" )){
        return true;
    }
    return false;
}
export const admin_guard = () => {
    if( user && user.user_role == "admin"){
        return true;
    }
    return false;
}

export const admin_vendor_guard = () => {
    if(user && (user.user_role == "admin" || user.user_role == "vendor_admin")){
        return true;
    }
    return false;
}

// export const admin_vendor_restaurant_guard = () => {
//     if((vendor.vendor_type_id === "1" && user.user_role == "admin") || (vendor.vendor_type_id === "1" && user.user_role == "vendor_admin")){
//         return true;
//     }
//     return false;
// }

// export const admin_vendor_laundry_guard = () => {
//     if((vendor.vendor_type_id === "2" && user.user_role == "admin") || (vendor.vendor_type_id === "2" && user.user_role == "vendor_admin")){
//         return true;
//     }
//     return false;
// }