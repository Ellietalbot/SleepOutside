import { getLocalStorage, setLocalStorage } from "./utils.mts"
const baseURL = `${import.meta.env.PUBLIC_SERVER_URL}`
//$state variable called userStore
interface UserStore {
 isLoggedIn:boolean,
 user?:{
     name:string
     email:string
     _id:string
 },
 token:string
}
export const userStore = $state( {isLoggedIn: false, user: {}, token: ""}) as UserStore;

//logout
//checkAuth()

export async function login(email:string, password:string){
    //user/login
    const res = await fetch(`${baseURL}users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json();
  if(res.ok) {
    userStore.user = data.user;
        userStore.isLoggedIn = true;
        userStore.token = data.token
        setLocalStorage("so-user", userStore);
    return data
  } else {
    throw new Error(data.error.message);
  }
}

export function logout(){
    userStore.user = undefined;
    userStore.token = "";
    userStore.isLoggedIn = false;
    setLocalStorage('so-user', null);
    window.location.href = '/'
}

export function checkAuth(){
    const userData = getLocalStorage("so-user");
    if(userData) {
        userStore.user = userData.user
        userStore.token = userData.token;
        userStore.isLoggedIn = true;
    } else {
        userStore.isLoggedIn = false;
        userStore.user = undefined;
        userStore.token = "";
    }
    return !!userData;
}


