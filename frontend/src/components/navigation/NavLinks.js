import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';

import { AppContext }  from '../../AppContext';
import './NavLinks.css';

const NavLinks = props => {

  const appContext = useContext(AppContext);

  return (
    <ul className="nav-links">
      {appContext.token && (
      <li>
        <button onClick={appContext.logoutFun}>Log out</button>
      </li>
      )}
    </ul>
  );
};


export default  NavLinks;
