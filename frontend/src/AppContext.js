import { createContext } from 'react';


export const AppContext = createContext({
    backendDomain: '',    
    userId: '',
    userName: '',
    token: '',
    loginFun: () => {},
    logoutFun: () => {}
});
  