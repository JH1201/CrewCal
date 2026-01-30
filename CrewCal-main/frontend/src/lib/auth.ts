const KEY='authToken';
export const setToken=(t:string)=>localStorage.setItem(KEY,t);
export const getToken=()=>localStorage.getItem(KEY);
export const clearToken=()=>localStorage.removeItem(KEY);
