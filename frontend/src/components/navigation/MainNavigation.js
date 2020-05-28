import React, { useContext } from 'react';

import { AppContext }  from '../../AppContext';
import Dropdown        from '../common/Dropdown'
import './MainNavigation.css';

const MainNavigation = props => {

  // Needed for recovering domain name and user id
  const appContext = useContext(AppContext);

  return (
    <React.Fragment>
      <div className="top-nav" >
        <a href={'https://bossabox.com/'} className="logo-bossa"></a>
        <div className="top-nav-title">
          vuttr
        </div>
        <div className="top-nav-links">
          {appContext.token && (
            <Dropdown name={appContext.userName.split(' ')[0]} // Shows just the first name
                      options={[ {name:'Logout ', action: appContext.logoutFun} ]}>
            </Dropdown>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};


export default MainNavigation;
