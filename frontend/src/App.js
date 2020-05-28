import React                                                from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

import MainNavigation   from './components/navigation/MainNavigation';
import { AppContext }   from './AppContext';
import { useAuth }      from './components/user/Auth';
import User             from './components/user/User';
import ToolsList        from './components/tool/ToolsList';
import AddTool          from './components/tool/AddTool';
import './App.css';


const App = (props) => {

  // ------------------------------ STATE ---------------------------------
  const { userId, userName, token, login, logout } = useAuth();

  
  // ---------------------------- RENDERING -------------------------------
  var routes;
  
  if (token) {
    routes = (
      <Switch>
        <Route path='/tools/list'  component={ToolsList} />
        <Route path='/tools/add'   component={AddTool} />
        <Route path='/logout' />
        <Redirect to='/tools/list' />
      </Switch>
    );
  } 
  else {
    routes = (
      <Switch>
        <Route path='/user'        component={User}   />
        <Redirect to="/user" />
      </Switch>
    );
  }
  
  return (
    <AppContext.Provider value={{
      // Backend domain is set by an environment variable
      backendDomain: process.env.REACT_APP_BACKEND_DOMAIN, 
      userId: userId,
      userName: userName,
      token: token,
      loginFun: login,
      logoutFun: logout
      }}>
      <Router>
        <div className='app'>
          <MainNavigation />
          <main>{routes}</main>
        </div>
      </Router>
    </AppContext.Provider>
  );
    
};


export default App;
